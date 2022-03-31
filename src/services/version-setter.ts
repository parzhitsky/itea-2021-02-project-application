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
interface FetchedHash {
	value: string;
	location: string;
}

/** @private */
class FetchHashSource {
	location: string | undefined;
	fetched = false;
	reasonNotFetched?: unknown;
}

/** @private */
class FetchHashResult {
	readonly local = new FetchHashSource();
	readonly remote = new FetchHashSource();
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
	protected readonly localGitOrigHeadFilePath = resolve(__dirname, "../..", ".git/ORIG_HEAD");
	protected readonly remoteRepoOwner = "parzhitsky";
	protected readonly remoteRepoName = "itea-2021-02-project-application";

	protected readonly commitsUrl = API_COMMITS_URL
		.replace("{owner}", this.remoteRepoOwner)
		.replace("{repo}", this.remoteRepoName)
		.replace("{branch}", process.env.HEROKU_BRANCH);

	protected readonly nonShaCharacterPattern = /[^0-9a-f]/gi;
	protected readonly commitShaPattern = /^[0-9a-f]{40}$/i;

	protected readonly fetchHashResult = new FetchHashResult();
	protected initStarted = false;
	protected afterInitSet = false;

	readonly didInit = this.init();

	protected versionValue: string | undefined;

	protected get versionSetStatus(): VersionSetStatus {
		return this.versionValue != null ? "set" : this.fetchHashResult.error != null ? "failed" : "unset";
	}

	@Logged({ level: "debug" })
	protected async fetchHashFromLocalRepo(): Promise<FetchedHash> {
		if (!exists(this.localGitOrigHeadFilePath))
			throw new VersionSetError("local .git/ORIG_HEAD file is not found", {
				filePath: this.localGitOrigHeadFilePath,
			});

		const content = await read(this.localGitOrigHeadFilePath, "utf8");
		const sha = content.replace(this.nonShaCharacterPattern, "");

		if (!this.commitShaPattern.test(sha))
			throw new VersionSetError("the input doesn't match commit SHA pattern", {
				input: sha,
				pattern: this.commitShaPattern,
			});

		return {
			value: sha,
			location: this.localGitOrigHeadFilePath,
		};
	}

	@Logged({ level: "debug" })
	protected async fetchHashFromRemoteRepo(): Promise<FetchedHash> {
		const response = await fetch(this.commitsUrl);
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

		return {
			value: result.sha,
			location: response.url,
		};
	}

	@Logged({ level: "debug" })
	protected async fetchHash(): Promise<string | undefined> {
		let value, location;

		// try fetch from local repo
		try {
			({ value, location } = await this.fetchHashFromLocalRepo());
			this.fetchHashResult.local.fetched = true;
			this.fetchHashResult.local.location = location;
		} catch (error) {
			this.fetchHashResult.local.reasonNotFetched = error;
		}

		// if failed, try fetch from remote repo
		if (!this.fetchHashResult.fetched)
			try {
				({ value, location } = await this.fetchHashFromRemoteRepo());
				this.fetchHashResult.remote.fetched = true;
				this.fetchHashResult.remote.location = location;
			} catch (error) {
				this.fetchHashResult.remote.reasonNotFetched = error;
			}

		// if still failed, don't fetch
		if (!this.fetchHashResult.fetched)
			this.fetchHashResult.error = new FetchHashError(
				this.fetchHashResult.local.reasonNotFetched,
				this.fetchHashResult.remote.reasonNotFetched,
			);

		return value;
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
