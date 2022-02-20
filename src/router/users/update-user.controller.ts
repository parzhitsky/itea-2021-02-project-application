import type { RequestHandler } from "express";
import type { UserTypeCreation } from "../../db/models/user";
import type UserService from "../../services/user.service";
import RequestValidation, { Joi, Segments } from "../request-validation";
import { userLogin, userPassword, userAge, userID } from "./definitions";

/** @private */
interface Deps {
	userService: Pick<UserService, "update">;
}

/** @private */
const { requestValidator, request } = new RequestValidation<Partial<UserTypeCreation>>({
	[Segments.BODY]: Joi.object<Partial<UserTypeCreation>>({
		login: userLogin,
		password: userPassword,
		age: userAge,
	}),
	[Segments.PARAMS]: Joi.object({
		id: userID,
	}),
});

export default function updateUser({ userService }: Deps): RequestHandler[] {
	return [
		requestValidator,
		// TODO: make DB a loose dependency (#35)
		async (req: typeof request, res) => {
			const userID = req.params.id;
			const user = await userService.update(userID, req.body);

			res.json(user);
		},
	];
}
