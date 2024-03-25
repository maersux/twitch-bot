import mysql from 'mysql2/promise';
import config from '../config.js';

let pool;

async function getDB() {
	if (!pool) {
		const { url, name, user, pass } = config.db;
		const connectionString = `mysql://${user}:${pass}@${url}/${name}`;
		pool = await mysql.createPool(connectionString);
	}
	return await pool.getConnection();
}

export async function query(query, params = []) {
	const db = await getDB();
	try {
		const [rows] = await db.execute(query, params);
		db.release();
		return rows;
	} catch (error) {
		db.release();
		console.error(Date.now(), error);
		return false;
	}
}

export async function queryOne(queryStr, params = []) {
	try {
		const result = await query(queryStr, params);
		return result?.[0] || [];
	} catch (error) {
		const date = new Date();
		console.error(date.toISOString(), `Error occurred while executing query: ${error.message}`);
		return [];
	}
}

export async function entryExists(queryStr, params = []) {
	try {
		const rows = await query(queryStr, params);
		return rows.length > 0;
	} catch (error) {
		const date = new Date();
		console.error(date.toISOString(), error);
		return false;
	}
}