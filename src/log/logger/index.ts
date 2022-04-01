import winston = require("winston");
import levels from "./levels";
import * as transports from "./transports";

export { Level } from "./levels";

/** @public */
const logger = winston.createLogger({
	level: process.env.LOGGER_LEVEL,
	levels,
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.ms(),
		winston.format.errors({ stack: true }),
		winston.format.splat(),
		winston.format.json(),
	),
	transports: [
		transports.outputFile,
		transports.errorFile,
	],
});

if (process.env.NODE_ENV !== "test")
	logger.add(transports.console);

export default logger;
