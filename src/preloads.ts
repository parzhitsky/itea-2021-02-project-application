import { resolve } from "path";

const projectRoot = resolve(__dirname, "..");

const preloads = {
	dev: [
		resolve(projectRoot, "./env/local.ts"),
		resolve(projectRoot, "./src/global"),
		resolve(projectRoot, "./src/enable-strict-mode.ts"),
	],
	play: [
		resolve(projectRoot, "./env/local.ts"),
		resolve(projectRoot, "./src/global"),
		resolve(projectRoot, "./src/enable-strict-mode.ts"),
	],
	start: [
		"source-map-support/register",
		resolve(projectRoot, "./env/remote.js"),
		resolve(projectRoot, "./dist/global"),
		resolve(projectRoot, "./dist/enable-strict-mode.js"),
	],
} as const;

function assertKnownCommand(command: unknown): asserts command is keyof typeof preloads {
	if (typeof command !== "string")
		throw new Error("Unknown npm command (probably, `process.env.npm_lifecycle_event` is `undefined`)");

	if (command in preloads === false)
		throw new Error(`Cannot figure out preloads: unknown npm command: "${command}"`);
}

const npmCommand = process.env.npm_lifecycle_event;

assertKnownCommand(npmCommand);

for (const path of preloads[npmCommand])
	require(path);
