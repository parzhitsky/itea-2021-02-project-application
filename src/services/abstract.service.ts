import Logged from "../log/logged.decorator";

/** @private */
interface ServiceWithDeps<
	Deps extends Service.Deps,
	Name extends string & keyof Deps,
> {
	deps: {
		readonly [N in Name]: NonNullable<Deps[Name]>;
	};
}

/** @public */
namespace Service {
	// short for "dependencies"
	export type Deps = Record<string, Service | undefined>;
}

/** @public */
abstract class Service<Deps extends Service.Deps = {}> {
	constructor(
		protected readonly deps = Object.create(null) as Deps,
	) {}

	/**
	 * @example
	 * class ServiceOne extends Service {
	 * 	doSomething() {}
	 * }
	 *
	 * type ServiceTwoDeps = {
	 * 	first?: ServiceOne;
	 * };
	 *
	 * class ServiceTwo extends Service<ServiceTwoDeps> {
	 * 	doSomethingUsingServiceOne() {
	 * 		this.using("first");
	 *
	 * 		// the object `this.deps.first` is how properly typed
	 * 		// and it is guaranteed to exist in runtime
	 * 		this.deps.first.doSomething();
	 * 	}
	 * }
	 */
	@Logged({ level: "debug" })
	protected using<
		Name extends string & keyof Deps,
	>(
		name: Name,
	): asserts this is ServiceWithDeps<Deps, Name> {
		if ((this.deps[name] instanceof Service) === false)
			throw new ServiceDependencyMissingError(this, name);
	}
}

/** @public */
namespace Service {
	/**
	 * The purpose of `Service.Error` class is to distinguish well-defined
	 * client-facing errors from internal, possibly unexpected errors.
	 *
	 * For example, a `UserNotFoundError` is a perfectly valid result of
	 * `UserService` correctly doing its job, and it is something that clients
	 * expect to see, – therefore `UserNotFoundError` is a descendant of `Service.Error`;
	 * whereas, `ServiceDependencyMissingError` is an error that means that a service cannot
	 * do its job correctly because of a missing dependency, – it is not a client-facing
	 * error (clients should not see this), – therefore it is not a `Service.Error`.
	 */
	export abstract class Error extends global.Error {
		readonly name = this.constructor.name;

		abstract statusCode: number;
	}
}

export default Service;

export class ServiceDependencyMissingError extends Error {
	constructor(service: Service, dependencyName: string) {
		super(`An instance of ${service.constructor.name} is missing a required dependency "${dependencyName}"`);
	}
}
