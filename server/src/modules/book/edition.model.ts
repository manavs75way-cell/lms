import mongoose, { Document, Schema } from 'mongoose';

export interface IEdition extends Document {
    work: mongoose.Types.ObjectId;
    isbn: string;
    format: 'HARDCOVER' | 'PAPERBACK' | 'AUDIOBOOK' | 'EBOOK';
    publisher: string;
    publicationYear: number;
    language: string;
    replacementCost: number;
    coverImageUrl?: string;
}

const editionSchema = new Schema<IEdition>(
    {
        work: { type: Schema.Types.ObjectId, ref: 'Work', required: true },
        isbn: { type: String, required: true, unique: true },
        format: {
            type: String,
            enum: ['HARDCOVER', 'PAPERBACK', 'AUDIOBOOK', 'EBOOK'],
            required: true,
        },
        publisher: { type: String, required: true },
        publicationYear: { type: Number, required: true },
        language: { type: String, default: 'English' },
        replacementCost: { type: Number, required: true, default: 0 },
        coverImageUrl: { type: String },
    },
    { timestamps: true }
);

editionSchema.index({ isbn: 1 });
editionSchema.index({ work: 1 });

export const Edition = mongoose.model<IEdition>('Edition', editionSchema);
