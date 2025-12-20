import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

// POST /api/auth/login - Public
router.post('/login', authController.login);

// POST /api/auth/logout - Requires authentication
router.post('/logout', authenticate, authController.logout);

// GET /api/auth/me - Requires authentication
router.get('/me', authenticate, authController.me);

export default router;
