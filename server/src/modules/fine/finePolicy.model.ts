import mongoose, { Document, Schema } from 'mongoose';

export interface IFinePolicy extends Document {
    library: mongoose.Types.ObjectId;
    ratePerDay: number;
    effectiveFrom: Date;
    effectiveTo?: Date;
    createdBy: mongoose.Types.ObjectId;
}

const finePolicySchema = new Schema<IFinePolicy>(
    {
        library: { type: Schema.Types.ObjectId, ref: 'Library', required: true },
        ratePerDay: { type: Number, required: true },
        effectiveFrom: { type: Date, required: true },
        effectiveTo: { type: Date },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);

finePolicySchema.index({ library: 1, effectiveFrom: 1 });

export const FinePolicy = mongoose.model<IFinePolicy>('FinePolicy', finePolicySchema);
