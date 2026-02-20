import mongoose, { Document, Schema } from 'mongoose';

export interface IDamageReport extends Document {
    copy: mongoose.Types.ObjectId;
    reportedBy: mongoose.Types.ObjectId;
    damageDescription: string;
    replacementCost: number;
    depreciatedValue: number;
    damageFee: number;
    flaggedBorrowers: mongoose.Types.ObjectId[];
    status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
}

const damageReportSchema = new Schema<IDamageReport>(
    {
        copy: { type: Schema.Types.ObjectId, ref: 'Copy', required: true },
        reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        damageDescription: { type: String, required: true },
        replacementCost: { type: Number, required: true },
        depreciatedValue: { type: Number, required: true },
        damageFee: { type: Number, required: true },
        flaggedBorrowers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        status: {
            type: String,
            enum: ['OPEN', 'INVESTIGATING', 'RESOLVED'],
            default: 'OPEN',
        },
    },
    { timestamps: true }
);

damageReportSchema.index({ copy: 1 });
damageReportSchema.index({ status: 1 });

export const DamageReport = mongoose.model<IDamageReport>('DamageReport', damageReportSchema);
