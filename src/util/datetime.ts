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
};

export const dateTimeFormatter = new Intl.DateTimeFormat('hr-HR', dateTimeFormatterOptions);