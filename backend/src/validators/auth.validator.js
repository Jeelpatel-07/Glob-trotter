import { z } from 'zod';

export const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128),
  phone: z.string().max(30).optional().default(''),
  city: z.string().max(100).optional().default(''),
  country: z.string().max(100).optional().default(''),
  additionalInfo: z.string().max(1000).optional().default(''),
  photo: z.string().optional().default(''),
  language: z.string().max(50).optional().default('English'),
});

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
