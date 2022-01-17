import type Entity from "../entity.type";
import type { ImplyTimestamps } from "../with-timestamps.type";
import client, { Model, DataTypes } from "../client";

export type Permission = (typeof permissions)[number];

export interface GroupTypeCreation {
	name: string;
	permissions: Permission[];
}

export interface GroupType extends Entity, GroupTypeCreation {
}

export const permissions = [ "READ", "WRITE", "DELETE", "SHARE", "UPLOAD_FILES" ] as const;

export class Group extends Model<GroupType, GroupTypeCreation> {}

export default Group;

Group.init<ImplyTimestamps<Group>>({
	id: {
		type: DataTypes.BIGINT,
		primaryKey: true,
		allowNull: false,
		autoIncrement: true,
	},
	name: {
		type: DataTypes.STRING(255),
		allowNull: false,
	},
	permissions: {
		type: DataTypes.ARRAY(DataTypes.ENUM<Permission>(...permissions)),
		allowNull: false,
		defaultValue: [],
	},
}, {
	sequelize: client,
	tableName: "group",
});
