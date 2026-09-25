export default {
  name: 'ping',
  description: 'pong',
  aliases: ['pong'],
  access: bot.permissions.default,
  cooldown: bot.cooldown.veryShort,
  async execute(msg) {
    const messages = [
      `🏓 ${msg.command.trigger === 'pong' ? 'PING' : 'PONG'}`,
      `bot uptime: ${bot.utils.timeSince(bot.stats.runningSince)}`,
      `channels: ${bot.channels.count()}`,
      `commands executed: ${bot.utils.formatNumber(bot.stats.commandsExecuted)}`
    ];

    return { text: bot.utils.joinMessage(messages), action: true, reply: false };
  }
};
