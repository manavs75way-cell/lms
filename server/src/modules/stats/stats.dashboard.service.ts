import { Copy } from '../book/copy.model';
import { Edition } from '../book/edition.model';
import { Work } from '../book/work.model';
import { User } from '../auth/auth.model';
import { Borrow, IBorrow } from '../borrow/borrow.model';
import { Library } from '../library/library.model';
import { Shipment } from '../shipment/shipment.model';
import { DamageReport } from '../damage/damageReport.model';

export const getLibrarianDashboard = async () => {
    const totalWorks = await Work.countDocuments();
    const totalEditions = await Edition.countDocuments();
    const totalCopies = await Copy.countDocuments();
    const availableCopies = await Copy.countDocuments({ status: 'AVAILABLE' });
    const borrowedCopies = await Copy.countDocuments({ status: 'BORROWED' });
    const damagedCopies = await Copy.countDocuments({ status: 'DAMAGED_PULLED' });
    const inTransitCopies = await Copy.countDocuments({ status: 'IN_TRANSIT' });

    const totalMembers = await User.countDocuments({ role: 'MEMBER' });
    const totalLibraries = await Library.countDocuments({ isActive: true });

    const activeBorrows = await Borrow.countDocuments({ status: 'BORROWED' });

    const overdueBorrows = await Borrow.countDocuments({
        status: 'BORROWED',
        dueDate: { $lt: new Date() },
    });

    const finesStats = await Borrow.aggregate([
        { $match: { fine: { $gt: 0 } } },
        { $group: { _id: null, totalFines: { $sum: '$fine' } } },
    ]);
    const totalFinesPending = finesStats[0]?.totalFines || 0;

    const pendingShipments = await Shipment.countDocuments({ status: { $in: ['PENDING', 'IN_TRANSIT'] } });
    const openDamageReports = await DamageReport.countDocuments({ status: { $in: ['OPEN', 'INVESTIGATING'] } });

    interface RecentBorrow extends Omit<IBorrow, 'copy' | 'user' | 'borrowedFromLibrary'> {
        copy: { edition: { work: { title: string }; isbn: string } };
        user: { name: string; email: string };
        borrowedFromLibrary: { name: string; code: string };
    }

    const recentBorrowsRaw = await Borrow.find()
        .sort({ borrowDate: -1 })
        .limit(10)
        .populate({
            path: 'copy',
            populate: { path: 'edition', populate: { path: 'work', select: 'title' } },
        })
        .populate('user', 'name email')
        .populate('borrowedFromLibrary', 'name code')
        .lean<RecentBorrow[]>();

    const recentBorrows = recentBorrowsRaw.map((borrow) => {
        const dueDate = new Date(borrow.dueDate);
        const today = new Date();
        const timeDiff = dueDate.getTime() - today.getTime();
        const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

        return {
            borrowId: borrow._id,
            bookTitle: borrow.copy?.edition?.work?.title || 'Unknown',
            bookISBN: borrow.copy?.edition?.isbn || 'N/A',
            userName: borrow.user?.name || 'Unknown',
            userEmail: borrow.user?.email || 'N/A',
            libraryName: borrow.borrowedFromLibrary?.name || 'Unknown',
            borrowDate: borrow.borrowDate,
            dueDate: borrow.dueDate,
            daysLeft,
            fineAmount: borrow.fine || 0,
            status: daysLeft < 0 && borrow.status === 'BORROWED' ? 'OVERDUE' : borrow.status,
        };
    });

    const topBooksRaw = await Borrow.aggregate([
        { $group: { _id: '$copy', borrowCount: { $sum: 1 } } },
        { $sort: { borrowCount: -1 } },
        { $limit: 10 },
        { $lookup: { from: 'copies', localField: '_id', foreignField: '_id', as: 'copyInfo' } },
        { $unwind: '$copyInfo' },
        { $lookup: { from: 'editions', localField: 'copyInfo.edition', foreignField: '_id', as: 'editionInfo' } },
        { $unwind: '$editionInfo' },
        { $lookup: { from: 'works', localField: 'editionInfo.work', foreignField: '_id', as: 'workInfo' } },
        { $unwind: '$workInfo' },
        {
            $project: {
                title: '$workInfo.title',
                isbn: '$editionInfo.isbn',
                borrowCount: 1,
            },
        },
    ]);

    const activeMembersRaw = await Borrow.aggregate([
        {
            $group: {
                _id: '$user',
                borrowCount: { $sum: 1 },
                totalFine: { $sum: '$fine' },
            },
        },
        { $sort: { borrowCount: -1 } },
        { $limit: 10 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'userInfo' } },
        { $unwind: '$userInfo' },
        {
            $project: {
                userId: '$_id',
                name: '$userInfo.name',
                email: '$userInfo.email',
                borrowCount: 1,
                totalFine: 1,
            },
        },
    ]);

    interface OverdueBorrowRaw extends Omit<IBorrow, 'copy' | 'user'> {
        copy: { edition: { work: { title: string }; isbn: string } };
        user: { name: string; email: string };
    }
    const overdueBorrowsRaw = await Borrow.find({
        status: 'BORROWED',
        dueDate: { $lt: new Date() },
    })
        .sort({ dueDate: 1 })
        .limit(20)
        .populate({
            path: 'copy',
            populate: { path: 'edition', populate: { path: 'work', select: 'title' } },
        })
        .populate('user', 'name email')
        .lean<OverdueBorrowRaw[]>();

    const overdueList = overdueBorrowsRaw.map((borrow) => {
        const daysOverdue = Math.floor(
            (Date.now() - new Date(borrow.dueDate).getTime()) / (1000 * 3600 * 24)
        );
        return {
            borrowId: borrow._id,
            bookTitle: borrow.copy?.edition?.work?.title || 'Unknown',
            bookISBN: borrow.copy?.edition?.isbn || 'N/A',
            userName: borrow.user?.name || 'Unknown',
            userEmail: borrow.user?.email || 'N/A',
            daysOverdue,
            fineAmount: borrow.fine || 0,
        };
    });

    const { getPredictiveHolds } = await import('./predictiveHolds.service');
    let predictiveHolds: Awaited<ReturnType<typeof getPredictiveHolds>> = [];
    try {
        predictiveHolds = await getPredictiveHolds();
    } catch (err) {
        console.error('Failed to get predictive holds:', err);
    }

    return {
        summary: {
            totalWorks,
            totalEditions,
            totalCopies,
            availableCopies,
            borrowedCopies,
            damagedCopies,
            inTransitCopies,
            totalMembers,
            totalLibraries,
            activeBorrows,
            overdueBorrows,
            totalFinesPending,
            pendingShipments,
            openDamageReports,
        },
        recentBorrows,
        overdueList,
        topBooks: topBooksRaw,
        activeMembers: activeMembersRaw,
        predictiveHolds,
    };
};
