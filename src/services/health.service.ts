import { getConnection } from "../db/connect";
import Logged from "../log/logged.decorator";
import Service from "./abstract.service";

/** @private */
interface Check {
	(...args: never[]): boolean;
}

/** @private */
const MESSAGE_HEALTHY = "💪";

/** @private */
const MESSAGE_GENERIC = "👋";

/** @private */
type Message =
	| typeof MESSAGE_HEALTHY
	| typeof MESSAGE_GENERIC
	;

/** @private */
interface Status {
	checksTotal: number;
	checksPassed: number;
	healthFactor: number; // checksPassed ÷ checksTotal = [0..1]
	healthy: boolean;
	message: Message;
}

export default class HealthService extends Service {
	private readonly checks: Check[] = [
		// app is running
		() => true,

		// DB is connected
		() => getConnection() != null,
	];

	/**
	 * @deprecated This method should not exist
	 * @see https://stackoverflow.com/q/71627955/4554883
	 */
	@Logged({ level: "debug" })
	protected async initializeGitCommitHash(): Promise<void> {
		// ...
	}

	@Logged()
	getStatus(): Status {
		const results = this.checks.map((check) => check());

		const checksTotal = this.checks.length;
		const checksPassed = results.filter(Boolean).length;
		const healthFactor = checksPassed / checksTotal;
		const healthy = healthFactor === 1;
		const message = healthy ? MESSAGE_HEALTHY : MESSAGE_GENERIC;

		return {
			checksTotal,
			checksPassed,
			healthFactor,
			healthy,
			message,
		};
	}
}
