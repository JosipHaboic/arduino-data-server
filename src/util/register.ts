export class Register<T> {
	protected register = new Map<string, T>();
	protected idGenerator: () => string;

	constructor(idGenerator: () => string) {
		this.idGenerator = idGenerator;
	}

	public get(id: string): T | undefined {
		return this.register.get(id);
	}

	public add(item: T): Map<string, T> {
		return this.register.set(this.idGenerator(), item);
	}

	public has(id: string): Boolean {
		return this.register.has(id);
	}

	public delete(id: string): Boolean {
		return this.register.delete(id);
	}

	public keys(): IterableIterator<string> {
		return this.register.keys();
	}

	public values(): IterableIterator<T> {
		return this.register.values();
	}

	public size(): number {
		return this.register.size;
	}

}
