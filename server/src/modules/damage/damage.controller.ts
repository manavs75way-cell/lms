import { Request, Response, NextFunction } from 'express';
import * as damageService from './damage.service';

export interface AuthenticatedRequest extends Request {
    user?: { userId: string; role: string };
}

export const createReport = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) throw new Error('User not found in request');
        const report = await damageService.createDamageReport({
            copyId: req.body.copyId,
            reportedBy: req.user.userId,
            damageDescription: req.body.damageDescription,
        });
        res.status(201).json({ success: true, data: report });
    } catch (error) { next(error); }
};

export const getReports = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reports = await damageService.getDamageReports(req.query.status as string);
        res.status(200).json({ success: true, data: reports });
    } catch (error) { next(error); }
};

export const updateReportStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const report = await damageService.updateDamageReportStatus(req.params.id, req.body.status);
        res.status(200).json({ success: true, data: report });
    } catch (error) { next(error); }
};
