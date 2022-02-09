import type { Model } from "sequelize";
import type Creatable from "./creatable.type";
import type Entity from "./entity.type";
import type Updatable from "./updatable.type";

/** @private */
interface WithTimestamps extends Creatable, Updatable {}

/**
 * @public
 * @deprecated (using "deprecated" loosely here) This type is a dirty hack. Basically, it allows
 * skipping explicit validation for the `createdAt` and `updatedAt` properties of the model,
 * because, frankly, this should be done by Sequelize itself somewhere under the hood 🤷‍♀️
 */
type ModelWithoutTimestamps<E extends Entity, Creation = E> =
	Model<Omit<E, keyof WithTimestamps>, Creation>

export default ModelWithoutTimestamps;
