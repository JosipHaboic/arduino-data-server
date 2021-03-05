export enum MessageCategories {
	WARNING = 'debug',
	ERROR = 'error',
	INFO = 'info',
	DEBUG = 'debug',
}

export interface Message {
	id: string;
	message: string;
	category: MessageCategories;
}
