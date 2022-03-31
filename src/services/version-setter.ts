import fetch = require("make-fetch-happen");
import { existsSync as exists } from "fs";
import { readFile as read } from "fs/promises";
import { resolve } from "path";
import Logged from "../log/logged.decorator";

/** @private */
const API_COMMITS_URL = "https://api.github.com/repos/{owner}/{repo}/commits/{branch}";

/** @private */
function hasSHA(value: unknown): value is { sha: string } {
	return value != null && "sha" in (value as {}) && typeof (value as { sha: unknown }).sha === "string";
}

/** @private */
class VersionSetterInitResult {
	locationLocal: string | undefined;
	fetchedFromLocal = false;
	reasonNotFetchedFromLocal?: unknown;
	locationRemote: string | undefined;
	fetchedFromRemote = false;
	reasonNotFetchedFromRemote?: unknown;

	error?: HashNotFetchedError;

	get fetched(): boolean {
		return this.fetchedFromLocal || this.fetchedFromRemote;
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
	protected readonly localGitOrigHeadFilePath = resolve(__dirname, "../..", ".git/ORIG_HEAD");
	protected readonly remoteRepoOwner = "parzhitsky";
	protected readonly remoteRepoName = "itea-2021-02-project-application";

	protected readonly commitsUrl = API_COMMITS_URL
		.replace("{owner}", this.remoteRepoOwner)
		.replace("{repo}", this.remoteRepoName)
		.replace("{branch}", process.env.HEROKU_BRANCH);

	protected readonly nonShaCharacterPattern = /[^0-9a-f]/gi;
	protected readonly commitShaPattern = /^[0-9a-f]{40}$/i;

	protected readonly initResult = new VersionSetterInitResult();
	protected initStarted = false;
	protected afterInitSet = false;

	readonly didInit = this.init();

	protected versionValue: string | undefined;

	protected get versionSetStatus(): VersionSetStatus {
		return this.versionValue != null ? "set" : this.initResult.error ? "failed" : "unset";
	}

	@Logged({ level: "debug" })
	protected async fetchHashFromLocalRepo(): Promise<string> {
		this.initResult.locationLocal = this.localGitOrigHeadFilePath;

		if (!exists(this.localGitOrigHeadFilePath))
			throw new VersionSetterInitError("local .git/ORIG_HEAD file is not found", {
				filePath: this.localGitOrigHeadFilePath,
			});

		const content = await read(this.localGitOrigHeadFilePath, "utf8");
		const sha = content.replace(this.nonShaCharacterPattern, "");

		if (!this.commitShaPattern.test(sha))
			throw new VersionSetterInitError("the input doesn't match commit SHA pattern", {
				input: sha,
				pattern: this.commitShaPattern,
			});

		this.initResult.fetchedFromLocal = true;

		return sha;
	}

	@Logged({ level: "debug" })
	protected async fetchHashFromRemoteRepo(): Promise<string> {
		const response = await fetch(this.commitsUrl);
		const result = await response.json();

		this.initResult.locationRemote = response.url;

		if (!response.ok)
			throw new VersionSetterInitError("response status is not 2xx", {
				url: response.url,
				status: response.status,
				statusText: response.statusText,
				body: result,
			});

		if (!hasSHA(result))
			throw new VersionSetterInitError("commit SHA not found in the result", result);

		this.initResult.fetchedFromRemote = true;

		return result.sha;
	}

	@Logged({ level: "debug" })
	protected async init(): Promise<void> {
		if (this.initStarted)
			return; // prevent overriding results

		this.initStarted = true;

		let hash;

		try {
			hash = await this.fetchHashFromLocalRepo();
		} catch (error) {
			this.initResult.reasonNotFetchedFromLocal = error;
		}

		if (!this.initResult.fetched)
			try {
				hash = await this.fetchHashFromRemoteRepo();
			} catch (error) {
				this.initResult.reasonNotFetchedFromRemote = error;
			}

		this.versionValue = hash;

		if (!this.initResult.fetched)
			this.initResult.error = new HashNotFetchedError(
				this.initResult.reasonNotFetchedFromLocal,
				this.initResult.reasonNotFetchedFromRemote,
			);
	}

	@Logged({ level: "debug" })
	afterInit(callback: (result: VersionSetterInitResult) => void): this {
		if (this.afterInitSet)
			throw new DuplicateAfterInitHookError();

		this.didInit.then(() => callback(this.initResult));
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

export class VersionSetterInitError extends global.Error {
	constructor(
		public readonly hint: string,
		public readonly payload?: unknown,
	) {
		super("Failed to initialize version setter");
	}
}

export class HashNotFetchedError extends global.Error {
	constructor(
		public readonly local: unknown,
		public readonly remote: unknown,
	) {
		super("Could not fetch hash of the latest commit");
	}
}
