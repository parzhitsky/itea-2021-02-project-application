import fetch = require("make-fetch-happen");
import { spawnSync, SpawnSyncReturns as SpawnResult } from "child_process";
import Logged from "../../log/logged.decorator";

/** @private */
function hasSHA(value: unknown): value is { sha: string } {
	return value != null && "sha" in (value as {}) && typeof (value as { sha: unknown }).sha === "string";
}

/** @private */
function * entriesOf<Obj extends object>(obj: Obj): IterableIterator<readonly [ keyof Obj, Obj[keyof Obj] ]> {
	for (const key in obj)
		yield [ key, obj[key] ];
}

/** @private */
const gitBranch = process.env.HEROKU_BRANCH;

export default abstract class FetchHashWorker {
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

export class FetchHashWorkerLocal extends FetchHashWorker {
	override readonly location = "(git CLI command)";

	@Logged({ level: "debug" })
	protected override async doFetch(): Promise<string> {
		const { stdout = null, stderr, error }: SpawnResult<string | null> =
			spawnSync("git", [ "rev-parse", gitBranch ], { encoding: "utf8" });

		if (error != null)
			throw error;

		const sha = stdout?.trim() ?? "";

		if (!sha)
			throw new FetchHashError("spawn(...) yielded empty stdout", { stdout, stderr });

		return sha;
	}
}

export class FetchHashWorkerRemote extends FetchHashWorker {
	override readonly location =
		`https://api.github.com/repos/parzhitsky/itea-2021-02-project-application/commits/${gitBranch}`;

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

export class FetchHashError extends global.Error {
	constructor(
		public readonly hint: string,
		public readonly payload?: unknown,
	) {
		super("Failed to fetch hash");
	}
}

export class FetchHashAggregatedError extends global.Error {
	readonly errors: Record<string, unknown> = Object.create(null);

	constructor(
		workers: Record<string, FetchHashWorker>,
	) {
		super("Could not fetch hash of the latest commit");

		for (const [ id, worker ] of entriesOf(workers))
			this.errors[id] = worker.fetchError ?? null;
	}
}
