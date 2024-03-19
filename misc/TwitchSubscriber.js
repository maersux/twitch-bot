import fetch from 'node-fetch';
import WebSocket from 'ws';
import config from '../config.js';

export class TwitchSubscriber {
	constructor() {
		this.token = config.twitch.token;
		this.clientId = config.twitch.clientId;
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
				'Authorization': `Bearer ${this.token}`,
				'Client-Id': this.clientId,
				'Content-Type': 'application/json'
			}
		};

		const response = await fetch(url, options);

		if (!response.ok) {
			const text = await response.text();
			throw new Error(`Failed subscribing to event. Server returned status ${response.status}. Response body: ${text}`);
		}
	}

	connectToWebSocket() {
		return new Promise((resolve, reject) => {
			this.socket = new WebSocket('wss://eventsub.wss.twitch.tv/ws?keepalive_timeout_seconds=600');

			this.socket.on('open', () => {
				console.log('Connected to Twitch');
			});

			this.socket.on('close', () => {
				console.log('Disconnected from Twitch');
			});

			this.socket.on('error', err => {
				console.error('Error occurred:', err);
			});

			this.socket.on('message', data => {
				const message = JSON.parse(data);

				switch (message.metadata.message_type) {
					case 'session_welcome':
						this.sessionId = message.payload.session.id;
						console.log('Received welcome message. Session id:', this.sessionId);
						resolve();
						break;

					case 'session_reconnect':
						console.log('Received reconnect message. Reconnecting to:', message.payload.session.reconnect_url);
						this.socket.close();
						this.socket = new WebSocket(message.payload.session.reconnect_url);
						this.connectToWebSocket();
						break;

					default:
						console.log(`Received: ${data}`);
						break;
				}
			});

			this.socket.on('ping', () => {
				console.log('Received ping. Sending pong...');
				this.socket.pong();
			});
		});
	}
}