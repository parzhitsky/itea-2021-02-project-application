import logger from "./logger";
import entriesOf from "./entries-of";
import createHasPropFn from "./create-has-prop-fn";

/** @private */
const AppImpl = {
	logger,
	entriesOf,
	createHasPropFn,
} as const;

global.App = AppImpl;

declare global {
	// eslint-disable-next-line no-var
	var App: typeof AppImpl;

	namespace App {
		type Logger = typeof logger;

		namespace Logger {
			export type Level = import("./logger/levels").Level;
		}
	}

	interface Console {
		/** @deprecated Use `App.logger.debug(…)` instead */
		debug(...args: unknown[]): void;
		/** @deprecated Use `App.logger.debug(…)` instead */
		trace(...args: unknown[]): void;
		/** @deprecated Use `App.logger.info(…)` instead */
		info(...args: unknown[]): void;
		/** @deprecated Use `App.logger.info(…)` instead */
		log(...args: unknown[]): void;
		/** @deprecated Use `App.logger.warn(…)` instead */
		warn(...args: unknown[]): void;
		/** @deprecated Use `App.logger.error(…)` instead */
		error(...args: unknown[]): void;
	}
}
