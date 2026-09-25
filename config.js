import dotenv from 'dotenv';
dotenv.config({ quiet: true });

const required = [
  'BOT_USERNAME',
  'BOT_USER_ID',
  'BOT_OWNER_USERNAME',
  'BOT_OWNER_USER_ID',
  'TWITCH_CLIENT_ID',
  'TWITCH_CLIENT_SECRET',
  'DB_HOST',
  'DB_NAME',
  'DB_USER'
];

const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`missing environment variables: ${missing.join(', ')} (see .env.example)`);
  process.exit(1);
}

const config = {
  bot: {
    prefix: process.env.BOT_PREFIX || '-',
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
    redirectUri: process.env.TWITCH_REDIRECT_URI || 'http://localhost:8888'
  },
  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    pass: process.env.DB_PASS
  }
};

export default config;
