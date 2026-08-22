import { Router } from 'express';
import * as cityController from '../controllers/city.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// City routes require authentication (frontend uses ProtectedRoute)
router.use(authenticate);

router.get('/', cityController.search);
router.get('/:cityId', cityController.getById);

export default router;
