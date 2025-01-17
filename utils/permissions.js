import config from '../config.js';

export class Permissions {
  constructor() {
    this.permissionMap = new Map();

    this.default = 0;
    this.vip = 1;
    this.mod = 2;
    this.broadcaster = 3;
    this.admin = 4;
    this.owner = 6;

    this.list = {
      default: this.default,
      vip: this.vip,
      mod: this.mod,
      broadcaster: this.broadcaster,
      admin: this.admin,
      owner: this.owner
    }
  }

  async initialize() {
    const permissions = await db.query(`SELECT * FROM permissions`);
    for (const { user_id, permission } of permissions) {
      this.permissionMap.set(user_id, permission);
    }
  }

  async set(userId, permission) {
    this.permissionMap.set(userId, permission);
    await db.query(`INSERT INTO permissions (user_id, permission) VALUES (?, ?) ON DUPLICATE KEY UPDATE permission = VALUES(permission)`, [userId, permission]);
  }

  get(userId, badges = []) {
    const savedPermission = this.permissionMap.get(userId) || this.default;
    const userPermissions = [savedPermission];

    for (const badge of badges || []) {
      if (badge.set_id === 'vip') userPermissions.push(this.vip);
      if (badge.set_id === 'moderator') userPermissions.push(this.mod);
      if (badge.set_id === 'broadcaster') userPermissions.push(this.broadcaster);
    }

    if (userId === config.owner.userId) userPermissions.push(this.owner);

    return Math.max(...userPermissions);
  }
}