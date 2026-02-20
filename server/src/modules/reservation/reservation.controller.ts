import { Response, NextFunction, Request } from 'express';
import * as reservationService from './reservation.service';

export interface AuthenticatedRequest extends Request {
    user?: { userId: string; role: string };
}

export const createReservation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.userId;
        const { editionId, preferredLibraryId } = req.body;
        const reservation = await reservationService.createReservation(userId, editionId, preferredLibraryId);
        res.status(201).json({ success: true, data: reservation });
    } catch (error) { next(error); }
};

export const getMyReservations = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.userId;
        const reservations = await reservationService.getMyReservations(userId);
        res.status(200).json({ success: true, data: reservations });
    } catch (error) { next(error); }
};

export const cancelReservation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.userId;
        const { id } = req.params;
        await reservationService.cancelReservation(id, userId);
        res.status(200).json({ success: true, message: 'Reservation cancelled' });
    } catch (error) { next(error); }
};

export const recalculatePriorities = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await reservationService.recalculatePriorities();
        res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
};
