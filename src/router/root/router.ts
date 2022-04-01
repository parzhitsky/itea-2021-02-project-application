import HealthService from "../../services/health.service";
import createRouter from "../create-router";
import healthCheck from "./health-check.controller";

/** @private */
const healthService = new HealthService();

export default createRouter({
	"/": {
		get: healthCheck({ healthService }),
	},
});
