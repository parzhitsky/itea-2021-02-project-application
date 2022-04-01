import { RequestHandler, Router } from "express";
import allowMethods, { ExpressHttpMethod } from "express-allow-methods";

/** @private */
type Routes = Record<string, Partial<Record<ExpressHttpMethod, RequestHandler[]>>>;

/** @private */
type Entry<Obj extends object> = [ keyof Obj, Obj[keyof Obj] ];

/** @private */
function * entriesOf<O extends object>(object: O): IterableIterator<Entry<O>> {
	yield * (Object.entries(object) as Entry<O>[]);
}

export default function createRouter(routes: Routes): Router {
	const router = Router();

	for (const [ path, handlers ] of entriesOf(routes)) {
		if (!path.startsWith("/"))
			throw new Error(`Path must start with "/" (encountered "${path}")`);

		const route = router.route(path);
		const entries = Array.from(entriesOf(handlers));
		const allowedMethods = entries.map((entry) => {
			return entry[0].toUpperCase() as Uppercase<ExpressHttpMethod>;
		});

		route.all(allowMethods(...allowedMethods));

		for (const [ method, handler ] of entries)
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			route[method](handler!);
	}

	return router;
}
