import { Request, Response, NextFunction } from 'express';
import * as statsService from './stats.service';
import * as predictiveHoldsService from './predictiveHolds.service';

export const getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const stats = await statsService.getDashboardStats();
        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        next(error);
    }
};

export const setPredictiveOverride = async (req: Request & { user?: { userId: string } }, res: Response, next: NextFunction) => {
    try {
        if (!req.user) throw new Error('Unauthorized');
        const override = await predictiveHoldsService.setPredictiveOverride({
            editionId: req.body.editionId,
            reservations: req.body.reservations,
            reason: req.body.reason,
            userId: req.user.userId,
        });
        res.status(200).json({ success: true, data: override });
    } catch (error) {
        next(error);
    }
};
