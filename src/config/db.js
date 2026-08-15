import mongoose from 'mongoose';
// Asumiendo que ya tienes una forma de importar tu configuración de variables de entorno
import { ENV } from './env.js'; 

export const connectDB = async () => {
  try {
    await mongoose.connect(ENV.mongoUri);
    console.log('✅ Conexión a MongoDB establecida exitosamente');
  } catch (error) {
    console.error('❌ Error crítico al conectar a MongoDB:', error.message);
    process.exit(1); // Detener el proceso si no hay conexión, según el contrato
  }
};