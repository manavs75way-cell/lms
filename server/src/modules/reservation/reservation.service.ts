import { Reservation } from './reservation.model';
import { Book } from '../book/book.model';
import { AppError } from '../../errors/AppError';
import mongoose from 'mongoose';

export const createReservation = async (userId: string, bookId: string) => {
    const book = await Book.findById(bookId);
    if (!book) {
        throw new AppError('Book not found', 404);
    }

    if (book.availableCopies > 0) {
        throw new AppError('Book is currently available. You can borrow it directly.', 400);
    }

    const existingReservation = await Reservation.findOne({
        user: userId,
        book: bookId,
        status: 'PENDING',
    });

    if (existingReservation) {
        throw new AppError('You already have a pending reservation for this book', 400);
    }

    const lastReservation = await Reservation.findOne({
        book: bookId,
        status: 'PENDING',
    }).sort({ position: -1 });

    const position = lastReservation ? lastReservation.position + 1 : 1;

    const reservation = await Reservation.create({
        user: userId,
        book: bookId,
        position,
    });

    return reservation.populate('book');
};

export const getMyReservations = async (userId: string) => {
    return Reservation.find({ user: userId }).populate('book').sort({ createdAt: -1 });
};

export const cancelReservation = async (reservationId: string, userId: string) => {
    const reservation = await Reservation.findOne({ _id: reservationId, user: userId });

    if (!reservation) {
        throw new AppError('Reservation not found', 404);
    }

    if (reservation.status !== 'PENDING') {
        throw new AppError('Cannot cancel a non-pending reservation', 400);
    }

    reservation.status = 'CANCELLED';
    await reservation.save();

};

export const checkAndNotifyNextUser = async (bookId: string) => {
    const nextReservation = await Reservation.findOne({
        book: bookId,
        status: 'PENDING',
    }).sort({ position: 1 }).populate('user');

    if (nextReservation) {
        const { createNotification } = await import('../notification/notification.service');
        const book = await Book.findById(bookId);
        const bookTitle = book ? book.title : 'requested book';

        await createNotification(
            nextReservation.user._id.toString(),
            'Book Available',
            `The book "${bookTitle}" you reserved is now available.`,
            'RESERVATION_AVAILABLE'
        );

        console.log(`Notification: User ${nextReservation.user._id} notified for book ${bookId}`);
    }
};
