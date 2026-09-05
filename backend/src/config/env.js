import dotenv from 'dotenv';
dotenv.config({ quiet: true });

// Valores por defecto para que el backend funcione con solo `npm install`.
// Se pueden sobreescribir con variables de entorno o con un archivo .env.
const DEFAULT_MONGO_URI =
  'mongodb+srv://jeffersonbom52_db_user:eC6ZlJfbKyu30TgW@cluster0.b98vpvo.mongodb.net/ClausterCatalogoDB?retryWrites=true&w=majority';

const numero = (valor, porDefecto) => {
  const n = Number(valor);
  return Number.isNaN(n) ? porDefecto : n;
};

export const ENV = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGO_URI || DEFAULT_MONGO_URI,
  redisHost: process.env.REDIS_HOST || 'localhost',
  redisPort: numero(process.env.REDIS_PORT, 6379),
  jwtSecret: process.env.JWT_SECRET || 'cambiar_en_produccion',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  maxFileSizeMb: numero(process.env.MAX_FILE_SIZE_MB, 50),
  batchSize: numero(process.env.BATCH_SIZE, 500),
  cacheTtlSeconds: numero(process.env.CACHE_TTL_SECONDS, 300),
  importErrorsCap: numero(process.env.IMPORT_ERRORS_CAP, 1000)
};
