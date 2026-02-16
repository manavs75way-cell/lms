import { api } from './api';
import { z } from 'zod';



export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'LIBRARIAN' | 'MEMBER' | 'ADMIN';
    membershipTier: 'STUDENT' | 'ADULT' | 'PREMIUM';
    barcodeUrl?: string; 
}

export interface AuthResponse {
    success: boolean;
    user: User;
    accessToken: string;
    refreshToken: string;
}

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['LIBRARIAN', 'MEMBER', 'ADMIN']).default('MEMBER'),
    membershipTier: z.enum(['STUDENT', 'ADULT', 'PREMIUM']).default('STUDENT'),
});

export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;

export const authApi = api.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<AuthResponse, LoginRequest>({
            query: (credentials) => ({
                url: 'auth/login',
                method: 'POST',
                body: credentials,
            }),
        }),
        register: builder.mutation<AuthResponse, RegisterRequest>({
            query: (data) => ({
                url: 'auth/register',
                method: 'POST',
                body: data,
            }),
        }),
        logout: builder.mutation<void, void>({
            query: () => ({
                url: 'auth/logout',
                method: 'POST',
            })
        }),
        getMe: builder.query<User, void>({
            query: () => 'auth/me',
            providesTags: ['Users'],
        }),
    }),
});

export const { useLoginMutation, useRegisterMutation, useLogoutMutation, useGetMeQuery } = authApi;
