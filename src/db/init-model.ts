import type { Model, ModelStatic, ModelAttributes, InitOptions } from "sequelize";
import type Creatable from "./creatable.type";
import type Updatable from "./updatable.type";
import client from "./client";

/** @private */
interface WithTimestamps extends Creatable, Updatable {}

/** @private */
type ModelWithoutTimestamps<
	Type extends object,
	TypeCreation extends object = Type,
> =
	Model<Omit<Type, keyof WithTimestamps>, TypeCreation>;

/** @private */
type WithOptional<
	Obj extends object,
	Key extends keyof Obj,
> =
	Omit<Obj, Key> & Partial<Pick<Obj, Key>>;

/** @private */
type InitModelParams = Omit<WithOptional<InitOptions, "sequelize">, "tableName" | "timestamps">;

export default function initModel<
	Type extends object,
	TypeCreation extends object = Type,
>(
	Model: ModelStatic<ModelWithoutTimestamps<Type, TypeCreation>>,
	tableName: string,
	attributes: ModelAttributes<ModelWithoutTimestamps<Type, TypeCreation>>,
	params: InitModelParams = {},
): void {
	Model.init(attributes, {
		sequelize: client,
		...params,
		timestamps: true,
		tableName,
	});
}
