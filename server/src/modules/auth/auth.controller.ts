import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';

export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        role: string;
    };
}

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await authService.registerUser(req.body);
        res.status(201).json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await authService.loginUser(req.body);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await authService.refreshAccessToken(req.body.refreshToken);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};

export const logout = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        if (req.user) {
            await authService.logoutUser(req.user.userId);
        }
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
};

export const me = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authenticated' });
            return;
        }
        const user = await authService.getUserById(req.user.userId);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};
