import { randomBytes } from 'crypto';
import { createServer } from 'http';
import { createPool } from 'mariadb';
import config from '../config.js';

const scopes = [
  'user:bot',
  'user:read:chat',
  'user:write:chat',
  'user:read:moderated_channels',
  'user:manage:whispers'
];

const redirectUri = new URL(config.twitch.redirectUri);
const state = randomBytes(16).toString('hex');

const authorizeUrl = new URL('https://id.twitch.tv/oauth2/authorize');
authorizeUrl.search = new URLSearchParams({
  client_id: config.twitch.clientId,
  redirect_uri: redirectUri.href,
  response_type: 'code',
  scope: scopes.join(' '),
  state,
  force_verify: 'true'
});

const post = async (url, params) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params)
  });

  return response.json();
};

const authorize = async (code) => {
  const token = await post('https://id.twitch.tv/oauth2/token', {
    client_id: config.twitch.clientId,
    client_secret: config.twitch.clientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri.href
  });

  if (!token.access_token) {
    throw new Error(`token exchange failed: ${token.message ?? JSON.stringify(token)}`);
  }

  const validation = await fetch('https://id.twitch.tv/oauth2/validate', {
    headers: { Authorization: `OAuth ${token.access_token}` }
  }).then((response) => response.json());

  if (validation.user_id !== config.bot.userId) {
    throw new Error(
      `logged in as ${validation.login} (${validation.user_id}), but BOT_USER_ID is ${config.bot.userId}. log in with the bot account`
    );
  }

  const pool = createPool({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.pass,
    database: config.db.name
  });

  try {
    await pool.query(
      'REPLACE INTO tokens (name, accessToken, refreshToken, expiresAt) VALUES (?, ?, ?, ?)',
      ['bot-token', token.access_token, token.refresh_token, Date.now() + token.expires_in * 1000]
    );
  } finally {
    await pool.end();
  }

  return validation.login;
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url, redirectUri);
  if (url.pathname !== redirectUri.pathname) {
    res.writeHead(404).end();
    return;
  }

  const finish = (status, text, exitCode) => {
    res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' }).end(text);
    console.log(text);
    server.close();
    setTimeout(() => process.exit(exitCode), 100);
  };

  if (url.searchParams.get('state') !== state) {
    return finish(400, 'state mismatch, please restart `npm run auth`', 1);
  }

  const code = url.searchParams.get('code');
  if (!code) {
    return finish(400, `authorization failed: ${url.searchParams.get('error_description')}`, 1);
  }

  try {
    const login = await authorize(code);
    finish(200, `stored the bot token for ${login}. you can close this tab and run npm start`, 0);
  } catch (error) {
    finish(500, error.message, 1);
  }
});

server.listen(Number(redirectUri.port) || 80, () => {
  console.log(`log in as ${config.bot.username} and open:\n\n${authorizeUrl}\n`);
});
