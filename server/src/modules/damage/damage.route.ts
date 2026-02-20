import { Router } from 'express';
import * as damageController from './damage.controller';
import { authenticate, authorize } from '../../common/middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', authorize('LIBRARIAN', 'ADMIN'), damageController.createReport);
router.get('/', authorize('LIBRARIAN', 'ADMIN'), damageController.getReports);
router.patch('/:id/status', authorize('LIBRARIAN', 'ADMIN'), damageController.updateReportStatus);

export default router;
