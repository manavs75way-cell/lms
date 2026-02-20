import { api } from './api';
import { Copy, Edition, Work } from './booksApi';
import { User } from './authApi';

export interface DamageReport {
    _id: string;
    copy: Copy & { edition: Edition & { work: Work } };
    reportedBy: User;
    damageDescription: string;
    replacementCost: number;
    depreciatedValue: number;
    damageFee: number;
    flaggedBorrowers: User[];
    status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
    createdAt: string;
    updatedAt: string;
}

export const damageApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getDamageReports: builder.query<DamageReport[], string | void>({
            query: (status) => ({
                url: 'damage-reports',
                params: status ? { status } : undefined,
            }),
            transformResponse: (response: { data: DamageReport[] }) => response.data,
            providesTags: ['DamageReports'],
        }),
        createDamageReport: builder.mutation<DamageReport, { copyId: string; damageDescription: string }>({
            query: (data) => ({
                url: 'damage-reports',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['DamageReports', 'Books'],
        }),
        updateDamageReportStatus: builder.mutation<DamageReport, { id: string; status: string }>({
            query: ({ id, status }) => ({
                url: `damage-reports/${id}/status`,
                method: 'PATCH',
                body: { status },
            }),
            invalidatesTags: ['DamageReports'],
        }),
    }),
});

export const {
    useGetDamageReportsQuery,
    useCreateDamageReportMutation,
    useUpdateDamageReportStatusMutation,
} = damageApi;
