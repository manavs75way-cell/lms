import { DamageReport } from './damageReport.model';
import { Copy } from '../book/copy.model';
import { Edition } from '../book/edition.model';
import { Borrow } from '../borrow/borrow.model';
import { AppError } from '../../errors/AppError';

const calculateDepreciation = (replacementCost: number, acquiredDate: Date): number => {
    const ageInYears = (Date.now() - acquiredDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    const depreciationRate = 0.10;
    const depreciatedValue = replacementCost * Math.max(0.10, 1 - ageInYears * depreciationRate);
    return Math.round(depreciatedValue * 100) / 100;
};

export const createDamageReport = async (data: {
    copyId: string;
    reportedBy: string;
    damageDescription: string;
}) => {
    const copy = await Copy.findById(data.copyId).populate('edition');
    if (!copy) {
        throw new AppError('Copy not found', 404);
    }

    copy.status = 'DAMAGED_PULLED';
    copy.condition = 'DAMAGED';
    await copy.save();

    const edition = await Edition.findById(copy.edition);
    const replacementCost = edition?.replacementCost ?? 0;

    const depreciatedValue = calculateDepreciation(replacementCost, copy.acquiredDate);

    const lastBorrows = await Borrow.find({ copy: data.copyId })
        .sort({ borrowDate: -1 })
        .limit(3)
        .select('user');
    const flaggedBorrowers = lastBorrows.map((b) => b.user);

    const report = await DamageReport.create({
        copy: data.copyId,
        reportedBy: data.reportedBy,
        damageDescription: data.damageDescription,
        replacementCost,
        depreciatedValue,
        damageFee: depreciatedValue,
        flaggedBorrowers,
    });

    return await report.populate([
        { path: 'copy' },
        { path: 'flaggedBorrowers', select: 'name email' },
        { path: 'reportedBy', select: 'name email' },
    ]);
};

export const getDamageReports = async (status?: string) => {
    const query: Record<string, unknown> = {};
    if (status) query.status = status;

    return await DamageReport.find(query)
        .populate({
            path: 'copy',
            populate: {
                path: 'edition',
                populate: { path: 'work' }
            }
        })
        .populate('flaggedBorrowers', 'name email')
        .populate('reportedBy', 'name email')
        .sort({ createdAt: -1 });
};

export const updateDamageReportStatus = async (
    reportId: string,
    status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED'
) => {
    const report = await DamageReport.findByIdAndUpdate(
        reportId,
        { status },
        { new: true, runValidators: true }
    );
    if (!report) {
        throw new AppError('Damage report not found', 404);
    }
    return report;
};
