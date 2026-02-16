import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
    user: mongoose.Schema.Types.ObjectId;
    title: string;
    message: string;
    type: 'DUE_SOON' | 'OVERDUE' | 'RESERVATION_AVAILABLE' | 'SYSTEM';
    isRead: boolean;
    createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: {
            type: String,
            enum: ['DUE_SOON', 'OVERDUE', 'RESERVATION_AVAILABLE', 'SYSTEM'],
            required: true,
        },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
);

notificationSchema.index({ user: 1 });
notificationSchema.index({ isRead: 1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
