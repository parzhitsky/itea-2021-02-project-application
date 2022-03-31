import fetch = require("make-fetch-happen");
import { spawnSync, SpawnSyncReturns as SpawnResult } from "child_process";
import Logged from "../log/logged.decorator";

/** @private */
function hasSHA(value: unknown): value is { sha: string } {
	return value != null && "sha" in (value as {}) && typeof (value as { sha: unknown }).sha === "string";
}

/** @private */
abstract class FetchHashWorker {
	abstract readonly location: string;
	fetched = false;
	fetchError?: unknown;

	protected abstract doFetch(): Promise<string>;

	@Logged({ level: "debug" })
	async fetch(): Promise<string | null> {
		try {
			const hash = await this.doFetch();
			this.fetched = true;
			return hash;
		} catch (error) {
			this.fetchError = error;
			return null;
		}
	}
}

/** @private */
class FetchHashWorkerLocal extends FetchHashWorker {
	override readonly location = "(git CLI command)";

	@Logged({ level: "debug" })
	protected override async doFetch(): Promise<string> {
		const result = spawnSync("git", [ "rev-parse", "@" ], { encoding: "utf8" }) as SpawnResult<string | null>;

		if (result.error != null)
			throw result.error;

		if (result.stdout == null)
			throw new FetchHashError("no output from spawn", result);

		const sha = result.stdout.slice(0, -1);

		return sha;
	}
}

/** @private */
class FetchHashWorkerRemote extends FetchHashWorker {
	override readonly location =
		`https://api.github.com/repos/parzhitsky/itea-2021-02-project-application/commits/${process.env.HEROKU_BRANCH}`;

	@Logged({ level: "debug" })
	protected override async doFetch(): Promise<string> {
		const response = await fetch(this.location);
		const result = await response.json();

		if (!response.ok)
			throw new FetchHashError("response status is not 2xx", {
				url: response.url,
				status: response.status,
				statusText: response.statusText,
				body: result,
			});

		if (!hasSHA(result))
			throw new FetchHashError("commit SHA not found in the result", result);

		return result.sha;
	}
}

/** @private */
class VersionSetterStatus {
	readonly local = new FetchHashWorkerLocal();
	readonly remote = new FetchHashWorkerRemote();

	error?: FetchHashAggregatedError;

	get fetched(): boolean {
		return this.local.fetched || this.remote.fetched;
	}
}

/** @private */
type VersionStatus = "unset" | "set" | "failed";

export class Version {
	value: string | undefined;
	status: VersionStatus = "unset";
}

/** @private */
interface AfterInitCallback {
	(
		this: unknown,
		version: Readonly<Version>,
		status: Readonly<VersionSetterStatus>,
	): void;
}

/**
 * @deprecated This thing should not exist
 * @see https://stackoverflow.com/q/71627955/4554883
 */
export default class VersionSetter {
	protected readonly status = new VersionSetterStatus();
	protected readonly _version = new Version();

	get version(): Readonly<Version> {
		return this._version;
	}

	protected initStarted = false;
	protected afterInitSet = false;

	readonly didInit = this.init();

	@Logged({ level: "debug" })
	protected async fetchHash(): Promise<string | undefined> {
		const strategy = [ this.status.local, this.status.remote ] as const;

		for (const worker of strategy) {
			const hash = await worker.fetch();

			if (hash != null)
				return hash;
		}

		this.status.error = new FetchHashAggregatedError(
			this.status.local.fetchError,
			this.status.remote.fetchError,
		);

		return undefined;
	}

	@Logged({ level: "debug" })
	protected async init(): Promise<void> {
		if (this.initStarted)
			return; // prevent overriding results

		this.initStarted = true;

		const hash = await this.fetchHash();

		this._version.value = hash;
		this._version.status = hash != null ? "set" : this.status.error != null ? "failed" : "unset";
	}

	@Logged({ level: "debug" })
	afterInit(callback: AfterInitCallback): this {
		if (this.afterInitSet)
			throw new DuplicateAfterInitHookError();

		this.didInit.then(() => callback(this.version, this.status));
		this.afterInitSet = true;

		return this;
	}
}

export class DuplicateAfterInitHookError extends global.Error {
	constructor() {
		super("Cannot set after-init hook more than once");
	}
}

export class FetchHashError extends global.Error {
	constructor(
		public readonly hint: string,
		public readonly payload?: unknown,
	) {
		super("Failed to fetch hash");
	}
}

export class FetchHashAggregatedError extends global.Error {
	constructor(
		public readonly local: unknown,
		public readonly remote: unknown,
	) {
		super("Could not fetch hash of the latest commit");
	}
}
