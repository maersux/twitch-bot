import { bot } from '../misc/Bot.js';
import { timeSince } from '../utils/utils.js';
import { sendAction } from '../utils/api/helix.js';
import { permissions } from '../utils/permissions.js';
import { duration } from '../utils/cooldown.js';

export default {
	name: 'ping',
	description: 'pong',
	aliases: ['pong'],
	access: permissions.default,
	cooldown: duration.xs,
	async execute(msg, response) {
		return sendAction(msg.channel.id,`🏓 PONG • Bot is running since ${timeSince(bot.runningSince)}`);
	}
}