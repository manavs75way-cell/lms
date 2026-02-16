

import { useForm } from 'react-hook-form';
import { useToast } from '../../../context/ToastContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useLoginMutation, loginSchema, LoginRequest } from '../../../services/authApi';
import { useCallback } from 'react';
import { ApiError } from '../../../services/api';

export const LoginPage = () => {
    const navigate = useNavigate();
    const [login, { isLoading, error }] = useLoginMutation();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginRequest>({
        resolver: zodResolver(loginSchema),
    });

    const { success, error: showError } = useToast();

    const onSubmit = useCallback(
        async (data: LoginRequest) => {
            try {
                await login(data).unwrap();
                success('Login successful!');
                navigate('/');
            } catch (err) {
                console.error('Login failed:', err);
                showError((err as ApiError).data?.message || 'Login failed');
            }
        },
        [login, navigate, success, showError]
    );

    return (
        <div className='grid grid-cols-1 lg:grid-cols-2 min-h-screen w-full overflow-hidden'>
            
            <div className="flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            Welcome Back
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Please sign in to access the digital library
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    {...register('email')}
                                    type="email"
                                    className="appearance-none block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition sm:text-sm"
                                    placeholder="name@example.com"
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
                                    className="appearance-none block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition sm:text-sm"
                                    placeholder="••••••••"
                                />
                                {errors.password && (
                                    <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                                )}
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center border border-red-100">
                                {((error as ApiError).data?.message) || 'Login failed'}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>

                        <div className="text-sm text-center">
                            <span className="text-gray-600">Don't have an account? </span>
                            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
                                Create an account
                            </Link>
                        </div>
                    </form>
                </div>
            </div>

            <div className="hidden lg:block relative">
                <img 
                    src= "/login.jpeg" 
                    alt="Library" 
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-indigo-900/20 mix-blend-multiply" />
                
                <div className="absolute bottom-12 left-12 right-12 text-white">
                    <p className="text-2xl font-serif italic">"A room without books is like a body without a soul."</p>
                    <p className="mt-2 text-sm uppercase tracking-widest opacity-80">— Marcus Tullius Cicero</p>
                </div>
            </div>
        </div>
    );
};
