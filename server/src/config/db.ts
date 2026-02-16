import mongoose from 'mongoose';
import { env } from './env';
import { logger } from './logger';

export const connectDB = async (): Promise<void> => {
    try {
        mongoose.set('strictQuery', true);

        await mongoose.connect(env.MONGO_URI);

        logger.info(`MongoDB Connected: ${mongoose.connection.host}`);
    } catch (error) {
        logger.error('Error connecting to MongoDB', error);
        process.exit(1);
    }
};
