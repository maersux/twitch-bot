## Twitch Bot - Modular Twitch Chat Bot

 

A modern, extensible Twitch chat bot built with Node.js, leveraging Conduit WebSockets and the Twitch API.

## 🌟 Features

- Modular Command System: Easily add new commands in the commands/ folder.

- Permission Management: Centralized control over user roles and command permissions.

- Cooldowns: Prevent command spam with automatic rate-limits.

- Database Support: MariaDB/MySQL integration for data persistence.

- Comprehensive Logging: Structured logging of errors and events.


## ⚙️ Installation

Clone the repository:

```bash
git clone https://github.com/maersux/twitch-bot.git
cd twitch-bot
```

Install dependencies:

```bash
npm install
```












    
## Generating OAuth Tokens

To connect the bot to Twitch, you need an access and refresh token:

 - Register a Twitch Application

```Go to https://dev.twitch.tv/console/apps```

Create a new application with Redirect URI ```http://localhost:8888``` and type ```confidential```.

Save the Client ID and Client Secret in your .env file.

- Request an Authorization Code

Open this URL in your browser (logged in with the bot account):

```https://id.twitch.tv/oauth2/authorize?client_id=<CLIENT_ID>&redirect_uri=http://localhost:8888&response_type=code&scope=analytics:read:extensions+analytics:read:games+bits:read+channel:manage:ads+channel:read:ads+channel:manage:broadcast+channel:read:charity+channel:edit:commercial+channel:read:editors+channel:manage:extensions+channel:read:goals+channel:read:guest_star+channel:manage:guest_star+channel:read:hype_train+channel:manage:moderators+channel:read:polls+channel:manage:polls+channel:read:predictions+channel:manage:predictions+channel:manage:raids+channel:read:redemptions+channel:manage:redemptions+channel:manage:schedule+channel:read:stream_key+channel:read:subscriptions+channel:manage:videos+channel:read:vips+channel:manage:vips+clips:edit+moderation:read+moderator:manage:announcements+moderator:manage:automod+moderator:read:automod_settings+moderator:manage:automod_settings+moderator:manage:banned_users+moderator:read:blocked_terms+moderator:manage:blocked_terms+moderator:manage:chat_messages+moderator:read:chat_settings+moderator:manage:chat_settings+moderator:read:chatters+moderator:read:followers+moderator:read:guest_star+moderator:manage:guest_star+moderator:read:shield_mode+moderator:manage:shield_mode+moderator:read:shoutouts+moderator:manage:shoutouts+moderator:read:unban_requests+moderator:manage:unban_requests+user:edit+user:edit:follows+user:read:blocked_users+user:manage:blocked_users+user:read:broadcast+user:manage:chat_color+user:read:email+user:read:emotes+user:read:follows+user:read:moderated_channels+user:read:subscriptions+user:manage:whispers+channel:bot+channel:moderate+chat:edit+chat:read+user:bot+user:read:chat+user:write:chat+whispers:read+whispers:edit+moderator:manage:warnings```

After granting access, you'll be redirected to ```http://localhost:8888?code=<YOUR_CODE>```.

Copy the code parameter from the URL.

- Execute the following cURL request (replace placeholders):

```curl -X POST 'https://id.twitch.tv/oauth2/token'
-H 'Content-Type: application/x-www-form-urlencoded'
-d 'client_id=<CLIENT_ID>&client_secret=<CLIENT_SECRET>&code=<CODE_FROM_BEFORE>&grant_type=authorization_code&redirect_uri=http://localhost:8888'
```

The response will include access_token, refresh_token, and expires_in.

Store Tokens in the Database in the tokens table. Make sure to set the name to
  ``` bot-token ``` 

Note: You can set expires_at to 0 initially.

## 🚀 Running the Bot

Start the Bot

```bash
  npm run start
```

The bot will automatically connect to Twitch and listen for chat events.


## Default Commands



Default Prefix is - and can be changed in the config.js

| Command | Description     | Permission                |
| :-------- | :------- | :------------------------- |
| -ping | Pong | Everyone |
| -setprefix | set the prefix in a channel | Mod |
| -permission | get/update a users permission | Everyone |
| -channel | join or part a channel | Admin |
| -eval | evaluates a given js code | Dev |






## 🤝 Contributing


Contributions, bug reports, and feature requests are welcome:

Open an issue

Fork the repository

Create a feature branch

Submit a pull request

## <h3 align="left">Languages and Tools:</h3>
<p align="left"> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg" alt="javascript" width="40" height="40"/> </a> <a href="https://www.mysql.com/" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/mysql/mysql-original-wordmark.svg" alt="mysql" width="40" height="40"/> </a> <a href="https://nodejs.org" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original-wordmark.svg" alt="nodejs" width="40" height="40"/> </a> </p>


