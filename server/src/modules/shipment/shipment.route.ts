import { Router } from 'express';
import * as shipmentController from './shipment.controller';
import { authenticate, authorize } from '../../common/middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', authorize('LIBRARIAN', 'ADMIN'), shipmentController.getShipments);
router.patch('/:id/status', authorize('LIBRARIAN', 'ADMIN'), shipmentController.updateShipmentStatus);
router.post('/rebalance', authorize('ADMIN'), shipmentController.triggerRebalancing);

export default router;
