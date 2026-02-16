import jwt from 'jsonwebtoken';
import { User, IUser } from './auth.model';
import { AppError } from '../../errors/AppError';
import { env } from '../../config/env';

export const getUserById = async (userId: string) => {
    const user = await User.findById(userId).select('-password');
    return user;
};

import { generateBarcode } from '../../utils/barcode';

interface RegisterUserDto {
    email: string;
    password: string;
    name: string;
    role: 'MEMBER' | 'LIBRARIAN' | 'ADMIN';
    membershipTier: 'BASIC' | 'PREMIUM' | 'VIP';
}

export const registerUser = async (userData: RegisterUserDto) => {
    const { email, password, name, role, membershipTier } = userData;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AppError('Email already in use', 400);
    }

    const membershipId = `MEM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const barcodeUrl = await generateBarcode(membershipId, `user-${membershipId}`);

    const user = await User.create({
        name,
        email,
        password,
        role,
        membershipTier,
        barcodeUrl,
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

        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

        user.refreshToken = newRefreshToken;
        await user.save();

        return { user: sanitizeUser(user), accessToken, refreshToken: newRefreshToken };
    } catch (error) {
        throw new AppError('Invalid refresh token', 401);
    }
};

export const logoutUser = async (userId: string) => {
    await User.findByIdAndUpdate(userId, { refreshToken: undefined });
};

const generateTokens = (user: IUser) => {
    const accessToken = jwt.sign(
        { userId: user._id, role: user.role, membershipTier: user.membershipTier },
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
