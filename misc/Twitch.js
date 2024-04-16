import config from '../config.js';

const helix = async (endpoint, method, body) => {
	const url = `https://api.twitch.tv/helix/${endpoint}`;

	const options = {
		method: method,
		headers: {
			'Client-Id': config.twitch.clientId,
			'Authorization': `Bearer ${config.twitch.token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	};

	console.log(options);

	try {
		const response = await fetch(url, options);
		if (response.ok) {
			return await response.json();
		} else {
			console.error(`Error in ${method} ${endpoint}: ${response.statusText}`);
			return null;
		}
	} catch (e) {
		console.error(`Network error in ${method} ${endpoint}: ${e}`);
		return null;
	}
};

export const sendMessage = async (channelId, message, parent = '') => {
	const body = {
		broadcaster_id: channelId,
		sender_id: config.bot.userId,
		message: message,
		reply_parent_message_id: parent
	};

	return await helix('chat/messages', 'POST', body);
};