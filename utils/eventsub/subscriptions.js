import config from '../../config.js';
import { channelChatMessage } from './handlers/chatMessage.js';

export const channelTopics = [
  {
    type: 'channel.chat.message',
    version: '1',
    condition: {
      broadcaster_user_id: '{channelId}',
      user_id: config.bot.userId
    },
    handler: channelChatMessage
  },
  {
    type: 'stream.online',
    version: '1',
    condition: {
      broadcaster_user_id: '{channelId}'
    },
    handler: () => {}
  },
  {
    type: 'stream.offline',
    version: '1',
    condition: {
      broadcaster_user_id: '{channelId}'
    },
    handler: () => {}
  }
];

export const botTopics = [
  {
    type: 'user.whisper.message',
    version: '1',
    condition: {
      user_id: '{channelId}'
    },
    handler: (event) => bot.log.msg(`whisper from @${event.from_user_login}: ${event.whisper.text}`)
  }
];
