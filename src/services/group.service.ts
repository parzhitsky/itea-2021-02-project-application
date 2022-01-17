import { Op } from "sequelize";
import insideTransaction from "../db/inside-transaction";
import User, { UserType } from "../db/models/user";
import Group, { GroupType, GroupTypeCreation } from "../db/models/group";
import UserGroup from "../db/models/user-group";
import ModelService from "./model-abstract.service";
import Logged from "../log/logged.decorator";

/** @private */
interface FindQuery extends ModelService.FindQuery {
	filter?: string;
}

/** @private */
interface GetOptions {
	includeUsers?: boolean;
}

/** @private */
interface GroupWithUsersType extends GroupType {
	users: UserType[];
}

export default class GroupService extends ModelService<Group> {
	@Logged({ level: "debug" })
	protected async getRecord(id: string): Promise<Group> {
		const record = await Group.findByPk(id);

		if (record == null)
			throw new GroupNotFoundError(id);

		return record;
	}

	@Logged()
	async find({ filter = "", limit }: FindQuery = {}): Promise<GroupType[]> {
		const records = await Group.findAll({
			where: {
				name: {
					[Op.like]: `%${filter}%`,
				},
			},
			limit,
		});

		return records.map((record) => record.get());
	}

	@Logged()
	async create(props: GroupTypeCreation): Promise<GroupType> {
		const record = await Group.create(props);

		return record.get();
	}

	@Logged()
	async delete(id: string): Promise<GroupType> {
		const record = await this.getRecord(id);

		await record.destroy();

		return record.get();
	}

	@Logged()
	async get(id: string, options: GetOptions = {}): Promise<GroupType | GroupWithUsersType> {
		const { includeUsers = true } = options;

		if (!includeUsers)
			return super.get(id);

		const record = await Group.findByPk(id, {
			include: {
				model: User,
				as: "users",
			},
		});

		if (record == null)
			throw new GroupNotFoundError(id);

		return record.get({ plain: true }) as GroupWithUsersType;
	}

	@Logged()
	async getGroupUsers(id: string): Promise<UserType[]> {
		const { users } = await this.get(id, { includeUsers: true }) as GroupWithUsersType;

		return users;
	}

	@Logged()
	async addUsersToGroup(groupID: string, userIDs: string[]): Promise<void> {
		// TODO: prevent adding deleted users to groups

		const records = userIDs.map((userID) => ({ userID, groupID }));

		await insideTransaction((transaction) => UserGroup.bulkCreate(records, { transaction }));
	}

	@Logged()
	async removeUsersFromGroup(groupID: string, userIDs: string[]): Promise<void> {
		await insideTransaction((transaction) => UserGroup.destroy({
			where: {
				groupID,
				userID: {
					[Op.in]: userIDs,
				},
			},
			transaction,
		}));
	}
}

export class GroupNotFoundError extends ModelService.ValueNotFoundError {
	constructor(groupID: string) {
		super(`Group "${groupID}" was not found`);
	}
}
