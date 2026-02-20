import { FinePolicy, IFinePolicy } from './finePolicy.model';
import { IFineBreakdownEntry } from '../borrow/borrow.model';
import { AppError } from '../../errors/AppError';

export const createFinePolicy = async (data: {
    library: string;
    ratePerDay: number;
    effectiveFrom: Date;
    createdBy: string;
}) => {
    const previousPolicy = await FinePolicy.findOne({
        library: data.library,
        effectiveTo: null,
    }).sort({ effectiveFrom: -1 });

    if (previousPolicy) {
        const newEffective = new Date(data.effectiveFrom);
        previousPolicy.effectiveTo = new Date(newEffective.getTime() - 1);
        await previousPolicy.save();
    }

    return await FinePolicy.create(data);
};

export const getFinePolicies = async (libraryId: string) => {
    return await FinePolicy.find({ library: libraryId })
        .sort({ effectiveFrom: -1 })
        .populate('createdBy', 'name email');
};

export const calculateFineRetroactive = async (
    libraryId: string,
    dueDate: Date,
    returnOrCurrentDate: Date
): Promise<{ totalFine: number; breakdown: IFineBreakdownEntry[] }> => {
    const due = new Date(dueDate);
    const endDate = new Date(returnOrCurrentDate);

    if (endDate <= due) {
        return { totalFine: 0, breakdown: [] };
    }

    const policies = await FinePolicy.find({
        library: libraryId,
        effectiveFrom: { $lte: endDate },
        $or: [
            { effectiveTo: null },
            { effectiveTo: { $gte: due } },
        ],
    }).sort({ effectiveFrom: 1 });

    if (policies.length === 0) {
        const { Library } = await import('../library/library.model');
        const library = await Library.findById(libraryId);
        const defaultRate = library?.fineRatePerDay ?? 0.25;
        const daysOverdue = Math.ceil(
            (endDate.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)
        );
        const amount = daysOverdue * defaultRate;
        return {
            totalFine: amount,
            breakdown: [{
                startDate: due,
                endDate: endDate,
                rate: defaultRate,
                amount,
            }],
        };
    }

    const breakdown: IFineBreakdownEntry[] = [];
    let totalFine = 0;
    let cursor = new Date(due);

    for (const policy of policies) {
        if (cursor >= endDate) break;

        const policyStart = new Date(Math.max(policy.effectiveFrom.getTime(), cursor.getTime()));
        const policyEnd = policy.effectiveTo
            ? new Date(Math.min(policy.effectiveTo.getTime(), endDate.getTime()))
            : new Date(endDate);

        const segmentStart = new Date(Math.max(cursor.getTime(), due.getTime()));
        const segmentEnd = new Date(Math.min(policyEnd.getTime(), endDate.getTime()));

        if (segmentEnd > segmentStart) {
            const days = Math.ceil(
                (segmentEnd.getTime() - segmentStart.getTime()) / (1000 * 60 * 60 * 24)
            );
            const amount = days * policy.ratePerDay;
            breakdown.push({
                startDate: segmentStart,
                endDate: segmentEnd,
                rate: policy.ratePerDay,
                amount,
            });
            totalFine += amount;
            cursor = new Date(segmentEnd);
        }
    }

    return { totalFine, breakdown };
};
