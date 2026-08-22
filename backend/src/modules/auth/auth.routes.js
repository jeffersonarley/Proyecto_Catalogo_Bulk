import { Router } from 'express';
import { loginController, registerController } from './auth.controller.js';
import { strictRateLimit } from '../../middlewares/rateLimit.js';

const router = Router();

router.post('/register', registerController);
router.post('/login', strictRateLimit, loginController);

export default router;
