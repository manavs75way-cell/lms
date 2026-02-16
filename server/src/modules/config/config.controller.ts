import { Request, Response, NextFunction } from 'express';
import { Config } from '../../config/config.model';
import { AppError } from '../../errors/AppError';

export const getFineConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let config = await Config.findOne({ key: 'fine_per_day' });
        if (!config) {
            // detailed check if default exists, if not create it??
            // For now just return default value 10
            return res.status(200).json({ key: 'fine_per_day', value: 10 });
        }
        res.status(200).json(config);
    } catch (error) {
        next(error);
    }
};

export const updateFineConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { value } = req.body;
        if (value === undefined || value < 0) {
            throw new AppError('Invalid fine value', 400);
        }

        const config = await Config.findOneAndUpdate(
            { key: 'fine_per_day' },
            { value },
            { upsert: true, new: true }
        );

        res.status(200).json(config);
    } catch (error) {
        next(error);
    }
};
