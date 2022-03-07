import type { RequestHandler } from "express";
import { randomUUID } from "crypto";

declare global {
	namespace Express {
		interface Request {
			readonly id: string;
		}
	}
}

/** @private */
interface Params {
	headerName?: string;
}

export default function requestID({
	headerName = "X-Request-Id",
}: Params = {}): RequestHandler[] {
	return [
		(req, res, next) => {
			const current = req.header(headerName);
			const id = current ?? randomUUID();

			if (current == null)
				res.setHeader(headerName, id);

			// not using assignment due to property
			// `id` being declared as read-only
			Reflect.set(req, "id", id);

			next();
		},
	];
}
