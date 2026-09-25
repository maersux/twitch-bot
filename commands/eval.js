export default {
  name: 'eval',
  description: 'evaluates a given js code',
  access: bot.permissions.dev,
  usage: '<code>',
  async execute(msg) {
    if (!msg.args.length) {
      return bot.commands.usage(msg, this);
    }

    try {
      const result = await eval(`(async () => {
        ${msg.text}
      })()`);

      if (result === undefined) return;

      return typeof result === 'object' ? JSON.stringify(result) : String(result);
    } catch (e) {
      return { error: `FeelsDankMan error ${e}` };
    }
  }
};
