import type { RequestHandler } from "express";
import type UserService from "../../services/user.service";
import RequestValidation, { Joi, Segments } from "../request-validation";
import { userID } from "./definitions";

/** @private */
interface Deps {
	userService: UserService;
}

/** @private */
const { requestValidator, request } = new RequestValidation({
	[Segments.PARAMS]: Joi.object({
		id: userID,
	}),
});

export default function getUser({ userService }: Deps): RequestHandler[] {
	return [
		requestValidator,
		async (req: typeof request, res) => {
			const userID = req.params.id;
			const user = await userService.get(userID);

			res.json(user);
		},
	];
}
