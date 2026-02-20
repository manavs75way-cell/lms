import mongoose, { Document, Schema } from 'mongoose';

export interface IWork extends Document {
    title: string;
    originalAuthor: string;
    genres: string[];
    description?: string;
    coverImageUrl?: string;
}

const workSchema = new Schema<IWork>(
    {
        title: { type: String, required: true },
        originalAuthor: { type: String, required: true },
        genres: [{ type: String }],
        description: { type: String },
        coverImageUrl: { type: String },
    },
    { timestamps: true }
);

workSchema.index({ title: 'text', originalAuthor: 'text' });

export const Work = mongoose.model<IWork>('Work', workSchema);
