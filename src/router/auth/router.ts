import AuthService from "../../services/auth.service";
import UserService from "../../services/user.service";
import createRouter from "../create-router";
import getUser from "./get-user.controller";
import login from "./login.controller";
import renew from "./renew.controller";
import logout from "./logout.controller";

/** @private */
const userService = new UserService();

/** @private */
const authService = new AuthService({ userService });

export default createRouter({
	"/user": {
		get: getUser({ authService }),
	},
	"/login": {
		post: login({ authService }),
	},
	"/renew": {
		post: renew({ authService }),
	},
	"/logout": {
		post: logout({ authService }),
	},
});
