import config from '../config.js';

export default {
  name: 'channel',
  description: 'join or part a channel',
  access: bot.permissions.admin,
  usage: '<join|part> <channel>',
  async execute(msg) {
    const action = msg.args[0]?.toLowerCase();
    if (msg.args.length < 2 || !['join', 'part'].includes(action)) {
      return bot.commands.usage(msg, this);
    }

    const login = bot.utils.sanitizeUser(msg.args[1]);
    const user = await bot.api.getUser(login);
    if (!user) {
      return { error: `FeelsDankMan channel ${login} not found` };
    }

    const { id: channelId, login: channel } = user;

    if (action === 'join') {
      if (bot.channels.has(channelId)) {
        return { error: `already joined channel ${bot.utils.antiPing(channel)}` };
      }

      const moderatedChannels = await bot.api.helix.getModeratingChannels();
      if (!moderatedChannels.has(channelId)) {
        return {
          error: `i'm not modded in ${bot.utils.antiPing(channel)}. please add @${config.bot.username} as a moderator in this channel and retry`
        };
      }

      const subscribed = await bot.channels.join(channelId, channel);
      if (!subscribed) {
        return `joined channel ${bot.utils.antiPing(channel)}, but some events couldn't be subscribed to. check the logs`;
      }

      return `joined channel ${bot.utils.antiPing(channel)}`;
    }

    if (!bot.channels.has(channelId)) {
      return { error: `channel ${bot.utils.antiPing(channel)} is not joined` };
    }

    if (channelId === config.bot.userId) {
      return { error: `can't part the bot's own channel` };
    }

    await bot.channels.part(channelId);

    return `parted channel ${bot.utils.antiPing(channel)}`;
  }
};
