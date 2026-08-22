import { Router } from 'express';
import * as stopController from '../controllers/stop.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { createStopSchema, updateStopSchema, reorderStopsSchema } from '../validators/stop.validator.js';

const router = Router();

router.use(authenticate);

// ─── Stops endpoints ────────────────────────────────────────────────────────
router.get('/trips/:tripId/stops', stopController.getByTrip);
router.post('/trips/:tripId/stops', validate(createStopSchema), stopController.create);
router.patch('/trips/:tripId/stops/reorder', validate(reorderStopsSchema), stopController.reorder);
router.put('/stops/:stopId', validate(updateStopSchema), stopController.update);
router.delete('/stops/:stopId', stopController.remove);

// ─── Activity endpoints in stops ────────────────────────────────────────────
router.post('/stops/:stopId/activities', stopController.addActivity);
router.patch('/stops/:stopId/activities/reorder', stopController.reorderActivities);
router.put('/trip-activities/:tripActivityId', stopController.updateActivity);
router.delete('/trip-activities/:tripActivityId', stopController.removeActivity);

export default router;
