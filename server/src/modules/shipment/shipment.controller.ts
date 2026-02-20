import { Request, Response, NextFunction } from 'express';
import * as rebalancingService from './rebalancing.service';

export interface AuthenticatedRequest extends Request {
    user?: { userId: string; role: string };
}

export const getShipments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const shipments = await rebalancingService.getShipments({
            status: req.query.status as string,
            libraryId: req.query.libraryId as string,
        });
        res.status(200).json({ success: true, data: shipments });
    } catch (error) { next(error); }
};

export const updateShipmentStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const shipment = await rebalancingService.updateShipmentStatus(
            req.params.id,
            req.body.status
        );
        res.status(200).json({ success: true, data: shipment });
    } catch (error) { next(error); }
};

export const triggerRebalancing = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const results = await rebalancingService.runRebalancing(req.user?.userId);
        res.status(200).json({ success: true, data: results });
    } catch (error) { next(error); }
};
