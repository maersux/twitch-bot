import { runningSince } from '../misc/Bot.js';
import { timeSince } from '../utils/utils.js';

export default {
	name: 'ping',
	description: 'pong',

	async execute() {
		const response = text => ({text, reply: true});
		return response(`🏓 PONG • Bot is running since ${timeSince(runningSince)}`);
	}
}