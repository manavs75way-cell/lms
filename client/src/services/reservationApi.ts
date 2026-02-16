import { api } from './api';
import { z } from 'zod';

export interface Reservation {
    _id: string;
    user: string;
    book: {
        _id: string;
        title: string;
        author: string;
        coverImageUrl?: string;
    };
    position: number;
    status: 'PENDING' | 'FULFILLED' | 'CANCELLED';
    createdAt: string;
}

export const createReservationSchema = z.object({
    bookId: z.string().min(1, 'Book ID is required'),
});

export type CreateReservationRequest = z.infer<typeof createReservationSchema>;

export const reservationApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getMyReservations: builder.query<Reservation[], void>({
            query: () => 'reservations/my-reservations',
            transformResponse: (response: { data: Reservation[] }) => response.data,
            providesTags: ['Reservations'],
        }),
        createReservation: builder.mutation<Reservation, CreateReservationRequest>({
            query: (data) => ({
                url: 'reservations',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Reservations'],
        }),
        cancelReservation: builder.mutation<void, string>({
            query: (id) => ({
                url: `reservations/${id}/cancel`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Reservations'],
        }),
    }),
});

export const {
    useGetMyReservationsQuery,
    useCreateReservationMutation,
    useCancelReservationMutation,
} = reservationApi;
