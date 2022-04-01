import { resolve } from "path";

export const config = {
	// A preset that is used as a base for Jest's configuration
	preset: "ts-jest",

	// The paths to modules that run some code to configure or set up the testing environment before each test
	setupFiles: [
		"<rootDir>/env/local.ts",
	],

	// The root directory that Jest should scan for tests and modules within
	rootDir: resolve(__dirname, "."),

	// ***

	// Indicates whether each individual test should be reported during the run
	verbose: true,

	// The test environment that will be used for testing
	testEnvironment: "node",

	// The number of seconds after which a test is considered as slow and reported as such in the results.
	slowTestThreshold: 3,

	// Make calling deprecated APIs throw helpful error messages
	errorOnDeprecated: true,

	// Automatically reset mock state between every test
	resetMocks: false,

	// Reset the module registry before running each individual test
	resetModules: false,

	// The directory where Jest should store its cached dependency information
	cacheDirectory: "<rootDir>/.cache",
};
