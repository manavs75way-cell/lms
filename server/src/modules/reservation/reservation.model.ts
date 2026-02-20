import mongoose, { Document, Schema } from 'mongoose';

export interface IReservation extends Document {
    user: mongoose.Types.ObjectId;
    edition: mongoose.Types.ObjectId;
    preferredLibrary?: mongoose.Types.ObjectId;
    position: number;
    status: 'PENDING' | 'FULFILLED' | 'CANCELLED';
    membershipTypeAtReservation: string;
    effectivePriority: number;
    priorityBoostedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const reservationSchema = new Schema<IReservation>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        edition: { type: Schema.Types.ObjectId, ref: 'Edition', required: true },
        preferredLibrary: { type: Schema.Types.ObjectId, ref: 'Library' },
        position: { type: Number, required: true },
        status: {
            type: String,
            enum: ['PENDING', 'FULFILLED', 'CANCELLED'],
            default: 'PENDING',
        },
        membershipTypeAtReservation: { type: String, required: true },
        effectivePriority: { type: Number, default: 50 },
        priorityBoostedAt: { type: Date },
    },
    { timestamps: true }
);

reservationSchema.index(
    { user: 1, edition: 1, status: 1 },
    { unique: true, partialFilterExpression: { status: 'PENDING' } }
);
reservationSchema.index({ user: 1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ effectivePriority: -1, createdAt: 1 });

export const Reservation = mongoose.model<IReservation>('Reservation', reservationSchema);
