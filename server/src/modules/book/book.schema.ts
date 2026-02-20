import { z } from 'zod';


export const createWorkSchema = z.object({
    body: z.object({
        title: z.string().min(1, 'Title is required'),
        originalAuthor: z.string().min(1, 'Author is required'),
        genres: z.array(z.string()).optional(),
        description: z.string().optional(),
    }),
});

export const updateWorkSchema = z.object({
    params: z.object({ id: z.string().min(1) }),
    body: z.object({
        title: z.string().optional(),
        originalAuthor: z.string().optional(),
        genres: z.array(z.string()).optional(),
        description: z.string().optional(),
    }),
});


export const createEditionSchema = z.object({
    params: z.object({ workId: z.string().min(1) }),
    body: z.object({
        isbn: z.string().min(10).max(13),
        format: z.enum(['HARDCOVER', 'PAPERBACK', 'AUDIOBOOK', 'EBOOK']),
        publisher: z.string().min(1),
        publicationYear: z.coerce.number().int().min(1000).max(2100),
        language: z.string().optional(),
        replacementCost: z.coerce.number().min(0).optional(),
    }),
});

export const updateEditionSchema = z.object({
    params: z.object({ id: z.string().min(1) }),
    body: z.object({
        isbn: z.string().optional(),
        format: z.enum(['HARDCOVER', 'PAPERBACK', 'AUDIOBOOK', 'EBOOK']).optional(),
        publisher: z.string().optional(),
        publicationYear: z.coerce.number().int().optional(),
        language: z.string().optional(),
        replacementCost: z.coerce.number().min(0).optional(),
    }),
});


export const createCopySchema = z.object({
    params: z.object({ editionId: z.string().min(1) }),
    body: z.object({
        copyCode: z.string().optional(),
        owningLibrary: z.string().min(1, 'Owning library is required'),
        currentLibrary: z.string().optional(),
        condition: z.enum(['NEW', 'GOOD', 'FAIR', 'DAMAGED']).default('GOOD'),
    }),
});

export const updateCopySchema = z.object({
    params: z.object({ id: z.string().min(1) }),
    body: z.object({
        condition: z.enum(['NEW', 'GOOD', 'FAIR', 'DAMAGED']).optional(),
        status: z.enum(['AVAILABLE', 'BORROWED', 'IN_TRANSIT', 'DAMAGED_PULLED', 'LOST']).optional(),
        currentLibrary: z.string().optional(),
    }),
});

export const getByIdSchema = z.object({
    params: z.object({ id: z.string().min(1) }),
});
