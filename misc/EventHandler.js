export class EventHandler {
	static channelChatMessage(event) {
		// Komplette Nachricht vom EventSub
		// console.log(`Received: ${message}`);

		// Semi-Verarbeitete Nachricht
		console.log({
			channel: {
				id: event.broadcaster_user_id,
				login: event.broadcaster_user_login
			},
			user: {
				id: event.chatter_user_id,
				login: event.chatter_user_login
			},
			message: {
				id: event.message_id,
				text: event.message.text
			}
		});
	}
}