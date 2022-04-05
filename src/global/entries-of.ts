export default function * entriesOf<Obj extends object>(obj: Obj): IterableIterator<readonly [ keyof Obj, Obj[keyof Obj] ]> {
	for (const key in obj)
		yield [ key, obj[key] ];
}
