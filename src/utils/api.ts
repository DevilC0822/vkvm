import { kv } from '@vercel/kv';
export const getKVData = async (key: string, filterType?: string | null) => {
  const type = await kv.type(key);
  if (filterType && filterType !== type) {
    return null;
  }
  if (type === 'hash') {
    return { key, value: await kv.hgetall(key), type };
  }
  if (type === 'list') {
    return { key, value: await kv.lrange(key, 0, -1), type };
  }
  if (type === 'set') {
    return { key, value: await kv.smembers(key), type };
  }
  if (type === 'zset') {
    return { key, value: await kv.zrange(key, 0, -1), type };
  }
  const value = await kv.get(key);
  return { key, value: typeof value === 'object' ? JSON.stringify(value) : value, type };
};

export const addKVData = async (key: string, value: any, type: string) => {
  if (!key || value === undefined) {
    return 'Key 和 Value 不能为空';
  }
  if (type === 'hash') {
    if (typeof value !== 'object') {
      return 'Value 类型错误';
    }
    if (Object.keys(value).length === 0) {
      return 'Value 为空对象';
    }
  }
  if (['list', 'set'].includes(type)) {
    if (!Array.isArray(value)) {
      return 'Value 类型错误';
    }
    if (value.length === 0) {
      return 'Value 为空数组';
    }
  }
  if (type === 'zset') {
    if (!Array.isArray(value)) {
      return 'Value 类型错误';
    }
    if (value.length === 0) {
      return 'Value 为空数组';
    }
    if (!value.every(item => (typeof item === 'object') && ('score' in item) && ('member' in item))) {
      return 'Value item 格式错误, 它必须是 { score: number, member: string }';
    }
  }
  if (type === 'string' && typeof value !== 'string') {
    return 'Value 类型错误';
  }
  const exist = await kv.exists(key);
  if (exist) {
    return 'Key 已存在';
  }
  if (type === 'hash') {
    kv.hmset(key, value);
    return false;
  }
  if (type === 'list') {
    kv.rpush(key, ...value);
    return false;
  }
  if (type === 'set') {
    kv.sadd(key, ...value);
    return false;
  }
  if (type === 'zset') {
    // @ts-ignore
    kv.zadd(key, ...value);
    return false;
  }
  kv.set(key, value);
  return false;
};

export const successResponse = (data: any, msg = 'success') => {
  return {
    success: true,
    data,
    msg,
  };
};

export const errorResponse = (msg: string) => {
  return {
    success: false,
    msg,
    data: null,
  };
};
