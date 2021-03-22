// date time formatter
const dateTimeFormatterOptions = {
	weekday: 'short',
	year: 'numeric',
	month: 'short',
	day: 'numeric',
	hour: 'numeric',
	minute: 'numeric',
	second: 'numeric',
	hour12: false,
} as Intl.DateTimeFormatOptions;

// tslint:disable-next-line
export const dateTimeFormatter = new Intl.DateTimeFormat('hr-HR', dateTimeFormatterOptions);