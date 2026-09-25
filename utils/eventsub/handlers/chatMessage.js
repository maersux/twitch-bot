import config from '../../../config.js';

export const channelChatMessage = async (event) => {
  if (event.chatter_user_id === config.bot.userId) return;

  if (
    event.source_broadcaster_user_id &&
    event.source_broadcaster_user_id !== event.broadcaster_user_id
  ) {
    return;
  }

  const channel = bot.channels.get(event.broadcaster_user_id);
  if (!channel) return;

  const prefix = channel.prefix || config.bot.prefix;
  const text = event.message.text.replace(/\s+/g, ' ').trim();
  if (!text.startsWith(prefix)) return;

  const args = text.slice(prefix.length).trim().split(' ');
  const trigger = args.shift().toLowerCase();

  const command = bot.commands.get(trigger);
  if (!command) return;

  const msg = {
    id: event.message_id,
    text: args.join(' '),
    prefix,
    args,
    command: {
      name: command.name,
      trigger
    },
    channel: {
      id: event.broadcaster_user_id,
      login: event.broadcaster_user_login,
      name: event.broadcaster_user_name
    },
    user: {
      id: event.chatter_user_id,
      login: event.chatter_user_login,
      name: event.chatter_user_name,
      perms: bot.permissions.get(event.chatter_user_id, event.badges)
    },

    async send(message, reply = true) {
      return bot.api.helix.sendMessage(msg.channel.id, message, reply ? msg.id : '');
    },

    async sendAction(message) {
      return bot.api.helix.sendAction(msg.channel.id, message);
    }
  };

  if (msg.user.perms <= bot.permissions.ignored) {
    if (bot.cooldown.hasOrSet(`ignoredUser:${msg.user.id}`, 3600)) return;
    return msg.send(`you're being ignored`);
  }

  const cooldownKey = `commands:${command.name}-${msg.user.id}`;
  const cooldown = command.cooldown ?? bot.cooldown.short;
  if (msg.user.perms < bot.permissions.admin && bot.cooldown.hasOrSet(cooldownKey, cooldown)) {
    return;
  }

  if ((command.access ?? bot.permissions.default) > msg.user.perms) {
    return msg.send(`you don't have the required permission to execute this command`);
  }

  try {
    bot.log.msg(`#${msg.channel.login} @${msg.user.login}: ${text}`);

    const result = await command.execute(msg);
    const response = typeof result === 'string' ? { text: result } : result;

    if (response?.error) {
      bot.cooldown.remove(cooldownKey);
    }

    const output = response?.error || response?.text;
    if (output) {
      const parent = response.reply === false ? '' : msg.id;

      if (response.action) {
        await bot.api.helix.sendAction(msg.channel.id, output, parent);
      } else {
        await bot.api.helix.sendMessage(msg.channel.id, output, parent);
      }
    }

    bot.stats.commandExecuted(command.name);
  } catch (error) {
    bot.log.error(`command ${command.name} failed:`, error);
    await msg.send(`FeelsDankMan error: ${error.message}`);
  }
};
