import { Router } from 'express';
import * as shareController from '../controllers/share.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// ─── Public routes (NO AUTH) ────────────────────────────────────────────────
router.get('/public/trips/:shareToken', shareController.getPublicTrip);

// ─── Protected share routes ─────────────────────────────────────────────────
router.post('/trips/:tripId/share', authenticate, shareController.enableSharing);
router.post('/public/trips/:shareToken/copy', authenticate, shareController.copyPublicTrip);

export default router;
