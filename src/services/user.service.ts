import { Op, UniqueConstraintError } from "sequelize";
import User, { UserType, UserTypeCreation } from "../db/models/user";
import Logged from "../log/logged.decorator";
import ModelService from "./model-abstract.service";

/** @private */
interface FindQuery extends ModelService.FindQuery {
	filter?: string;
	filterExact?: boolean;
}

export default class UserService extends ModelService<User> {
	@Logged({ level: "debug" })
	protected async getRecord(id: string): Promise<User> {
		const record = await User.findOne({
			where: {
				id,
				isDeleted: false,
			},
		});

		if (record == null)
			throw new UserNotFoundError(id);

		return record;
	}

	@Logged()
	async find({ filter = "", filterExact = false, limit }: FindQuery = {}): Promise<UserType[]> {
		const records = await User.findAll({
			where: {
				login: {
					[Op.like]: filterExact ? filter : `%${filter}%`,
				},
				isDeleted: "false",
			},
			order: [['login', 'ASC']],
			limit,
		});

		return records.map((record) => record.get());
	}

	@Logged({ level: "debug", mapArgs: "hide" })
	protected async createRecord(props: UserTypeCreation): Promise<User> {
		return User.create(props);
	}

	@Logged()
	async findRecordByLogin(login: string): Promise<User | null> {
		return User.findOne({ where: { login, isDeleted: "false" } });
	}

	@Logged()
	async findByLogin(login: string): Promise<UserType | null> {
		const user = await this.findRecordByLogin(login);

		return user?.get() ?? null;
	}

	@Logged()
	async create(props: UserTypeCreation): Promise<UserType> {
		try {
			const record = await this.createRecord(props);

			return record.get();
		} catch (error: unknown) {
			if (error instanceof UniqueConstraintError)
				throw new UserNotUniqueError(props.login);

			throw error;
		}
	}

	@Logged()
	async delete(id: string): Promise<UserType> {
		const record = await this.updateAnyProps(id, { isDeleted: true });

		return record.get();
	}
}

export class UserNotFoundError extends ModelService.ValueNotFoundError {
	constructor(userID: string) {
		super(`User "${userID}" was not found`);
	}
}

export class UserNotUniqueError extends ModelService.ValueNotUniqueError {
	constructor(userLogin: string) {
		super(`User with login "${userLogin}" already exists`);
	}
}
