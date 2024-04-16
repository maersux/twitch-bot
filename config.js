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
		scopes: [
			'bits:read',
			'chat:read',
			'channel:read:redemptions',
			'channel:moderate',
			'channel:bot',
			'channel:read:subscriptions',
			'channel:manage:predictions',
			'channel:manage:polls',
			'channel:read:charity',
			'channel:read:cheers',
			'channel:read:ads',
			'user:read:email',
			'user:read:broadcast',
			'moderator:manage:banned_users',
			'user:read:chat',
			'user:write:chat',
			'user:read:emotes',
			'user:read:follows',
			'user:read:moderated_channels',
			'user:read:subscriptions'
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