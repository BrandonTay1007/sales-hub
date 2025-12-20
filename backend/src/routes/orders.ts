import { Router } from 'express';
import { orderController } from '../controllers/orderController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All order routes require authentication
router.use(authenticate);

// GET /api/orders - List orders (filtered by role in service)
router.get('/', orderController.getAll);

// GET /api/orders/:id - Get single order
router.get('/:id', orderController.getById);

// POST /api/orders - Create order (access checked in service)
router.post('/', orderController.create);

// PUT /api/orders/:id - Update order (access checked in service)
router.put('/:id', orderController.update);

// DELETE /api/orders/:id - Delete order (access checked in service)
router.delete('/:id', orderController.delete);

export default router;
