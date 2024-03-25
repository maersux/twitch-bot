import config from '../config.js';
import { query, queryOne } from '../misc/database.js';

export const permissionList = {
	default: 0,
	vip: 1,
	moderator: 2,
	broadcaster: 3,
	dev: 4,
	owner: 5
};

export const getUserPermissionForBot = async (userId) => {
	const result = await queryOne(`SELECT permission FROM permissions WHERE userId = ?`, [userId]);
	return result || 0;
}

export const setUserPermissionForBot = async (userId, permission) => {
	await query(`INSERT INTO permissions (userId, permission) VALUES (?, ?) ON DUPLICATE KEY UPDATE permission = ?`, [userId, permission, permission]);
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