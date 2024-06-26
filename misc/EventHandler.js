import config from '../config.js';
import { commands } from './Bot.js';
import { sendMessage } from './Twitch.js';

export class EventHandler {
	static channelChatMessage = async (event) => {
		// Komplette Nachricht vom EventSub
		// console.log(`Received: ${JSON.stringify(event)}`);

		const prefix = '_' || config.bot.prefix;

		if (!event.message.text.startsWith(prefix)) return;
		if (event.chatter_user_id === config.bot.userId) return;

		const filteredText = event.message.text.replace(/\s+/g, ' ').replace(/[^ -~]+/g, '').trim();
		const args = filteredText.slice(prefix.length).trim().split(' ');
		const commandName = args.shift().toLowerCase();

		const msg = {
			id: event.message_id,
			text: filteredText,
			prefix: prefix,
			args: args,
			command: commandName,
			channel: {
				id: event.broadcaster_user_id,
				login: event.broadcaster_user_login,
				name: event.broadcaster_user_name
			},
			user: {
				id: event.chatter_user_id,
				login: event.chatter_user_login,
				name: event.chatter_user_name,
			},

			async send(message, reply = true) {
				const parent = reply ? event.message_id : '';
				await sendMessage(event.broadcaster_user_id, message, parent);
			}
		};

		const command = commands[commandName];
		if (!command) return;

		try {
			const responseFunction = text => ({text, reply: true});
			const response = await command.execute(msg, responseFunction);

			if (response?.text) {
				const parent = response?.reply ? event.message_id : '';

				await sendMessage(event.broadcaster_user_id, response.text, parent);
			}
		} catch (e) {
			const parent = event.message_id;
			await sendMessage(event.broadcaster_user_id, `FeelsDankMan ${e}`, parent);
		}
	}
}