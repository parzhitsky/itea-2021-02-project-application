import supertest = require("supertest");
import app from "./app";
import client from "./db/client";
import type { ErrorResponse } from "./services/http-error.service";
import AuthService from "./services/auth.service";
import UserService from "./services/user.service";

const request = supertest(app);

const authService = new AuthService();
const userService = new UserService();

function getToken(): string {
	const token = authService.sign({ tokenType: "access" });

	return `Bearer ${token}`;
}

async function getIdOfDeletedUser(): Promise<string> {
	const user = await userService.create({
		username: "test-user-" + Date.now(),
		age: 42,
		password: "test-user-Password123",
	});

	await userService.delete(user.id);

	return user.id;
}

function getUserMissingResponse(userID: string): ErrorResponse {
	return {
		message: `Request "GET /users/${userID}" failed`,
		details: expect.arrayContaining([
			{
				kind: "message",
				value: `User "${userID}" was not found`,
			},
		]),
		statusCode: 404,
	};
}

afterAll(() => client.close());

describe("GET /users/{user_id} (where {user_id} does not exist in DB)", () => {
	it("should return '404 Not Found' response", async () => {
		const id = "59145c76-ee91-4abc-a8ba-3ae8d807d99d";

		const { body } = await request.get(`/users/${id}`)
			.set("Authorization", getToken());

		expect(body).toMatchObject(getUserMissingResponse(id));
	});
});

describe("GET /users/{user_id} (where {user_id} was deleted)", () => {
	it("should return '404 Not Found' response", async () => {
		const id = await getIdOfDeletedUser();

		const { body } = await request.get(`/users/${id}`)
			.set("Authorization", getToken());

		expect(body).toMatchObject(getUserMissingResponse(id));
	});
});
