import dotenv from 'dotenv';
dotenv.config();

const requiredEnv = [
  'PORT',
  'MONGO_URI',
  'REDIS_HOST',
  'REDIS_PORT',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'MAX_FILE_SIZE_MB',
  'BATCH_SIZE',
  'CACHE_TTL_SECONDS',
  'IMPORT_ERRORS_CAP'
];

for (const env of requiredEnv) {
  if (!process.env[env]) {
    console.error(`❌ Error crítico: Falta la variable de entorno obligatoria ${env}`);
    process.exit(1);
  }
}

export const ENV = {
  port: process.env.PORT,
  mongoUri: process.env.MONGO_URI,
  redisHost: process.env.REDIS_HOST,
  redisPort: process.env.REDIS_PORT,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB),
  batchSize: Number(process.env.BATCH_SIZE),
  cacheTtlSeconds: Number(process.env.CACHE_TTL_SECONDS),
  importErrorsCap: Number(process.env.IMPORT_ERRORS_CAP)
};