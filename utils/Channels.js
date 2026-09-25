import config from '../config.js';

export class Channels {
  static updatableSettings = ['prefix'];

  constructor() {
    this.channelsMap = new Map();
  }

  async initialize() {
    await bot.db.query(`INSERT IGNORE INTO channels (userId, login, prefix) VALUES (?, ?, ?)`, [
      config.bot.userId,
      config.bot.username.toLowerCase(),
      config.bot.prefix
    ]);

    const channels = await bot.db.query(`SELECT userId, login, prefix FROM channels`);
    for (const channel of channels) {
      this.set(channel.userId, channel);
    }
  }

  get(userId) {
    return this.channelsMap.get(userId) || null;
  }

  getAll() {
    return [...this.channelsMap.keys()];
  }

  count() {
    return this.channelsMap.size;
  }

  set(userId, data) {
    this.channelsMap.set(userId, data);
  }

  has(userId) {
    return this.channelsMap.has(userId);
  }

  async update(userId, setting, value) {
    if (!Channels.updatableSettings.includes(setting)) {
      throw new Error(`unknown channel setting "${setting}"`);
    }

    await bot.db.query(`UPDATE channels SET ${setting} = ? WHERE userId = ?`, [value, userId]);
    this.get(userId)[setting] = value;
  }

  async join(userId, login, prefix = config.bot.prefix) {
    await bot.db.query(`INSERT INTO channels (userId, login, prefix) VALUES (?, ?, ?)`, [
      userId,
      login,
      prefix
    ]);

    this.set(userId, { userId, login, prefix });

    return bot.eventsub.subscribe([userId]);
  }

  async part(userId) {
    await bot.eventsub.unsubscribe([userId]);
    await bot.db.query(`DELETE FROM channels WHERE userId = ?`, [userId]);

    this.channelsMap.delete(userId);
  }
}
