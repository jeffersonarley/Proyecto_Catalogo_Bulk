import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import { getRedisClient } from './config/redis.js';
import { swaggerSpec } from './docs/swagger.js';
import { errorHandler } from './middlewares/errorHandler.js';
import AppError from './errors/AppError.js';
import authRoutes from './modules/auth/auth.routes.js';
import usuarioRoutes from './modules/auth/usuario.routes.js';
import categoriaRoutes from './modules/categorias/categoria.routes.js';
import importRoutes from './modules/imports/import.routes.js';
import productoRoutes from './modules/productos/producto.routes.js';
import proveedorRoutes from './modules/proveedores/proveedor.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/imports', importRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/proveedores', proveedorRoutes);

// Endpoint de salud exigido en la Fase 0
app.get('/health', async (req, res) => {
  const mongoState = mongoose.connection.readyState === 1 ? 'up' : 'down';

  let redisState = 'up';
  try {
    const redisClient = getRedisClient();
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    await redisClient.ping();
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

// Ruta no encontrada
app.use((req, _res, next) => {
  next(new AppError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, 404, 'RUTA_NO_ENCONTRADA'));
});

// Manejador de errores centralizado (siempre al final)
app.use(errorHandler);

export default app;
