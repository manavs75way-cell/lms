import React from 'react';
import { useGetDashboardStatsQuery } from '../../../services/statsApi';
import { Link } from 'react-router-dom';
import Recommendations from '../../borrow/components/Recommendations';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import LibrarianDashboardPage from './LibrarianDashboardPage';
import {
    BookOpenIcon,
    BellIcon,
    BookmarkIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const DashboardPage = React.memo(() => {
    const { user } = useSelector((state: RootState) => state.auth);

    if (user && ['LIBRARIAN', 'ADMIN'].includes(user.role)) {
        return <LibrarianDashboardPage />;
    }

    const { data: stats, isLoading, error } = useGetDashboardStatsQuery();

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-pulse text-indigo-600 font-medium">Loading your library space...</div>
        </div>
    );

    if (error) return (
        <div className="p-10 text-center text-red-500 bg-red-50 rounded-2xl m-6 border border-red-100">
            Error loading your dashboard. Please try again later.
        </div>
    );

    interface StatCardProps {
        title: string;
        value: number | undefined;
        icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
        color: string;
        link?: string;
        linkText?: string;
    }

    const StatCard = ({ title, value, icon: Icon, color, link, linkText }: StatCardProps) => (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${color}`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
                {link && (
                    <Link to={link} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition">
                        {linkText || 'View All'} →
                    </Link>
                )}
            </div>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="text-3xl font-bold text-gray-900 mt-1">{value}</dd>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12">
            <div className="bg-indigo-700 pb-32 pt-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-white">Hello, {user?.name.split(' ')[0]}! 👋</h1>
                    <p className="mt-2 text-indigo-100">Welcome to your digital library. Here’s what’s happening with your account.</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Books Borrowed"
                        value={stats?.totalBorrowed}
                        icon={BookOpenIcon}
                        color="bg-blue-500"
                        link="/my-borrows"
                    />
                    <StatCard
                        title="Overdue Books"
                        value={stats?.overdueCount}
                        icon={ExclamationTriangleIcon}
                        color={(stats?.overdueCount || 0) > 0 ? "bg-red-500" : "bg-gray-400"}
                        link="/my-borrows"
                    />
                    <StatCard
                        title="Reservations"
                        value={stats?.reservedCount}
                        icon={BookmarkIcon}
                        color="bg-purple-500"
                        link="/reservations"
                        linkText="View Queue"
                    />
                    <StatCard
                        title="New Notifications"
                        value={stats?.unreadNotificationsCount}
                        icon={BellIcon}
                        color={(stats?.unreadNotificationsCount || 0) > 0 ? "bg-orange-500" : "bg-gray-400"}
                        link="/notifications"
                        linkText="Check"
                    />
                </div>

                <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
                            <Recommendations />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Library Reach</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 text-sm">Total Collection</span>
                                    <span className="font-bold text-gray-900">{stats?.totalBooks}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 text-sm">Total Members</span>
                                    <span className="font-bold text-gray-900">{stats?.totalUsers}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 text-sm">Active this month</span>
                                    <span className="font-bold text-green-600">{stats?.activeMembers}</span>
                                </div>
                            </div>
                            <Link to="/books" className="mt-6 block w-full text-center py-3 bg-indigo-50 text-indigo-700 rounded-xl font-semibold text-sm hover:bg-indigo-100 transition">
                                Browse Catalog
                            </Link>
                        </div>

                        <div className="bg-gradient-to-br bg-orange-500 p-6 rounded-2xl text-white shadow-lg">
                            <h4 className="font-bold mb-2">Did you know?</h4>
                            <p className="text-sm text-indigo-100">You can renew your books online up to 2 days before the due date!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default DashboardPage;