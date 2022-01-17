# crud-app-example

## Environments:

Notice that any push to non-development environment branch automatically triggers deploy to that environment, as in `git push prod main` deploys to production environment.

### 🔴 Production

- Link: https://epam-crud-app-example-prod.herokuapp.com/
- Branch: `main`
- Git link: https://git.heroku.com/epam-crud-app-example-prod.git
- Git remote: `prod`

	```sh
	git remote add prod https://git.heroku.com/epam-crud-app-example-prod.git
	```

### 🟡 Staging

- Link: https://epam-crud-app-example-staging.herokuapp.com/
- Branch: `develop`
- Git link: https://git.heroku.com/epam-crud-app-example-staging.git
- Git remote: `staging`

	```sh
	git remote add staging https://git.heroku.com/epam-crud-app-example-staging.git
	```

### 🔵 Development

> Local development machine.

- Link: _(localhost)_
- Branch: _(any `feature/*` branch)_
- Git link: https://github.com/epam-nodejs-program-2021-03-01/crud-app-example.git
- Git remote: `origin`

	```sh
	git remote add origin https://github.com/epam-nodejs-program-2021-03-01/crud-app-example.git
	```

### 🟢 Playground

> The `src/playground.ts` file on local development machine. Run with `npm run play` script.

- Link: _(localhost)_
- Branch: _(N/A)_
- Git link: _(N/A)_
- Git remote: _(N/A)_

## Endpoints

> Note: 🔐 means that this endpoint requires an access token to be provided in `Authorization` header.

- `GET /` – health-check

### Auth

- `POST /auth/login` – get an access token (with request body packed as its payload) and a refresh token

	_Requires Basic Authorization header with user login and password_

- `POST /auth/renew` – get a new access token

	_Requires Bearer Authorization header with refresh token_

- `POST /auth/logout` - invalidate all issued refresh tokens

	_Requires Basic Authorization header with user login and password_

### Users

- `GET /users` 🔐 – get list of all users
	- `GET /users?login-substring=<string>` 🔐 – get list of all users, whose login contains the given substring
	- `GET /users?limit=<integer>` 🔐 – get list of all users, limiting the results to the given value
- `POST /users` 🔐 – create new user
- `GET /users/:id` 🔐 – get user by their ID
- `PATCH /users/:id` 🔐 – update user by their ID
- `DELETE /users/:id` 🔐 – delete user by their ID

### Groups

- `GET /groups` 🔐 – get list of all groups
- `POST /groups` 🔐 – create new group
- `GET /groups/:id` 🔐 – get group by its ID
	- `GET /groups/:id?users=<any>` 🔐 – get group by its ID, include information about members
	- `GET /groups/:id?users=<"0"|"false">` 🔐 – get group by its ID, without information about members
- `PATCH /groups/:id` 🔐 – update group by its ID
- `DELETE /groups/:id` 🔐 – delete group by its ID
- `GET /groups/:id/users` 🔐 – get a list of all members of the group
- `PUT /groups/:id/users` 🔐 – add members to the group
- `DELETE /groups/:id/users` 🔐 – remove members from the group

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

	_(intended for a local environment)_ Runs the code in the playground file.

- `npm start`

	_(intended for a remote environment)_ Runs the compiled code of the application (the compiled code must exist prior to that).
