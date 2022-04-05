import winston = require("winston");
import { consoleFormat } from "winston-console-format";
import path = require("path");
import { colors } from "./levels";

export const console = new winston.transports.Console({
	format: winston.format.combine(
		winston.format.colorize({
			all: true,
			colors,
		}),
		winston.format.padLevels(),
		consoleFormat({
			showMeta: true,
			metaStrip: [ "timestamp" ],
			inspectOptions: {
				depth: 5,
				colors: true,
			},
		}),
	),
});

export const outputFile = new winston.transports.File({
	filename: path.resolve(
		process.cwd(),
		process.env.LOGGER_LOGS_DIR,
		process.env.LOGGER_OUTPUT_LOG_FILENAME,
	),
});

export const errorFile = new winston.transports.File({
	level: "error",
	filename: path.resolve(
		process.cwd(),
		process.env.LOGGER_LOGS_DIR,
		process.env.LOGGER_ERROR_LOG_FILENAME,
	),
});
