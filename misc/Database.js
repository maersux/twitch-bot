import mariadb from 'mariadb';
import Redis from 'ioredis';
import config from '../config.js';
import { logger } from './Logger.js';

export const db = {
	pool: null,

	initialize: async function() {
		this.pool = mariadb.createPool({
			user: config.db.user,
			password: config.db.pass,
			database: config.db.name,
			host: config.db.host,
		})
	},

	query: async function(queryParam, params = []) {
		const connection = await this.pool.getConnection();

		let result;
		try {
			result = await connection.query(queryParam, params);
		} catch (e) {
			logger.error(e);
		} finally {
			connection.release();
		}

		return result || [];
	},

	queryOne: async function(queryStr, params = [], addLimit = true) {
		const result = await this.query(`${queryStr}${addLimit ? ' LIMIT 1' : ''}`, params);
		return result?.[0] || false;
	},

	entryExists: async function(queryStr, params = [], addLimit = true) {
		const rows = await this.query(`${queryStr}${addLimit ? ' LIMIT 1' : ''}`, params);
		return rows.length > 0;
	}
}

export const redis = new Redis();
redis.nc = 'tb';