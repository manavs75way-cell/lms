import { Request, Response, NextFunction } from 'express';
import * as borrowService from './borrow.service';

export interface AuthenticatedRequest extends Request {
    user?: { userId: string; role: string };
}

export const borrowBook = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) throw new Error('User not found in request');
        const borrow = await borrowService.borrowBook({
            userId: req.user.userId,
            copyId: req.body.copyId,
            libraryId: req.body.libraryId,
            onBehalfOfUserId: req.body.onBehalfOfUserId,
        });
        res.status(201).json({ success: true, data: borrow });
    } catch (error) { next(error); }
};

export const returnBook = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) throw new Error('User not found in request');
        const borrow = await borrowService.returnBook({
            userId: req.user.userId,
            borrowId: req.params.id,
            returnToLibraryId: req.body.returnToLibraryId,
            condition: req.body.condition,
            damageNotes: req.body.damageNotes,
        });
        res.status(200).json({ success: true, data: borrow });
    } catch (error) { next(error); }
};

export const getMyBorrows = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) throw new Error('User not found in request');
        const borrows = await borrowService.getMyBorrows(req.user.userId);
        res.status(200).json({ success: true, data: borrows });
    } catch (error) { next(error); }
};

export const getReadingHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) throw new Error('User not found in request');
        console.log(`[History] Fetching for user: ${req.user.userId}`);
        const history = await borrowService.getReadingHistory(req.user.userId);
        console.log(`[History] Found ${history.length} returned records`);
        res.status(200).json({ success: true, data: history });
    } catch (error) { next(error); }
};

export const getRecommendations = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) throw new Error('User not found in request');
        const recommendations = await borrowService.getRecommendations(req.user.userId);
        res.status(200).json({ success: true, data: recommendations });
    } catch (error) { next(error); }
};
