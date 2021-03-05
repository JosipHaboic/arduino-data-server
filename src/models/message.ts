export enum MessageCategories {
	WARNING = 'warning',
	ERROR = 'error',
	INFO = 'info',
	DEBUG = 'debug',
}

export interface Message {
	id: string;
	message: string;
	category: MessageCategories;
}
