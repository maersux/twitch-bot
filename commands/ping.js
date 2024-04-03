import { runningSince } from '../misc/Bot.js';
import { timeSince } from '../utils/utils.js';

export default {
	name: 'ping',
	description: 'pong',
	async execute(msg, response) {
		return response(`/me 🏓 PONG • Bot is running since ${timeSince(runningSince)}`);
	}
}