import { Request, Response, NextFunction } from 'express';
import * as notificationService from './notification.service';
import { AuthenticatedRequest } from '../../common/middleware/auth.middleware';

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthenticatedRequest).user!.userId;
        const notifications = await notificationService.getUserNotifications(userId);
        res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        next(error);
    }
};

export const getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthenticatedRequest).user!.userId;
        const count = await notificationService.getUnreadCount(userId);
        res.status(200).json({ success: true, data: { count } });
    } catch (error) {
        next(error);
    }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthenticatedRequest).user!.userId;
        const { id } = req.params;
        const notification = await notificationService.markAsRead(id, userId);
        res.status(200).json({ success: true, data: notification });
    } catch (error) {
        next(error);
    }
};

export const markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthenticatedRequest).user!.userId;
        await notificationService.markAllAsRead(userId);
        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        next(error);
    }
};
