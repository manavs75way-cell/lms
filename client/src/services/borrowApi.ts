import { api } from './api';
import { Copy, Edition, Work } from './booksApi';
import { User } from './authApi';
import { Library } from './libraryApi';

export interface PopulatedCopy extends Omit<Copy, 'edition'> {
    edition: PopulatedEdition;
}

export interface PopulatedEdition extends Omit<Edition, 'work'> {
    work: Work;
}

export interface Borrow {
    _id: string;
    user: string | User;
    borrowedOnBehalfOf?: string | User;
    copy: PopulatedCopy;
    borrowedFromLibrary: string | Library;
    returnedToLibrary?: string | Library;
    borrowDate: string;
    dueDate: string;
    returnDate?: string;
    status: 'BORROWED' | 'RETURNED' | 'OVERDUE';
    fine: number;
    fineBreakdown: Array<{ startDate: string; endDate: string; rate: number; amount: number }>;
}

export const borrowApi = api.injectEndpoints({
    endpoints: (builder) => ({
        borrowBook: builder.mutation<Borrow, { copyId: string; libraryId: string; onBehalfOfUserId?: string }>({
            query: (body) => ({
                url: 'borrow',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Books', 'Borrows'],
        }),
        returnBook: builder.mutation<Borrow, { id: string; condition?: string; damageNotes?: string; returnToLibraryId?: string }>({
            query: ({ id, ...body }) => ({
                url: `borrow/${id}/return`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Borrows', 'Books'],
        }),
        getMyBorrows: builder.query<Borrow[], void>({
            query: () => 'borrow/my-borrows',
            transformResponse: (response: { data: Borrow[] }) => response.data,
            providesTags: ['Borrows'],
        }),
        getReadingHistory: builder.query<Borrow[], void>({
            query: () => 'borrow/history',
            transformResponse: (response: { data: Borrow[] }) => response.data,
            providesTags: ['Borrows'],
        }),
        getRecommendations: builder.query<{ edition: PopulatedEdition; explanation: string; score: number }[], void>({
            query: () => 'borrow/recommendations',
            transformResponse: (response: { data: { edition: PopulatedEdition; explanation: string; score: number }[] }) => response.data,
            providesTags: ['Books'],
        }),
    }),
});

export const {
    useBorrowBookMutation,
    useReturnBookMutation,
    useGetMyBorrowsQuery,
    useGetReadingHistoryQuery,
    useGetRecommendationsQuery,
} = borrowApi;
