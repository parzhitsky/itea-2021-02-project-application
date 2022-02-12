import bcrypt = require("bcrypt");
import type Entity from "../entity.type";
import { Model, DataTypes } from "../client";
import Logged from "../../log/logged.decorator";
import initModel from "../init-model";

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

initModel(User, "user", {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		allowNull: false,
		primaryKey: true,
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
