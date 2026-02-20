import mongoose, { Document, Schema } from 'mongoose';

export interface IPredictiveOverride extends Document {
    edition: mongoose.Types.ObjectId;
    overriddenReservations: number;
    reason: string;
    overriddenBy: mongoose.Types.ObjectId;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const predictiveOverrideSchema = new Schema<IPredictiveOverride>(
    {
        edition: { type: Schema.Types.ObjectId, ref: 'Edition', required: true },
        overriddenReservations: { type: Number, required: true },
        reason: { type: String, required: true },
        overriddenBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        expiresAt: { type: Date, required: true },
    },
    { timestamps: true }
);

predictiveOverrideSchema.index({ edition: 1 }, { unique: true });
predictiveOverrideSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PredictiveOverride = mongoose.model<IPredictiveOverride>('PredictiveOverride', predictiveOverrideSchema);
