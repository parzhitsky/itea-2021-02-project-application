import AuthService from "../../services/auth.service";
import UserService from "../../services/user.service";
import createRouter from "../create-router";
import login from "./login.controller";
import renew from "./renew.controller";
import logout from "./logout.controller";

/** @private */
const userService = new UserService();

/** @private */
const authService = new AuthService({ userService });

export default createRouter({
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
