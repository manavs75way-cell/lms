import mongoose, { Document, Schema } from 'mongoose';

export interface ILibrary extends Document {
    name: string;
    code: string;
    address: string;
    borrowingLimit: number;
    loanPeriodDays: number;
    fineRatePerDay: number;
    isActive: boolean;
}

const librarySchema = new Schema<ILibrary>(
    {
        name: { type: String, required: true },
        code: { type: String, required: true, unique: true },
        address: { type: String, required: true },
        borrowingLimit: { type: Number, required: true, default: 5 },
        loanPeriodDays: { type: Number, required: true, default: 14 },
        fineRatePerDay: { type: Number, required: true, default: 0.25 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

librarySchema.index({ code: 1 });

export const Library = mongoose.model<ILibrary>('Library', librarySchema);
