import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { AppError } from '../../errors/AppError';
import { User } from '../../modules/auth/auth.model';

export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        role: string;
    };
}

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                role: string;
            };
        }
    }
}

interface DecodedToken {
    userId: string;
    role: string;
    iat: number;
    exp: number;
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('Authentication token missing', 401);
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as DecodedToken;
            req.user = { userId: decoded.userId, role: decoded.role };
            next();
        } catch (error) {
            console.error('Token Verification Error:', error);
            throw new AppError('Invalid or expired token', 401);
        }
    } catch (error) {
        next(error);
    }
};

export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError('Not authenticated', 401));
        }

        // console.log('Checking permission. User Role:', req.user.role, 'Required Roles:', roles);
        if (!roles.includes(req.user.role)) {
            console.error(`Access Denied. User Role: ${req.user.role}, Required: ${roles.join(', ')}`);
            return next(new AppError('You do not have permission to perform this action', 403));
        }

        next();
    };
};
