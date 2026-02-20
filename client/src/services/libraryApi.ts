import { api } from './api';

export interface Library {
    _id: string;
    name: string;
    code: string;
    address: string;
    borrowingLimit: number;
    loanPeriodDays: number;
    fineRatePerDay: number;
    isActive: boolean;
    createdAt: string;
}

export const libraryApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getLibraries: builder.query<Library[], void>({
            query: () => 'libraries',
            transformResponse: (response: { data: Library[] }) => response.data,
            providesTags: ['Libraries'],
        }),
        getLibrary: builder.query<Library, string>({
            query: (id) => `libraries/${id}`,
            transformResponse: (response: { data: Library }) => response.data,
        }),
        createLibrary: builder.mutation<Library, Partial<Library>>({
            query: (data) => ({
                url: 'libraries',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Libraries'],
        }),
        updateLibrary: builder.mutation<Library, { id: string; data: Partial<Library> }>({
            query: ({ id, data }) => ({
                url: `libraries/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Libraries'],
        }),
        deleteLibrary: builder.mutation<void, string>({
            query: (id) => ({
                url: `libraries/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Libraries'],
        }),
    }),
});

export const {
    useGetLibrariesQuery,
    useGetLibraryQuery,
    useCreateLibraryMutation,
    useUpdateLibraryMutation,
    useDeleteLibraryMutation,
} = libraryApi;
