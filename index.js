import { bot } from './misc/Bot.js';
import { db } from './misc/Database.js';
import { TwitchSubscriber } from './misc/TwitchSubscriber.js';
import { logger } from './misc/Logger.js';

try {
	await db.initialize()
	await bot.initialize()

	const subscriber = new TwitchSubscriber();
	await subscriber.connectToWebSocket();

	// const channelsToJoin = ['97123979', '48048659', '50985620'];
	const channelsToJoin = ['995903564'];
	await Promise.all(channelsToJoin.map(async channel => {
		await subscriber.subscribeToEvent('channel.chat.message', channel);
	}));

} catch (e) {
	logger.log(`An error occurred: ${e}`);
}