import config from '../config.js';

export class Permissions {
  constructor() {
    this.permissionMap = new Map();

    this.ignored = -1;
    this.default = 0;
    this.vip = 1;
    this.mod = 2;
    this.broadcaster = 3;
    this.admin = 4;
    this.dev = 5;
    this.owner = 6;

    this.list = {
      ignored: this.ignored,
      default: this.default,
      vip: this.vip,
      mod: this.mod,
      broadcaster: this.broadcaster,
      admin: this.admin,
      dev: this.dev,
      owner: this.owner
    };
  }

  async initialize() {
    const permissions = await bot.db.query(`SELECT * FROM permissions`);
    for (const { userId, permission } of permissions) {
      this.permissionMap.set(userId, permission);
    }
  }

  async set(userId, permission) {
    this.permissionMap.set(userId, permission);
    await bot.db.query(
      `INSERT INTO permissions (userId, permission) VALUES (?, ?) ON DUPLICATE KEY UPDATE permission = VALUES(permission)`,
      [userId, permission]
    );
  }

  get(userId, badges = []) {
    if (userId === config.owner.userId) return this.owner;

    const stored = this.permissionMap.get(userId) ?? this.default;

    if (stored <= this.ignored) return stored;

    const userPermissions = [stored];

    for (const badge of badges || []) {
      if (badge.set_id === 'vip') userPermissions.push(this.vip);
      if (badge.set_id === 'moderator') userPermissions.push(this.mod);
      if (badge.set_id === 'broadcaster') userPermissions.push(this.broadcaster);
    }

    return Math.max(...userPermissions);
  }

  name(level) {
    return Object.keys(this.list).find((key) => this.list[key] === level) ?? null;
  }

  level(name) {
    return Object.hasOwn(this.list, name) ? this.list[name] : undefined;
  }
}
