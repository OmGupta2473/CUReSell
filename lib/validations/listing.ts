import { z } from 'zod';

export const listingSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(80, 'Title must be under 80 characters'),
  description: z
    .string()
    .max(500, 'Description must be under 500 characters')
    .optional()
    .or(z.literal('')),
  priceInput: z
    .string()
    .min(1, 'Price is required')
    .regex(/^\d+$/, 'Enter a valid number')
    .refine((val) => parseInt(val) >= 1, 'Price must be at least Rs. 1')
    .refine((val) => parseInt(val) <= 100000, 'Price must be under Rs. 1,00,000'),
  is_negotiable: z.boolean().default(false),
  category: z.enum(
    ['books', 'electronics', 'furniture', 'kitchen', 'clothes', 'cycles', 'sports', 'other'] as const,
    { message: 'Select a category' }
  ),
  condition: z.enum(['like_new', 'good', 'fair'] as const, {
    message: 'Select a condition',
  }),
});

export type ListingFormValues = z.input<typeof listingSchema>;
