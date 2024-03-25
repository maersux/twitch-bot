import config from '../config.js';

export class EventHandler {
	static channelChatMessage = async (event) => {
		// Komplette Nachricht vom EventSub
		// console.log(`Received: ${JSON.stringify(event)}`);

		const prefix = '-' || config.bot.prefix;

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
			}
		};

		console.log(msg);
	}
}