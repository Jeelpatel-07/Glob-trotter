import { Router } from 'express';
import * as tripController from '../controllers/trip.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { createTripSchema, updateTripSchema } from '../validators/trip.validator.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(createTripSchema), tripController.create);
router.get('/', tripController.getAll);
router.get('/:tripId', tripController.getById);
router.put('/:tripId', validate(updateTripSchema), tripController.update);
router.delete('/:tripId', tripController.remove);
router.get('/:tripId/itinerary', tripController.getItinerary);
router.get('/:tripId/budget', tripController.getBudget);
router.get('/:tripId/calendar', tripController.getCalendar);

export default router;
