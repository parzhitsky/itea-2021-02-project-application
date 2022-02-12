import type Entity from "../entity.type";
import { Model, DataTypes } from "../client";
import User from "./user";
import initModel from "../init-model";

export interface RefreshTokenTypeCreation {
	userID: string;
}

export interface RefreshTokenType extends Entity, RefreshTokenTypeCreation {
}

export class RefreshToken extends Model<RefreshTokenType, RefreshTokenTypeCreation> {}

export default RefreshToken;

initModel(RefreshToken, "refresh_token", {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		allowNull: false,
		primaryKey: true,
	},
	userID: {
		type: DataTypes.BIGINT,
		allowNull: false,
		references: {
			model: User,
			key: "id",
		},
	},
});
