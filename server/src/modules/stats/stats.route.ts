import { Router } from 'express';
import * as statsController from './stats.controller';
import { authenticate, authorize } from '../../common/middleware/auth.middleware';
import * as dashboardController from './stats.dashboard.controller';

const router = Router();

router.use(authenticate);

router.get('/dashboard', authorize('LIBRARIAN', 'ADMIN'), dashboardController.getLibrarianDashboard);
router.post('/predictive-override', authorize('LIBRARIAN', 'ADMIN'), statsController.setPredictiveOverride);
router.get('/', statsController.getStats);

export default router;
