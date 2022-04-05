import stringifyFunctionCall, { KnownArgMapperName, ArgMapper } from "./stringify-function-call";

declare global {
	interface Function {
		(...args: unknown[]): unknown;
	}
}

/** @private */
interface LoggedParams {
	level?: App.Logger.Level;
	mapArgs?: KnownArgMapperName | ArgMapper;
}

/** @private */
const STATIC_DESIGNATOR = "+";

/** @private */
const NON_STATIC_DESIGNATOR = ".";

interface Method<Instance extends object = object> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(this: Instance, ...args: any[]): any;
}

interface MethodDecoratorCustom<Instance extends object = object> {
	(
		target: Instance | Constructor<Instance>,
		key: PropertyKey,
		descriptor: TypedPropertyDescriptor<Method<Instance | Constructor<Instance>>>
	): void | TypedPropertyDescriptor<Method<Instance | Constructor<Instance>>>;
}

export default function Logged<Instance extends object>({
	level = "info",
	mapArgs,
}: LoggedParams = {}): MethodDecoratorCustom<Instance> {
	return (target, key, descriptor): void => {
		if (descriptor.value == null)
			return;

		let logPrefix: string;

		if (target instanceof Function)
			logPrefix = target.name + STATIC_DESIGNATOR;

		else
			logPrefix = target.constructor.name + NON_STATIC_DESIGNATOR;

		const params = { prefix: `Calling: ${logPrefix}`, mapArgs } as const;
		const method = descriptor.value;
		const logged: typeof method = function (this: typeof target, ...args) {
			App.logger.log(level, stringifyFunctionCall(key, args, params));
			return method.apply(this, args);
		};

		descriptor.value = logged;
	};
}
