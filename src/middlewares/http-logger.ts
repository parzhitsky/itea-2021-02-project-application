import type { Request, RequestHandler } from "express";
import morgan = require("morgan");

/** @private */
interface HttpLoggerParams {
	level?: App.Logger.Level;
}

/** @private */
const trailingNewLine = /\n$/;

morgan.token("id", (req: Request) => req.id);
morgan.format("main", "[:id] :method :url - :status :response-time ms");

/** @public */
const httpLogger = ({
	level = "info",
}: HttpLoggerParams = {}): RequestHandler => morgan("main", {
	stream: {
		write(log) {
			App.logger.log(level, log.replace(trailingNewLine, ""));
		},
	},
});

export default httpLogger;
