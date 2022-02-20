import { load } from "dotenv-extended";
import { resolve } from "path";
import { options } from "./common";

/** @private */
const isTest = process.env.NODE_ENV === "test";

load({
	...options,
	path: resolve(__dirname, isTest ? ".env.local-test" : ".env.local"),
	silent: !!process.env.CI, // do not report missing file in a CI run
	errorOnMissing: !isTest,
});
