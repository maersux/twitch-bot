import config from '../../config.js';
import { logger } from '../../misc/Logger.js';

export const helix = async (endpoint, method = 'GET', body = {}, useBotAuth = false) => {
	const url = `https://api.twitch.tv/helix/${endpoint}`;

	// const auth = useBotAuth ? await getBotAuth() : await getAppAuth();

	const options = {
		method: method,
		headers: {
			'Client-Id': config.twitch.clientId,
			'Authorization': `Bearer ${config.twitch.token}`, // 'Authorization': `Bearer ${auth}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	};

	try {
		const response = await fetch(url, options);
		if (response.ok) {
			return await response.json();
		} else {
			logger.error(`Error in ${method} ${endpoint}: ${response.statusText}`);
			return null;
		}
	} catch (e) {
		logger.error(`Network error in ${method} ${endpoint}: ${e}`);
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

export const sendAction = async (channelId, message, parent = '') => {
	const body = {
		broadcaster_id: channelId,
		sender_id: config.bot.userId,
		message: `/me ${message}`,
		reply_parent_message_id: parent
	};

	try {
		const response = await helix('chat/messages', 'POST', body);
		if (response?.data?.[0]?.is_sent === false) {
			logger.error(`Failed to send Message #${channelId}: ${message} - Reason: ${JSON.stringify(response.data[0].drop_reason)}`);
		}

		return response;
	} catch (e) {
		logger.error(`Failed to send Message #${channelId}: ${message}`)
	}
};