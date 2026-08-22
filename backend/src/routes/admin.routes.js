import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Admin routes require authentication and ADMIN role
router.use(authenticate);
router.use(authorizeAdmin);

router.get('/analytics', adminController.getAnalytics);
router.get('/users', adminController.getUsers);
router.get('/trips', adminController.getTrips);

export default router;
