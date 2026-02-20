import { Copy } from '../book/copy.model';
import { Work } from '../book/work.model';
import { Edition } from '../book/edition.model';
import { User } from '../auth/auth.model';
import { Borrow } from '../borrow/borrow.model';
import { Library } from '../library/library.model';

export const getDashboardStats = async () => {
    const [totalWorks, totalEditions, totalCopies, totalBorrowed, totalUsers, totalLibraries] = await Promise.all([
        Work.countDocuments(),
        Edition.countDocuments(),
        Copy.countDocuments(),
        Borrow.countDocuments({ status: 'BORROWED' }),
        User.countDocuments({ role: 'MEMBER' }),
        Library.countDocuments({ isActive: true }),
    ]);

    const availableCopies = await Copy.countDocuments({ status: 'AVAILABLE' });

    const mostBorrowed = await Borrow.aggregate([
        { $group: { _id: '$copy', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'copies', localField: '_id', foreignField: '_id', as: 'copy' } },
        { $unwind: '$copy' },
        { $lookup: { from: 'editions', localField: 'copy.edition', foreignField: '_id', as: 'edition' } },
        { $unwind: '$edition' },
        { $lookup: { from: 'works', localField: 'edition.work', foreignField: '_id', as: 'work' } },
        { $unwind: '$work' },
        { $project: { _id: 1, title: '$work.title', isbn: '$edition.isbn', count: 1 } },
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
        totalWorks,
        totalEditions,
        totalCopies,
        availableCopies,
        totalBorrowed,
        totalUsers,
        totalLibraries,
        mostBorrowed,
        overdueCount,
        activeMembers,
        reservedCount,
        unreadNotificationsCount,
    };
};
