import logger from "./log/logger";

process.on("unhandledRejection", (reason) => {
	if (reason instanceof Error)
		throw reason;

	if (typeof reason === "string")
		throw new Error(reason);

	throw new Error(JSON.stringify(reason));
});

logger.debug("'unhandledRejection' handler is set");

process.on("uncaughtException", (error: unknown) => {
	logger.debug(`Uncaught exception encountered: ${error}`);
	logger.error(error);

	process.exit(1);
});

process.on("exit", (code) => {
	logger.debug(`Exiting the process with code '${code}'`);
});

logger.debug("'uncaughtException' listener is set");
