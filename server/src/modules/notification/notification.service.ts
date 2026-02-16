import { Notification, INotification } from './notification.model';
import { AppError } from '../../errors/AppError';

export const createNotification = async (
    userId: string,
    title: string,
    message: string,
    type: 'DUE_SOON' | 'OVERDUE' | 'RESERVATION_AVAILABLE' | 'SYSTEM'
) => {
    return await Notification.create({
        user: userId,
        title,
        message,
        type,
    });
};

export const getUserNotifications = async (userId: string) => {
    return await Notification.find({ user: userId }).sort({ createdAt: -1 });
};

export const getUnreadCount = async (userId: string) => {
    return await Notification.countDocuments({ user: userId, isRead: false });
};

export const markAsRead = async (notificationId: string, userId: string) => {
    const notification = await Notification.findOne({ _id: notificationId, user: userId });

    if (!notification) {
        throw new AppError('Notification not found', 404);
    }

    notification.isRead = true;
    await notification.save();
    return notification;
};

export const markAllAsRead = async (userId: string) => {
    await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
};
