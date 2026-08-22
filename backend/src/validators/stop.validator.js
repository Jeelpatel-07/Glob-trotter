import { z } from 'zod';

export const createStopSchema = z.object({
  cityId: z.union([z.string(), z.number()]).optional().nullable(),
  cityName: z.string().optional().default(''),
  startDate: z.string().optional().nullable().default(null),
  endDate: z.string().optional().nullable().default(null),
  budget: z.union([z.string(), z.number()]).optional().default(0),
  notes: z.string().optional().default(''),
  order: z.number().optional(),
});

export const updateStopSchema = z.object({
  cityId: z.union([z.string(), z.number()]).optional().nullable(),
  cityName: z.string().optional(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  budget: z.union([z.string(), z.number()]).optional(),
  notes: z.string().optional(),
});

export const reorderStopsSchema = z.object({
  stops: z.array(z.object({
    id: z.union([z.string(), z.number()]),
    order: z.number(),
  })),
});
