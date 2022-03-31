# itea-2021-02-project-application

## Environments and branches

### 🔴 Production [&rarr;](https://itea-2021-02-app.herokuapp.com/)

Production environment "lives" on the `main` branch. Progressing the codebase to production is possible only from `develop` branch and only through Heroku UI.

### 🟡 Staging [&rarr;](https://itea-2021-02-app-staging.herokuapp.com/)

Staging environment is deployed from the `develop` branch. Progressing the codebase to staging is possible only through merging feature pull requests on GitHub.

### 🔵 Development

Development environment is taken from various feature branches, such as `feat/*`, `fix/*` etc. Depending on whether the branch is deployed to Heroku, it is either a local development environment (codebase on the developer's local machine) or remote development environment (deployed codebase).

#### 💻 Local environment

To deploy changes locally, run the server locally (see **Scripts** section below) and find the port number in the logs (usually it is `8081`):

```log
info:    ▪ Server is listening on port 8081
```

> Alternatively, just take the value of `process.env.PORT`, if it is known in advance

Given the port, you can connect to local server using local URL:

```
http://localhost:8081/
```

#### 🌎 Remote environment

To deploy changes remotely, [create a feature pull request](https://github.com/parzhitsky/itea-2021-02-project-application/compare) (from feature branch to `develop`). After all required checks (e.g., tests) are passed, the changes will be deployed as a separate Heroku app at:

```
https://itea-2021-02-app-pr-{GITHUB_PR_NUMBER}.herokuapp.com/
```

Thus, for example, [PR #5](https://github.com/parzhitsky/itea-2021-02-project-application/pull/5) would be deployed to https://itea-2021-02-app-pr-5.herokuapp.com/

### 🟢 Playground [&rarr;](./src/playground.ts)

Playground environment is basically just a file on local development machine. It is used to quickly try out the project from the code's perspective (see **Scripts** section below).

## Endpoints

> Note: 🔐 means that this endpoint requires an access token to be provided in `Authorization` header.

- `GET /` – health-check

### Auth

- `POST /auth/login` – get an access token (with request body packed as its payload) and a refresh token

	_Requires Basic Authorization header with username and password_

- `GET /auth/user` – get info about the user, to which a given refresh token belongs

	_Optionally accepts Bearer Authorization header with refresh token_

- `POST /auth/renew` – get a new access token

	_Requires Bearer Authorization header with refresh token_

- `POST /auth/logout` - invalidate all issued refresh tokens

	_Requires Basic Authorization header with username and password_

### Users


- `GET /users` 🔐 – get list of all users
	- `GET /users?username=<string>` 🔐 – get list of all users, whose username contains a given substring
	- `GET /users?limit=<integer>` 🔐 – get list of all users, limiting the results to the given value
- `POST /users` 🔐 – create new user
- `GET /users/:id` 🔐 – get user by their ID
- `PATCH /users/:id` 🔐 – update user by their ID
- `DELETE /users/:id` 🔐 – delete user by their ID

## Scripts

### Build

- `npm run build`

	Builds an output code from the source code. This also runs "pre-" and "postbuild" hooks that help making a cleaner build.

- `npm run clean`

	Prunes the contents of the output directory, – usually, this is needed to remove leftovers from the previous builds.

- `npm run build:only`

	Builds an output code from the source code, without performing any additional file management through the hooks.

### Verify

- `npm run compile`

	Verify that the code is able to be built without actually building it.

- `npm run lint`

	Verify the code-style (run `npm run lint -- --fix` to also attempt auto-fixing the found issues).

- `npm run test`

	Verify the source code by running all test suites.

- `npm run test:u`

	Verify the source code by running unit tests.

- `npm run test:i`

	Verify the source code by running integration tests.

### Run

- `npm run dev`

	_(intended for a local environment)_ Runs the source code of the application.

- `npm run play`

	_(intended for a local environment)_ Runs the code in the playground file (`src/playground.ts`; the file is created automatically, if needed).

- `npm start`

	_(intended for a remote environment)_ Runs the compiled code of the application (the compiled code must exist prior to that).
