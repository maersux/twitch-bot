## Twitch Bot - Modular Twitch Chat Bot

A modern, extensible Twitch chat bot built with Node.js, leveraging EventSub conduits and the Twitch API.

## 🌟 Features

- Modular Command System: Easily add new commands in the commands/ folder.

- Permission Management: Centralized control over user roles and command permissions.

- Cooldowns: Prevent command spam with automatic rate-limits.

- Database Support: MariaDB/MySQL integration for data persistence.

- Reliable EventSub: Conduit + websocket shard with automatic reconnects and keepalive checks.

- Chat Bot Badge: Messages are sent with an app access token.

## ⚙️ Installation

Requirements: Node.js 20.12 or newer and a MariaDB/MySQL database.

Clone the repository:

```bash
git clone https://github.com/maersux/twitch-bot.git
cd twitch-bot
```

Install dependencies:

```bash
npm install
```

Create the database tables from `db-schema.sql`, then copy `.env.example` to `.env` and fill it in.

## 🔓 Authorizing the Bot Account

- Register a Twitch Application

Go to https://dev.twitch.tv/console/apps and create a new application with the OAuth Redirect URL `http://localhost:8888` and client type `Confidential`.

Save the Client ID and Client Secret in your .env file.

- Run the auth script

```bash
npm run auth
```

Open the printed URL in a browser that is logged in with the **bot account** and grant access. The script stores the token as `bot-token` in the `tokens` table and refreshes it automatically from then on.

The bot requests these scopes:

| Scope | Used for |
| :-------- | :------- |
| `user:bot` | reading chat via EventSub, chat bot badge |
| `user:read:chat` | reading chat via EventSub |
| `user:write:chat` | sending chat messages |
| `user:read:moderated_channels` | checking for mod status in `-channel join` |
| `user:manage:whispers` | receiving whispers |

<details>
<summary>Doing it manually instead</summary>

Open this URL (logged in as the bot account):

```
https://id.twitch.tv/oauth2/authorize?client_id=<CLIENT_ID>&redirect_uri=http://localhost:8888&response_type=code&scope=user:bot+user:read:chat+user:write:chat+user:read:moderated_channels+user:manage:whispers
```

Copy the `code` parameter from the URL you get redirected to and exchange it:

```bash
curl -X POST 'https://id.twitch.tv/oauth2/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'client_id=<CLIENT_ID>&client_secret=<CLIENT_SECRET>&code=<CODE>&grant_type=authorization_code&redirect_uri=http://localhost:8888'
```

Insert `access_token` and `refresh_token` into the `tokens` table with the name `bot-token` and `expiresAt` set to `0`.

</details>

## 🚀 Running the Bot

Start the Bot

```bash
npm run start
```

The bot connects to Twitch and always joins its own channel. Type `-channel join <channel>` there to join other channels. The bot has to be a moderator in a channel before it can join it.

## Default Commands

Default prefix is `-` and can be changed with `BOT_PREFIX` in the .env or per channel with `-setprefix`.

| Command | Description     | Permission                |
| :-------- | :------- | :------------------------- |
| -ping | pong | Everyone |
| -setprefix | set the prefix in a channel | Mod |
| -permission | get your permission; admins can update permissions below their own | Everyone |
| -channel | join or part a channel | Admin |
| -eval | evaluates a given js code | Dev |

## ✍️ Writing Commands

Every `.js` file in `commands/` (subfolders included) is a command. The global `bot` object gives access to everything else.

```js
export default {
  name: 'hello', // defaults to the file name
  description: 'says hello',
  aliases: ['hi'],
  usage: '<user>',
  access: bot.permissions.default, // minimum permission, default: everyone
  cooldown: bot.cooldown.short, // seconds per user, default: short (5s)
  async execute(msg) {
    if (!msg.args.length) {
      return bot.commands.usage(msg, this);
    }

    // return a string to reply...
    return `hello ${msg.args[0]}`;

    // ...or an object:
    // { text }              reply with text
    // { error }             reply with error, resets the cooldown
    // { text, reply: false } send without replying to the message
    // { text, action: true } send as /me
  }
};
```

`msg` contains `text`, `args`, `prefix`, `command`, `channel`, `user` (including `user.perms`) and `send()` for sending extra messages.

Event handlers for EventSub topics (stream online/offline, whispers, ...) live in `utils/eventsub/subscriptions.js`.

## ⬆️ Upgrading From an Older Version

The `subscriptions` and `users` tables are no longer used. Update the `tokens` table with:

```sql
ALTER TABLE tokens MODIFY expiresAt BIGINT DEFAULT NULL;
DROP TABLE IF EXISTS subscriptions, users;
```

## 🤝 Contributing

Got an idea, found a bug, or want to add a new feature? Contributions are always welcome!

### How to contribute:

- 🔧 Fork the repo
- 🌿 Create a feature branch
- 📝 Make your changes and commit
- ✅ Submit a pull request


Thanks for helping make this bot template better
