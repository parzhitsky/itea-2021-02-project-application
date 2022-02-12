import app from "./app";
import connect from "./db/connect";
import synchronizeModels from "./db/synchronize-models";
import logger from "./log/logger";

const { PORT, DATABASE_CONNECT_TIMEOUT } = process.env;

app.listen(PORT, () => {
	logger.info(`Server is listening on port ${PORT}`);
});

// TODO: make DB a loose dependency (#35)
connect({ timeout: DATABASE_CONNECT_TIMEOUT }).then(({ user, database, host, port }) => {
	logger.info(`Connected to database '${database}' at address '${host}:${port}' as user '${user}'`);

	synchronizeModels();
});
