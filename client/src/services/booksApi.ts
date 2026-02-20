import { api } from './api';
import { Library } from './libraryApi';

export interface Work {
    _id: string;
    title: string;
    originalAuthor: string;
    genres: string[];
    description?: string;
    coverImageUrl?: string;
    createdAt: string;
}

export interface Edition {
    _id: string;
    work: string | Work;
    isbn: string;
    format: 'HARDCOVER' | 'PAPERBACK' | 'AUDIOBOOK' | 'EBOOK';
    publisher: string;
    publicationYear: number;
    language: string;
    replacementCost: number;
    coverImageUrl?: string;
    createdAt: string;
}

export interface Copy {
    _id: string;
    edition: string | Edition;
    copyCode: string;
    owningLibrary: string | Library;
    currentLibrary: string | Library;
    condition: 'NEW' | 'GOOD' | 'FAIR' | 'DAMAGED';
    status: 'AVAILABLE' | 'BORROWED' | 'IN_TRANSIT' | 'DAMAGED_PULLED' | 'LOST';
    barcodeUrl?: string;
    qrCodeUrl?: string;
    acquiredDate: string;
    createdAt: string;
}

export interface SearchEditionAvailability {
    edition: Edition;
    totalCopies: number;
    availableCopies: number;
}

export interface SearchCatalogResult {
    work: Work;
    editions: SearchEditionAvailability[];
}

export interface CsvRow {
    title: string;
    originalAuthor: string;
    genres: string;
    isbn: string;
    format: string;
    publisher: string;
    publicationYear: string;
    language: string;
    replacementCost: string;
    copyCode: string;
    libraryId: string;
    condition: string;
    [key: string]: string;
}

export interface NearDuplicate {
    csvRow: CsvRow;
    existingMatch: {
        _id: string;
        title: string;
        originalAuthor: string;
    };
    similarityScore: number;
}

export const booksApi = api.injectEndpoints({
    endpoints: (builder) => ({
        searchCatalog: builder.query<SearchCatalogResult[], string | void>({
            query: (query) => ({
                url: 'books/search',
                params: query ? { q: query } : undefined,
            }),
            transformResponse: (response: { data: SearchCatalogResult[] }) => response.data,
            providesTags: ['Books'],
        }),

        getWorks: builder.query<Work[], string | void>({
            query: (search) => ({
                url: 'books/works',
                params: search ? { search } : undefined,
            }),
            transformResponse: (response: { data: Work[] }) => response.data,
            providesTags: ['Books'],
        }),
        getWork: builder.query<Work, string>({
            query: (id) => `books/works/${id}`,
            transformResponse: (response: { data: Work }) => response.data,
            providesTags: (_result, _error, id) => [{ type: 'Books', id }],
        }),
        createWork: builder.mutation<{ success: boolean; data: Work; _id?: string }, FormData>({
            query: (formData) => ({
                url: 'books/works',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['Books'],
        }),
        updateWork: builder.mutation<Work, { id: string; data: Partial<Work> }>({
            query: ({ id, data }) => ({
                url: `books/works/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Books'],
        }),
        deleteWork: builder.mutation<void, string>({
            query: (id) => ({
                url: `books/works/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Books'],
        }),

        getEditions: builder.query<Edition[], string>({
            query: (workId) => `books/works/${workId}/editions`,
            transformResponse: (response: { data: Edition[] }) => response.data,
            providesTags: ['Books'],
        }),
        createEdition: builder.mutation<{ success: boolean; data: Edition; _id?: string }, { workId: string; data: FormData }>({
            query: ({ workId, data }) => ({
                url: `books/works/${workId}/editions`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Books'],
        }),
        updateEdition: builder.mutation<Edition, { id: string; data: Partial<Edition> }>({
            query: ({ id, data }) => ({
                url: `books/editions/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Books'],
        }),
        deleteEdition: builder.mutation<void, string>({
            query: (id) => ({
                url: `books/editions/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Books'],
        }),

        getCopies: builder.query<Copy[], string>({
            query: (editionId) => `books/editions/${editionId}/copies`,
            transformResponse: (response: { data: Copy[] }) => response.data,
            providesTags: ['Books'],
        }),
        createCopy: builder.mutation<{ success: boolean; data: Copy; _id?: string }, { editionId: string; owningLibrary: string; condition: string }>({
            query: ({ editionId, ...data }) => ({
                url: `books/editions/${editionId}/copies`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Books'],
        }),
        updateCopy: builder.mutation<Copy, { id: string; data: Partial<Copy> }>({
            query: ({ id, data }) => ({
                url: `books/copies/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Books'],
        }),
        deleteCopy: builder.mutation<void, string>({
            query: (id) => ({
                url: `books/copies/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Books'],
        }),

        importBooks: builder.mutation<{ success: boolean; data: { nearDuplicates: NearDuplicate[]; newBooks: Work[] } }, File>({
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
        resolveImportDuplicate: builder.mutation<void, { csvRow: CsvRow; resolution: string; matchId?: string }>({
            query: (data) => ({
                url: 'books/import/resolve',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Books'],
        }),
    }),
});

export const {
    useSearchCatalogQuery,
    useGetWorksQuery,
    useGetWorkQuery,
    useCreateWorkMutation,
    useUpdateWorkMutation,
    useDeleteWorkMutation,
    useGetEditionsQuery,
    useCreateEditionMutation,
    useUpdateEditionMutation,
    useDeleteEditionMutation,
    useGetCopiesQuery,
    useCreateCopyMutation,
    useUpdateCopyMutation,
    useDeleteCopyMutation,
    useImportBooksMutation,
    useResolveImportDuplicateMutation
} = booksApi;
