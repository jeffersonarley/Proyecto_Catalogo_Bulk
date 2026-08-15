import app from './app.js';
import { connectDB } from './config/db.js';
import { ENV } from './config/env.js';

const startServer = async () => {
  await connectDB(); // Conectar antes de escuchar peticiones
  
  app.listen(ENV.port, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${ENV.port}`);
  });
};

startServer();