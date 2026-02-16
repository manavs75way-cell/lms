import { Router } from 'express';
import * as configController from './config.controller';
import { authenticate, authorize } from '../../common/middleware/auth.middleware';

const router = Router();

router.get('/fine', authenticate, authorize('ADMIN'), configController.getFineConfig);
router.put('/fine', authenticate, authorize('ADMIN'), configController.updateFineConfig);

export default router;
