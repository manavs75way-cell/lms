import { Router } from 'express';
import * as notificationController from './notification.controller';
import { authenticate } from '../../common/middleware/auth.middleware';
import { validate } from '../../common/middleware/validate.middleware';
import { markAsReadSchema } from './notification.schema';

const router = Router();

router.use(authenticate);

router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/:id/read', validate(markAsReadSchema), notificationController.markAsRead);
router.patch('/read-all', notificationController.markAllAsRead);

export default router;
