import bcrypt = require("bcrypt");
import type Entity from "../entity.type";
import client, { Model, DataTypes, type ModelStatic } from "../client";
import Logged from "../../log/logged.decorator";
import type ModelWithoutTimestamps from "../model-without-timestamps.type";

export interface UserTypeCreation {
	login: string;
	/** Password hash, actually */
	password: string;
	age: number;
}

export interface UserType extends Entity, UserTypeCreation {
	isDeleted?: boolean;
}

export class User extends Model<UserType, UserTypeCreation> {
	@Logged()
	isPasswordCorrect(password: string): Promise<boolean> {
		return bcrypt.compare(password, this.getDataValue("password"));
	}
}

export default User;

/** @private */
type UserNoTimestamps = ModelWithoutTimestamps<UserType, UserTypeCreation>;

User.init<ModelStatic<UserNoTimestamps>, UserNoTimestamps>({
	id: {
		type: DataTypes.BIGINT,
		primaryKey: true,
		allowNull: false,
		autoIncrement: true,
	},
	login: {
		type: DataTypes.STRING(255),
		unique: "user_login",
		allowNull: false,
	},
	password: {
		type: DataTypes.STRING(255),
		allowNull: false,
	},
	age: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	isDeleted: {
		type: DataTypes.BOOLEAN,
		defaultValue: false,
	},
}, {
	sequelize: client,
	tableName: "user",
	indexes: [
		{
			name: "user_login",
			fields: [ "login" ],
			unique: true,
		},
	],
	hooks: {
		async beforeCreate(user) {
			const password = user.getDataValue("password");
			const hash = await bcrypt.hash(password, 10);

			user.setDataValue("password", hash);
		},
	},
});
