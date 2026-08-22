import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { updateProfileSchema } from '../validators/user.validator.js';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// GET /api/users/me
router.get('/me', userController.getProfile);

// PUT /api/users/me
router.put('/me', validate(updateProfileSchema), userController.updateProfile);

// DELETE /api/users/me
router.delete('/me', userController.deleteAccount);

export default router;
