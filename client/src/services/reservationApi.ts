import { api } from './api';
import { z } from 'zod';
import { User } from './authApi';
import { Edition, Work } from './booksApi';
import { Library } from './libraryApi';

export interface PopulatedEdition extends Omit<Edition, 'work'> {
    work: Work;
}

export interface Reservation {
    _id: string;
    user: string | User;
    edition: PopulatedEdition;
    preferredLibrary?: string | Library;
    membershipTypeAtReservation: string;
    effectivePriority: number;
    priorityBoostedAt?: string;
    status: 'PENDING' | 'FULFILLED' | 'CANCELLED';
    createdAt: string;
}

export const createReservationSchema = z.object({
    editionId: z.string().min(1, 'Edition ID is required'),
    preferredLibraryId: z.string().optional(),
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
        recalculatePriorities: builder.mutation<{ updated: number; promoted: number }, void>({
            query: () => ({
                url: 'reservations/recalculate-priorities',
                method: 'POST',
            }),
            invalidatesTags: ['Reservations'],
        }),
    }),
});

export const {
    useGetMyReservationsQuery,
    useCreateReservationMutation,
    useCancelReservationMutation,
    useRecalculatePrioritiesMutation,
} = reservationApi;
