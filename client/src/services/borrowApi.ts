import { api } from './api';
import { Book } from './booksApi';

export interface Borrow {
    _id: string;
    user: string;
    book: Book;
    borrowDate: string;
    dueDate: string;
    returnDate?: string;
    status: 'BORROWED' | 'RETURNED';
    fine: number;
}

export const borrowApi = api.injectEndpoints({
    endpoints: (builder) => ({
        borrowBook: builder.mutation<Borrow, string>({
            query: (bookId) => ({
                url: 'borrow',
                method: 'POST',
                body: { bookId },
            }),
            invalidatesTags: ['Books', 'Borrows'],
        }),
        returnBook: builder.mutation<Borrow, { id: string; condition?: string; damageNotes?: string }>({
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
        getRecommendations: builder.query<Book[], void>({
            query: () => 'borrow/recommendations',
            transformResponse: (response: { data: Book[] }) => response.data,
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
