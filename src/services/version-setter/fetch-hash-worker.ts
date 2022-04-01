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
		const result = spawnSync("git", [ "rev-parse", "@" ], { encoding: "utf8" }) as SpawnResult<string | null>;

		if (result.error != null)
			throw result.error;

		if (result.stdout == null)
			throw new FetchHashError("no output from spawn", result);

		const sha = result.stdout.slice(0, -1);

		return sha;
	}
}

export class FetchHashWorkerRemote extends FetchHashWorker {
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
