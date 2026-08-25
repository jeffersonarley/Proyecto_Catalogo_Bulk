import { Router } from 'express';
import {
  createProductoController,
  deleteProductoController,
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
router.delete('/:id', auth, rol('admin'), deleteProductoController);

export default router;
