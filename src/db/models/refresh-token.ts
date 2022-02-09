import type Entity from "../entity.type";
import client, { Model, DataTypes, type ModelStatic } from "../client";
import User from "./user";
import type ModelWithoutTimestamps from "../model-without-timestamps.type";

export interface RefreshTokenTypeCreation {
	userID: string;
}

export interface RefreshTokenType extends Entity, RefreshTokenTypeCreation {
}

export class RefreshToken extends Model<RefreshTokenType, RefreshTokenTypeCreation> {}

export default RefreshToken;

/** @private */
type RefreshTokenTypeNoTimestamps = ModelWithoutTimestamps<RefreshTokenType, RefreshTokenTypeCreation>;

RefreshToken.init<ModelStatic<RefreshTokenTypeNoTimestamps>, RefreshTokenTypeNoTimestamps>({
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
}, {
	sequelize: client,
	tableName: "refresh_token",
});
