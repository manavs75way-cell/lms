import fs from 'fs';
import csv from 'csv-parser';
import { Book, IBook } from './book.model';
import { generateBarcode } from '../../utils/barcode';

export const parseAndImportBooks = (filePath: string): Promise<number> => {
    return new Promise((resolve, reject) => {
        const books: Partial<IBook>[] = [];

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => {
                // Map CSV fields to Book model fields
                // Assuming CSV headers: title,author,isbn,genre,publisher,totalCopies,branch1_count,branch2_count...
                // Simplify: title,author,isbn,genre,publisher,totalCopies,branch,copyCount

                const book: Partial<IBook> = {
                    title: data.title,
                    author: data.author,
                    isbn: data.isbn,
                    genre: data.genre,
                    publisher: data.publisher,
                    totalCopies: parseInt(data.totalCopies, 10),
                    availableCopies: parseInt(data.totalCopies, 10),
                    condition: 'GOOD', // Default
                    coverImageUrl: data.coverImageUrl,
                    branches: [
                        {
                            branch: data.branch || 'Main',
                            copyCount: parseInt(data.copyCount || data.totalCopies, 10),
                            availableCount: parseInt(data.copyCount || data.totalCopies, 10),
                        }
                    ]
                };
                books.push(book);
            })
            .on('end', async () => {
                try {
                    let importedCount = 0;
                    for (const bookData of books) {
                        // Generate barcode
                        if (bookData.isbn) {
                            bookData.barcodeUrl = await generateBarcode(bookData.isbn, `book-${bookData.isbn}`);
                        }

                        // Upsert based on ISBN
                        await Book.findOneAndUpdate(
                            { isbn: bookData.isbn },
                            bookData,
                            { upsert: true, new: true }
                        );
                        importedCount++;
                    }
                    // Clean up file
                    fs.unlinkSync(filePath);
                    resolve(importedCount);
                } catch (error) {
                    reject(error);
                }
            })
            .on('error', (error) => {
                reject(error);
            });
    });
};
