import { z } from 'zod';

export const createTripSchema = z.object({
  name: z.string().min(1, 'Trip name is required').max(300),
  description: z.string().optional().default(''),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  coverImage: z.string().optional().default(''),
  budget: z.union([z.string(), z.number()]).optional().default(0),
}).refine(data => new Date(data.endDate) >= new Date(data.startDate), {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export const updateTripSchema = z.object({
  name: z.string().min(1).max(300).optional(),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  coverImage: z.string().optional(),
  budget: z.union([z.string(), z.number()]).optional(),
  isPublic: z.boolean().optional(),
});
