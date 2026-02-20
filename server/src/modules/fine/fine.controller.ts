import { Request, Response, NextFunction } from 'express';
import * as fineService from './fine.service';

export interface AuthenticatedRequest extends Request {
    user?: { userId: string; role: string };
}

export const createPolicy = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) throw new Error('User not found in request');
        const policy = await fineService.createFinePolicy({
            library: req.body.library,
            ratePerDay: req.body.ratePerDay,
            effectiveFrom: new Date(req.body.effectiveFrom),
            createdBy: req.user.userId,
        });
        res.status(201).json({ success: true, data: policy });
    } catch (error) { next(error); }
};

export const getPolicies = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const libraryId = req.query.libraryId as string;
        if (!libraryId) {
            res.status(400).json({ success: false, message: 'libraryId query parameter is required' });
            return;
        }
        const policies = await fineService.getFinePolicies(libraryId);
        res.status(200).json({ success: true, data: policies });
    } catch (error) { next(error); }
};
