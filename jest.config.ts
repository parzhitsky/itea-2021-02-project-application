import { resolve } from "path";

export default {
	// Run tests from one or more projects
	projects: [
		resolve(__dirname, "jest.config.unit.ts"),
		resolve(__dirname, "jest.config.integration.ts"),
	],
};
