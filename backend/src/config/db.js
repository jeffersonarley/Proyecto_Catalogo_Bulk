import mongoose from 'mongoose';
import { ENV } from './env.js';

const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 3000;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const connectDB = async () => {
  for (let intento = 1; intento <= MAX_RETRIES; intento += 1) {
    try {
      await mongoose.connect(ENV.mongoUri, {
        serverSelectionTimeoutMS: 5000
      });
      console.log('✅ Conexión a MongoDB establecida exitosamente');
      return;
    } catch (error) {
      console.error(
        `❌ Intento ${intento}/${MAX_RETRIES} de conexión a MongoDB falló: ${error.message}`
      );
      if (intento === MAX_RETRIES) {
        console.error('❌ No se pudo conectar a MongoDB tras varios reintentos.');
        process.exit(1);
      }
      await delay(RETRY_DELAY_MS);
    }
  }
};
