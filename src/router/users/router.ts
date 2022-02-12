import UserService from "../../services/user.service";
import createRouter from "../create-router";
import getUsers from "./get-users.controller";
import createUser from "./create-user.controller";
import getUser from "./get-user.controller";
import updateUser from "./update-user.controller";
import deleteUser from "./delete-user.controller";

/** @private */
const userService = new UserService();

export default createRouter({
	"/": {
		get: getUsers({ userService }),
		post: createUser({ userService }),
	},
	"/:id": {
		get: getUser({ userService }),
		patch: updateUser({ userService }),
		delete: deleteUser({ userService }),
	},
});
