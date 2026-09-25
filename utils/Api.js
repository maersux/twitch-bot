import config from '../config.js';
import { Helix } from './apis/Helix.js';

export class Api {
  constructor() {
    this.userAgent = `twitch bot by ${config.owner.username}`;
    this.timeout = 10_000;

    this.helix = new Helix();

    this.userCache = new Map();
    this.userCacheTtl = 10 * 60 * 1000;
    this.userCacheLimit = 5000;
  }

  async fetch(url, { headers = {}, silent = false, responseType = 'json', ...options } = {}) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(this.timeout),
        ...options,
        headers: {
          'User-Agent': this.userAgent,
          ...headers
        }
      });

      const text = await response.text();
      let body = text || null;

      if (text && responseType === 'json') {
        try {
          body = JSON.parse(text);
        } catch {}
      }

      if (!response.ok && !silent) {
        bot.log.error(`error in ${url} (${response.status}): ${text || response.statusText}`);
      }

      return { ok: response.ok, status: response.status, body };
    } catch (error) {
      if (!silent) {
        bot.log.error(`network error in ${url}: ${error.message}`);
      }

      return { ok: false, status: 0, body: null };
    }
  }

  async getUser(login) {
    login = login?.toLowerCase();
    if (!login) return null;

    const cached = this.userCache.get(login);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.user;
    }

    const user = await this.helix.getUserByLogin(login);
    if (!user) return null;

    if (this.userCache.size >= this.userCacheLimit) {
      this.userCache.clear();
    }

    this.userCache.set(login, { user, expiresAt: Date.now() + this.userCacheTtl });
    return user;
  }

  async getUserId(login) {
    return (await this.getUser(login))?.id ?? null;
  }
}
