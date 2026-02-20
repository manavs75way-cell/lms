import React from 'react';
import { useGetLibrarianDashboardQuery } from '../../../services/dashboardApi';
import SummaryCards from '../components/SummaryCards';
import RecentBorrowsTable from '../components/RecentBorrowsTable';
import OverdueTable from '../components/OverdueTable';
import TopBooksTable from '../components/TopBooksTable';
import ActiveMembersTable from '../components/ActiveMembersTable';
import PredictiveHoldsTable from '../components/PredictiveHoldsTable';

const LibrarianDashboardPage: React.FC = () => {
    const { data: response, isLoading, error } = useGetLibrarianDashboardQuery();

    if (isLoading) return <div className="min-h-screen flex items-center justify-center animate-pulse text-indigo-600">Loading Dashboard...</div>;

    if (error || !response?.data) return <div className="p-10 text-center text-red-500">Failed to load system metrics.</div>;

    const { summary, recentBorrows, overdueList, topBooks, activeMembers, predictiveHolds } = response.data;

    return (
        <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Library Overview</h1>
                    <p className="text-gray-500">Real-time system health and member activity.</p>
                </header>

                <section className="mb-10">
                    <SummaryCards summary={summary} />
                </section>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-2 space-y-8">
                        <PredictiveHoldsTable data={predictiveHolds} />
                        <RecentBorrowsTable data={recentBorrows} />
                        <OverdueTable data={overdueList} />
                    </div>

                    <div className="space-y-8">
                        <TopBooksTable data={topBooks} />
                        <ActiveMembersTable data={activeMembers} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(LibrarianDashboardPage);