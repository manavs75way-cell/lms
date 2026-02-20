

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterMutation, registerSchema, RegisterRequest } from '../../../services/authApi';
import React, { useCallback } from 'react';
import { ApiError } from '../../../services/api';

export const RegisterPage = () => {
    const navigate = useNavigate();
    const [registerUser, { isLoading, error }] = useRegisterMutation();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            role: 'MEMBER',
            membershipType: 'STUDENT',
            parentAccount: '',
        },
    });

    const selectedRole = watch('role');
    const [showParentField, setShowParentField] = React.useState(false);

    const onSubmit = useCallback(
        async (data: RegisterRequest) => {
            try {
                const payload = {
                    ...data,
                    parentAccount: data.parentAccount?.trim() || undefined,
                };
                await registerUser(payload).unwrap();
                navigate('/');
            } catch (err) {
                console.error('Registration failed:', err);
            }
        },
        [registerUser, navigate]
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen w-full overflow-hidden bg-white">

            <div className="hidden lg:block relative">
                <img
                    src="/register.jpeg"
                    alt="Library Books"
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-indigo-900/40 mix-blend-multiply" />
                <div className="absolute top-12 left-12 text-white">
                    <h1 className="text-4xl font-bold tracking-tight">Join our Community</h1>
                    <p className="mt-4 text-lg opacity-90 max-w-sm">
                        Unlock thousands of digital resources, journals, and local archives today.
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-12 bg-gray-50">
                <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl shadow-xl lg:shadow-none lg:bg-transparent">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-extrabold text-gray-900">
                            Create Account
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Start your reading journey with us.
                        </p>
                    </div>

                    <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    {...register('name')}
                                    type="text"
                                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    placeholder="John Doe"
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    {...register('email')}
                                    type="email"
                                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    placeholder="john@example.com"
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    {...register('password')}
                                    type="password"
                                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    placeholder="••••••••"
                                />
                                {errors.password && (
                                    <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">I am a...</label>
                                    <select
                                        {...register('role')}
                                        className="block w-full px-3 py-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                    >
                                        <option value="MEMBER">Member</option>
                                        <option value="LIBRARIAN">Librarian</option>
                                    </select>
                                </div>

                                {selectedRole === 'MEMBER' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tier</label>
                                        <select
                                            {...register('membershipType')}
                                            className="block w-full px-3 py-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                        >
                                            <option value="STUDENT">Student</option>
                                            <option value="ADULT">Adult</option>
                                            <option value="PREMIUM">Premium</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            {selectedRole === 'MEMBER' && (
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <label className="block text-sm font-medium text-gray-700">Delegated Account</label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowParentField(v => {
                                                    if (v) setValue('parentAccount', ''); 
                                                    return !v;
                                                });
                                            }}
                                            className="text-xs text-indigo-500 underline"
                                        >
                                            {showParentField ? 'Hide' : '+ Link to parent account'}
                                        </button>
                                    </div>
                                    {showParentField && (
                                        <>
                                            <input
                                                {...register('parentAccount')}
                                                type="text"
                                                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm font-mono"
                                                placeholder="Parent user ID (MongoDB ObjectId)"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Borrows will count against the parent's limit.</p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center border border-red-100">
                                {((error as ApiError).data?.message) || 'Registration failed'}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all transform active:scale-[0.98]"
                        >
                            {isLoading ? 'Creating account...' : 'Create Account'}
                        </button>

                        <div className="text-sm text-center">
                            <span className="text-gray-600">Already have an account? </span>
                            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
                                Sign in
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
