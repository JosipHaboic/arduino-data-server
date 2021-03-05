export class Register<T> {
	protected register = new Array();
	protected idGenerator: () => string;

	constructor(idGenerator: () => string) {
		this.idGenerator = idGenerator;
	}

	public add(item: T) {
		this.register.push({
			id: this.idGenerator(),
			message: item,
		})
	}

	public delete(id: string) {
		this.register = this.register.filter((value: any, index: number, arr: any) => {
			return value.id === id;
		});
	}

	public find(id: string) {
		return this.register.find((value: any, index: number, obj: any[]) => value.id === id);
	}

	public all() {
		return [...this.register];
	}
}