import { redis } from '../misc/Database.js';

export const duration = {
  xs: 3,
  sm: 5,
  md: 15,
  lg: 30,
  xl: 60
}

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