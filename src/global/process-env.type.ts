declare global {
	namespace NodeJS {
		interface ProcessEnv {
			readonly NODE_ENV: "production" | "development" | "test";
			readonly PORT: string;
			readonly HEROKU_BRANCH: string;
			readonly DATABASE_URL: string;
			readonly DATABASE_CONNECT_TIMEOUT: string;
			readonly LOGGER_LEVEL: App.Logger.Level;
			readonly LOGGER_LOGS_DIR: string;
			readonly LOGGER_OUTPUT_LOG_FILENAME: string;
			readonly LOGGER_ERROR_LOG_FILENAME: string;
			readonly JWT_TOKEN_SECRET: string;
		}
	}
}

export {};
