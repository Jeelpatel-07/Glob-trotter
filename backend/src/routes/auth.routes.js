import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validate } from '../middleware/validation.middleware.js';
import { signupSchema, loginSchema } from '../validators/auth.validator.js';

const router = Router();

// POST /api/auth/signup
router.post('/signup', validate(signupSchema), authController.signup);

// POST /api/auth/login
router.post('/login', validate(loginSchema), authController.login);

export default router;
