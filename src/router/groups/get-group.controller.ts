import type { RequestHandler } from "express";
import type GroupService from "../../services/group.service";
import queryHasFlag from "../query-has-flag";
import RequestValidation, { Joi, Segments } from "../request-validation";
import { groupID, includeUsersFlag } from "./definitions";

/** @private */
interface Deps {
	groupService: GroupService;
}

/** @private */
interface GetGroupQuery {
	users?: "false" | 0 | "0" | unknown;
}

/** @private */
const { requestValidator, request } = new RequestValidation<unknown, GetGroupQuery>({
	[Segments.QUERY]: Joi.object<GetGroupQuery>({
		users: includeUsersFlag,
	}),
	[Segments.PARAMS]: Joi.object({
		id: groupID,
	}),
});

export default function getGroup({ groupService }: Deps): RequestHandler[] {
	return [
		requestValidator,
		async (req: typeof request, res) => {
			const groupID = req.params.id;
			const group = await groupService.get(groupID, {
				includeUsers: queryHasFlag(req.query, "users"),
			});

			res.json(group);
		},
	];
}
