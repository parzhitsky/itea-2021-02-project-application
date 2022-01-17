import bcrypt = require("bcrypt");
import type Entity from "../entity.type";
import type { ImplyTimestamps } from "../with-timestamps.type";
import client, { Model, DataTypes } from "../client";
import Logged from "../../log/logged.decorator";

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

User.init<ImplyTimestamps<User>>({
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
			const salt = await bcrypt.genSalt(10);
			const hash = await bcrypt.hash(password, salt);

			user.setDataValue("password", hash);
		},
	},
});
