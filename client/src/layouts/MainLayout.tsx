

import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useGetUnreadCountQuery } from '../services/notificationApi';
import { BellIcon, BookOpenIcon, UserCircleIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { useToast } from '../context/ToastContext';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../modules/auth/authSlice';
import { RootState } from '../app/store';

export const MainLayout: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useSelector((state: RootState) => state.auth);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const isActive = (path: string) => location.pathname === path;

    const navLinkClasses = (path: string) =>
        `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${isActive(path)
            ? 'border-indigo-600 text-gray-900'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`;

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                                <div className="bg-indigo-600 p-1.5 rounded-lg">
                                    <BookOpenIcon className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-xl font-bold tracking-tight text-gray-900">
                                    Libris<span className="text-indigo-600">Sync</span>
                                </span>
                            </Link>

                            <div className="hidden sm:-my-px sm:ml-10 sm:flex sm:space-x-8">
                                <Link to="/books" className={navLinkClasses('/books')}>
                                    Books
                                </Link>
                                {user?.role === 'MEMBER' && (
                                    <>
                                        <Link to="/my-borrows" className={navLinkClasses('/my-borrows')}>
                                            My Borrows
                                        </Link>
                                        <Link to="/history" className={navLinkClasses('/history')}>
                                            History
                                        </Link>
                                    </>
                                )}
                                {(user?.role === 'LIBRARIAN' || user?.role === 'ADMIN') && (
                                    <>
                                        <Link to="/admin/shipments" className={navLinkClasses('/admin/shipments')}>
                                            Shipments
                                        </Link>
                                        <Link to="/admin/damage-reports" className={navLinkClasses('/admin/damage-reports')}>
                                            Damage Reports
                                        </Link>
                                    </>
                                )}
                                {user?.role === 'ADMIN' && (
                                    <Link to="/admin/fine-config" className={navLinkClasses('/admin/fine-config')}>
                                        Fine Config
                                    </Link>
                                )}
                            </div>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-6">
                            <NotificationBell />

                            <div className="relative">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition"
                                >
                                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 border border-indigo-200">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="hidden lg:block">{user?.name.split(' ')[0]}</span>
                                </button>

                                {isUserMenuOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 overflow-hidden">
                                            <Link
                                                to="/profile"
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                <UserCircleIcon className="h-4 w-4" /> Profile
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                                            >
                                                <ArrowLeftOnRectangleIcon className="h-4 w-4" /> Logout
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="transition-all duration-300">
                <Outlet />
            </main>

            <footer className="bg-white border-t border-gray-200 py-8">
                <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
                    &copy; 2026 LibrisSync Management System. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

const NotificationBell = () => {
    const { data } = useGetUnreadCountQuery(undefined, {
        pollingInterval: 60000, 
    });
    const { success } = useToast();
    const [prevCount, setPrevCount] = React.useState(0);

    React.useEffect(() => {
        if (data?.count !== undefined) {
            if (data.count > prevCount) {
                success('You have a new notification');
            }
            setPrevCount(data.count);
        }
    }, [data, prevCount, success]);

    return (
        <Link to="/notifications" className="p-1.5 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition relative group">
            <span className="sr-only">View notifications</span>
            <BellIcon className="h-6 w-6" aria-hidden="true" />
            {data?.count !== undefined && data.count > 0 && (
                <span className="absolute top-1 right-1  h-4 w-4 rounded-full ring-2 ring-white bg-red-500 text-[10px] text-white font-bold flex items-center justify-center">
                    {data.count > 9 ? '9+' : data.count}
                </span>
            )}
        </Link>
    );
};