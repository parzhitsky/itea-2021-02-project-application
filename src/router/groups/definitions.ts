import { permissions } from "../../db/models/group";
import { Joi, definitions } from "../request-validation";

export const groupID = definitions.entityID;

export const groupName = definitions.name;

export const groupPermissionItem = Joi.string()
	.valid(...permissions);

export const groupPermissions = Joi.array()
	.items(groupPermissionItem);

export const includeUsersFlag = Joi.any();

export const userIDs = Joi.array()
	.items(definitions.entityID);
