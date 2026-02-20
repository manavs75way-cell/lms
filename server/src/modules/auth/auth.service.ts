import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { User, IUser } from './auth.model';
import { AppError } from '../../errors/AppError';
import { env } from '../../config/env';
import { generateBarcode, generateQRCode } from '../../utils/barcode';

export const getUserById = async (userId: string) => {
    const user = await User.findById(userId).select('-password').populate('homeLibrary', 'name code');
    return user;
};

interface RegisterUserDto {
    email: string;
    password: string;
    name: string;
    role: 'MEMBER' | 'LIBRARIAN' | 'ADMIN';
    membershipType: 'STANDARD' | 'PREMIUM' | 'FACULTY' | 'STUDENT';
    homeLibrary?: string;
    parentAccount?: string;
}

export const registerUser = async (userData: RegisterUserDto) => {
    const { email, password, name, role, membershipType, homeLibrary, parentAccount } = userData;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AppError('Email already in use', 400);
    }

    if (parentAccount) {
        if (!mongoose.isValidObjectId(parentAccount)) {
            throw new AppError('Invalid parent account ID format. Please enter the full MongoDB ObjectId.', 400);
        }
        const parent = await User.findById(parentAccount);
        if (!parent) {
            throw new AppError('Parent account not found', 404);
        }
    }

    const membershipId = `MEM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const barcodeUrl = await generateBarcode(membershipId, `user-${membershipId}`);
    let qrCodeUrl: string | undefined;
    try {
        const deepLink = `http://localhost:3000/profile`;
        qrCodeUrl = await generateQRCode(deepLink, `user-qr-${membershipId}`);
    } catch (e) {
        console.error('QR code generation failed', e);
    }

    const user = await User.create({
        name,
        email,
        password,
        role,
        membershipType,
        homeLibrary: homeLibrary || undefined,
        parentAccount: parentAccount || undefined,
        barcodeUrl,
        qrCodeUrl,
    });

    const { accessToken, refreshToken } = generateTokens(user);

    user.refreshToken = refreshToken;
    await user.save();

    return { user: sanitizeUser(user), accessToken, refreshToken };
};

export const loginUser = async (data: Pick<IUser, 'email' | 'password'>) => {
    const user = await User.findOne({ email: data.email });
    if (!user || !(await user.comparePassword(data.password))) {
        throw new AppError('Invalid email or password', 401);
    }

    if (!user.qrCodeUrl) {
        try {
            const deepLink = `http://localhost:3000/profile`;
            user.qrCodeUrl = await generateQRCode(deepLink, `user-qr-login-${user._id}`);
        } catch (e) {
            console.error('QR code backfill failed', e);
        }
    }

    const { accessToken, refreshToken } = generateTokens(user);

    user.refreshToken = refreshToken;
    await user.save();

    return { user: sanitizeUser(user), accessToken, refreshToken };
};

export const refreshAccessToken = async (token: string) => {
    try {
        const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string };
        const user = await User.findById(decoded.userId);

        if (!user || user.refreshToken !== token) {
            throw new AppError('Invalid refresh token', 401);
        }

        const accessToken = jwt.sign(
            { userId: user._id, role: user.role, membershipType: user.membershipType },
            env.JWT_ACCESS_SECRET,
            { expiresIn: '15m' }
        );

        return { user: sanitizeUser(user), accessToken, refreshToken: token };
    } catch (error) {
        throw new AppError('Invalid refresh token', 401);
    }
};

export const logoutUser = async (userId: string) => {
    await User.findByIdAndUpdate(userId, { refreshToken: undefined });
};


export const getChildAccounts = async (parentId: string) => {
    return await User.find({ parentAccount: parentId }).select('-password -refreshToken');
};

const generateTokens = (user: IUser) => {
    const accessToken = jwt.sign(
        { userId: user._id, role: user.role, membershipType: user.membershipType },
        env.JWT_ACCESS_SECRET,
        {
            expiresIn: '15m',
        });

    const refreshToken = jwt.sign({ userId: user._id }, env.JWT_REFRESH_SECRET, {
        expiresIn: '7d',
    });

    return { accessToken, refreshToken };
};

const sanitizeUser = (user: IUser) => {
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refreshToken;
    return userObj;
};
