import express = require("express");
import requestID = require("express-request-id");
import cors = require("cors");
import httpLogger from "./middlewares/http-logger";
import errorHandler from "./middlewares/error-handler";
import router from "./router";

declare global {
	namespace Express {
		interface Request {
			readonly id: string;
		}
	}
}

/** @public */
const app = express();

app.set("json replacer", (key: PropertyKey, value: unknown) => value ?? null);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(requestID());
app.use(httpLogger());

app.use(cors({
	origin: "*",
}));

app.use("/", router);

app.use(errorHandler());

export default app;
