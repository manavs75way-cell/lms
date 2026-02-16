import { Request, Response, NextFunction } from 'express';
import * as borrowService from './borrow.service';

export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        role: string;
    };
}

export const borrowBook = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new Error('User not found in request');
        }
        const borrow = await borrowService.borrowBook(req.user.userId, req.body.bookId);
        res.status(201).json({ success: true, data: borrow });
    } catch (error) {
        next(error);
    }
};

export const returnBook = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new Error('User not found in request');
        }
        const borrow = await borrowService.returnBook(req.user.userId, req.params.id, req.body);
        res.status(200).json({ success: true, data: borrow });
    } catch (error) {
        next(error);
    }
};

export const getMyBorrows = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new Error('User not found in request');
        }
        const borrows = await borrowService.getMyBorrows(req.user.userId);
        res.status(200).json({ success: true, data: borrows });
    } catch (error) {
        next(error);
    }
};

export const getReadingHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new Error('User not found in request');
        }
        const history = await borrowService.getReadingHistory(req.user.userId);
        res.status(200).json({ success: true, data: history });
    } catch (error) {
        next(error);
    }
};

export const getRecommendations = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new Error('User not found in request');
        }
        const recommendations = await borrowService.getRecommendations(req.user.userId);
        res.status(200).json({ success: true, data: recommendations });
    } catch (error) {
        next(error);
    }
};
