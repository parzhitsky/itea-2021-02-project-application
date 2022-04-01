import Logged from "../../log/logged.decorator";
import { FetchHashWorkerLocal, FetchHashWorkerRemote, FetchHashAggregatedError } from "./fetch-hash-worker";

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
		const { local, remote } = this.status;

		for (const worker of [ local, remote ] as const) {
			const hash = await worker.fetch();

			if (hash != null)
				return hash;
		}

		this.status.error = new FetchHashAggregatedError({ local, remote });
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
