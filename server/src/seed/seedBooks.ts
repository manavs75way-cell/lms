import mongoose from 'mongoose';
import { Book } from '../modules/book/book.model';
import { env } from '../config/env';
import { generateBarcode } from '../utils/barcode';

const books = [
    {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        isbn: '9780743273565',
        totalCopies: 5,
        availableCopies: 5,
        genre: 'Classic',
        publisher: 'Scribner',
        condition: 'GOOD',
        coverImageUrl: 'https://res.cloudinary.com/dqj9xgkip/image/upload/v1/library/gatsby.jpg',
        branches: [{ branch: 'Main Library', copyCount: 5, availableCount: 5 }]
    },
    {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        isbn: '9780061120084',
        totalCopies: 3,
        availableCopies: 3,
        genre: 'Classic',
        publisher: 'Harper Perennial',
        condition: 'GOOD',
        coverImageUrl: 'https://res.cloudinary.com/dqj9xgkip/image/upload/v1/library/mockingbird.jpg',
        branches: [{ branch: 'Main Library', copyCount: 3, availableCount: 3 }]
    },
    {
        title: '1984',
        author: 'George Orwell',
        isbn: '9780451524935',
        totalCopies: 4,
        availableCopies: 4,
        genre: 'Dystopian',
        publisher: 'Signet Classic',
        condition: 'NEW',
        coverImageUrl: 'https://res.cloudinary.com/dqj9xgkip/image/upload/v1/library/1984.jpg',
        branches: [{ branch: 'Main Library', copyCount: 4, availableCount: 4 }]
    },
    {
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        isbn: '9781503290563',
        totalCopies: 6,
        availableCopies: 6,
        genre: 'Romance',
        publisher: 'CreateSpace',
        condition: 'GOOD',
        coverImageUrl: 'https://res.cloudinary.com/dqj9xgkip/image/upload/v1/library/pride.jpg',
        branches: [{ branch: 'Main Library', copyCount: 6, availableCount: 6 }]
    },
    {
        title: 'The Catcher in the Rye',
        author: 'J.D. Salinger',
        isbn: '9780316769488',
        totalCopies: 4,
        availableCopies: 4,
        genre: 'Fiction',
        publisher: 'Little, Brown and Company',
        condition: 'FAIR',
        coverImageUrl: 'https://res.cloudinary.com/dqj9xgkip/image/upload/v1/library/catcher.jpg',
        branches: [{ branch: 'Main Library', copyCount: 4, availableCount: 4 }]
    },
];

const seedBooks = async () => {
    try {
        await mongoose.connect(env.MONGO_URI);
        console.log('Connected to MongoDB');

        const count = await Book.countDocuments();
        if (count > 0) {
            console.log('Books already exist. Skipping seed.');
            process.exit(0);
        }

        console.log('Seeding books...');

        for (const bookData of books) {
            const barcodeUrl = await generateBarcode(bookData.isbn, `book-${bookData.isbn}`);
            await Book.create({
                ...bookData,
                barcodeUrl,
            });
        }

        console.log('Books seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding books:', error);
        process.exit(1);
    }
};

seedBooks();
