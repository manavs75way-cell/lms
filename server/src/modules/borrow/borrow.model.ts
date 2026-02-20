import mongoose, { Document, Schema } from 'mongoose';

export interface IFineBreakdownEntry {
    startDate: Date;
    endDate: Date;
    rate: number;
    amount: number;
}

export interface IBorrow extends Document {
    user: mongoose.Types.ObjectId;
    copy: mongoose.Types.ObjectId;
    borrowedFromLibrary: mongoose.Types.ObjectId;
    returnedToLibrary?: mongoose.Types.ObjectId;
    borrowedOnBehalfOf?: mongoose.Types.ObjectId;
    borrowDate: Date;
    dueDate: Date;
    returnDate?: Date;
    status: 'BORROWED' | 'RETURNED' | 'OVERDUE';
    fine: number;
    fineBreakdown: IFineBreakdownEntry[];
    conditionAtBorrow: 'NEW' | 'GOOD' | 'FAIR' | 'DAMAGED';
    conditionAtReturn?: 'NEW' | 'GOOD' | 'FAIR' | 'DAMAGED';
    damageNotes?: string;
}

const fineBreakdownSchema = new Schema<IFineBreakdownEntry>(
    {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        rate: { type: Number, required: true },
        amount: { type: Number, required: true },
    },
    { _id: false }
);

const borrowSchema = new Schema<IBorrow>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        copy: { type: Schema.Types.ObjectId, ref: 'Copy', required: true },
        borrowedFromLibrary: { type: Schema.Types.ObjectId, ref: 'Library', required: true },
        returnedToLibrary: { type: Schema.Types.ObjectId, ref: 'Library' },
        borrowedOnBehalfOf: { type: Schema.Types.ObjectId, ref: 'User' },
        borrowDate: { type: Date, default: Date.now },
        dueDate: { type: Date, required: true },
        returnDate: { type: Date },
        status: { type: String, enum: ['BORROWED', 'RETURNED', 'OVERDUE'], default: 'BORROWED' },
        fine: { type: Number, default: 0 },
        fineBreakdown: { type: [fineBreakdownSchema], default: [] },
        conditionAtBorrow: {
            type: String,
            enum: ['NEW', 'GOOD', 'FAIR', 'DAMAGED'],
            required: true,
        },
        conditionAtReturn: {
            type: String,
            enum: ['NEW', 'GOOD', 'FAIR', 'DAMAGED'],
        },
        damageNotes: { type: String },
    },
    { timestamps: true }
);

borrowSchema.index({ copy: 1 });
borrowSchema.index({ user: 1 });
borrowSchema.index({ status: 1 });
borrowSchema.index({ dueDate: 1 });
borrowSchema.index({ borrowedFromLibrary: 1 });

export const Borrow = mongoose.model<IBorrow>('Borrow', borrowSchema);
