import React, { useMemo } from 'react';
import { RecentBorrow } from '../../../types/dashboard.types';

interface RecentBorrowsTableProps {
    data: RecentBorrow[];
}

const RecentBorrowsTable: React.FC<RecentBorrowsTableProps> = React.memo(({ data }) => {
    const rows = useMemo(() => data, [data]);

    return (
        <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Borrows</h3>
            </div>
            <div className="border-t border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Action</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {rows.map((row) => (
                                <tr key={row.borrowId} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-semibold text-gray-900">{row.bookTitle}</p>
                                        <p className="text-xs text-gray-400 font-mono">{row.bookISBN}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <span className="block font-medium text-gray-900">{row.userName}</span>
                                        <span className="text-xs">{row.userEmail}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                            row.status === 'OVERDUE' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                        }`}>
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {rows.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No recent borrows</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
});

export default RecentBorrowsTable;
