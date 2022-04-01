import type { RequestHandler } from "express";

/** @public */
const sendStatus = (status: number): RequestHandler => (req, res) => {
	res.sendStatus(status);
};

export default sendStatus;
