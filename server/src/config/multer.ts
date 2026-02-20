import multer from 'multer';
import { Request } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { env } from './env';

cloudinary.config({
    cloud_name: env.CLOUDINARY_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
});

const storageParams: {
    folder: string;
    allowed_formats: string[];
    public_id: (req: Request, file: Express.Multer.File) => string;
    [key: string]: unknown;
} = {
    folder: 'library-covers',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    public_id: (req: Request, file: Express.Multer.File) => `book-${Date.now()}-${file.originalname.split('.')[0]}`,
};

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: storageParams,
});

export const upload = multer({ storage: storage });
