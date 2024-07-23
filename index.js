import { Bot } from './misc/Bot.js';
import { Database } from './misc/Database.js';

try {
  global.db = new Database();
  await db.initialize();

  global.bot = new Bot();
  await bot.initialize();

  bot.log.info('bot ready');
} catch (e) {
  console.error(`An error occurred: ${e}`);
}