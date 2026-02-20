import { z } from 'zod';

export const createReservationSchema = z.object({
    body: z.object({
        editionId: z.string().min(1, 'Edition ID is required'),
        preferredLibraryId: z.string().optional(),
    }),
});

export const cancelReservationSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Reservation ID is required'),
    }),
});
