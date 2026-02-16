import { Router } from 'express';
import * as borrowController from './borrow.controller';
import { authenticate, authorize } from '../../common/middleware/auth.middleware';
import { validate } from '../../common/middleware/validate.middleware';
import { borrowBookSchema, returnBookSchema } from './borrow.schema';

const router = Router();

router.use(authenticate);

router.get('/history', authenticate, borrowController.getReadingHistory);
router.get('/recommendations', authenticate, borrowController.getRecommendations);

router.post('/', authenticate, authorize('MEMBER'), validate(borrowBookSchema), borrowController.borrowBook);
router.patch('/:id/return', authenticate, validate(returnBookSchema), borrowController.returnBook);
router.get('/my-borrows', authenticate, borrowController.getMyBorrows);

export default router;
