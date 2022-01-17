import type { RequestHandler } from "express";
import type GroupService from "../../services/group.service";

/** @private */
interface Deps {
	groupService: GroupService;
}

export default function getGroups({ groupService }: Deps): RequestHandler[] {
	return [
		async (req, res) => {
			const groups = await groupService.find();

			res.json(groups);
		},
	];
}
