import { Router } from 'express';
import {
  cambiarEstadoProductoController,
  createProductoController,
  getProductoController,
  getProductosController,
  getProductoStatsController,
  updateProductoController
} from './producto.controller.js';
import auth from '../../middlewares/auth.js';
import { rol } from '../../middlewares/rol.js';

const router = Router();

router.get('/', getProductosController);
router.get('/stats', getProductoStatsController);
router.get('/:id', getProductoController);

// Solo admin
router.post('/', auth, rol('admin'), createProductoController);
router.put('/:id', auth, rol('admin'), updateProductoController);
router.patch('/:id/estado', auth, rol('admin'), cambiarEstadoProductoController);

export default router;
