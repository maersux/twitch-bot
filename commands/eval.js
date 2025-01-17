import * as twitch from '../utils/api/helix.js';
import * as conduits from '../utils/api/conduits.js';
import * as ivrHelper from '../utils/api/ivr.js';

export default {
  name: 'eval',
  description: 'evaluates a given js code',
  access: bot.permissions.owner,
  usage: '<code>',
  async execute(msg, response) {
    if (!msg.args.length) return response(`usage: ${msg.prefix}${msg.command.trigger} ${this.usage}`);

    try {
      const result = await eval(`(async () => {
				${msg.text}
			})()`);

      if (result) {
        return response(`✅ output: ${String(result)}`);
      }

    } catch (e) {
      bot.log.error(e);
      return response(`FeelsDankMan Error ${e}`);
    }
  }
};