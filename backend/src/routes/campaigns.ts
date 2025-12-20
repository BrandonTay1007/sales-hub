import { Router } from 'express';
import { campaignController } from '../controllers/campaignController';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';

const router = Router();

// All campaign routes require authentication
router.use(authenticate);

// GET /api/campaigns - List campaigns (access filtered by role in service)
router.get('/', campaignController.getAll);

// GET /api/campaigns/:id - Get single campaign (access checked in service)
router.get('/:id', campaignController.getById);

// POST /api/campaigns - Create campaign (Admin only)
router.post('/', requireAdmin, campaignController.create);

// PUT /api/campaigns/:id - Update campaign (Admin only)
router.put('/:id', requireAdmin, campaignController.update);

// DELETE /api/campaigns/:id - Delete campaign (Admin only)
router.delete('/:id', requireAdmin, campaignController.delete);

export default router;
