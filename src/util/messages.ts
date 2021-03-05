import { Message, MessageCategories } from '../models';

export class MessageRegister {
	protected register = new Array<Message>();
	protected idGenerator: () => string;

	constructor(idGenerator: () => string) {
		this.idGenerator = idGenerator;
	}

	public add(message: string, category: MessageCategories) {
		this.register.push({
			id: this.idGenerator(),
			message,
			category,
		});
	}

	public delete(id: string) {
		this.register = this.register.filter((value: any, index: number, arr: any) => {
			return value.id !== id;
		});
	}

	// public find(id: string) {
	// 	return this.register.find((value: any, index: number, obj: any[]) => value.id === id);
	// }

	public all() {
		return [...this.register];
	}

	public clear() {
		this.register = new Array<Message>();
	}
}