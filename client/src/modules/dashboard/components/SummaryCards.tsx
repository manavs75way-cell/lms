import React from 'react';
import { DashboardSummary } from '../../../types/dashboard.types';
import {
    BookOpenIcon,
    UserGroupIcon,
    ExclamationCircleIcon,
    BanknotesIcon
} from '@heroicons/react/24/outline';

interface SummaryCardsProps {
    summary: DashboardSummary;
}


const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
    const cards = [
        { name: 'Total Collection', value: summary.totalBooks, icon: BookOpenIcon, color: 'text-indigo-600', bg: 'bg-indigo-100' },
        { name: 'Currently Out', value: summary.borrowedCopies, icon: BookOpenIcon, color: 'text-blue-600', bg: 'bg-blue-100' },
        { name: 'Active Members', value: summary.totalMembers, icon: UserGroupIcon, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        { name: 'Overdue Items', value: summary.overdueBorrows, icon: ExclamationCircleIcon, color: 'text-red-600', bg: 'bg-red-100' },
        { name: 'Unpaid Fines', value: `$${summary.totalFinesPending}`, icon: BanknotesIcon, color: 'text-amber-600', bg: 'bg-amber-100' },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {cards.map((item) => (
                <div key={item.name} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
                    <div className={`p-3 rounded-xl ${item.bg} ${item.color} mb-3`}>
                        <item.icon className="h-6 w-6" />
                    </div>
                    <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{item.name}</dt>
                    <dd className="text-2xl font-bold text-gray-900 mt-1">{item.value}</dd>
                </div>
            ))}
        </div>
    );
};

export default SummaryCards;
