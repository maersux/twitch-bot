export default {
  name: 'setprefix',
  description: 'set the prefix in a channel',
  aliases: [],
  usage: '<prefix>',
  access: bot.permissions.mod,
  cooldown: bot.cooldown.veryShort,
  async execute(msg) {
    if (!msg.args.length) {
      return bot.commands.usage(msg, this);
    }

    const prefix = msg.args[0];

    if (prefix.length > 15) {
      return { error: 'FeelsDankMan This prefix is too long, the maximum length is 15 characters' };
    }

    if (msg.prefix === prefix) {
      return { error: `FeelsDankMan The prefix is already "${msg.prefix}"` };
    }

    const reservedSymbols = ['.', '/'];
    if (reservedSymbols.some((reservedSymbol) => prefix.startsWith(reservedSymbol))) {
      return {
        error: `FeelsDankMan didn't update prefix because it starts with a twitch reserved symbol`
      };
    }

    await bot.channels.update(msg.channel.id, `prefix`, prefix);

    return `SeemsGood The new prefix is "${prefix}"`;
  }
};
