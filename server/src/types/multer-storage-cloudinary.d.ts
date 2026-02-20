declare module 'multer-storage-cloudinary' {
    import { v2 as cloudinary } from 'cloudinary';
    import { StorageEngine } from 'multer';
    import { Request } from 'express';

    interface Options {
        cloudinary: typeof cloudinary;
        params?: {
            folder?: string;
            format?: string;
            public_id?: (req: Request, file: Express.Multer.File) => string;
            allowed_formats?: string[];
            [key: string]: unknown;
        };
    }

    export class CloudinaryStorage implements StorageEngine {
        constructor(options: Options);
        _handleFile(req: Request, file: Express.Multer.File, cb: (error?: Error | null, info?: Partial<Express.Multer.File>) => void): void;
        _removeFile(req: Request, file: Express.Multer.File, cb: (error: Error | null) => void): void;
    }
}
