import { api } from './api';
import { Library } from './libraryApi';
import { User } from './authApi';

export interface FinePolicy {
    _id: string;
    library: Library;
    ratePerDay: number;
    effectiveFrom: string;
    effectiveTo?: string;
    createdBy: User;
    createdAt: string;
}

export const finePolicyApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getFinePolicies: builder.query<FinePolicy[], string>({
            query: (libraryId) => ({
                url: 'fine-policies',
                params: { libraryId },
            }),
            transformResponse: (response: { data: FinePolicy[] }) => response.data,
            providesTags: ['FinePolicies'],
        }),
        createFinePolicy: builder.mutation<FinePolicy, { library: string; ratePerDay: number; effectiveFrom: string }>({
            query: (data) => ({
                url: 'fine-policies',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['FinePolicies'],
        }),
    }),
});

export const {
    useGetFinePoliciesQuery,
    useCreateFinePolicyMutation,
} = finePolicyApi;
