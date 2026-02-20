import { Router, Request, Response } from 'express';
import authRoutes from '../modules/auth/auth.route';
import bookRoutes from '../modules/book/book.route';
import borrowRoutes from '../modules/borrow/borrow.route';
import statsRoutes from '../modules/stats/stats.route';
import reservationRoutes from '../modules/reservation/reservation.route';
import notificationRoutes from '../modules/notification/notification.route';
import configRoutes from '../modules/config/config.route';
import libraryRoutes from '../modules/library/library.route';
import shipmentRoutes from '../modules/shipment/shipment.route';
import damageRoutes from '../modules/damage/damage.route';
import fineRoutes from '../modules/fine/fine.route';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
    });
});

router.use('/auth', authRoutes);
router.use('/books', bookRoutes);
router.use('/borrow', borrowRoutes);
router.use('/stats', statsRoutes);
router.use('/reservations', reservationRoutes);
router.use('/notifications', notificationRoutes);
router.use('/config', configRoutes);
router.use('/libraries', libraryRoutes);
router.use('/shipments', shipmentRoutes);
router.use('/damage-reports', damageRoutes);
router.use('/fine-policies', fineRoutes);

export default router;
