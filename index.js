import { setupBot } from './misc/Bot.js';
import { TwitchSubscriber } from './misc/TwitchSubscriber.js';

try {
	await setupBot();

	const subscriber = new TwitchSubscriber();
	await subscriber.connectToWebSocket();

	// const channelsToJoin = ['97123979', '48048659', '50985620'];
	const channelsToJoin = ['995903564'];
	await Promise.all(channelsToJoin.map(async channel => {
		await subscriber.subscribeToEvent('channel.chat.message', channel);
	}));

} catch (e) {
	console.log(`An error occurred: ${e}`);
}