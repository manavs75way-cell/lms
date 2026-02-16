import mongoose, { Document, Schema } from 'mongoose';

export interface IReservation extends Document {
    user: mongoose.Types.ObjectId;
    book: mongoose.Types.ObjectId;
    position: number;
    status: 'PENDING' | 'FULFILLED' | 'CANCELLED';
    createdAt: Date;
    updatedAt: Date;
}

const reservationSchema = new Schema<IReservation>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
        position: { type: Number, required: true },
        status: {
            type: String,
            enum: ['PENDING', 'FULFILLED', 'CANCELLED'],
            default: 'PENDING',
        },
    },
    { timestamps: true }
);

reservationSchema.index({ user: 1, book: 1, status: 1 }, { unique: true, partialFilterExpression: { status: 'PENDING' } });
reservationSchema.index({ user: 1 });
reservationSchema.index({ status: 1 });

export const Reservation = mongoose.model<IReservation>('Reservation', reservationSchema);
