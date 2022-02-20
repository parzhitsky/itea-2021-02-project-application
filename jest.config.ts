import jestConfigUnit from "./jest.config.unit";
import jestConfigIntegration from "./jest.config.integration";

export default {
	// Run tests from one or more projects
	projects: [
		jestConfigUnit,
		jestConfigIntegration,
	],
};
