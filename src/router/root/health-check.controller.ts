import type { RequestHandler } from "express";
import type HealthService from "../../services/health.service";

/** @private */
interface Deps {
	healthService: Pick<HealthService, "getStatus">;
}

export default function healthCheck({ healthService }: Deps): RequestHandler[] {
	return [
		// avoid making this controller asynchronous, – it should respond rather quickly
		(req, res) => {
			const status = healthService.getStatus();

			res.json({
				message: status.message,
				healthy: status.healthy,
				checks: {
					total: status.checksTotal,
					passed: status.checksPassed,
					ratio: status.healthFactor,
				},
				version: status.version,
				db: {
					connection: status.dbConnection,
				},
			});
		},
	];
}
