import http = require("http");
import app from "./app";

describe("app", () => {
	it("should be an Express application", () => {
		expect(app).toHaveProperty("listen", expect.any(Function));
		expect(app.listen(8081).close()).toBeInstanceOf(http.Server);
	});
});
