"use strict";

/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");

/** @public @type {import("dotenv-extended").IDotenvExtendedOptions} */
const options = {
	schema: path.resolve(__dirname, ".env.schema"),
	defaults: path.resolve(__dirname, ".env.defaults"),
};

module.exports = {
	options,
};
