import mongoose from 'mongoose';
import { Borrow, IBorrow } from './borrow.model';
import { Book, IBook } from '../book/book.model';
import { AppError } from '../../errors/AppError';

export const borrowBook = async (userId: string, bookId: string) => {
    // const session = await mongoose.startSession();
    // session.startTransaction();

    try {
        const book = await Book.findById(bookId); // .session(session);
        if (!book) {
            throw new AppError('Book not found', 404);
        }

        if (book.availableCopies <= 0) {
            throw new AppError('Book is not available', 400);
        }

        // Check verification queue
        const { Reservation } = await import('../reservation/reservation.model');
        const pendingReservations = await Reservation.find({
            book: bookId,
            status: 'PENDING'
        }).sort({ position: 1 }).limit(1);

        if (pendingReservations.length > 0) {
            const firstReserver = pendingReservations[0];
            if (firstReserver.user.toString() !== userId) {
                throw new AppError('This book is currently reserved for another user.', 400);
            }

            // Fulfill reservation
            firstReserver.status = 'FULFILLED';
            await firstReserver.save();
        }

        // Check if user already has an active borrow for this book
        const existingBorrow = await Borrow.findOne({
            user: userId,
            book: bookId,
            status: 'BORROWED',
        }); // .session(session);

        if (existingBorrow) {
            throw new AppError('You have already borrowed this book', 400);
        }

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14); // 2 weeks loan period

        const borrow = await Borrow.create(
            [
                {
                    user: userId,
                    book: bookId,
                    dueDate,
                    conditionAtBorrow: book.condition, // Capture condition at borrow
                },
            ]
            // { session }
        );

        book.availableCopies -= 1;
        await book.save(); // { session });

        // await session.commitTransaction();
        return borrow[0];
    } catch (error) {
        // await session.abortTransaction();
        throw error;
    } finally {
        // session.endSession();
    }
};

export const returnBook = async (
    userId: string,
    borrowId: string,
    data?: { condition?: string; damageNotes?: string }
) => {
    // const session = await mongoose.startSession();
    // session.startTransaction();

    try {
        const borrow = await Borrow.findOne({
            _id: borrowId,
            user: userId,
            status: 'BORROWED',
        }); // .session(session);

        if (!borrow) {
            throw new AppError('Active borrow record not found', 404);
        }

        const returnDate = new Date();

        // Calculate Fine
        let fine = 0;
        const dueDate = new Date(borrow.dueDate);
        if (returnDate > dueDate) {
            const daysOverdue = Math.ceil((returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
            const { Config } = await import('../../config/config.model');
            const fineConfig = await Config.findOne({ key: 'fine_per_day' });
            const fineRate = fineConfig ? (fineConfig.value as number) : 1; // Default $1 per day
            fine = daysOverdue * fineRate;
        }

        borrow.returnDate = returnDate;
        borrow.status = 'RETURNED';
        borrow.fine = fine;

        if (data?.condition) {
            borrow.conditionAtReturn = data.condition as IBorrow['conditionAtReturn'];
        }
        if (data?.damageNotes) {
            borrow.damageNotes = data.damageNotes;
        }

        await borrow.save(); // { session });

        const book = await Book.findById(borrow.book); // .session(session);
        if (book) {
            book.availableCopies += 1;
            // Update book condition if changed/damaged?
            if (data?.condition) {
                book.condition = data.condition as IBook['condition'];
            }
            await book.save(); // { session });
        }

        // await session.commitTransaction();

        // Notify next user in reservation queue
        const { checkAndNotifyNextUser } = await import('../reservation/reservation.service');
        await checkAndNotifyNextUser(borrow.book.toString());

        return borrow;
    } catch (error) {
        // await session.abortTransaction();
        throw error;
    } finally {
        // session.endSession();
    }
};

export const getReadingHistory = async (userId: string) => {
    return await Borrow.find({ user: userId, status: 'RETURNED' })
        .populate('book')
        .sort({ returnDate: -1 });
};

export const getRecommendations = async (userId: string) => {
    // 1. Get user's reading history to find genres
    const history = await Borrow.find({ user: userId }).populate('book');
    const genres = new Set<string>();
    history.forEach((record) => {
        const book = record.book as unknown as IBook;
        if (book && book.genre) {
            genres.add(book.genre);
        }
    });

    if (genres.size === 0) {
        // If no history, return some popular or random books
        return await Book.find().limit(5);
    }

    // 2. Find books in those genres that the user hasn't borrowed
    const borrowedBookIds = history.map((record) => record.book._id);
    const recommendations = await Book.find({
        genre: { $in: Array.from(genres) },
        _id: { $nin: borrowedBookIds },
    }).limit(10);

    return recommendations;
};

export const getMyBorrows = async (userId: string) => {
    return await Borrow.find({ user: userId })
        .populate('book', 'title author isbn')
        .sort({ createdAt: -1 });
};
