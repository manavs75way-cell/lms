import { Borrow } from '../borrow/borrow.model';
import { Edition } from '../book/edition.model';
import { Reservation } from '../reservation/reservation.model';
import { PredictiveOverride } from './predictiveOverride.model';

interface PredictedHold {
    editionId: string;
    title: string;
    isbn: string;
    currentReservations: number;
    predictedReservations: number;
    confidence: number;
    trend: 'RISING' | 'STABLE' | 'DECLINING';
    isOverridden?: boolean;
    overrideReason?: string;
}

export const getPredictiveHolds = async (): Promise<PredictedHold[]> => {
    const now = new Date();
    const predictions: PredictedHold[] = [];

    const editions = await Edition.find().populate('work');
    const overrides = await PredictiveOverride.find();
    const overrideMap = new Map(overrides.map(o => [o.edition.toString(), o]));

    for (const edition of editions) {
        const weeklyCounts: number[] = [];

        for (let i = 8; i > 0; i--) {
            const weekStart = new Date(now);
            weekStart.setDate(weekStart.getDate() - i * 7);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 7);

            const count = await Borrow.countDocuments({
                copy: {
                    $in: await import('../book/copy.model').then(({ Copy }) =>
                        Copy.find({ edition: edition._id }).distinct('_id')
                    ),
                },
                borrowDate: { $gte: weekStart, $lt: weekEnd },
            });
            weeklyCounts.push(count);
        }

        const totalActivity = weeklyCounts.reduce((a, b) => a + b, 0);
        if (totalActivity === 0) continue;

        const weights = [1, 1, 1.5, 1.5, 2, 2, 3, 4];
        let weightedSum = 0;
        let weightTotal = 0;
        for (let i = 0; i < weeklyCounts.length; i++) {
            weightedSum += weeklyCounts[i] * weights[i];
            weightTotal += weights[i];
        }
        const predictedBorrows = weightedSum / weightTotal;

        const recentAvg =
            (weeklyCounts[6] + weeklyCounts[7]) / 2;
        const olderAvg =
            (weeklyCounts[0] + weeklyCounts[1] + weeklyCounts[2] + weeklyCounts[3]) / 4;

        let trend: PredictedHold['trend'] = 'STABLE';
        if (recentAvg > olderAvg * 1.3) trend = 'RISING';
        else if (recentAvg < olderAvg * 0.7) trend = 'DECLINING';

        const confidence = Math.min(
            0.95,
            Math.max(0.3, totalActivity / 20)
        );

        const currentReservations = await Reservation.countDocuments({
            edition: edition._id,
            status: 'PENDING',
        });

        const override = overrideMap.get(edition._id.toString());
        const finalPrediction = override ? override.overriddenReservations : Math.round(predictedBorrows * 10) / 10;
        const isOverridden = !!override;

        if (finalPrediction > 0.5 || currentReservations > 0) {
            const work = edition.work as unknown as { title: string };
            predictions.push({
                editionId: edition._id.toString(),
                title: work?.title || 'Unknown',
                isbn: edition.isbn,
                currentReservations,
                predictedReservations: finalPrediction,
                confidence: isOverridden ? 1 : Math.round(confidence * 100) / 100,
                trend,
                isOverridden,
                overrideReason: override?.reason
            });
        }
    }

    predictions.sort((a, b) => b.predictedReservations - a.predictedReservations);

    return predictions.slice(0, 20);
};


export const setPredictiveOverride = async (data: {
    editionId: string;
    reservations: number;
    reason: string;
    userId: string;
}) => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); 

    return await PredictiveOverride.findOneAndUpdate(
        { edition: data.editionId },
        {
            edition: data.editionId,
            overriddenReservations: data.reservations,
            reason: data.reason,
            overriddenBy: data.userId,
            expiresAt,
        },
        { upsert: true, new: true }
    );
};
