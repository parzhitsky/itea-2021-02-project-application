import type Creatable from "./creatable.type";
import type Updatable from "./updatable.type";

export default interface Entity extends Creatable, Updatable {
	id: string;
}
