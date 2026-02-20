import { Router } from 'express';
import * as libraryController from './library.controller';
import { authenticate, authorize } from '../../common/middleware/auth.middleware';

const router = Router();

router.get('/', libraryController.getLibraries);
router.get('/:id', libraryController.getLibrary);
router.post('/', authenticate, authorize('ADMIN'), libraryController.createLibrary);
router.put('/:id', authenticate, authorize('ADMIN'), libraryController.updateLibrary);
router.delete('/:id', authenticate, authorize('ADMIN'), libraryController.deleteLibrary);

export default router;
