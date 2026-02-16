import { z } from 'zod';

export const createReservationSchema = z.object({
    body: z.object({
        bookId: z.string().min(1, 'Book ID is required'),
    }),
});

export const cancelReservationSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Reservation ID is required'),
    }),
});
