import { Router } from 'express';
import * as bookController from './book.controller';
import { validate } from '../../common/middleware/validate.middleware';
import { authenticate, authorize } from '../../common/middleware/auth.middleware';
import {
    createWorkSchema,
    updateWorkSchema,
    createEditionSchema,
    updateEditionSchema,
    createCopySchema,
    updateCopySchema,
    getByIdSchema,
} from './book.schema';
import { upload } from '../../config/multer';

const router = Router();

router.get('/search', bookController.searchCatalog);

router.post('/works', authenticate, authorize('LIBRARIAN', 'ADMIN'), upload.single('coverImage'), validate(createWorkSchema), bookController.createWork);
router.get('/works', bookController.getWorks);
router.get('/works/:id', bookController.getWork);
router.put('/works/:id', authenticate, authorize('LIBRARIAN', 'ADMIN'), validate(updateWorkSchema), bookController.updateWork);
router.delete('/works/:id', authenticate, authorize('LIBRARIAN', 'ADMIN'), bookController.deleteWork);

router.post('/works/:workId/editions', authenticate, authorize('LIBRARIAN', 'ADMIN'), upload.single('coverImage'), validate(createEditionSchema), bookController.createEdition);
router.get('/works/:workId/editions', bookController.getEditionsByWork);
router.get('/editions/:id', bookController.getEdition);
router.get('/editions/:id/availability', bookController.getEditionAvailability);
router.put('/editions/:id', authenticate, authorize('LIBRARIAN', 'ADMIN'), validate(updateEditionSchema), bookController.updateEdition);
router.delete('/editions/:id', authenticate, authorize('LIBRARIAN', 'ADMIN'), bookController.deleteEdition);

router.post('/editions/:editionId/copies', authenticate, authorize('LIBRARIAN', 'ADMIN'), validate(createCopySchema), bookController.createCopy);
router.get('/editions/:editionId/copies', bookController.getCopiesByEdition);
router.get('/copies/:id', bookController.getCopy);
router.put('/copies/:id', authenticate, authorize('LIBRARIAN', 'ADMIN'), validate(updateCopySchema), bookController.updateCopy);
router.delete('/copies/:id', authenticate, authorize('LIBRARIAN', 'ADMIN'), bookController.deleteCopy);

router.post('/import', authenticate, authorize('LIBRARIAN', 'ADMIN'), upload.single('file'), bookController.importBooks);
router.post('/import/resolve', authenticate, authorize('LIBRARIAN', 'ADMIN'), bookController.resolveImportDuplicate);

export default router;
