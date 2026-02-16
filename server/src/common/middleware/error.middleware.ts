import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../errors/AppError';
import { logger } from '../../config/logger';

export const globalErrorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    logger.error(err.message, { stack: err.stack });

    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
        return;
    }

    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
    });
};
