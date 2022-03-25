import { CelebrateError, Segments, Joi } from "celebrate";
import type { RequestHandler, Request, Response } from "express";
import type { UserType, UserTypeCreation } from "../../db/models/user";
import type UserService from "../../services/user.service";
import createUser from "./create-user.controller";

class UserServiceMock implements Pick<UserService, "create"> {
	async create(props: UserTypeCreation): Promise<UserType> {
		const date = "2021-06-07T19:28:29.517Z";

		return {
			...props,
			id: "42",
			createdAt: date,
			updatedAt: date,
		};
	}
}

function generateRequestHandlerArgs<
	Body extends Partial<UserTypeCreation>,
>(
	body: Body,
): Parameters<RequestHandler<{}, {}, Body>> & { 2: jest.Mock } {
	const req = {
		method: "POST",
		body,
	} as Request<{}, {}, Body>;

	const res = {} as Response;

	res.status = jest.fn(() => res);
	res.json = jest.fn(() => res);

	const next = jest.fn();

	return [ req, res, next ];
}

describe("POST /users", () => {
	let validator: RequestHandler;
	let controller: (...args: Parameters<RequestHandler>) => void | Promise<void>;

	const bodyValid: UserTypeCreation = {
		username: "whatever",
		password: "whateverPassword1",
		age: 42,
	};

	beforeEach(() => {
		[ validator, controller ] = createUser({
			userService: new UserServiceMock(),
		});
	});

	describe("validator", () => {
		let body!: Partial<UserTypeCreation>;

		beforeEach(() => {
			body = ({ ...bodyValid });
		});

		// FIXME: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/34617#issuecomment-497760008
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		test.each<any>([
			[
				"\"username\" to be present",
				() => delete body.username,
				"\"username\" is required",
			],
			[
				"\"username\" to have at least one character",
				() => body.username = "",
				"\"username\" is not allowed to be empty",
			],
			[
				"\"username\" to have at most 32 characters",
				() => body.username = "a".repeat(33),
				"\"username\" length must be less than or equal to 32 characters long",
			],
			[
				"\"username\" to start with a letter",
				() => body.username = "1-hello-world",
				'"username" with value "1-hello-world" fails to match the alpha-numeric characters pattern',
			],
			[
				"\"username\" to only contain letters, digits, and hyphens",
				() => body.username = "hello-world-@",
				'"username" with value "hello-world-@" fails to match the alpha-numeric characters pattern',
			],
			[
				"\"password\" to be present",
				() => delete body.password,
				"\"password\" is required",
			],
			[
				"\"password\" to have at least one character",
				() => body.password = "",
				"\"password\" is not allowed to be empty",
			],
			[
				"\"password\" to have lowercase letters",
				() => body.password = "HELLO-WORLD-1",
				"\"password\" with value \"HELLO-WORLD-1\" fails to match the lowercase letters pattern",
			],
			[
				"\"password\" to have uppercase letters",
				() => body.password = "hello-world-1",
				"\"password\" with value \"hello-world-1\" fails to match the uppercase letters pattern",
			],
			[
				"\"password\" to have digits",
				() => body.password = "HELLO-world-one",
				"\"password\" with value \"HELLO-world-one\" fails to match the digits pattern",
			],
			[
				"\"age\" to be present",
				() => delete body.age,
				"\"age\" is required",
			],
			[
				"\"age\" to be at least 4",
				() => body.age = 3,
				"\"age\" must be greater than or equal to 4",
			],
			[
				"\"age\" to be at most 130",
				() => body.age = 131,
				"\"age\" must be less than or equal to 130",
			],
		])('should validate %s', (name, prepare: Function, message: string, done: jest.DoneCallback) => {
			prepare();

			const [ req, res, next ] = generateRequestHandlerArgs(body);

			validator(req, res, next.mockImplementation(() => {
				expect(next).toHaveBeenCalledTimes(1);
				expect(next).toHaveBeenLastCalledWith(expect.anything());

				const error: CelebrateError = next.mock.calls[0][0];

				expect(error).toBeInstanceOf(CelebrateError);

				const bodyError = error.details.get(Segments.BODY);

				expect(bodyError).toBeInstanceOf(Joi.ValidationError);
				expect(bodyError).toHaveProperty("details", expect.arrayContaining([
					expect.objectContaining({ message }),
				]));

				done();
			}));
		});
	});

	describe("controller", () => {
		it("should respond with status 201, user ID, and user creation date", async () => {
			const [ req, res, next ] = generateRequestHandlerArgs(bodyValid);

			await controller(req, res, next);

			expect(res.status).toHaveBeenCalledTimes(1);
			expect(res.status).toHaveBeenLastCalledWith(201);

			expect(res.json).toHaveBeenCalledTimes(1);
			expect(res.json).toHaveBeenLastCalledWith({
				userID: "42",
				createdAt: "2021-06-07T19:28:29.517Z",
			});
		});
	})
});
