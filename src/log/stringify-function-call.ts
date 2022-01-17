export type KnownArgMapperName =
	| "stringify"
	| "toIndex"
	| "hide"
	;

export interface ArgMapper {
	(value: unknown, index: number): string;
}

/** @private */
interface StringifyFunctionCallParams {
	prefix?: string;
	mapArgs?: KnownArgMapperName | ArgMapper;
}

/** @private */
const argMappers: Record<KnownArgMapperName, ArgMapper> = {
	stringify(value, index) {
		try {
			return JSON.stringify(value);
		} catch (error) {
			return argMappers.toIndex(value, index);
		}
	},

	toIndex(value, index) {
		return `$${index}`;
	},

	hide() {
		return `…`;
	},
} as const;

export default function stringifyFunctionCall(key: PropertyKey, args: unknown[], {
	prefix = "",
	mapArgs: argMapperName = "stringify",
}: StringifyFunctionCallParams = {}): string {
	const argMapper = argMapperName instanceof Function ? argMapperName : argMappers[argMapperName];
	const argsMapped = args.map(argMapper).join(", ");

	// myMethod(), [42](), [Symbol.myMethod]()
	const callName = typeof key === "string" ? key : `[${String(key)}]`;

	return prefix + callName + `(${argsMapped})`;
}
