import { Book, IBook } from './book.model';
import { AppError } from '../../errors/AppError';

import { generateBarcode } from '../../utils/barcode';

export const createBook = async (data: Partial<IBook>) => {
    const existingBook = await Book.findOne({ isbn: data.isbn });
    if (existingBook) {
        throw new AppError('Book with this ISBN already exists', 400);
    }

    // Generate barcode if ISBN is present
    let barcodeUrl = '';
    if (data.isbn) {
        try {
            barcodeUrl = await generateBarcode(data.isbn, `book-${data.isbn}`);
        } catch (error) {
            console.error('Failed to generate barcode:', error);
            // Proceed without barcode or handle error as needed
        }
    }

    // Initial available copies equals total copies
    const bookData = {
        ...data,
        barcodeUrl, // Add barcode URL
        availableCopies: data.totalCopies,
        // Ensure each branch has availableCount initialized if not provided
        branches: data.branches?.map(b => ({
            ...b,
            availableCount: b.availableCount ?? b.copyCount
        }))
    };

    const book = await Book.create(bookData);
    return book;
};

export const getAllBooks = async (search?: string) => {
    const query: any = {};
    if (search) {
        const searchRegex = new RegExp(search, 'i');
        query.$or = [
            { title: searchRegex },
            { author: searchRegex },
            { isbn: searchRegex },
        ];
    }
    return await Book.find(query).sort({ createdAt: -1 });
};

export const getBookById = async (id: string) => {
    const book = await Book.findById(id);
    if (!book) {
        throw new AppError('Book not found', 404);
    }
    return book;
};

export const updateBook = async (id: string, data: Partial<IBook>) => {
    const book = await Book.findById(id);
    if (!book) {
        throw new AppError('Book not found', 404);
    }

    // If updating totalCopies, adjust availableCopies logic could be complex.
    // Requirement doesn't specify logic for adjusting available copies on total update.
    // Assuming strict set for now, but preserving consistency if possible.
    // If user updates totalCopies, we should probably adjust availableCopies by the difference?
    // Or just let them update it. Let's keep it simple: just update the fields provided.
    // But wait, if availableCopies > totalCopies (if reduced), that's invalid state.
    // For MVP, letting simple update pass, but ideally we'd validate.

    if (data.totalCopies !== undefined) {
        if (data.totalCopies < (book.totalCopies - book.availableCopies)) {
            throw new AppError('Cannot reduce total copies below currently borrowed amount', 400);
        }
        // Adjust available copies by the difference
        const diff = data.totalCopies - book.totalCopies;
        book.availableCopies += diff;
        book.totalCopies = data.totalCopies;
    }

    if (data.title) book.title = data.title;
    if (data.author) book.author = data.author;
    if (data.isbn) book.isbn = data.isbn;

    await book.save();
    return book;
};

export const deleteBook = async (id: string) => {
    const book = await Book.findById(id);
    if (!book) {
        throw new AppError('Book not found', 404);
    }
    await Book.findByIdAndDelete(id);
};
