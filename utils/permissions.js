import config from '../config.js';
import { db } from '../misc/database.js';

export const permissions = {
	default: 0,
	vip: 1,
	moderator: 2,
	broadcaster: 3,
	admin: 4,
	owner: 5
};

export const getUserPermissionForBot = async (userId) => {
	const result = await db.queryOne(`SELECT permission FROM permissions WHERE user_id = ?`, [userId]);
	return result || 0;
}

export const setUserPermissionForBot = async (userId, permission) => {
	await db.query(`INSERT INTO permissions (user_id, permission) VALUES (?, ?) ON DUPLICATE KEY UPDATE permission = ?`, [userId, permission, permission]);
}

export const getUserPermission = async (userId, badges) => {
	const savedPermission = await getUserPermissionForBot(userId);

	const permissions = [savedPermission];

	for (const badge of badges) {
		if (badge?.set_id === 'vip') permissions.push(1);
		if (badge?.set_id === 'moderator') permissions.push(2);
		if (badge?.set_id === 'broadcaster') permissions.push(3);
	}

	if (userId === config.owner.userId) permissions.push(5);

	return Math.max(...permissions);
}