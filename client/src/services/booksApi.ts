import { api } from './api';
import { z } from 'zod';

export interface Book {
    _id: string;
    title: string;
    author: string;
    isbn: string;
    barcodeUrl?: string;
    coverImageUrl?: string;
    genre: string;
    publisher: string;
    condition: 'NEW' | 'GOOD' | 'FAIR' | 'DAMAGED';
    totalCopies: number;
    availableCopies: number;
    createdAt: string;
}

export const createBookSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    author: z.string().min(1, 'Author is required'),
    isbn: z.string().min(10, 'ISBN must be at least 10 characters').max(13, 'ISBN cannot exceed 13 characters'),
    coverImageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
    genre: z.string().min(1, 'Genre is required'),
    publisher: z.string().min(1, 'Publisher is required'),
    condition: z.enum(['NEW', 'GOOD', 'FAIR', 'DAMAGED']).default('GOOD'),
    totalCopies: z.coerce.number().int().min(1, 'Total copies must be at least 1'),
});

export type CreateBookRequest = z.infer<typeof createBookSchema>;

export const booksApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getBooks: builder.query<Book[], string | void>({
            query: (search) => ({
                url: 'books',
                params: search ? { search } : undefined,
            }),
            transformResponse: (response: { data: Book[] }) => response.data,
            providesTags: ['Books'],
        }),
        createBook: builder.mutation<Book, FormData>({
            query: (formData) => ({
                url: 'books',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['Books'],
        }),
        deleteBook: builder.mutation<void, string>({
            query: (id) => ({
                url: `books/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Books'],
        }),
        importBooks: builder.mutation<{ success: boolean; message: string }, File>({
            query: (file) => {
                const formData = new FormData();
                formData.append('file', file);
                return {
                    url: 'books/import',
                    method: 'POST',
                    body: formData,
                };
            },
            invalidatesTags: ['Books'],
        }),
        getBook: builder.query<Book, string>({
            query: (id) => `books/${id}`,
            transformResponse: (response: { data: Book }) => response.data,
            providesTags: (_result, _error, id) => [{ type: 'Books', id }],
        }),
        updateBook: builder.mutation<Book, { id: string; data: FormData }>({
            query: ({ id, data }) => ({
                url: `books/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Books'],
        }),
    }),
});

export const { useGetBooksQuery, useCreateBookMutation, useDeleteBookMutation, useImportBooksMutation, useGetBookQuery, useUpdateBookMutation } = booksApi;
