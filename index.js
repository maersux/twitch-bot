import { Bot } from './Bot.js';

(() => {
  global.bot = new Bot();

  bot
    .initialize()
    .then(() => bot.log.info('Bot initialized'))
    .catch((error) => {
      bot.log.error('Bot initialization failed:', error);
      process.exit(1);
    });

  process.on('unhandledRejection', (reason) => {
    bot.log.error('unhandled rejection:', reason);
  });

  const shutdown = async (signal) => {
    bot.log.info(`received ${signal}, shutting down`);
    setTimeout(() => process.exit(1), 10_000).unref();

    try {
      await bot.teardown();
      process.exit(0);
    } catch (error) {
      bot.log.error('shutdown failed:', error);
      process.exit(1);
    }
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
})();
