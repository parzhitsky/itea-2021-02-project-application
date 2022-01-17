import type { ClientConfig } from "pg";
import { Sequelize } from "sequelize";
import logger from "../log/logger";

export * from "sequelize";

/** @public */
const client = new Sequelize(process.env.DATABASE_URL, {
	dialect: "postgres",
	dialectOptions: <ClientConfig> {
		ssl: {
			require: true,
			rejectUnauthorized: false, // allow self-signed certificates
		},
	},
	logging(sql) {
		logger.debug(sql);
	},
});

export default client;
