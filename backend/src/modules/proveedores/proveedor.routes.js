import { Router } from 'express';
import {
  cambiarEstadoProveedorController,
  createProveedorController,
  getProveedorController,
  getProveedoresController,
  updateProveedorController
} from './proveedor.controller.js';
import auth from '../../middlewares/auth.js';
import { rol } from '../../middlewares/rol.js';

const router = Router();

router.get('/', getProveedoresController);
router.get('/:id', getProveedorController);
// Admin routes
router.post('/', auth, rol('admin'), createProveedorController);
router.put('/:id', auth, rol('admin'), updateProveedorController);
router.patch('/:id/estado', auth, rol('admin'), cambiarEstadoProveedorController);

export default router;
