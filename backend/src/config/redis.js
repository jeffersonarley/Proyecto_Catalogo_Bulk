import { createClient } from 'redis';
import { ENV } from './env.js';

let client = null;

export const getRedisClient = () => {
  if (!client) {
    client = createClient({
      url: `redis://${ENV.redisHost}:${ENV.redisPort}`
    });

    client.on('error', (err) => {
      console.error('❌ Error en el cliente Redis:', err.message);
    });
  }

  return client;
};

export const connectRedis = async () => {
  const redis = getRedisClient();
  if (!redis.isOpen) {
    await redis.connect();
  }
  return redis;
};

export const disconnectRedis = async () => {
  if (client?.isOpen) {
    await client.quit();
  }
  client = null;
};

export default { getRedisClient, connectRedis, disconnectRedis };
