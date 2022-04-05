declare global {
	interface Constructor<Instance extends object = object> {
		new (...args: never[]): Instance;
	}
}

export {};
