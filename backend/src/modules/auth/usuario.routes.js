import { Router } from 'express';
import {
  listUsuariosController,
  updateUsuarioController
} from './usuario.controller.js';
import auth from '../../middlewares/auth.js';
import { rol } from '../../middlewares/rol.js';

const router = Router();

router.get('/', auth, rol('admin'), listUsuariosController);
router.put('/:id', auth, rol('admin'), updateUsuarioController);

export default router;
