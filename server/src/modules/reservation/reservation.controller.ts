import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../auth/auth.controller';
import * as reservationService from './reservation.service';

export const createReservation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.userId;
        const { bookId } = req.body;
        const reservation = await reservationService.createReservation(userId, bookId);
        res.status(201).json({ success: true, data: reservation });
    } catch (error) {
        next(error);
    }
};

export const getMyReservations = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.userId;
        const reservations = await reservationService.getMyReservations(userId);
        res.status(200).json({ success: true, data: reservations });
    } catch (error) {
        next(error);
    }
};

export const cancelReservation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.userId;
        const { id } = req.params;
        await reservationService.cancelReservation(id, userId);
        res.status(200).json({ success: true, message: 'Reservation cancelled' });
    } catch (error) {
        next(error);
    }
};
