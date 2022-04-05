process.on("unhandledRejection", (reason) => {
	if (reason instanceof Error)
		throw reason;

	if (typeof reason === "string")
		throw new Error(reason);

	throw new Error(JSON.stringify(reason));
});

App.logger.debug("'unhandledRejection' handler is set");

process.on("uncaughtException", (error: unknown) => {
	App.logger.debug(`Uncaught exception encountered: ${error}`);
	App.logger.error(error);

	process.exit(1);
});

process.on("exit", (code) => {
	App.logger.debug(`Exiting the process with code '${code}'`);
});

App.logger.debug("'uncaughtException' listener is set");
