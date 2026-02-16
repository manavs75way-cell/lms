import { api } from './api';
import { DashboardResponse } from '../types/dashboard.types';

export const dashboardApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getLibrarianDashboard: builder.query<DashboardResponse, void>({
            query: () => '/stats/dashboard',
            providesTags: ['Borrows', 'Books', 'Users'],
        }),
    }),
});

export const { useGetLibrarianDashboardQuery } = dashboardApi;
