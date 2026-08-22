import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100).optional(),
  lastName: z.string().min(1, 'Last name is required').max(100).optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().max(30).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
});
