import type { RequestHandler } from "express";
import type AuthService from "../../services/auth.service";
import RequestValidation, { Joi, Segments } from "../request-validation";

/** @private */
interface Deps {
	authService: Pick<AuthService, "renew">;
}

/** @private */
const { requestValidator, request } = new RequestValidation<object | undefined>({
	[Segments.BODY]: Joi.object().optional(),
});

export default function renew({ authService }: Deps): RequestHandler[] {
	return [
		requestValidator,
		async (req: typeof request, res) => {
			const auth = req.header("authorization");
			const tokens = await authService.renew(auth, req.body);

			res.json(tokens);
		},
	];
}
