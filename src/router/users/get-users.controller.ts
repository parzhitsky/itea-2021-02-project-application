import type { RequestHandler } from "express";
import type UserService from "../../services/user.service";
import RequestValidation, { Joi, Segments } from "../request-validation";
import { getUsersLimit, usernameSubstring } from "./definitions";

/** @private */
interface Deps {
	userService: Pick<UserService, "find">;
}

/** @private */
interface GetUsersQuery {
	username?: string;
	limit?: number;
}

/** @private */
const { requestValidator, request } = new RequestValidation<unknown, GetUsersQuery>({
	[Segments.QUERY]: Joi.object<GetUsersQuery>({
		username: usernameSubstring.allow(""),
		limit: getUsersLimit.allow(""),
	}),
});

export default function getUsers({ userService }: Deps): RequestHandler[] {
	return [
		requestValidator,
		async (req: typeof request, res) => {
			const { username, limit } = req.query;

			const users = await userService.find({ username, limit });

			res.json(users);
		},
	];
}
