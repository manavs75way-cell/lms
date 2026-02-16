import { api } from './api';

export interface DashboardStats {
    totalBooks: number;
    totalBorrowed: number;
    totalUsers: number;
    mostBorrowed: Array<{ _id: string; title: string; count: number }>;
    overdueCount: number;
    activeMembers: number;
    reservedCount: number;
    unreadNotificationsCount: number;
}

export const statsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getDashboardStats: builder.query<DashboardStats, void>({
            query: () => 'stats',
            providesTags: ['Books', 'Borrows', 'Users'],
        }),
    }),
});

export const { useGetDashboardStatsQuery } = statsApi;
