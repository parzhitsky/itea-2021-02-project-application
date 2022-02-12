export default function queryHasFlag(query: object, flag: string): boolean {
	const flags = query as Record<string, unknown>;

	return (flag in flags) && (flags[flag] !== "0") && (flags[flag] !== "false");
}
