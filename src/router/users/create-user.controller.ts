import type { RequestHandler } from "express";
import type { UserTypeCreation } from "../../db/models/user";
import type UserService from "../../services/user.service";
import RequestValidation, { Joi, Segments } from "../request-validation";
import { userAge, userLogin, userPassword } from "./definitions";

/** @private */
interface Deps {
	userService: Pick<UserService, "create">;
}

/** @private */
const { requestValidator, request } = new RequestValidation<UserTypeCreation>({
	[Segments.BODY]: Joi.object<UserTypeCreation>({
		login: userLogin.required(),
		password: userPassword.required(),
		age: userAge.required(),
	}),
});

export default function createUser({ userService }: Deps): RequestHandler[] {
	return [
		requestValidator,
		// TODO: make DB a loose dependency (#35)
		async (req: typeof request, res) => {
			const { id: userID, createdAt } = await userService.create(req.body);

			res.status(201).json({
				userID,
				createdAt,
			});
		},
	];
}
