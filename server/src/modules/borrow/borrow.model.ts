import mongoose, { Document, Schema } from 'mongoose';

export interface IBorrow extends Document {
    user: mongoose.Types.ObjectId;
    book: mongoose.Types.ObjectId;
    borrowDate: Date;
    dueDate: Date;
    returnDate?: Date;
    status: 'BORROWED' | 'RETURNED';
    fine: number;
    conditionAtBorrow: 'NEW' | 'GOOD' | 'FAIR' | 'DAMAGED';
    conditionAtReturn?: 'NEW' | 'GOOD' | 'FAIR' | 'DAMAGED';
    damageNotes?: string;
}

const borrowSchema = new Schema<IBorrow>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
        borrowDate: { type: Date, default: Date.now },
        dueDate: { type: Date, required: true },
        returnDate: { type: Date },
        status: { type: String, enum: ['BORROWED', 'RETURNED'], default: 'BORROWED' },
        fine: { type: Number, default: 0 },
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

borrowSchema.index({ book: 1 });
borrowSchema.index({ user: 1 });
borrowSchema.index({ status: 1 });
borrowSchema.index({ dueDate: 1 });

export const Borrow = mongoose.model<IBorrow>('Borrow', borrowSchema);
