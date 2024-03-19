import { TwitchSubscriber } from './misc/TwitchSubscriber.js';

const subscriber = new TwitchSubscriber();
subscriber.connectToWebSocket().then(async () => {
	await subscriber.subscribeToEvent('channel.chat.message', '995903564');
}).catch(err => {
	console.log('An error occurred: ' + err);
});