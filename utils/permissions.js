import config from '../config.js';

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
  return result?.permission || 0;
};

export const setUserPermissionForBot = async (userId, permission) => {
  await db.query(`INSERT INTO permissions (user_id, permission) VALUES (?, ?) ON DUPLICATE KEY UPDATE permission = ?`, [userId, permission, permission]);
};

export const getUserPermission = async (userId, badges = []) => {
  const savedPermission = await getUserPermissionForBot(userId);

  const userPermissions = [savedPermission];

  for (const badge of badges || []) {
    if (badge?.set_id === 'vip') userPermissions.push(permissions.vip);
    if (badge?.set_id === 'moderator') userPermissions.push(permissions.moderator);
    if (badge?.set_id === 'broadcaster') userPermissions.push(permissions.broadcaster);
  }

  if (userId === config.owner.userId) userPermissions.push(permissions.owner);

  return Math.max(...userPermissions);
};
