/** @public */
const levels = {
	error: 0,
	warn: 1,
	info: 2,
	debug: 3,
} as const;

export const colors = {
	error: "red",
	warn: "yellow",
	info: "white",
	debug: "blue",
} as const;

export default levels;

export type Level = keyof typeof levels;
