import fetch = require("make-fetch-happen");
import { spawnSync, SpawnSyncReturns as SpawnResult } from "child_process";
import Logged from "../log/logged.decorator";

/** @private */
function hasSHA(value: unknown): value is { sha: string } {
	return value != null && "sha" in (value as {}) && typeof (value as { sha: unknown }).sha === "string";
}

/** @private */
abstract class HashFetcher {
	abstract readonly location: string;
	fetched = false;
	fetchError?: unknown;

	protected abstract doFetch(): Promise<string>;

	@Logged({ level: "debug" })
	async fetch(): Promise<string | null> {
		try {
			const value = await this.doFetch();
			this.fetched = true;
			return value;
		} catch (error) {
			this.fetchError = error;
			return null;
		}
	}
}

/** @private */
class LocalHashFetcher extends HashFetcher {
	override readonly location = "(git CLI command)";

	protected override async doFetch(): Promise<string> {
		const result = spawnSync("git", [ "rev-parse", "@" ], { encoding: "utf8" }) as SpawnResult<string | null>;

		if (result.error != null)
			throw result.error;

		if (result.stdout == null)
			throw new VersionSetError("no output from spawn", result);

		const sha = result.stdout.slice(0, -1);

		return sha;
	}
}

/** @private */
class RemoteHashFetcher extends HashFetcher {
	override readonly location =
		`https://api.github.com/repos/parzhitsky/itea-2021-02-project-application/commits/${process.env.HEROKU_BRANCH}`;

	protected override async doFetch(): Promise<string> {
		const response = await fetch(this.location);
		const result = await response.json();

		if (!response.ok)
			throw new VersionSetError("response status is not 2xx", {
				url: response.url,
				status: response.status,
				statusText: response.statusText,
				body: result,
			});

		if (!hasSHA(result))
			throw new VersionSetError("commit SHA not found in the result", result);

		return result.sha;
	}
}

/** @private */
class FetchHashResult {
	readonly local = new LocalHashFetcher();
	readonly remote = new RemoteHashFetcher();

	error?: FetchHashError;

	get fetched(): boolean {
		return this.local.fetched || this.remote.fetched;
	}
}

/** @private */
type VersionSetStatus = "unset" | "set" | "failed";

export interface Version {
	value: string | undefined;
	setStatus: VersionSetStatus;
}

/**
 * @deprecated This thing should not exist
 * @see https://stackoverflow.com/q/71627955/4554883
 */
export default class VersionSetter {
	protected readonly fetchHashResult = new FetchHashResult();
	protected initStarted = false;
	protected afterInitSet = false;
	protected versionValue: string | undefined;

	protected get versionSetStatus(): VersionSetStatus {
		return this.versionValue != null ? "set" : this.fetchHashResult.error != null ? "failed" : "unset";
	}

	readonly didInit = this.init();

	@Logged({ level: "debug" })
	protected async fetchHash(): Promise<string | undefined> {
		const strategy = [
			this.fetchHashResult.local,
			this.fetchHashResult.remote,
		] as const;

		for (const source of strategy) {
			const value = await source.fetch();

			if (value != null)
				return value;
		}

		this.fetchHashResult.error = new FetchHashError(
			this.fetchHashResult.local.fetchError,
			this.fetchHashResult.remote.fetchError,
		);

		return undefined;
	}

	@Logged({ level: "debug" })
	protected async init(): Promise<void> {
		if (this.initStarted)
			return; // prevent overriding results

		this.initStarted = true;
		this.versionValue = await this.fetchHash();
	}

	@Logged({ level: "debug" })
	afterInit(callback: (result: FetchHashResult) => void): this {
		if (this.afterInitSet)
			throw new DuplicateAfterInitHookError();

		this.didInit.then(() => callback(this.fetchHashResult));
		this.afterInitSet = true;

		return this;
	}

	@Logged({ level: "debug" })
	getVersion(): Version {
		return {
			value: this.versionValue,
			setStatus: this.versionSetStatus,
		};
	}
}

export class DuplicateAfterInitHookError extends global.Error {
	constructor() {
		super("Cannot set after-init hook more than once");
	}
}

export class VersionSetError extends global.Error {
	constructor(
		public readonly hint: string,
		public readonly payload?: unknown,
	) {
		super("Failed to set version");
	}
}

export class FetchHashError extends global.Error {
	constructor(
		public readonly local: unknown,
		public readonly remote: unknown,
	) {
		super("Could not fetch hash of the latest commit");
	}
}
