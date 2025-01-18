import config from '../../config.js';

export const helix = async (endpoint, method = 'GET', body = {}, useBotAuth = false) => {
  const url = `https://api.twitch.tv/helix/${endpoint}`;

  const auth = useBotAuth ? await getBotAuthToken() : await getAppAuthToken();

  const options = {
    method: method,
    headers: {
      'Client-Id': config.twitch.clientId,
      Authorization: `Bearer ${auth}`,
      'Content-Type': 'application/json'
    },
    body: (method === "POST" || method === "PATCH") ? JSON.stringify(body) : null,
  };

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorDetails = await response.json();
      bot.log.error(
        `error in ${method} ${url}: ${response.status} ${response.statusText} - ${errorDetails.message || 'no detailed message'}`
      );

      return null;
    }

    try {
      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (e) {
      bot.log.error(
        `failed to parse JSON response from ${method} ${url}, content may not be JSON: ${e}`
      );
      return null;
    }
  } catch (e) {
    bot.log.error(`network error in ${method} ${endpoint}: ${e}`);
    return null;
  }
};

export const getBotAuthToken = async () => {
  const tokenData = await bot.db.queryOne(
    'SELECT accessToken, expiresAt, refreshToken FROM tokens WHERE name = ?',
    ['bot-token']
  );

  const currentTime = Date.now();

  if (tokenData && Number(tokenData.expiresAt) > currentTime) {
    return tokenData.accessToken;
  }

  const response = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: config.twitch.clientId,
      client_secret: config.twitch.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: tokenData.refreshToken ?? null
    })
  });

  const newTokenData = await response.json();

  const expiresAt = currentTime + newTokenData.expires_in * 1000;
  await bot.db.query(
    'REPLACE INTO tokens (name, accessToken, expiresAt, refreshToken) VALUES (?, ?, ?, ?)',
    ['bot-token', newTokenData.access_token, expiresAt, newTokenData.refresh_token]
  );

  return newTokenData.access_token;
};

export const getAppAuthToken = async () => {
  const tokenData = await bot.db.queryOne(
    'SELECT accessToken, expiresAt FROM tokens WHERE name = ?',
    ['app-token']
  );

  if (tokenData && Number(tokenData.expiresAt) > Date.now()) {
    return tokenData.accessToken;
  }

  const url = new URL('https://id.twitch.tv/oauth2/token');
  url.search = new URLSearchParams({
    client_id: config.twitch.clientId,
    client_secret: config.twitch.clientSecret,
    grant_type: 'client_credentials'
  }).toString();

  const response = await fetch(url, {
    method: 'POST'
  });

  const newTokenData = await response.json();
  const expiresAt = Date.now() + newTokenData.expires_in * 1000;

  await bot.db.query('REPLACE INTO tokens (name, accessToken, expiresAt) VALUES (?, ?, ?)', [
    'app-token',
    newTokenData.access_token,
    expiresAt
  ]);

  return newTokenData.access_token;
};

export const getModeratingChannels = async () => {
  const channelIds = new Set([config.bot.userId]);
  let cursor;

  do {
    const response = await helix(
      `moderation/channels?user_id=${config.bot.userId}&first=100&after=${cursor || ''}`,
      'GET',
      null,
      true
    );
    cursor = response?.pagination?.cursor || null;

    for (const channel of response?.data || []) {
      channelIds.add(channel.broadcaster_id);
    }
  } while (cursor);

  return channelIds;
};

export const sendMessage = async (channelId, message, parent = '') => {
  const body = {
    broadcaster_id: channelId,
    sender_id: config.bot.userId,
    message: message,
    reply_parent_message_id: parent
  };

  try {
    const response = await helix('chat/messages', 'POST', body, true);
    if (response?.data?.[0]?.is_sent === false) {
      bot.log.error(
        `failed to send Message #${channelId}: ${message} - Reason: ${JSON.stringify(response.data[0].drop_reason)}`
      );
    }

    return response;
  } catch (e) {
    bot.log.error(`Failed to send Message #${channelId}: ${message}`);
  }
};

export const sendAction = async (channelId, message, parent = '') => {
  return await sendMessage(channelId, `/me ${message}`, parent);
};
