import { config } from "./jest.config.common";

export default Object.assign({}, config, {
	displayName: "Integration",

	// The glob patterns Jest uses to detect test files
	testMatch: [
		"<rootDir>/src/**/*.integration.ts",
	],

	// The number of seconds after which a test is considered as slow and reported as such in the results.
	slowTestThreshold: 7,
});
