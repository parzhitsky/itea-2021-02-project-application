import Group from "./models/group";
import User from "./models/user";
import UserGroup from "./models/user-group";
import client from "./client";

export default async function synchronizeModels(): Promise<void> {
	User.belongsToMany(Group, {
		through: UserGroup,
		as: "groups",
		foreignKey: "userID",
	});

	Group.belongsToMany(User, {
		through: UserGroup,
		as: "users",
		foreignKey: "groupID",
	});

	await client.sync();
}
