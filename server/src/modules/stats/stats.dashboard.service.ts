import { Book } from '../book/book.model';
import { User } from '../auth/auth.model';
import { Borrow, IBorrow } from '../borrow/borrow.model';
import mongoose from 'mongoose';

export const getLibrarianDashboard = async () => {
    const totalBooks = await Book.countDocuments();

    const copiesStats = await Book.aggregate([
        {
            $group: {
                _id: null,
                totalCopies: { $sum: '$totalCopies' },
                availableCopies: { $sum: '$availableCopies' }
            }
        }
    ]);
    const totalCopies = copiesStats[0]?.totalCopies || 0;
    const availableCopies = copiesStats[0]?.availableCopies || 0;
    const borrowedCopies = totalCopies - availableCopies;

    const totalMembers = await User.countDocuments({ role: 'MEMBER' });

    const activeBorrows = await Borrow.countDocuments({ status: 'BORROWED' });

    const overdueBorrows = await Borrow.countDocuments({
        status: 'BORROWED',
        dueDate: { $lt: new Date() }
    });

    const finesStats = await Borrow.aggregate([
        { $match: { fine: { $gt: 0 } } }, 
        { $group: { _id: null, totalFines: { $sum: '$fine' } } }
    ]);
    const totalFinesPending = finesStats[0]?.totalFines || 0;


    interface RecentBorrow extends Omit<IBorrow, 'book' | 'user'> {
        book: { title: string; isbn: string };
        user: { name: string; email: string };
    }

    const recentBorrowsRaw = await Borrow.find()
        .sort({ borrowDate: -1 })
        .limit(10)
        .populate('book', 'title isbn')
        .populate('user', 'name email')
        .lean<RecentBorrow[]>();

    const recentBorrows = recentBorrowsRaw.map((borrow) => {
        const dueDate = new Date(borrow.dueDate);
        const today = new Date();
        const timeDiff = dueDate.getTime() - today.getTime();
        const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

        return {
            borrowId: borrow._id,
            bookTitle: borrow.book?.title || 'Unknown',
            bookISBN: borrow.book?.isbn || 'N/A',
            userName: borrow.user?.name || 'Unknown',
            userEmail: borrow.user?.email || 'N/A',
            borrowDate: borrow.borrowDate,
            dueDate: borrow.dueDate,
            daysLeft,
            fineAmount: borrow.fine || 0,
            status: daysLeft < 0 && borrow.status === 'BORROWED' ? 'OVERDUE' : borrow.status
        };
    });

    interface OverdueBorrow extends Omit<IBorrow, 'book' | 'user'> {
        book: { title: string };
        user: { name: string; email: string };
    }

    const overdueRaw = await Borrow.find({
        status: 'BORROWED',
        dueDate: { $lt: new Date() }
    })
        .populate('book', 'title')
        .populate('user', 'name email')
        .sort({ dueDate: 1 }) 
        .lean<OverdueBorrow[]>();

    const { Config } = await import('../../config/config.model');
    const fineConfig = await Config.findOne({ key: 'fine_per_day' });
    const fineRate = fineConfig ? (fineConfig.value as number) : 10;

    const overdueList = overdueRaw.map((borrow) => {
        const dueDate = new Date(borrow.dueDate);
        const today = new Date();
        const timeDiff = today.getTime() - dueDate.getTime();
        const daysOverdue = Math.floor(timeDiff / (1000 * 3600 * 24));
        const fineAmount = daysOverdue * fineRate;

        return {
            borrowId: borrow._id,
            bookTitle: borrow.book?.title || 'Unknown',
            userName: borrow.user?.name || 'Unknown',
            userEmail: borrow.user?.email || 'N/A',
            daysOverdue,
            fineAmount
        };
    });

    const topBooksRaw = await Borrow.aggregate([
        { $group: { _id: '$book', borrowCount: { $sum: 1 } } },
        { $sort: { borrowCount: -1 } },
        { $limit: 10 },
        { $lookup: { from: 'books', localField: '_id', foreignField: '_id', as: 'bookInfo' } },
        { $unwind: '$bookInfo' },
        {
            $project: {
                bookId: '$_id',
                title: '$bookInfo.title',
                isbn: '$bookInfo.isbn',
                borrowCount: 1
            }
        }
    ]);

    const activeMembersRaw = await Borrow.aggregate([
        {
            $group: {
                _id: '$user',
                borrowCount: { $sum: 1 },
                totalFine: { $sum: '$fine' }
            }
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
                totalFine: 1
            }
        }
    ]);

    return {
        summary: {
            totalBooks,
            totalCopies,
            availableCopies,
            borrowedCopies,
            totalMembers,
            activeBorrows,
            overdueBorrows,
            totalFinesPending
        },
        recentBorrows,
        overdueList,
        topBooks: topBooksRaw,
        activeMembers: activeMembersRaw
    };
};
