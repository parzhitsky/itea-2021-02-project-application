import type { RequestHandler } from "express";
import type AuthService from "../../services/auth.service";

/** @private */
interface Deps {
	authService: AuthService;
}

export default function logout({ authService }: Deps): RequestHandler[] {
	return [
		async (req, res) => {
			const auth = req.header("authorization");

			await authService.logout(auth);

			res.sendStatus(204);
		},
	];
}
