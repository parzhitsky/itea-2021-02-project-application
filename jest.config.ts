import { resolve } from "path";

export default {
	// Run tests from one or more projects
	projects: [
		resolve(__dirname, "test/config.unit.ts"),
		resolve(__dirname, "test/config.integration.ts"),
	],
};
