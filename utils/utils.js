export const timeSince = (timestamp) => {
	const duration = Date.now() - timestamp;

	let seconds = Math.floor(duration / 1000);
	let minutes = Math.floor(seconds / 60);
	let hours = Math.floor(minutes / 60);
	let days = Math.floor(hours / 24);

	seconds %= 60;
	minutes %= 60;
	hours %= 24;

	const pluralize = (count, noun) => count + ' ' + noun + (count !== 1 ? 's' : '');

	const formattedDays = days > 0 ? pluralize(days, 'day') + ', ' : '';
	const formattedHours = hours > 0 ? pluralize(hours, 'hour') + ', ' : '';
	const formattedMinutes = minutes > 0 ? pluralize(minutes, 'minute') + ', ' : '';
	const formattedSeconds = seconds > 0 ? pluralize(seconds, 'second') : '';

	return formattedDays + formattedHours + formattedMinutes + formattedSeconds;
}