import { getConnection } from "../db/connect";
import Logged from "../log/logged.decorator";
import logger from "../log/logger";
import Service from "./abstract.service";
import VersionSetter, { type Version } from "./version-setter";

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
	version: Version; // FIXME: this should be a `string`
}

export default class HealthService extends Service {
	protected readonly versionSetter = new VersionSetter()
		.afterInit((version, status) => {
			logger.debug("VersionSetter status:", status);

			if (status.error)
				logger.warn(status.error);

			else
				logger.info("Version:", version);
		});

	protected readonly checks: Check[] = [
		// app is running
		() => true,

		// DB is connected
		() => getConnection() != null,
	];

	@Logged()
	getStatus(): Status {
		const results = this.checks.map((check) => check());

		const checksTotal = this.checks.length;
		const checksPassed = results.filter(Boolean).length;
		const healthFactor = checksPassed / checksTotal;
		const healthy = healthFactor === 1;
		const message = healthy ? MESSAGE_HEALTHY : MESSAGE_GENERIC;
		const version = this.versionSetter.version;

		return {
			checksTotal,
			checksPassed,
			healthFactor,
			healthy,
			message,
			version,
		};
	}
}
