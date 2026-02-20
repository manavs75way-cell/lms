import mongoose, { Document, Schema } from 'mongoose';

export interface ICopy extends Document {
    edition: mongoose.Types.ObjectId;
    copyCode: string;
    owningLibrary: mongoose.Types.ObjectId;
    currentLibrary: mongoose.Types.ObjectId;
    condition: 'NEW' | 'GOOD' | 'FAIR' | 'DAMAGED';
    status: 'AVAILABLE' | 'BORROWED' | 'IN_TRANSIT' | 'DAMAGED_PULLED' | 'LOST';
    barcodeUrl?: string;
    qrCodeUrl?: string;
    acquiredDate: Date;
}

const copySchema = new Schema<ICopy>(
    {
        edition: { type: Schema.Types.ObjectId, ref: 'Edition', required: true },
        copyCode: { type: String, required: true, unique: true },
        owningLibrary: { type: Schema.Types.ObjectId, ref: 'Library', required: true },
        currentLibrary: { type: Schema.Types.ObjectId, ref: 'Library', required: true },
        condition: {
            type: String,
            enum: ['NEW', 'GOOD', 'FAIR', 'DAMAGED'],
            default: 'GOOD',
        },
        status: {
            type: String,
            enum: ['AVAILABLE', 'BORROWED', 'IN_TRANSIT', 'DAMAGED_PULLED', 'LOST'],
            default: 'AVAILABLE',
        },
        barcodeUrl: { type: String },
        qrCodeUrl: { type: String },
        acquiredDate: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

copySchema.index({ edition: 1 });
copySchema.index({ currentLibrary: 1 });
copySchema.index({ owningLibrary: 1 });
copySchema.index({ status: 1 });
copySchema.index({ copyCode: 1 });

export const Copy = mongoose.model<ICopy>('Copy', copySchema);
