import { api } from './api';

export interface FineConfig {
    key: string;
    value: number;
}

export const configApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getFineConfig: builder.query<FineConfig, void>({
            query: () => 'config/fine',
            providesTags: ['Config'],
        }),
        updateFineConfig: builder.mutation<FineConfig, { value: number }>({
            query: (data) => ({
                url: 'config/fine',
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Config'],
        }),
    }),
});

export const { useGetFineConfigQuery, useUpdateFineConfigMutation } = configApi;
