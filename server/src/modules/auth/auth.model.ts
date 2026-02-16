import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: 'LIBRARIAN' | 'MEMBER' | 'ADMIN';
    membershipTier: 'STUDENT' | 'ADULT' | 'PREMIUM';
    barcodeUrl?: string;
    refreshToken?: string;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: ['LIBRARIAN', 'MEMBER', 'ADMIN'], default: 'MEMBER' },
        membershipTier: { type: String, enum: ['STUDENT', 'ADULT', 'PREMIUM'], default: 'STUDENT' },
        barcodeUrl: { type: String },
        refreshToken: { type: String },
    },
    { timestamps: true }
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
