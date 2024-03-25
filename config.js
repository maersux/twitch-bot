import dotenv from 'dotenv';
dotenv.config();

const config = {
	bot: {
		prefix: '-',
		userId: process.env.BOT_USER_ID,
		username: process.env.BOT_USERNAME
	},
	owner: {
		userId: process.env.BOT_OWNER_USER_ID,
		username: process.env.BOT_OWNER_USERNAME
	},
	twitch: {
		clientId: process.env.TWITCH_CLIENT_ID,
		clientSecret: process.env.TWITCH_CLIENT_SECRET,
		token: process.env.TWITCH_TOKEN,
		// Keine Ahnung welche Scopes ich brauche.
		scopes: [
			'channel:manage:broadcast',
			'channel:read:hype_train',
			'channel:read:predictions',
			'channel:read:vips',
			'moderation:read',
			'moderator:manage:banned_users',
			'moderator:read:chatters',
			'moderator:read:followers',
			'user:read:chat',
			'user:write:chat',
			'user:read:emotes',
			'user:read:follows',
			'user:read:moderated_channels',
			'user:read:subscriptions',
			'user:manage:whispers',
			'user:bot'
		]
	},
	db: {
		url: process.env.DB_URL,
		name: process.env.DB_NAME,
		user: process.env.DB_USER,
		pass: process.env.DB_PASS
	}
};

export default config;