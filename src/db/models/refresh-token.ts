import type Entity from "../entity.type";
import type { ImplyTimestamps } from "../with-timestamps.type";
import client, { Model, DataTypes } from "../client";
import User from "./user";

export interface RefreshTokenTypeCreation {
	userID: string;
}

export interface RefreshTokenType extends Entity, RefreshTokenTypeCreation {
}

export class RefreshToken extends Model<RefreshTokenType, RefreshTokenTypeCreation> {}

export default RefreshToken;

RefreshToken.init<ImplyTimestamps<RefreshToken>>({
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
