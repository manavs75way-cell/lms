import { z } from 'zod';

export const createNotificationSchema = z.object({
    body: z.object({
        userId: z.string().min(1, 'User ID is required'),
        title: z.string().min(1, 'Title is required'),
        message: z.string().min(1, 'Message is required'),
        type: z.enum(['DUE_SOON', 'OVERDUE', 'RESERVATION_AVAILABLE']),
    }),
});

export const markAsReadSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Notification ID is required'),
    }),
});
