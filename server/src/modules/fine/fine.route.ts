import { Router } from 'express';
import * as fineController from './fine.controller';
import { authenticate, authorize } from '../../common/middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', authorize('ADMIN', 'LIBRARIAN'), fineController.createPolicy);
router.get('/', authorize('ADMIN', 'LIBRARIAN'), fineController.getPolicies);

export default router;
