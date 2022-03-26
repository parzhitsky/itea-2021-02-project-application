import type { RequestHandler } from "express";
import type AuthService from "../../services/auth.service";

/** @private */
interface Deps {
	authService: Pick<AuthService, "getUserByRefreshTokenAuth">;
}

export default function getUser({ authService }: Deps): RequestHandler[] {
	return [
		async (req, res) => {
			const auth = req.header("authorization");
			const user = await authService.getUserByRefreshTokenAuth(auth);

			res.json(user);
		},
	];
}
