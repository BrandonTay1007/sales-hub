import { Router } from 'express';
import { payoutController } from '../controllers/payoutController';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';

const router = Router();

// All payout routes require authentication
router.use(authenticate);

// GET /api/payouts/me - Sales person's own payout
router.get('/me', payoutController.getMyPayout);

// GET /api/payouts/team - All sales persons' payouts (Admin only)
router.get('/team', requireAdmin, payoutController.getTeamPayout);

export default router;
