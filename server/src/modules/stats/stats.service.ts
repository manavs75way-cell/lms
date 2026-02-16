import { Book } from '../book/book.model';
import { User } from '../auth/auth.model';
import { Borrow } from '../borrow/borrow.model';

export const getDashboardStats = async () => {
    const [totalBooks, totalBorrowed, totalUsers] = await Promise.all([
        Book.countDocuments(),
        Borrow.countDocuments({ status: 'BORROWED' }),
        User.countDocuments({ role: 'MEMBER' }),
    ]);

    const mostBorrowed = await Borrow.aggregate([
        { $group: { _id: '$book', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'books', localField: '_id', foreignField: '_id', as: 'book' } },
        { $unwind: '$book' },
        { $project: { _id: 1, title: '$book.title', count: 1 } },
    ]);

    const overdueCount = await Borrow.countDocuments({
        status: 'BORROWED',
        dueDate: { $lt: new Date() },
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeMembers = await Borrow.distinct('user', {
        createdAt: { $gte: thirtyDaysAgo },
    }).then((users) => users.length);

    const reservedCount = await import('../reservation/reservation.model').then(({ Reservation }) =>
        Reservation.countDocuments({ status: 'PENDING' })
    );

    const unreadNotificationsCount = await import('../notification/notification.model').then(({ Notification }) =>
        Notification.countDocuments({ isRead: false })
    );

    return {
        totalBooks,
        totalBorrowed,
        totalUsers,
        mostBorrowed,
        overdueCount,
        activeMembers,
        reservedCount,
        unreadNotificationsCount
    };
};
