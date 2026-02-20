import mongoose from 'mongoose';
import { Borrow } from './modules/borrow/borrow.model';
import { Copy } from './modules/book/copy.model';
import { Edition } from './modules/book/edition.model';
import { Work, IWork } from './modules/book/work.model';
import { createNotification } from './modules/notification/notification.service';
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
                $lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000),
            },
        }).populate({
            path: 'copy',
            populate: { path: 'edition', populate: { path: 'work' } },
        });

        for (const borrow of dueSoonBorrows) {
            const copy = borrow.copy as unknown as { edition: { work: IWork } };
            const bookTitle = copy?.edition?.work?.title || 'Unknown Book';
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
            dueDate: { $lt: now },
        }).populate({
            path: 'copy',
            populate: { path: 'edition', populate: { path: 'work' } },
        });

        for (const borrow of overdueBorrows) {
            const copy = borrow.copy as unknown as { edition: { work: IWork } };
            const bookTitle = copy?.edition?.work?.title || 'Unknown Book';
            await createNotification(
                borrow.user.toString(),
                'Book Overdue',
                `The book "${bookTitle}" is overdue. Please return it as soon as possible.`,
                'OVERDUE'
            );
        }
        console.log(`Sent ${overdueBorrows.length} overdue notifications.`);

        const { recalculatePriorities } = await import('./modules/reservation/reservation.service');
        const priorityResult = await recalculatePriorities();
        console.log(`Priorities recalculated: ${priorityResult.updated} updated, ${priorityResult.promoted} promoted.`);

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error checking notifications:', error);
        process.exit(1);
    }
};

checkDueNotifications();
