import WebSocket from 'ws';
import config from '../config.js';
import { EventHandler } from './EventHandler.js';
import { logger } from './Logger.js';

export class TwitchSubscriber {
	constructor() {
		this.socket = null;
		this.sessionId = null;
	}

	async subscribeToEvent(eventName, broadcasterUserId) {
		const url = 'https://api.twitch.tv/helix/eventsub/subscriptions';
		const payload = {
			type: eventName,
			version: '1',
			condition: {
				broadcaster_user_id: broadcasterUserId,
				user_id: config.bot.userId
			},
			transport: {
				method: 'websocket',
				session_id: this.sessionId
			}
		};

		const options = {
			method: 'POST',
			body: JSON.stringify(payload),
			headers: {
				'Authorization': `Bearer ${config.twitch.token}`,
				'Client-Id': config.twitch.clientId,
				'Content-Type': 'application/json'
			}
		};

		const response = await fetch(url, options);

		if (!response.ok) {
			const text = await response.text();
			throw new Error(`Failed subscribing to event. Server returned status ${response.status}. Response body: ${text}`);
		}
	}

	async connectToWebSocket() {
		return new Promise((resolve, reject) => {
			this.socket = new WebSocket('wss://eventsub.wss.twitch.tv/ws?keepalive_timeout_seconds=600');

			this.socket.on('open', () => {
				const date = new Date();
				logger.log(`${date.toISOString()} - Connected to Twitch`);
			});

			this.socket.on('close', (e) => {
				const date = new Date();
				logger.log(`${date.toISOString()} - Disconnected from Twitch: ${e}`);
			});

			this.socket.on('error', (e) => {
				const date = new Date();
				logger.error(`${date.toISOString()} - Error occurred: ${e}`);
			});

			this.socket.on('message', data => {
				const message = JSON.parse(data);

				switch (message.metadata.message_type) {
					case 'session_welcome': {
						this.sessionId = message.payload.session.id;
						logger.log('Received welcome message. Session id:', this.sessionId);
						resolve();
						return;
					}

					case 'session_reconnect': {
						logger.log('Received reconnect message. Reconnecting to:', message.payload.session.reconnect_url);
						this.socket.close();
						this.socket = new WebSocket(message.payload.session.reconnect_url);
						this.connectToWebSocket();
						return;
					}

					default: {
						// Dynamisches Suchen der EventHandler function je nach event name.
						// wenn event = channel.chat.message dann: EventHandler::channelChatMessage()
						const event = message.payload.event;
						const eventName = this.toCamelCase(message.metadata.subscription_type);
						if (typeof EventHandler[eventName] === 'function') {
							EventHandler[eventName](event);
						}

						return;
					}
				}
			});

			this.socket.on('ping', () => {
				logger.log('Received ping. Sending pong...');
				this.socket.pong();
			});
		});
	}

	toCamelCase(str = '') {
		return str.replace(/\.([a-z])/g, (match, letter) => letter.toUpperCase());
	}
}