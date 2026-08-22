import { Router } from 'express';
import upload from '../../middlewares/upload.js';
import {
  createImportController,
  getImportController,
  listImportsController
} from './import.controller.js';
import auth from '../../middlewares/auth.js';
import { rol } from '../../middlewares/rol.js';

const router = Router();

// POST import — solo admin
router.post('/', auth, rol('admin'), upload.single('file'), createImportController);
router.get('/', auth, rol('admin'), listImportsController);
router.get('/:id', auth, getImportController);

export default router;
