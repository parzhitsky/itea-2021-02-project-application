import type { RequestHandler } from "express";
import type GroupService from "../../services/group.service";
import RequestValidation, { Segments, Joi } from "../request-validation";
import { groupID } from "./definitions";

/** @private */
interface Deps {
	groupService: GroupService;
}

/** @private */
const { requestValidator, request } = new RequestValidation({
	[Segments.PARAMS]: Joi.object({
		id: groupID,
	}),
});

export default function getGroupUsers({ groupService }: Deps): RequestHandler[] {
	return [
		requestValidator,
		async (req: typeof request, res) => {
			const groupID = req.params.id;
			const users = await groupService.getGroupUsers(groupID);

			res.json(users);
		},
	];
}
