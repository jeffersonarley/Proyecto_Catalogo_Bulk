import { Router } from 'express';
import {
  deleteUsuarioController,
  listUsuariosController,
  updateUsuarioController
} from './usuario.controller.js';
import auth from '../../middlewares/auth.js';
import { rol } from '../../middlewares/rol.js';

const router = Router();

router.get('/', auth, rol('admin'), listUsuariosController);
router.put('/:id', auth, rol('admin'), updateUsuarioController);
router.delete('/:id', auth, rol('admin'), deleteUsuarioController);

export default router;
