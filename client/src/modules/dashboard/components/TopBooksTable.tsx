import React, { useMemo } from 'react';
import { TopBook } from '../../../types/dashboard.types';

const TableCard: React.FC<{ title: string; children: React.ReactNode; color?: string }> = ({ title, children, color = "indigo" }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className={`px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-${color}-50/30`}>
            <h3 className="font-bold text-gray-800">{title}</h3>
            <button className="text-xs font-semibold text-indigo-600 hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">{children}</div>
    </div>
);

const TopBooksTable: React.FC<{ data: TopBook[] }> = ({ data }) => (
    <TableCard title="Trending Titles">
        <div className="p-4 space-y-4">
            {data.slice(0, 5).map((book, idx) => (
                <div key={book.bookId} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <span className="text-lg font-black text-gray-200">0{idx + 1}</span>
                        <div>
                            <p className="text-sm font-bold text-gray-800 line-clamp-1">{book.title}</p>
                            <p className="text-xs text-gray-400">ISBN: {book.isbn}</p>
                        </div>
                    </div>
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold">
                        {book.borrowCount}
                    </span>
                </div>
            ))}
        </div>
    </TableCard>
);

export default TopBooksTable;
