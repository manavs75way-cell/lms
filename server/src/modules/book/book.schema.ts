import { z } from 'zod';

export const createBookSchema = z.object({
    body: z.object({
        title: z.string().min(1, 'Title is required'),
        author: z.string().min(1, 'Author is required'),
        isbn: z.string().min(10, 'ISBN must be at least 10 characters').max(13, 'ISBN cannot exceed 13 characters'),
        coverImageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
        genre: z.string().min(1, 'Genre is required'),
        publisher: z.string().min(1, 'Publisher is required'),
        condition: z.enum(['NEW', 'GOOD', 'FAIR', 'DAMAGED']).default('GOOD'),
        totalCopies: z.coerce.number().int().min(1, 'Total copies must be at least 1'),
        branches: z.array(
            z.object({
                branch: z.string().min(1, 'Branch name is required'),
                copyCount: z.coerce.number().int().min(1, 'Copy count must be at least 1')
            })
        ).optional(),
    }),
});

export const updateBookSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Book ID is required'),
    }),
    body: z.object({
        title: z.string().optional(),
        author: z.string().optional(),
        isbn: z.string().optional(),
        coverImageUrl: z.string().url().optional(),
        genre: z.string().optional(),
        publisher: z.string().optional(),
        condition: z.enum(['NEW', 'GOOD', 'FAIR', 'DAMAGED']).optional(),
        totalCopies: z.number().int().min(0).optional(),
    }),
});

export const getBookSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Book ID is required'),
    }),
});
