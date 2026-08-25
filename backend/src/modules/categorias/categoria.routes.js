import { Router } from 'express';
import {
  getCategoriaController,
  getCategoriasController,
  updateCategoriaController
} from './categoria.controller.js';
import auth from '../../middlewares/auth.js';
import { rol } from '../../middlewares/rol.js';

const router = Router();

// Lista todas las categorías (sin paginar según especificación)
router.get('/', getCategoriasController);
// Obtener por slug (contrato)
router.get('/:slug', getCategoriaController);
// Enriquecer categoría (solo admin); el slug no se edita
router.put('/:id', auth, rol('admin'), updateCategoriaController);

export default router;
