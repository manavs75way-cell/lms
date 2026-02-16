import React, { useMemo } from 'react';
import { OverdueBorrow } from '../../../types/dashboard.types';

interface OverdueTableProps {
    data: OverdueBorrow[];
}

const OverdueTable: React.FC<OverdueTableProps> = React.memo(({ data }) => {
    const rows = useMemo(() => data, [data]);

    return (
        <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 bg-red-50 border-b border-red-200">
                <h3 className="text-lg leading-6 font-medium text-red-800">Overdue Books</h3>
            </div>
            <div className="">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overdue By</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fine</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {rows.map((row) => (
                                <tr key={row.borrowId} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-semibold text-gray-900">{row.bookTitle}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <span className="block font-medium text-gray-900">{row.userName}</span>
                                        <span className="text-xs">{row.userEmail}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                                            {row.daysOverdue} days
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                        ${row.fineAmount}
                                    </td>
                                </tr>
                            ))}
                            {rows.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No overdue books</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
});

export default OverdueTable;
