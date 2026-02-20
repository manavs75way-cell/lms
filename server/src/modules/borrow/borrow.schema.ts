import { z } from 'zod';

export const borrowBookSchema = z.object({
    body: z.object({
        copyId: z.string().min(1, 'Copy ID is required'),
        libraryId: z.string().min(1, 'Library ID is required'),
        onBehalfOfUserId: z.string().optional(),
    }),
});

export const returnBookSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Borrow ID is required'),
    }),
    body: z.object({
        returnToLibraryId: z.string().optional(),
        condition: z.enum(['NEW', 'GOOD', 'FAIR', 'DAMAGED']).optional(),
        damageNotes: z.string().optional(),
    }),
});
