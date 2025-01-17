export default {
  name: 'ping',
  description: 'pong',
  aliases: ['pong'],
  access: bot.permissions.default,
  cooldown: bot.cooldown.veryShort,
  async execute(msg, response) {
    const messages = [
      `🏓 ${msg.command.trigger === 'pong' ? 'PING' : 'PONG'}`,
      `bot uptime: ${bot.utils.timeSince(bot.uptime)}`,
      `channels: ${bot.channels.size}`
    ];

    return msg.sendAction(messages.join(` • `));
  }
};