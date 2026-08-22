import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import * as tripController from '../controllers/trip.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { updateProfileSchema } from '../validators/user.validator.js';

const router = Router();

router.use(authenticate);

// Profile
router.get('/me', userController.getProfile);
router.put('/me', validate(updateProfileSchema), userController.updateProfile);
router.delete('/me', userController.deleteAccount);

// Saved Destinations
router.get('/me/saved-destinations', tripController.getSavedDestinations);
router.post('/me/saved-destinations', tripController.saveDestination);
router.delete('/me/saved-destinations/:cityId', tripController.removeSavedDestination);

export default router;
