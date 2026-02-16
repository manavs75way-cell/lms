import { api } from './api';

export interface Notification {
    _id: string;
    title: string;
    message: string;
    type: 'DUE_SOON' | 'OVERDUE' | 'RESERVATION_AVAILABLE' | 'SYSTEM';
    isRead: boolean;
    createdAt: string;
}

export const notificationApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getNotifications: builder.query<Notification[], void>({
            query: () => 'notifications',
            transformResponse: (response: { data: Notification[] }) => response.data,
            providesTags: ['Notifications'],
        }),
        getUnreadCount: builder.query<{ count: number }, void>({
            query: () => 'notifications/unread-count',
            transformResponse: (response: { data: { count: number } }) => response.data,
            providesTags: ['Notifications'],
        }),
        markAsRead: builder.mutation<Notification, string>({
            query: (id) => ({
                url: `notifications/${id}/read`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Notifications'],
        }),
        markAllAsRead: builder.mutation<void, void>({
            query: () => ({
                url: 'notifications/read-all',
                method: 'PATCH',
            }),
            invalidatesTags: ['Notifications'],
        }),
    }),
});

export const {
    useGetNotificationsQuery,
    useGetUnreadCountQuery,
    useMarkAsReadMutation,
    useMarkAllAsReadMutation,
} = notificationApi;
