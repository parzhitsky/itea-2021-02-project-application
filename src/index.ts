import app from "./app";
import connect from "./db/connect";
import synchronizeModels from "./db/synchronize-models";

const { PORT, DATABASE_CONNECT_TIMEOUT } = process.env;

app.listen(PORT, () => {
	App.logger.info(`Server is listening on port ${PORT}`);
});

connect({ timeout: DATABASE_CONNECT_TIMEOUT }).then(({ user, database, host, port }) => {
	App.logger.info(`Connected to database '${database}' at address '${host}:${port}' as user '${user}'`);

	synchronizeModels();
});
