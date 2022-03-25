import type { Request, RequestHandler } from "express";
import { celebrator, Joi, SchemaOptions } from "celebrate";

export * from "celebrate";

/** @private */
const createValidator = celebrator({
	reqContext: true,
}, {
	abortEarly: false,
	allowUnknown: true,
});

export default class RequestValidation<
	Body = unknown,
	Query extends object = {},
> {
	request = null as unknown as Request<Record<string, string>, unknown, Body, Query>;
	requestValidator: RequestHandler;

	constructor(schema: SchemaOptions) {
		this.requestValidator = createValidator(schema);
	}
}

export namespace definitions {
	export const name = Joi.string()
		.pattern(/^[a-zA-Z][-a-zA-Z0-9]*$/, { name: "alpha-numeric characters" })
		.min(1)
		.max(32);

	export const naturalNumber = Joi.number()
		.positive()
		.integer();

	export const entityID = Joi.string()
		.uuid();
}
