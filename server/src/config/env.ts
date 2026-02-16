import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    PORT: z.string().default('5000'),
    MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    JWT_ACCESS_SECRET: z.string().min(1, 'JWT_ACCESS_SECRET is required'),
    JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),
    CLOUDINARY_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),
    CLOUDINARY_URL: z.string().optional(),
});

const envParse = envSchema.safeParse(process.env);

if (!envParse.success) {
    console.error('Invalid environment variables:', envParse.error.format());
    process.exit(1);
}

export const env = envParse.data;
