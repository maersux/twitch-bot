import { permissions } from '../utils/permissions.js';
import { getUserId } from '../utils/api/ivr.js';
import { antiPing } from '../utils/utils.js';
import { getModeratingChannels } from '../utils/api/helix.js';
import config from '../config.js';

export default {
  name: 'channel',
  description: 'join or part a channel',
  access: permissions.admin,
  usage: 'join or part a channel',
  async execute(msg, response) {
    if (msg.args.length < 2) {
      return response(`usage: ${this.usage}`, { error: true });
    }

    const action = msg.args[0].toLowerCase();
    const channel = msg.args[1].toLowerCase().replace(/[#@,]/g, '');

    const channelId = await getUserId(channel);
    if (!channelId) {
      return response(`FeelsDankMan channel ${channel} not found`);
    }

     switch (action) {
       case 'join': {
         if (bot.channels.has(channelId)) {
           return response(`already joined channel ${antiPing(channel)}`);
         }

         const moderatedChannels = await getModeratingChannels();
         if (!moderatedChannels.has(channelId)) {
           return response(`i'm not modded in ${antiPing(channel)}. please add @${config.bot.username} as a moderator in this channel and retry`);
         }

         await Promise.all([
           bot.conduitClient.subscribeToEvents([channelId]),
           db.query(`INSERT INTO channels (user_id, login, prefix) VALUES (?, ?, ?)`, [channelId, channel, config.bot.prefix]),
           bot.channels.add(channelId)
         ]);

         return response(`joined channel ${antiPing(channel)}`);
       }

       case 'part': {
         if (!bot.channels.has(channelId)) {
           return response(`channel ${antiPing(channel)} is not joined`);
         }

         await Promise.all([
           bot.conduitClient.unsubscribeFromEvents([channelId]),
           db.query(`DELETE FROM channels WHERE user_id = ?`, [channelId]),
           bot.channels.delete(channelId)
         ]);

         return response(`parted channel ${antiPing(channel)}`);
       }

       default: {
         return response(`usage: ${this.usage}`, { error: true });
       }
     }
  }
}