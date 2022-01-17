import GroupService from "../../services/group.service";
import createRouter from "../create-router";
import getGroups from "./get-groups.controller";
import createGroup from "./create-group.controller";
import getGroup from "./get-group.controller";
import updateGroup from "./update-group.controller";
import deleteGroup from "./delete-group.controller";
import getGroupUsers from "./get-group-users.controller";
import addGroupUsers from "./add-group-users.controller";
import removeGroupUsers from "./remove-group-users.controller";

/** @private */
const groupService = new GroupService();

export default createRouter({
	"/": {
		get: getGroups({ groupService }),
		post: createGroup({ groupService }),
	},
	"/:id": {
		get: getGroup({ groupService }),
		patch: updateGroup({ groupService }),
		delete: deleteGroup({ groupService }),
	},
	"/:id/users": {
		get: getGroupUsers({ groupService }),
		put: addGroupUsers({ groupService }),
		delete: removeGroupUsers({ groupService }),
	},
});
