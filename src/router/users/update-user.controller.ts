import type { RequestHandler } from "express";
import type { UserTypeCreation } from "../../db/models/user";
import type UserService from "../../services/user.service";
import RequestValidation, { Joi, Segments } from "../request-validation";
import { username, userPassword as password, userAge as age, userID as id } from "./definitions";

/** @private */
interface Deps {
	userService: Pick<UserService, "update">;
}

/** @private */
const { requestValidator, request } = new RequestValidation<Partial<UserTypeCreation>>({
	[Segments.BODY]: Joi.object<Partial<UserTypeCreation>>({ username, password, age }),
	[Segments.PARAMS]: Joi.object({ id }),
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
