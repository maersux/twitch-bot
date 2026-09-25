export class Cooldown {
  constructor() {
    this.cooldownMap = new Map();

    this.veryShort = 3;
    this.short = 5;
    this.medium = 15;
    this.long = 30;
    this.veryLong = 60;
  }

  set(key, ttl) {
    if (!ttl) return;

    clearTimeout(this.cooldownMap.get(key));
    const timeout = setTimeout(() => this.cooldownMap.delete(key), ttl * 1000);
    timeout.unref();

    this.cooldownMap.set(key, timeout);
  }

  remove(key) {
    clearTimeout(this.cooldownMap.get(key));
    this.cooldownMap.delete(key);
  }

  has(key) {
    return this.cooldownMap.has(key);
  }

  hasOrSet(key, ttl) {
    if (this.has(key)) return true;

    this.set(key, ttl);
    return false;
  }
}
