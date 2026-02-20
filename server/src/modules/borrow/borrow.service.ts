import { Borrow, IBorrow } from './borrow.model';
import { Copy, ICopy } from '../book/copy.model';
import { Edition } from '../book/edition.model';
import { Work, IWork } from '../book/work.model';
import { User } from '../auth/auth.model';
import { Library } from '../library/library.model';
import { AppError } from '../../errors/AppError';
import { calculateFineRetroactive } from '../fine/fine.service';
import { createDamageReport } from '../damage/damage.service';
import { Shipment } from '../shipment/shipment.model';
import { Reservation } from '../reservation/reservation.model';
import { getRecommendations as engineGetRecommendations } from './recommendation.service';


export const borrowBook = async (data: {
    userId: string;
    copyId: string;
    libraryId: string;
    onBehalfOfUserId?: string;
}) => {
    const { userId, copyId, libraryId, onBehalfOfUserId } = data;

    const currentUser = await User.findById(userId);
    if (!currentUser) throw new AppError('User not found', 404);

    let effectiveUserId = userId;
    let actualOnBehalfOfId = onBehalfOfUserId;

    if (onBehalfOfUserId) {
        const childUser = await User.findById(onBehalfOfUserId);
        if (!childUser || childUser.parentAccount?.toString() !== userId) {
            throw new AppError('Invalid delegated borrowing: user is not your child account', 403);
        }
        effectiveUserId = userId;
    } else if (currentUser.parentAccount) {
        effectiveUserId = currentUser.parentAccount.toString();
        actualOnBehalfOfId = userId;
    }

    const effectiveUser = await User.findById(effectiveUserId);
    if (!effectiveUser) {
        throw new AppError('User not found', 404);
    }

    const totalActiveBorrows = await Borrow.countDocuments({
        user: effectiveUserId,
        status: 'BORROWED',
    });

    if (totalActiveBorrows >= effectiveUser.globalBorrowLimit) {
        throw new AppError(
            `Global borrowing limit reached (${effectiveUser.globalBorrowLimit}). ` +
            `You currently have ${totalActiveBorrows} active borrows across all libraries.`,
            400
        );
    }

    const copy = await Copy.findById(copyId).populate('edition');
    if (!copy) {
        throw new AppError('Copy not found', 404);
    }
    if (copy.status !== 'AVAILABLE') {
        throw new AppError('This copy is not available for borrowing', 400);
    }

    const library = await Library.findById(libraryId);
    if (!library || !library.isActive) {
        throw new AppError('Library not found or inactive', 404);
    }

    if (copy.currentLibrary.toString() !== libraryId) {
        throw new AppError('This copy is not at the selected library', 400);
    }

    const { Reservation } = await import('../reservation/reservation.model');

    const edition = await Edition.findById(copy.edition);
    if (edition) {
        const pendingReservations = await Reservation.find({
            edition: edition._id,
            status: 'PENDING',
        }).sort({ effectivePriority: -1, createdAt: 1 }).limit(1);

        if (pendingReservations.length > 0) {
            const borrower = onBehalfOfUserId || userId;
            if (pendingReservations[0].user.toString() !== borrower) {
                throw new AppError('This edition is reserved for another user.', 400);
            }
            pendingReservations[0].status = 'FULFILLED';
            await pendingReservations[0].save();
        }
    }

    const existingBorrow = await Borrow.findOne({
        user: effectiveUserId,
        copy: copyId,
        borrowedOnBehalfOf: actualOnBehalfOfId || undefined,
        status: 'BORROWED',
    });
    if (existingBorrow) {
        throw new AppError('You have already borrowed this copy', 400);
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + library.loanPeriodDays);

    const borrow = await Borrow.create({
        user: effectiveUserId,
        copy: copyId,
        borrowedFromLibrary: libraryId,
        borrowedOnBehalfOf: actualOnBehalfOfId || undefined,
        dueDate,
        conditionAtBorrow: copy.condition,
    });

    copy.status = 'BORROWED';
    await copy.save();

    return await borrow.populate([
        { path: 'copy', populate: { path: 'edition', populate: { path: 'work' } } },
        { path: 'borrowedFromLibrary', select: 'name code' },
        { path: 'user', select: 'name email' },
    ]);
};


export const returnBook = async (data: {
    userId: string;
    borrowId: string;
    returnToLibraryId?: string;
    condition?: string;
    damageNotes?: string;
}) => {
    const { userId, borrowId, condition, damageNotes } = data;

    const borrow = await Borrow.findOne({
        _id: borrowId,
        user: userId,
        status: 'BORROWED',
    });
    if (!borrow) {
        throw new AppError('Active borrow record not found', 404);
    }

    const returnToLibraryId = (data.returnToLibraryId && data.returnToLibraryId.trim() !== '')
        ? data.returnToLibraryId
        : borrow.borrowedFromLibrary.toString();

    const returnDate = new Date();

    const { totalFine, breakdown } = await calculateFineRetroactive(
        borrow.borrowedFromLibrary.toString(),
        borrow.dueDate,
        returnDate
    );

    borrow.returnDate = returnDate;
    borrow.status = 'RETURNED';
    borrow.fine = totalFine;
    borrow.fineBreakdown = breakdown;
    borrow.returnedToLibrary = returnToLibraryId as unknown as IBorrow['returnedToLibrary'];

    if (condition) {
        borrow.conditionAtReturn = condition as IBorrow['conditionAtReturn'];
    }
    if (damageNotes) {
        borrow.damageNotes = damageNotes;
    }

    await borrow.save();

    const copy = await Copy.findById(borrow.copy);
    if (copy) {
        copy.currentLibrary = returnToLibraryId as unknown as typeof copy.currentLibrary;

        if (condition === 'DAMAGED') {
            copy.status = 'DAMAGED_PULLED';
            copy.condition = 'DAMAGED';
            await copy.save();

            await createDamageReport({
                copyId: copy._id.toString(),
                reportedBy: userId,
                damageDescription: damageNotes || 'Returned in damaged condition',
            });
        } else {
            copy.status = 'AVAILABLE';
            if (condition) {
                copy.condition = condition as typeof copy.condition;
            }
            await copy.save();

            if (borrow.borrowedFromLibrary.toString() !== returnToLibraryId) {
                copy.status = 'IN_TRANSIT';
                await copy.save();

                await Shipment.create({
                    copy: copy._id,
                    fromLibrary: returnToLibraryId,
                    toLibrary: borrow.borrowedFromLibrary,
                    reason: 'INTER_LIBRARY_RETURN',
                    status: 'PENDING',
                    triggeredBy: userId,
                });
            }
        }

        const { checkAndNotifyNextUser } = await import('../reservation/reservation.service');
        const edition = await Edition.findById(copy.edition);
        if (edition) {
            await checkAndNotifyNextUser(edition._id.toString());
        }

        if (condition !== 'DAMAGED') {
            import('../shipment/rebalancing.service').then(({ runRebalancing }) => {
                runRebalancing(userId).catch((err) =>
                    console.error('[Rebalancing] Auto-trigger failed:', err)
                );
            });
        }
    }

    return borrow;
};


export const getReadingHistory = async (userId: string) => {
    return await Borrow.find({
        $or: [{ user: userId }, { borrowedOnBehalfOf: userId }],
        status: 'RETURNED'
    })
        .populate({
            path: 'copy',
            populate: { path: 'edition', populate: { path: 'work' } },
        })
        .populate('borrowedFromLibrary', 'name code')
        .populate('returnedToLibrary', 'name code')
        .sort({ returnDate: -1 });
};

export const getRecommendations = async (userId: string) => {
    return await engineGetRecommendations(userId, 10);
};

export const getMyBorrows = async (userId: string) => {
    return await Borrow.find({
        $or: [{ user: userId }, { borrowedOnBehalfOf: userId }]
    })
        .populate({
            path: 'copy',
            populate: { path: 'edition', populate: { path: 'work' } },
        })
        .populate('borrowedFromLibrary', 'name code')
        .populate('returnedToLibrary', 'name code')
        .sort({ createdAt: -1 });
}
