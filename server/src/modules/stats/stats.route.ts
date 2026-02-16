import { Router } from 'express';
import * as statsController from './stats.controller';
import { authenticate, authorize } from '../../common/middleware/auth.middleware';
import * as dashboardController from './stats.dashboard.controller';

const router = Router();

router.use(authenticate);

router.get('/dashboard', authorize('LIBRARIAN', 'ADMIN'), dashboardController.getLibrarianDashboard);
router.get('/', statsController.getStats);

export default router;
