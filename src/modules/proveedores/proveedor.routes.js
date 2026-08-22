import { Router } from 'express';
import {
  createProveedorController,
  deleteProveedorController,
  getProveedorController,
  getProveedoresController,
  updateProveedorController
} from './proveedor.controller.js';
import auth from '../../middlewares/auth.js';
import { rol } from '../../middlewares/rol.js';

const router = Router();

router.get('/', auth, getProveedoresController);
router.get('/:id', auth, getProveedorController);
// Admin routes
router.post('/', auth, rol('admin'), createProveedorController);
router.put('/:id', auth, rol('admin'), updateProveedorController);
router.delete('/:id', auth, rol('admin'), deleteProveedorController);

export default router;
