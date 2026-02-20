import mongoose, { Document, Schema } from 'mongoose';

export interface IShipment extends Document {
    copy: mongoose.Types.ObjectId;
    fromLibrary: mongoose.Types.ObjectId;
    toLibrary: mongoose.Types.ObjectId;
    reason: 'INTER_LIBRARY_RETURN' | 'REBALANCING' | 'TRANSFER';
    status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED';
    triggeredBy?: mongoose.Types.ObjectId;
    deliveredAt?: Date;
}

const shipmentSchema = new Schema<IShipment>(
    {
        copy: { type: Schema.Types.ObjectId, ref: 'Copy', required: true },
        fromLibrary: { type: Schema.Types.ObjectId, ref: 'Library', required: true },
        toLibrary: { type: Schema.Types.ObjectId, ref: 'Library', required: true },
        reason: {
            type: String,
            enum: ['INTER_LIBRARY_RETURN', 'REBALANCING', 'TRANSFER'],
            required: true,
        },
        status: {
            type: String,
            enum: ['PENDING', 'IN_TRANSIT', 'DELIVERED'],
            default: 'PENDING',
        },
        triggeredBy: { type: Schema.Types.ObjectId, ref: 'User' },
        deliveredAt: { type: Date },
    },
    { timestamps: true }
);

shipmentSchema.index({ status: 1 });
shipmentSchema.index({ fromLibrary: 1 });
shipmentSchema.index({ toLibrary: 1 });

export const Shipment = mongoose.model<IShipment>('Shipment', shipmentSchema);
