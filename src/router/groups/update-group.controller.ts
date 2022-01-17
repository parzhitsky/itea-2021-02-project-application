import type { RequestHandler } from "express";
import type { GroupTypeCreation } from "../../db/models/group";
import type GroupService from "../../services/group.service";
import RequestValidation, { Joi, Segments } from "../request-validation";
import { groupID, groupName, groupPermissions } from "./definitions";

/** @private */
interface Deps {
	groupService: GroupService;
}

/** @private */
const { requestValidator, request } = new RequestValidation<Partial<GroupTypeCreation>>({
	[Segments.BODY]: Joi.object<GroupTypeCreation>({
		name: groupName,
		permissions: groupPermissions,
	}),
	[Segments.PARAMS]: Joi.object({
		id: groupID,
	}),
});

export default function updateGroup({ groupService }: Deps): RequestHandler[] {
	return [
		requestValidator,
		// TODO: make DB a loose dependency (#35)
		async (req: typeof request, res) => {
			const groupID = req.params.id;
			const group = await groupService.update(groupID, req.body);

			res.json(group);
		}
	];
}
