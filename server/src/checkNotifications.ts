import mongoose from 'mongoose';
import { Borrow } from './modules/borrow/borrow.model';
import { createNotification } from './modules/notification/notification.service';
import { Book, IBook } from './modules/book/book.model';
import { env } from './config/env';

const checkDueNotifications = async () => {
    try {
        await mongoose.connect(env.MONGO_URI);
        console.log('Connected to MongoDB');

        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);

        
        const dueSoonBorrows = await Borrow.find({
            status: 'BORROWED',
            dueDate: {
                $gte: now,
                $lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
            }
        }).populate('book');

        for (const borrow of dueSoonBorrows) {

            const bookTitle = (borrow.book as unknown as IBook).title;
            await createNotification(
                borrow.user.toString(),
                'Book Due Soon',
                `The book "${bookTitle}" is due tomorrow.`,
                'DUE_SOON'
            );
        }
        console.log(`Sent ${dueSoonBorrows.length} due soon notifications.`);

        const overdueBorrows = await Borrow.find({
            status: 'BORROWED',
            dueDate: { $lt: now }
        }).populate('book');

        for (const borrow of overdueBorrows) {
            const bookTitle = (borrow.book as unknown as IBook).title;
            
            await createNotification(
                borrow.user.toString(),
                'Book Overdue',
                `The book "${bookTitle}" is overdue. Please return it as soon as possible.`,
                'OVERDUE'
            );
        }
        console.log(`Sent ${overdueBorrows.length} overdue notifications.`);

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error checking notifications:', error);
        process.exit(1);
    }
};

checkDueNotifications();
