import type { Model } from "sequelize";

export default interface WithTimestamps {
	createdAt: string;
	updatedAt: string;
}

/**
 * @deprecated (using "deprecated" loosely here) This type is a dirty hack. Basically, it allows
 * skipping explicit validation for the `createdAt` and `updatedAt` properties of the model,
 * because, frankly, this should be done by Sequelize itself somewhere under the hood 🤷‍♀️
 */
export type ImplyTimestamps<M extends Model> =
	Model<Omit<M["_attributes"], keyof WithTimestamps>, M["_creationAttributes"]>
