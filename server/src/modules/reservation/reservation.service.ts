import { Reservation } from './reservation.model';
import { Edition } from '../book/edition.model';
import { Copy } from '../book/copy.model';
import { User } from '../auth/auth.model';
import { AppError } from '../../errors/AppError';


const calculatePriorityScore = (
    membershipType: string,
    createdAt: Date,
    existingBoost?: Date | null
): { priority: number; boosted: boolean } => {
    const basePriority =
        membershipType === 'PREMIUM' || membershipType === 'FACULTY' ? 100 : 50;

    const daysWaiting = Math.floor(
        (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    let priority = basePriority + daysWaiting;
    let boosted = !!existingBoost;

    if (
        (membershipType === 'STANDARD' || membershipType === 'STUDENT') &&
        daysWaiting >= 14 &&
        !existingBoost
    ) {
        priority = 100 + daysWaiting;
        boosted = true;
    }

    return { priority, boosted };
};


export const createReservation = async (
    userId: string,
    editionId: string,
    preferredLibraryId?: string
) => {
    const edition = await Edition.findById(editionId);
    if (!edition) {
        throw new AppError('Edition not found', 404);
    }

    const availableCopies = await Copy.countDocuments({
        edition: editionId,
        status: 'AVAILABLE',
    });
    if (availableCopies > 0) {
        throw new AppError(
            'Copies of this edition are available. You can borrow one directly.',
            400
        );
    }

    const existingReservation = await Reservation.findOne({
        user: userId,
        edition: editionId,
        status: 'PENDING',
    });
    if (existingReservation) {
        throw new AppError('You already have a pending reservation for this edition', 400);
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    const lastReservation = await Reservation.findOne({
        edition: editionId,
        status: 'PENDING',
    }).sort({ position: -1 });
    const position = lastReservation ? lastReservation.position + 1 : 1;

    const { priority } = calculatePriorityScore(user.membershipType, new Date());

    const reservation = await Reservation.create({
        user: userId,
        edition: editionId,
        preferredLibrary: preferredLibraryId || undefined,
        position,
        membershipTypeAtReservation: user.membershipType,
        effectivePriority: priority,
    });

    return await reservation.populate([
        { path: 'edition', populate: { path: 'work' } },
        { path: 'user', select: 'name email' },
    ]);
};


export const getMyReservations = async (userId: string) => {
    return Reservation.find({ user: userId })
        .populate({ path: 'edition', populate: { path: 'work' } })
        .sort({ createdAt: -1 });
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


export const recalculatePriorities = async () => {
    const pendingReservations = await Reservation.find({ status: 'PENDING' });
    let promotedCount = 0;

    for (const reservation of pendingReservations) {
        const { priority, boosted } = calculatePriorityScore(
            reservation.membershipTypeAtReservation,
            reservation.createdAt,
            reservation.priorityBoostedAt
        );

        reservation.effectivePriority = priority;
        if (boosted && !reservation.priorityBoostedAt) {
            reservation.priorityBoostedAt = new Date();
            promotedCount++;
        }
        await reservation.save();
    }

    return { updated: pendingReservations.length, promoted: promotedCount };
};

export const checkAndNotifyNextUser = async (editionId: string) => {
    const nextReservation = await Reservation.findOne({
        edition: editionId,
        status: 'PENDING',
    })
        .sort({ effectivePriority: -1, createdAt: 1 })
        .populate('user');

    if (nextReservation) {
        const { createNotification } = await import('../notification/notification.service');
        const edition = await Edition.findById(editionId).populate('work');
        const workTitle = (edition?.work as unknown as { title: string })?.title || 'requested book';

        await createNotification(
            nextReservation.user._id.toString(),
            'Book Available',
            `The book "${workTitle}" you reserved is now available.`,
            'RESERVATION_AVAILABLE'
        );

        console.log(
            `Notification: User ${nextReservation.user._id} notified for edition ${editionId}`
        );
    }
};
