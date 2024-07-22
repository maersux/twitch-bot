const logMessage = (type, color, ...args) => {
	const options = { timeZone: 'Europe/Berlin' }
	const date = new Date().toLocaleString('de-DE', options);

	const coloredType = `\x1b[${color}m${type}\x1b[97m`;
	console.log(`\x1b[37m${date}\x1b[97m [${coloredType}]:`, ...args);
}

// Farbcodes:
// https://en.wikipedia.org/wiki/ANSI_escape_code#3-bit_and_4-bit
export const logger = {
	log(...args) {
		logMessage('LOG', '34', ...args);
	},

	info(...args) {
		logMessage('INFO', '32', ...args);
	},

	warn(...args) {
		logMessage('WARN', '33', ...args);
	},

	error(...args) {
		logMessage('ERROR', '31', ...args);
	},

	irc(...args) {
		logMessage('IRC', '96', ...args);
	},

	web(...args) {
		logMessage('WEB', '95', ...args);
	}
}