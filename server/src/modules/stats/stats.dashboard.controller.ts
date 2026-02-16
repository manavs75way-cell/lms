import { Request, Response, NextFunction } from 'express';
import * as dashboardService from './stats.dashboard.service';

export const getLibrarianDashboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dashboardData = await dashboardService.getLibrarianDashboard();
        res.status(200).json({ success: true, data: dashboardData });
    } catch (error) {
        next(error);
    }
};
