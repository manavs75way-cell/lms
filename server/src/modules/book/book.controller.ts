import { Request, Response, NextFunction } from 'express';
import * as bookService from './book.service';

export const createBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const bookData = { ...req.body };
        if (req.file) {
            bookData.coverImageUrl = req.file.path;
        }
        const book = await bookService.createBook(bookData);
        res.status(201).json({ success: true, data: book });
    } catch (error) {
        next(error);
    }
};

export const getBooks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const search = req.query.search as string;
        const books = await bookService.getAllBooks(search);
        res.status(200).json({ success: true, data: books });
    } catch (error) {
        next(error);
    }
};

export const getBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const book = await bookService.getBookById(req.params.id);
        res.status(200).json({ success: true, data: book });
    } catch (error) {
        next(error);
    }
};

export const updateBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const book = await bookService.updateBook(req.params.id, req.body);
        res.status(200).json({ success: true, data: book });
    } catch (error) {
        next(error);
    }
};

export const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await bookService.deleteBook(req.params.id);
        res.status(200).json({ success: true, message: 'Book deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const importBooks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            throw new Error('No CSV file uploaded'); // Changed AppError to Error for simplicity, assuming AppError is not defined here.
        }
        const { parseAndImportBooks } = await import('./import.service');
        const count = await parseAndImportBooks(req.file.path);
        res.status(200).json({ success: true, message: `Imported ${count} books successfully` });
    } catch (error) {
        next(error);
    }
};
