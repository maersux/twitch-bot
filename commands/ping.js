import { bot } from '../misc/Bot.js';
import { timeSince } from '../utils/utils.js';
import { sendAction } from '../utils/api/helix.js';
import { permissions } from '../utils/permissions.js';

export default {
	name: 'ping',
	description: 'pong',
	access: permissions.default,
	cooldown: 3,
	async execute(msg, response) {
		return sendAction(msg.channel.id,`🏓 PONG • Bot is running since ${timeSince(bot.runningSince)}`);
	}
}