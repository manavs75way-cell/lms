import mongoose from 'mongoose';
import { Work } from '../modules/book/work.model';
import { Edition } from '../modules/book/edition.model';
import { Copy } from '../modules/book/copy.model';
import { Library } from '../modules/library/library.model';
import { env } from '../config/env';
import { generateBothCodes } from '../utils/barcode';

interface SeedEditionData {
    isbn: string;
    format: string;
    publisher: string;
    publicationYear: number;
    language: string;
    replacementCost: number;
    coverImageUrl: string;
    copies: number;
}

interface SeedBookData {
    title: string;
    author: string;
    genres: string[];
    description: string;
    editions: SeedEditionData[];
}

const booksData: SeedBookData[] = [
    {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        genres: ['Classic', 'Fiction'],
        description: 'A novel about the American Dream in the 1920s.',
        editions: [
            {
                isbn: '9780743273565',
                format: 'PAPERBACK',
                publisher: 'Scribner',
                publicationYear: 2004,
                language: 'English',
                replacementCost: 15.00,
                coverImageUrl: 'https://res.cloudinary.com/dqj9xgkip/image/upload/v1/library/gatsby.jpg',
                copies: 5
            }
        ]
    },
    {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        genres: ['Classic', 'Fiction', 'Historical'],
        description: 'A novel about racial injustice in the American South.',
        editions: [
            {
                isbn: '9780061120084',
                format: 'PAPERBACK',
                publisher: 'Harper Perennial',
                publicationYear: 2006,
                language: 'English',
                replacementCost: 14.00,
                coverImageUrl: 'https://res.cloudinary.com/dqj9xgkip/image/upload/v1/library/mockingbird.jpg',
                copies: 3
            }
        ]
    },
    {
        title: '1984',
        author: 'George Orwell',
        genres: ['Dystopian', 'Science Fiction'],
        description: 'A terrifying vision of a totalitarian future.',
        editions: [
            {
                isbn: '9780451524935',
                format: 'PAPERBACK',
                publisher: 'Signet Classic',
                publicationYear: 1961,
                language: 'English',
                replacementCost: 10.00,
                coverImageUrl: 'https://res.cloudinary.com/dqj9xgkip/image/upload/v1/library/1984.jpg',
                copies: 4
            }
        ]
    },
    {
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        genres: ['Romance', 'Classic'],
        description: 'A classic of English literature exploring manners and marriage.',
        editions: [
            {
                isbn: '9781503290563',
                format: 'PAPERBACK',
                publisher: 'CreateSpace',
                publicationYear: 2014,
                language: 'English',
                replacementCost: 12.00,
                coverImageUrl: 'https://res.cloudinary.com/dqj9xgkip/image/upload/v1/library/pride.jpg',
                copies: 6
            }
        ]
    },
    {
        title: 'The Catcher in the Rye',
        author: 'J.D. Salinger',
        genres: ['Fiction', 'Classic'],
        description: 'The iconic novel of teenage angst and alienation.',
        editions: [
            {
                isbn: '9780316769488',
                format: 'PAPERBACK',
                publisher: 'Little, Brown and Company',
                publicationYear: 2001,
                language: 'English',
                replacementCost: 11.00,
                coverImageUrl: 'https://res.cloudinary.com/dqj9xgkip/image/upload/v1/library/catcher.jpg',
                copies: 4
            }
        ]
    }
];

const seedCatalog = async () => {
    try {
        await mongoose.connect(env.MONGO_URI);
        console.log('Connected to MongoDB');

        const libraries = await Library.find();
        if (libraries.length === 0) {
            console.error('No libraries found! Please run the library seeder first.');
            process.exit(1);
        }

        const workCount = await Work.countDocuments();
        if (workCount > 0) {
            console.log(`Catalog already seeded (${workCount} works found). Skipping...`);
            process.exit(0);
        }

        console.log('Seeding catalog (Works, Editions, Copies)...');

        for (const data of booksData) {
            const work = await Work.create({
                title: data.title,
                originalAuthor: data.author,
                genres: data.genres,
                description: data.description,
            });

            for (const edData of data.editions) {
                const { copies: copyCount, ...editionParams } = edData;

                const edition = await Edition.create({
                    ...editionParams,
                    work: work._id,
                });

                for (let i = 0; i < copyCount; i++) {
                    const randomLibrary = libraries[Math.floor(Math.random() * libraries.length)];
                    const copyCode = `CPY-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 10000)}`;

                    const copy = await Copy.create({
                        edition: edition._id,
                        copyCode,
                        owningLibrary: randomLibrary._id,
                        currentLibrary: randomLibrary._id,
                        condition: ['NEW', 'GOOD', 'FAIR'][Math.floor(Math.random() * 3)],
                        status: 'AVAILABLE',
                    });

                    try {
                        const { barcodeUrl, qrCodeUrl } = await generateBothCodes(copy.copyCode, copy._id.toString());
                        copy.barcodeUrl = barcodeUrl;
                        copy.qrCodeUrl = qrCodeUrl;
                        await copy.save();
                    } catch (e) {
                        console.error(`Failed to generate barcode for ${copyCode}`);
                    }
                }
            }
        }

        console.log('Catalog seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding catalog:', error);
        process.exit(1);
    }
};

seedCatalog();
