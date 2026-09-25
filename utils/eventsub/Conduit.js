import config from '../../config.js';
import { Shard } from './Shard.js';
import { botTopics, channelTopics } from './subscriptions.js';

export class Conduit {
  conduitId = null;
  shard = new Shard(this);

  #handlers = new Map([...channelTopics, ...botTopics].map((topic) => [topic.type, topic.handler]));
  #subscriptions = new Map();

  async initialize() {
    this.conduitId = await this.#getConduitId();
    bot.log.twitch(`conduit: ${this.conduitId}`);

    await this.shard.connect();
    await this.#loadSubscriptions();

    await this.subscribe([config.bot.userId], botTopics);
    await this.subscribe(bot.channels.getAll());

    bot.log.twitch(`eventsub ready, ${this.count()} subscriptions`);
  }

  teardown() {
    this.shard.close();
  }

  count() {
    return this.#subscriptions.size;
  }

  async subscribe(channelIds, topics = channelTopics) {
    let ok = true;

    for (const channelId of channelIds) {
      for (const topic of topics) {
        ok = (await this.#subscribe(channelId, topic)) && ok;
      }
    }

    return ok;
  }

  async unsubscribe(channelIds, topics = channelTopics) {
    for (const channelId of channelIds) {
      for (const topic of topics) {
        const key = this.#key(topic.type, topic.version, channelId);
        const id = this.#subscriptions.get(key);
        if (!id) continue;

        const { ok, status } = await bot.api.helix.request(`eventsub/subscriptions?id=${id}`, {
          method: 'DELETE'
        });

        if (ok || status === 404) {
          this.#subscriptions.delete(key);
        }
      }
    }
  }

  async assignShard(sessionId) {
    const { ok, body } = await bot.api.helix.request('eventsub/conduits/shards', {
      method: 'PATCH',
      body: {
        conduit_id: this.conduitId,
        shards: [{ id: '0', transport: { method: 'websocket', session_id: sessionId } }]
      }
    });

    if (!ok || body?.errors?.length) {
      throw new Error(`failed to assign shard: ${JSON.stringify(body?.errors ?? body)}`);
    }
  }

  async handleNotification(type, event) {
    const handler = this.#handlers.get(type);
    if (!handler || !event) return;

    try {
      await handler(event);
    } catch (error) {
      bot.log.error(`eventsub: ${type} handler failed:`, error);
    }
  }

  handleRevocation(subscription) {
    const channelId = this.#channelIdOf(subscription.condition);
    this.#subscriptions.delete(this.#key(subscription.type, subscription.version, channelId));

    bot.log.warn(
      `eventsub: ${subscription.type} for ${channelId} got revoked (${subscription.status})`
    );
  }

  async #getConduitId() {
    const { ok, body } = await bot.api.helix.request('eventsub/conduits');
    if (!ok) {
      throw new Error('failed to fetch conduits');
    }

    const existing = body?.data ?? [];
    const stored = (await bot.db.queryOne('SELECT id FROM conduits'))?.id;

    if (stored && existing.some((conduit) => conduit.id === stored)) {
      return stored;
    }

    if (stored) {
      bot.log.warn(`conduit ${stored} doesn't exist anymore, creating a new one`);
    }

    let conduitId = !stored ? existing[0]?.id : null;

    if (!conduitId) {
      const created = await bot.api.helix.request('eventsub/conduits', {
        method: 'POST',
        body: { shard_count: 1 }
      });

      conduitId = created.body?.data?.[0]?.id;
      if (!conduitId) {
        throw new Error('failed to create conduit');
      }
    }

    await bot.db.query('DELETE FROM conduits');
    await bot.db.query('INSERT INTO conduits (id) VALUES (?)', [conduitId]);

    return conduitId;
  }

  async #loadSubscriptions() {
    const subscriptions = [];
    let cursor = '';

    do {
      const params = new URLSearchParams({ status: 'enabled' });
      if (cursor) params.set('after', cursor);

      const { ok, body } = await bot.api.helix.request(`eventsub/subscriptions?${params}`);
      if (!ok) {
        throw new Error('failed to fetch eventsub subscriptions');
      }

      subscriptions.push(...(body?.data ?? []));
      cursor = body?.pagination?.cursor ?? '';
    } while (cursor);

    this.#subscriptions.clear();

    for (const subscription of subscriptions) {
      if (subscription.transport?.conduit_id !== this.conduitId) continue;

      const channelId = this.#channelIdOf(subscription.condition);
      this.#subscriptions.set(
        this.#key(subscription.type, subscription.version, channelId),
        subscription.id
      );
    }
  }

  async #subscribe(channelId, topic) {
    const key = this.#key(topic.type, topic.version, channelId);
    if (this.#subscriptions.has(key)) return true;

    const condition = JSON.parse(
      JSON.stringify(topic.condition).replaceAll('{channelId}', channelId)
    );

    const { ok, status, body } = await bot.api.helix.request('eventsub/subscriptions', {
      method: 'POST',
      body: {
        type: topic.type,
        version: topic.version,
        condition,
        transport: { method: 'conduit', conduit_id: this.conduitId }
      },
      silent: true
    });

    const id = body?.data?.[0]?.id;
    if (ok && id) {
      this.#subscriptions.set(key, id);
      return true;
    }

    if (status === 409) {
      bot.log.warn(`eventsub: ${topic.type} for ${channelId} already exists on another transport`);
      return true;
    }

    if (status === 403) {
      bot.log.warn(`eventsub: not authorized to subscribe to ${topic.type} for ${channelId}`);
      return false;
    }

    bot.log.error(
      `eventsub: failed to subscribe to ${topic.type} for ${channelId} (${status}): ${body?.message ?? 'no response'}`
    );
    return false;
  }

  #key(type, version, channelId) {
    return `${type}:${version}:${channelId}`;
  }

  #channelIdOf(condition = {}) {
    return condition.broadcaster_user_id ?? condition.user_id ?? null;
  }
}
