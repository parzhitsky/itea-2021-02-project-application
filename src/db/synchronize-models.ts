import client from "./client";

export default async function synchronizeModels(): Promise<void> {
	await client.sync();
}
