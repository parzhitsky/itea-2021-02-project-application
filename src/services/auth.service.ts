import ms = require("ms");
import jwt = require("jsonwebtoken");
import Logged from "../log/logged.decorator";
import type { UserType } from "../db/models/user";
import RefreshToken from "../db/models/refresh-token";
import UserService, { UserNotFoundError } from "./user.service";
import Service from "./abstract.service";

/** @private */
type AuthType = "Bearer" | "Basic";

/** @private */
const jwtTokenLifespans = {
	access: "10 minutes",
	refresh: "1 hour",
} as const;

/** @private */
type JwtTokenType = keyof typeof jwtTokenLifespans;

export type Token<Type extends JwtTokenType> = string & {
	/** @deprecated This doesn't exist in runtime */
	readonly __kind__: unique symbol;

	/** @deprecated This doesn't exist in runtime */
	readonly __type__: Type;
};

/** @private */
type PayloadData<Type extends JwtTokenType> = (Type extends "refresh" ? {
	userID: string;
	tokenID: string;
} : unknown);

/** @private */
interface Payload<Type extends JwtTokenType = JwtTokenType> {
	[key: string]: unknown;
	tokenType: Type;
	data?: PayloadData<Type>;
}

export interface IssuedToken<Type extends JwtTokenType> {
	type: Type;
	value: Token<Type>;
	issuedAt: Date;
	expiresAt: Date | null;
}

/** @private */
interface WithAccessToken {
	accessToken: IssuedToken<"access">;
}

/** @private */
interface IssuedTokens extends WithAccessToken {
	refreshToken: IssuedToken<"refresh">;
}

/** @private */
const secret = process.env.JWT_TOKEN_SECRET;

export default class AuthService extends Service<{
	userService?: Service & Pick<UserService, "findRecordByUsername" | "get">;
}> {
	@Logged({ level: "debug" })
	protected parseAuthValue(expectedType: AuthType, auth: string | undefined): string {
		if (!auth)
			throw new AuthHeaderMissingError();

		const [ type, value ] = auth.split(" ");

		if (type !== expectedType)
			throw new AuthTypeUnexpectedError(type, expectedType);

		if (!value)
			throw new AuthHeaderMissingError();

		return value;
	}

	@Logged({ level: "debug" })
	protected async getUserByBasicAuth(auth: string | undefined): Promise<UserType> {
		this.using("userService");

		const credsRaw = this.parseAuthValue("Basic", auth);
		const creds = Buffer.from(credsRaw, "base64").toString("ascii");

		const [ username, password ] = creds.split(":");

		const user = await this.deps.userService.findRecordByUsername(username);

		if (user == null)
			throw new AuthCredsInvalidError(username);

		const passwordsMatch = await user.isPasswordCorrect(password);

		if (!passwordsMatch)
			throw new AuthCredsInvalidError(username);

		return user.get();
	}

	@Logged({ level: "debug" })
	sign<Type extends JwtTokenType>(payload: Payload<Type>, options?: jwt.SignOptions): Token<Type> {
		return jwt.sign(payload, secret, options) as Token<Type>;
	}

	@Logged({ level: "debug" })
	protected issueToken<Type extends JwtTokenType>(type: Type, data?: PayloadData<Type>): IssuedToken<Type> {
		const now = Date.now();
		const lifespan: string = jwtTokenLifespans[type];
		const token = this.sign<Type>({
			data,
			tokenType: type,
			iat: Math.floor(now / 1000),
		}, {
			expiresIn: lifespan,
		});

		return {
			type,
			value: token,
			issuedAt: new Date(now),
			expiresAt: new Date(now + ms(lifespan)),
		};
	}

	@Logged({ level: "debug" })
	protected async invalidateRefreshToken(userID: string): Promise<void> {
		const destroyedCount = await RefreshToken.destroy({ where: { userID } });

		if (destroyedCount > 0)
			App.logger.info(`Invalidated refresh token for user "${userID}"`);

		if (destroyedCount > 1)
			App.logger.warn(`User "${userID}" unexpectedly has ${destroyedCount} refresh tokens`);
	}

	@Logged({ level: "debug" })
	protected async issueRefreshToken(userID: string): Promise<IssuedToken<"refresh">> {
		await this.invalidateRefreshToken(userID);

		const tokenDB = await RefreshToken.create({ userID });
		const tokenID = tokenDB.getDataValue("id");

		return this.issueToken("refresh", { tokenID, userID });
	}

	@Logged()
	async login(auth: string | undefined, data?: unknown): Promise<IssuedTokens> {
		const user = await this.getUserByBasicAuth(auth);
		const refreshToken = await this.issueRefreshToken(user.id);
		const accessToken = this.issueToken("access", data);

		return {
			accessToken,
			refreshToken,
		};
	}

	@Logged()
	async logout(auth: string | undefined): Promise<void> {
		const user = await this.getUserByBasicAuth(auth);

		await this.invalidateRefreshToken(user.id);
	}

	@Logged({ level: "debug" })
	protected extractPayload<Type extends JwtTokenType>(type: Type, token: string): Payload<Type> {
		try {
			return jwt.verify(token, secret, { clockTolerance: 1 }) as Payload<Type>;
		} catch (error: unknown) {
			if (error instanceof jwt.TokenExpiredError)
				throw new AuthTokenExpiredError(type, error.expiredAt);

			if (error instanceof jwt.JsonWebTokenError)
				throw new AuthJwtError(error);

			throw error;
		}
	}

	@Logged({ level: "debug" })
	parseToken<Type extends JwtTokenType>(expectedType: Type, auth: string | undefined): PayloadData<Type> | undefined {
		const token = this.parseAuthValue("Bearer", auth);
		const payload = this.extractPayload(expectedType, token);

		if (typeof payload !== "object")
			throw new AuthTokenPayloadUnknownError(payload, "payload is not of an object type");

		if ("tokenType" in payload === false)
			throw new AuthTokenPayloadUnknownError(payload, "tokenType property is missing");

		if (payload.tokenType !== expectedType)
			throw new AuthTokenTypeUnexpectedError(payload.tokenType, expectedType);

		return payload.data;
	}

	@Logged({ level: "debug" })
	protected assertRefreshTokenPayloadDataKnown(data: unknown): asserts data is PayloadData<"refresh"> {
		const payload = { data } as const;

		if (typeof data !== "object" || data == null)
			throw new AuthTokenPayloadUnknownError(payload, "refresh token payload data is not an object");

		if ("tokenID" in data === false)
			throw new AuthTokenPayloadUnknownError(payload, "tokenID property is missing in refresh token payload data object");

		if ("userID" in data === false)
			throw new AuthTokenPayloadUnknownError(payload, "userID property is missing in refresh token payload data object");
	}

	@Logged({ level: "debug" })
	protected async assertRefreshTokenKnown({ userID, tokenID }: PayloadData<"refresh">): Promise<void> {
		const token = await RefreshToken.findOne({ where: { userID } });

		if (token == null)
			throw new AuthRefreshTokenUnknownError(`user "${userID}" does not have associated refresh tokens`);

		if (token.getDataValue("id") !== tokenID)
			throw new AuthRefreshTokenUnknownError(`refresh token "${tokenID}" is not associated with user "${userID}"`);
	}

	@Logged({ level: "debug" })
	protected async convertAuthToRefreshTokenPayloadData(auth: string | undefined): Promise<PayloadData<"refresh">> {
		const data = this.parseToken("refresh", auth);

		this.assertRefreshTokenPayloadDataKnown(data);

		await this.assertRefreshTokenKnown(data);

		return data;
	}

	private readonly getUserByRefreshTokenAuthToleratedErrorNames: Set<string> = new Set([
		AuthHeaderMissingError.name,
		AuthRefreshTokenUnknownError.name,
		UserNotFoundError.name,
	]);

	@Logged()
	async getUserByRefreshTokenAuth(auth: string | undefined): Promise<UserType | null> {
		this.using("userService");

		// alias
		const toleratedErrors = this.getUserByRefreshTokenAuthToleratedErrorNames;

		try {
			const { userID } = await this.convertAuthToRefreshTokenPayloadData(auth);

			return this.deps.userService.get(userID);
		} catch (error) {
			if (error instanceof Error && toleratedErrors.has(error.name)) {
				App.logger.error(error);
				return null;
			}

			throw error;
		}
	}

	@Logged()
	async renew(auth: string | undefined, data?: unknown): Promise<WithAccessToken> {
		await this.convertAuthToRefreshTokenPayloadData(auth);

		return {
			accessToken: this.issueToken("access", data),
		};
	}
}

export abstract class AuthHintedError extends Service.Error {
	public abstract hint: string;
}

export class AuthCredsInvalidError extends Service.Error {
	statusCode = 401;

	constructor(username: string) {
		super(`Invalid credentials: the user "${username}" does not exist, or the password is incorrect`);
	}
}

export class AuthHeaderMissingError extends Service.Error {
	statusCode = 401;

	constructor() {
		super('The "Authorization" header is missing in the request, or its value is empty');
	}
}

export class AuthTypeUnexpectedError extends Service.Error {
	statusCode = 401;

	constructor(actual: string, expected: AuthType) {
		super(`Unexpected type of authorization: expected "${expected}", got "${actual}" instead`);
	}
}

export class AuthTokenTypeUnexpectedError extends Service.Error {
	statusCode = 403;

	constructor(actual: JwtTokenType, expected: JwtTokenType) {
		super(`Unexpected JWT token type: expected ${expected} token, got ${actual} token instead`);
	}
}

export class AuthTokenPayloadUnknownError extends AuthHintedError {
	statusCode = 403;

	constructor(
		public payload: unknown,
		public hint: string,
	) {
		super("Refusing to verify token with unexpected payload");
	}
}

export class AuthTokenExpiredError extends Service.Error {
	statusCode = 403;

	@Logged({ level: "debug" })
	private static calcTimeAgo(then: Date): string {
		return ms(Date.now() - then.getTime(), { long: true });
	}

	constructor(type: JwtTokenType, expiration: Date) {
		super(`The supplied ${type} token has expired ${AuthTokenExpiredError.calcTimeAgo(expiration)} ago`);
	}
}

export class AuthRefreshTokenUnknownError extends AuthHintedError {
	statusCode = 403;

	constructor(
		public hint: string,
	) {
		super("Refusing to validate unknown refresh token");
	}
}

export class AuthJwtError extends Service.Error {
	statusCode = 401;

	constructor(
		public cause: jwt.JsonWebTokenError,
	) {
		super(`Authorization error: ${cause.message}`);
	}
}
