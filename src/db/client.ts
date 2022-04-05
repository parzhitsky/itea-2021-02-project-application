import type { ClientConfig } from "pg";
import { Sequelize } from "sequelize";

export * from "sequelize";

/** @private */
const { DATABASE_URL } = process.env;

/** @private */
function isErrorInvalidURL(error: unknown): error is TypeError & { code: "ERR_INVALID_URL" } {
	return error instanceof TypeError && "code" in error && (error as { code: unknown }).code === "ERR_INVALID_URL";
}

/** @private */
const shouldUseSSL = ((): boolean => {
	try {
		const { hostname } = new URL(DATABASE_URL);
		const isLocalDB = hostname === "localhost";

		return !isLocalDB;
	} catch (error) {
		if (!isErrorInvalidURL(error))
			throw error;

		App.logger.warn(`Could not parse database URL as a URL: "${DATABASE_URL}"`);

		// by default try to use SSL for better security
		return true;
	}
})();

/** @public */
const client = new Sequelize(DATABASE_URL, {
	dialect: "postgres",
	dialectOptions: <ClientConfig> {
		ssl: shouldUseSSL && {
			require: false,
			rejectUnauthorized: false, // allow self-signed certificates
		},
	},
	logging(sql) {
		App.logger.debug(sql);
	},
});

export default client;
