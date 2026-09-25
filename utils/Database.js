import { createPool } from 'mariadb';
import config from '../config.js';

export class Database {
  constructor() {
    this.pool = createPool({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.pass,
      database: config.db.name,
      connectionLimit: 5,
      bigIntAsNumber: true,
      insertIdAsNumber: true
    });
  }

  async query(query, params = []) {
    try {
      return await this.pool.query(query, params);
    } catch (error) {
      bot.log.error(`database query failed: ${query}`, error.message);
      throw error;
    }
  }

  async tryQuery(query, params = [], fallback = []) {
    try {
      return await this.query(query, params);
    } catch {
      return fallback;
    }
  }

  async queryOne(query, params = []) {
    const rows = await this.query(`${query} LIMIT 1`, params);
    return rows[0] ?? null;
  }

  async teardown() {
    await this.pool.end();
  }
}
