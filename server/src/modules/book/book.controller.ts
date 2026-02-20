import { Request, Response, NextFunction } from 'express';
import * as bookService from './book.service';

export interface AuthenticatedRequest extends Request {
    user?: { userId: string; role: string };
}


export const createWork = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const data = { ...req.body };
        if (req.file) data.coverImageUrl = req.file.path;
        const work = await bookService.createWork(data);
        res.status(201).json({ success: true, data: work });
    } catch (error) { next(error); }
};

export const getWorks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const search = req.query.search as string;
        const works = await bookService.getAllWorks(search);
        res.status(200).json({ success: true, data: works });
    } catch (error) { next(error); }
};

export const getWork = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const work = await bookService.getWorkById(req.params.id);
        res.status(200).json({ success: true, data: work });
    } catch (error) { next(error); }
};

export const updateWork = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const work = await bookService.updateWork(req.params.id, req.body);
        res.status(200).json({ success: true, data: work });
    } catch (error) { next(error); }
};

export const deleteWork = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await bookService.deleteWork(req.params.id);
        res.status(200).json({ success: true, message: 'Work deleted successfully' });
    } catch (error) { next(error); }
};


export const createEdition = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const data = { ...req.body };
        if (req.file) data.coverImageUrl = req.file.path;
        const edition = await bookService.createEdition(req.params.workId, data);
        res.status(201).json({ success: true, data: edition });
    } catch (error) { next(error); }
};

export const getEditionsByWork = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const editions = await bookService.getEditionsByWork(req.params.workId);
        res.status(200).json({ success: true, data: editions });
    } catch (error) { next(error); }
};

export const getEdition = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const edition = await bookService.getEditionById(req.params.id);
        res.status(200).json({ success: true, data: edition });
    } catch (error) { next(error); }
};

export const updateEdition = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const edition = await bookService.updateEdition(req.params.id, req.body);
        res.status(200).json({ success: true, data: edition });
    } catch (error) { next(error); }
};

export const deleteEdition = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await bookService.deleteEdition(req.params.id);
        res.status(200).json({ success: true, message: 'Edition deleted successfully' });
    } catch (error) { next(error); }
};

export const getEditionAvailability = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const availability = await bookService.getEditionAvailability(req.params.id);
        res.status(200).json({ success: true, data: availability });
    } catch (error) { next(error); }
};


export const createCopy = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const copy = await bookService.createCopy(req.params.editionId, req.body);
        res.status(201).json({ success: true, data: copy });
    } catch (error) { next(error); }
};

export const getCopiesByEdition = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const copies = await bookService.getCopiesByEdition(req.params.editionId);
        res.status(200).json({ success: true, data: copies });
    } catch (error) { next(error); }
};

export const getCopy = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const copy = await bookService.getCopyById(req.params.id);
        res.status(200).json({ success: true, data: copy });
    } catch (error) { next(error); }
};

export const updateCopy = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const copy = await bookService.updateCopy(req.params.id, req.body);
        res.status(200).json({ success: true, data: copy });
    } catch (error) { next(error); }
};

export const deleteCopy = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await bookService.deleteCopy(req.params.id);
        res.status(200).json({ success: true, message: 'Copy deleted successfully' });
    } catch (error) { next(error); }
};


export const searchCatalog = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = (req.query.q as string) || '';
        const results = await bookService.searchCatalog(query);
        res.status(200).json({ success: true, data: results });
    } catch (error) { next(error); }
};


export const importBooks = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            throw new Error('No CSV file uploaded');
        }
        const { parseAndImportBooks } = await import('./import.service');
        const result = await parseAndImportBooks(req.file.path);
        res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
};

export const resolveImportDuplicate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { resolveNearDuplicate } = await import('./import.service');
        const result = await resolveNearDuplicate(req.body);
        res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
};
