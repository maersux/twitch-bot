import config from '../../config.js';

export class Helix {
  baseUrl = 'https://api.twitch.tv/helix';
  maxMessageLength = 500;

  #tokens = new Map();
  #refreshing = new Map();
  #refreshBlockedUntil = new Map();
  #expirationBuffer = 5 * 60 * 1000;

  async request(endpoint, { method = 'GET', body = null, auth = 'app', silent = false } = {}) {
    const tokenName = auth === 'bot' ? 'bot-token' : 'app-token';

    for (let attempt = 0; ; attempt++) {
      const token = await this.getToken(tokenName);
      if (!token) {
        return { ok: false, status: 401, body: null };
      }

      const result = await bot.api.fetch(`${this.baseUrl}/${endpoint}`, {
        method,
        headers: {
          'Client-Id': config.twitch.clientId,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined,
        silent: true
      });

      if (result.status === 401 && attempt === 0) {
        this.#invalidate(tokenName);
        continue;
      }

      if (!result.ok && !silent) {
        const reason = result.body?.message ?? result.body ?? 'network error';
        bot.log.error(`helix ${method} ${endpoint} failed (${result.status}): ${reason}`);
      }

      return result;
    }
  }

  async fetch(endpoint, options = {}) {
    return (await this.request(endpoint, options)).body;
  }

  async getToken(name) {
    const cached = this.#tokens.get(name);
    if (cached && cached.expiresAt - this.#expirationBuffer > Date.now()) {
      return cached.accessToken;
    }

    if (!this.#refreshing.has(name)) {
      const refresh = this.#refreshToken(name, cached).finally(() => this.#refreshing.delete(name));
      this.#refreshing.set(name, refresh);
    }

    return this.#refreshing.get(name);
  }

  #invalidate(name) {
    const cached = this.#tokens.get(name);
    if (cached) cached.expiresAt = 0;
  }

  async #refreshToken(name, cached) {
    let stored = cached;

    if (!stored) {
      const row = await bot.db.queryOne(
        'SELECT accessToken, refreshToken, expiresAt FROM tokens WHERE name = ?',
        [name]
      );

      if (row) {
        stored = {
          accessToken: row.accessToken,
          refreshToken: row.refreshToken,
          expiresAt: Number(row.expiresAt) || 0
        };
        this.#tokens.set(name, stored);

        if (stored.expiresAt - this.#expirationBuffer > Date.now()) {
          return stored.accessToken;
        }
      }
    }

    if (Date.now() < (this.#refreshBlockedUntil.get(name) ?? 0)) {
      return stored?.accessToken ?? null;
    }

    const params = {
      client_id: config.twitch.clientId,
      client_secret: config.twitch.clientSecret
    };

    if (name === 'bot-token') {
      if (!stored?.refreshToken) {
        bot.log.error('no bot token stored. run `npm run auth` to authorize the bot account');
        return null;
      }

      params.grant_type = 'refresh_token';
      params.refresh_token = stored.refreshToken;
    } else {
      params.grant_type = 'client_credentials';
    }

    const { ok, body } = await bot.api.fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(params)
    });

    if (!ok || !body?.access_token) {
      this.#refreshBlockedUntil.set(name, Date.now() + 30_000);
      bot.log.error(`failed to refresh ${name}`);
      return stored?.accessToken ?? null;
    }

    const token = {
      accessToken: body.access_token,
      refreshToken: body.refresh_token ?? stored?.refreshToken ?? null,
      expiresAt: Date.now() + body.expires_in * 1000
    };
    this.#tokens.set(name, token);

    try {
      await bot.db.query(
        'REPLACE INTO tokens (name, accessToken, refreshToken, expiresAt) VALUES (?, ?, ?, ?)',
        [name, token.accessToken, token.refreshToken, token.expiresAt]
      );
    } catch (error) {
      bot.log.error(`failed to store ${name}:`, error);
    }

    return token.accessToken;
  }

  async getUserByLogin(login) {
    const body = await this.fetch(`users?login=${encodeURIComponent(login)}`);
    return body?.data?.[0] ?? null;
  }

  async getModeratingChannels() {
    const channelIds = new Set([config.bot.userId]);
    let cursor = '';

    do {
      const params = new URLSearchParams({ user_id: config.bot.userId, first: '100' });
      if (cursor) params.set('after', cursor);

      const { ok, body } = await this.request(`moderation/channels?${params}`, { auth: 'bot' });
      if (!ok) break;

      for (const channel of body?.data ?? []) {
        channelIds.add(channel.broadcaster_id);
      }

      cursor = body?.pagination?.cursor ?? '';
    } while (cursor);

    return channelIds;
  }

  async sendMessage(channelId, message, parent = '') {
    return this.#send(channelId, message, parent, '');
  }

  async sendAction(channelId, message, parent = '') {
    return this.#send(channelId, message, parent, '/me ');
  }

  async #send(channelId, message, parent, prefix) {
    const parts = bot.utils.splitMessage(String(message), this.maxMessageLength - prefix.length);

    for (const [index, part] of parts.entries()) {
      const body = {
        broadcaster_id: channelId,
        sender_id: config.bot.userId,
        message: prefix + part
      };

      if (parent && index === 0) {
        body.reply_parent_message_id = parent;
      }

      const { ok, body: response } = await this.request('chat/messages', { method: 'POST', body });
      const result = response?.data?.[0];

      if (!ok || result?.is_sent === false) {
        if (result?.drop_reason) {
          bot.log.error(
            `failed to send message #${channelId}: ${part} - ${result.drop_reason.message}`
          );
        }

        return false;
      }
    }

    return true;
  }
}
