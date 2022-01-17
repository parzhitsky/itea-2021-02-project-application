import type { RequestHandler } from "express";
import type UserService from "../../services/user.service";
import RequestValidation, { Joi, Segments } from "../request-validation";
import { getUsersLimit, userLoginSubstring } from "./definitions";

/** @private */
interface Deps {
	userService: UserService;
}

/** @private */
interface GetUsersQuery {
	"login-substring"?: string;
	limit?: number;
}

/** @private */
const { requestValidator, request } = new RequestValidation<unknown, GetUsersQuery>({
	[Segments.QUERY]: Joi.object<GetUsersQuery>({
		"login-substring": userLoginSubstring.allow(""),
		limit: getUsersLimit.allow(""),
	}),
});

export default function getUsers({ userService }: Deps): RequestHandler[] {
	return [
		requestValidator,
		async (req: typeof request, res) => {
			const users = await userService.find({
				filter: req.query["login-substring"],
				limit: req.query.limit,
			});

			res.json(users);
		},
	];
}
