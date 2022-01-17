import type { ErrorRequestHandler } from "express";
import HttpErrorService from "../services/http-error.service";

/** @private */
const httpErrorService = new HttpErrorService();

/** @public */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = (): ErrorRequestHandler => async (error: unknown, req, res, next) => {
	httpErrorService.logError(error);

	const response = httpErrorService.createErrorResponse(error, req);

	res.status(response.statusCode).json(response);
};

export default errorHandler;
