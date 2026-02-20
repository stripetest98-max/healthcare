const Redis = require('ioredis');

let redisConnected = false;
let errorLogged = false;

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    // Only retry once, then give up
    if (times > 1) {
      return null; // Stop retrying
    }
    return 100;
  },
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
  lazyConnect: true,
  showFriendlyErrorStack: false,
});

redis.on('connect', () => {
  redisConnected = true;
  console.log('✅ Redis connected - Caching enabled');
});

redis.on('error', () => {
  redisConnected = false;
  // Silently handle error - warning shown on connect failure
});

// Try to connect
redis.connect().catch(() => {
  if (!errorLogged) {
    console.log('ℹ️  Redis not configured - Running without cache (optional feature)');
    errorLogged = true;
  }
});

// Cache helper functions
const cache = {
  async get(key) {
    if (!redisConnected) return null;
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  },

  async set(key, value, ttl = 3600) {
    if (!redisConnected) return false;
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      return false;
    }
  },

  async del(key) {
    if (!redisConnected) return false;
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      return false;
    }
  },

  async delPattern(pattern) {
    if (!redisConnected) return false;
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return true;
    } catch (error) {
      return false;
    }
  },
};

module.exports = { redis, cache };
