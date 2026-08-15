import express from 'express';
import mongoose from 'mongoose';
import { createClient } from 'redis';
import { ENV } from './config/env.js';

const app = express();

app.use(express.json());

// Endpoint de salud exigido en la Fase 0
app.get('/health', async (req, res) => {
  const mongoState = mongoose.connection.readyState === 1 ? 'up' : 'down';
  
  let redisState = 'up';
  try {
    const redisClient = createClient({ url: `redis://${ENV.redisHost}:${ENV.redisPort}` });
    await redisClient.connect();
    await redisClient.ping();
    await redisClient.quit();
  } catch {
    redisState = 'down';
  }

  const status = mongoState === 'up' && redisState === 'up' ? 'ok' : 'error';
  const statusCode = status === 'ok' ? 200 : 503;

  return res.status(statusCode).json({
    status,
    mongo: mongoState,
    redis: redisState
  });
});

export default app;