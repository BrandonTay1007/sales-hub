import { Router } from 'express';
import { userController } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';

const router = Router();

// All user routes require authentication and admin role
router.use(authenticate, requireAdmin);

// GET /api/users - List all users
router.get('/', userController.getAll);

// GET /api/users/:id - Get single user
router.get('/:id', userController.getById);

// POST /api/users - Create user
router.post('/', userController.create);

// PUT /api/users/:id - Update user
router.put('/:id', userController.update);

// DELETE /api/users/:id - Delete user
router.delete('/:id', userController.delete);

export default router;
