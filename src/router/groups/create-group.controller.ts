import type { RequestHandler } from "express";
import type { GroupTypeCreation } from "../../db/models/group";
import type GroupService from "../../services/group.service";
import RequestValidation, { Joi, Segments } from "../request-validation";
import { groupName, groupPermissions } from "./definitions";

/** @private */
interface Deps {
	groupService: GroupService;
}

/** @private */
const { requestValidator, request } = new RequestValidation<GroupTypeCreation>({
	[Segments.BODY]: Joi.object<GroupTypeCreation>({
		name: groupName.required(),
		permissions: groupPermissions.required(),
	}),
});

export default function createGroup({ groupService }: Deps): RequestHandler[] {
	return [
		requestValidator,
		// TODO: make DB a loose dependency (#35)
		async (req: typeof request, res) => {
			const { id: groupID, createdAt } = await groupService.create(req.body);

			res.status(201).json({
				groupID,
				createdAt,
			});
		},
	];
}
