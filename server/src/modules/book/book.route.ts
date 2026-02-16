import { Router } from 'express';
import * as bookController from './book.controller';
import { validate } from '../../common/middleware/validate.middleware';
import { authenticate, authorize } from '../../common/middleware/auth.middleware';
import { createBookSchema, updateBookSchema, getBookSchema } from './book.schema';

import { upload } from '../../config/multer';

const router = Router();

router.post('/import', authenticate, authorize('LIBRARIAN', 'ADMIN'), upload.single('file'), bookController.importBooks);
router.post('/', authenticate, authorize('LIBRARIAN', 'ADMIN'), upload.single('coverImage'), validate(createBookSchema), bookController.createBook);
router.get('/', bookController.getBooks);
router.get('/:id', bookController.getBook);
router.put('/:id', authenticate, authorize('LIBRARIAN', 'ADMIN'), validate(updateBookSchema), bookController.updateBook);
router.delete('/:id', authenticate, authorize('LIBRARIAN', 'ADMIN'), validate(getBookSchema), bookController.deleteBook);

export default router;
