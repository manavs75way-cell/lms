import { api } from './api';
import { DashboardResponse } from '../types/dashboard.types';

export const dashboardApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getLibrarianDashboard: builder.query<DashboardResponse, void>({
            query: () => '/stats/dashboard',
            providesTags: ['Borrows', 'Books', 'Users'],
        }),
        overridePredictiveHold: builder.mutation<void, { editionId: string; reservations: number; reason: string }>({
            query: (body) => ({
                url: '/stats/predictive-override',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Borrows'], 
        }),
    }),
});

export const { useGetLibrarianDashboardQuery, useOverridePredictiveHoldMutation } = dashboardApi;
