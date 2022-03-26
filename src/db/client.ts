import type { ClientConfig } from "pg";
import { Sequelize } from "sequelize";
import logger from "../log/logger";

export * from "sequelize";

/** @private */
type Env = NodeJS.ProcessEnv["NODE_ENV"];

/** @private */
const devEnvs: Partial<Record<Env, unknown>> = {
	development: null,
	test: null,
} as const;

/** @public */
const client = new Sequelize(process.env.DATABASE_URL, {
	dialect: "postgres",
	dialectOptions: <ClientConfig> {
		ssl: process.env.NODE_ENV in devEnvs ? false : {
			require: false,
			rejectUnauthorized: false, // allow self-signed certificates
		},
	},
	logging(sql) {
		logger.debug(sql);
	},
});

export default client;
