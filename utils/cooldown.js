import { redis } from '../misc/Database.js';

export const set = (id, ttl) => {
  redis.set(id, 'true', 'EX', ttl);
};

export const remove = (id) => {
  redis.del(id);
};

export const has = (id) => {
  const result = redis.get(id);
  return result !== null;
};