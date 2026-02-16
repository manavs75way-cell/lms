import mongoose, { Document, Schema } from 'mongoose';

export interface IBook extends Document {
    title: string;
    author: string;
    isbn: string;
    coverImageUrl?: string;
    genre: string;
    publisher: string;
    condition: 'NEW' | 'GOOD' | 'FAIR' | 'DAMAGED';
    totalCopies: number;
    availableCopies: number;
    branches: Array<{
        branch: string;
        copyCount: number;
        availableCount: number; 
    }>;
    barcodeUrl?: string;
}

const bookSchema = new Schema<IBook>(
    {
        title: { type: String, required: true },
        author: { type: String, required: true },
        isbn: { type: String, required: true, unique: true },
        coverImageUrl: { type: String },
        genre: { type: String, required: true },
        publisher: { type: String, required: true },
        condition: {
            type: String,
            enum: ['NEW', 'GOOD', 'FAIR', 'DAMAGED'],
            default: 'GOOD',
        },
        totalCopies: { type: Number, required: true, min: 0 },
        availableCopies: { type: Number, required: true, min: 0 },
        branches: [
            {
                branch: { type: String, required: true },
                copyCount: { type: Number, required: true, min: 0 },
                availableCount: { type: Number, required: true, min: 0 }, 
            },
        ],
        barcodeUrl: { type: String },
    },
    { timestamps: true }
);

bookSchema.index({ isbn: 1 });

export const Book = mongoose.model<IBook>('Book', bookSchema);
