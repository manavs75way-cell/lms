import { z } from 'zod';

export const borrowBookSchema = z.object({
    body: z.object({
        bookId: z.string().min(1, 'Book ID is required'),
    }),
});

export const returnBookSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Borrow ID is required'),
    }),
    body: z.object({
        condition: z.enum(['NEW', 'GOOD', 'FAIR', 'DAMAGED']).optional(),
        damageNotes: z.string().optional(),
    }),
});
