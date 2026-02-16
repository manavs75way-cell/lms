import { Router } from 'express';
import { authenticate } from '../../common/middleware/auth.middleware';
import { validate } from '../../common/middleware/validate.middleware';
import * as reservationController from './reservation.controller';
import { createReservationSchema, cancelReservationSchema } from './reservation.schema';

const router = Router();

router.post(
    '/',
    authenticate,
    validate(createReservationSchema),
    reservationController.createReservation
);

router.get('/my-reservations', authenticate, reservationController.getMyReservations);

router.patch(
    '/:id/cancel',
    authenticate,
    validate(cancelReservationSchema),
    reservationController.cancelReservation
);

export default router;
