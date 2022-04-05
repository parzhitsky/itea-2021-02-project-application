/** @private */
interface TypeMap {
	object: object | null;
	symbol: symbol;
	string: string;
	number: number;
	bigint: bigint;
	boolean: boolean;
	function: Function | Constructor;
	undefined: undefined;
}

/** @private */
type TypeOf = keyof TypeMap;

/** @private */
function isNotNull(value: unknown): value is {} {
	return value != null;
}

/** @private */
function hasKey<Key extends PropertyKey>(object: {}, key: Key): object is { [K in Key]: unknown } {
	return key in object;
}

/** @public */
const createHasPropFn = <
	Key extends PropertyKey,
	Type extends TypeOf | undefined = undefined,
>(
	key: Key,
	type?: Type,
) =>
	(value: unknown): value is {
		[K in Key]: Type extends undefined ? unknown : TypeMap[NonNullable<Type>];
	} => {
		return isNotNull(value) && hasKey(value, key) && (type == null || typeof value[key] === type);
	};

export default createHasPropFn;
