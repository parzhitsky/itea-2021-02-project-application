import client, { Transaction, TransactionOptions } from "./client";

/** @private */
interface Action<Result> {
	(transaction: Transaction): PromiseLike<Result> | Result;
}

export default async function insideTransaction<Result = unknown>(
	action: Action<Result>,
	options?: TransactionOptions,
): Promise<Result> {
	let transaction!: Transaction;

	try {
		transaction = await client.transaction(options);

		const result = await action(transaction);

		await transaction.commit();
		return result;
	} catch (error: unknown) {
		await transaction?.rollback();
		throw error;
	}
}
