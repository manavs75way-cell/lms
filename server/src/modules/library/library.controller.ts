import { Request, Response, NextFunction } from 'express';
import * as libraryService from './library.service';

export const createLibrary = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const library = await libraryService.createLibrary(req.body);
        res.status(201).json({ success: true, data: library });
    } catch (error) { next(error); }
};

export const getLibraries = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const libraries = await libraryService.getAllLibraries();
        res.status(200).json({ success: true, data: libraries });
    } catch (error) { next(error); }
};

export const getLibrary = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const library = await libraryService.getLibraryById(req.params.id);
        res.status(200).json({ success: true, data: library });
    } catch (error) { next(error); }
};

export const updateLibrary = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const library = await libraryService.updateLibrary(req.params.id, req.body);
        res.status(200).json({ success: true, data: library });
    } catch (error) { next(error); }
};

export const deleteLibrary = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await libraryService.deleteLibrary(req.params.id);
        res.status(200).json({ success: true, message: 'Library deactivated' });
    } catch (error) { next(error); }
};
