import fetch = require("make-fetch-happen");
import Logged from "../log/logged.decorator";
import logger from "../log/logger";

/** @private */
const API_COMMITS_URL = "https://api.github.com/repos/{owner}/{repo}/commits/{branch}";

/** @private */
function hasSHA(value: unknown): value is { sha: string } {
	return value != null && "sha" in (value as {}) && typeof (value as { sha: unknown }).sha === "string";
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
	protected readonly repoOwner = "parzhitsky";
	protected readonly repoName = "itea-2021-02-project-application";

	protected initStarted = false;
	protected initFailed = false;
	protected versionValue: string | undefined;

	protected get versionSetStatus(): VersionSetStatus {
		return this.versionValue != null ? "set" : this.initFailed ? "failed" : "unset";
	}

	readonly didSet = this.init().catch((error) => {
		logger.error(error);
		this.initFailed = true;
	});

	@Logged()
	protected async init(): Promise<void> {
		if (this.initStarted)
			return;

		this.initStarted = true;

		const commitsUrl = API_COMMITS_URL
			.replace("{owner}", this.repoOwner)
			.replace("{repo}", this.repoName)
			.replace("{branch}", process.env.HEROKU_BRANCH);

		const response = await fetch(commitsUrl);

		if (!response.ok)
			throw new VersionSetterInitError(`${response.status} ${response.statusText}`);

		const result = await response.json();

		if (!hasSHA(result))
			throw new VersionSetterInitError("commit SHA not found in the result");

		this.versionValue = result.sha;
	}

	@Logged()
	getVersion(): Version {
		return {
			value: this.versionValue,
			setStatus: this.versionSetStatus,
		};
	}
}

export class VersionSetterInitError extends global.Error {
	constructor(
		public readonly hint: string,
	) {
		super("Failed to initialize version setter");
	}
}
