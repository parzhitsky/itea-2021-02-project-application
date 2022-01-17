import RequestValidation, { Joi, Segments } from "../request-validation";
import type { RequestHandler } from "express";
import type GroupService from "../../services/group.service";
import { groupID, userIDs } from "./definitions";
import type WithUserIDs from "./with-user-ids.type";

/** @private */
interface Deps {
	groupService: GroupService;
}

/** @private */
const { requestValidator, request } = new RequestValidation<WithUserIDs>({
	[Segments.BODY]: Joi.object<WithUserIDs>({
		userIDs: userIDs.required(),
	}),
	[Segments.PARAMS]: Joi.object({
		id: groupID,
	}),
});

export default function removeGroupUsers({ groupService }: Deps): RequestHandler[] {
	return [
		requestValidator,
		async (req: typeof request, res) => {
			const userIDs = req.body.userIDs;
			const groupID = req.params.id;

			await groupService.removeUsersFromGroup(groupID, userIDs);

			res.redirect(303, `/groups/${groupID}?users`);
		},
	];
}
