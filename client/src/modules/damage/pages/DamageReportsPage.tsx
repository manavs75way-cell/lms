import { useState } from 'react';
import { useGetDamageReportsQuery, useUpdateDamageReportStatusMutation, DamageReport } from '../../../services/damageApi';
import { useToast } from '../../../context/ToastContext';
import { format } from 'date-fns';

const DamageReportsPage = () => {
    const { data: reports, isLoading, error } = useGetDamageReportsQuery();
    const [updateReport] = useUpdateDamageReportStatusMutation();
    const { success, error: showError } = useToast();
    const [statusFilter, setStatusFilter] = useState<'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'ALL'>('ALL');

    if (isLoading) return <div className="p-10 text-center text-indigo-600 animate-pulse">Loading reports...</div>;
    if (error) return <div className="p-10 text-center text-red-500">Failed to load damage reports.</div>;

    const filteredReports = reports?.filter(r => statusFilter === 'ALL' || r.status === statusFilter) || [];

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await updateReport({ id, status: newStatus as Pick<DamageReport, 'status'>['status'] }).unwrap();
            success('Report status updated.');
        } catch (err) {
            showError('Failed to update status.');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <header className="mb-8 flex justify-between items-end flex-wrap gap-4 border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Damage Reports</h1>
                    <p className="text-gray-600 mt-2">Investigate depreciated copies and flag borrowers.</p>
                </div>
                <div className="flex gap-2">
                    {['ALL', 'OPEN', 'INVESTIGATING', 'RESOLVED'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status as 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'ALL')}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-colors ${statusFilter === status ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </header>

            {filteredReports.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center">
                    <p className="text-gray-500 font-medium">No damage reports found for this filter.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Copy Issue</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reported</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Financials</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Flagged Users</th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {filteredReports.map((report) => {
                                const workTitle = typeof report.copy === 'object' && typeof report.copy.edition === 'object' && typeof report.copy.edition.work === 'object' ? report.copy.edition.work.title : 'Unknown Title';
                                const copyCode = typeof report.copy === 'object' ? report.copy.copyCode : 'Unknown';

                                return (
                                    <tr key={report._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="text-sm font-bold text-gray-900">{workTitle}</div>
                                            <div className="text-xs text-gray-500 mt-1">Copy: {copyCode}</div>
                                            <div className="text-xs text-red-600 mt-2 bg-red-50 px-2 py-1 rounded inline-block">
                                                "{report.damageDescription}"
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                                            {format(new Date(report.createdAt), 'MMM d, yyyy')}
                                            <div className="text-xs mt-1">
                                                by {typeof report.reportedBy === 'object' ? report.reportedBy.name : report.reportedBy}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                Fee: <span className="font-bold text-red-600">${report.damageFee.toFixed(2)}</span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Repl: ${report.replacementCost.toFixed(2)} | Val: ${report.depreciatedValue.toFixed(2)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex -space-x-2 overflow-hidden">
                                                {report.flaggedBorrowers.length === 0 ? (
                                                    <span className="text-xs text-gray-500">None flagged</span>
                                                ) : (
                                                    report.flaggedBorrowers.map((u, i) => (
                                                        <div key={i} className="inline-block h-8 w-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center" title={typeof u === 'object' ? u.email : u as string}>
                                                            <span className="text-xs font-bold text-indigo-800">
                                                                {typeof u === 'object' ? u.name.charAt(0).toUpperCase() : '?'}
                                                            </span>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-right">
                                            <select
                                                value={report.status}
                                                onChange={(e) => handleStatusChange(report._id, e.target.value)}
                                                className={`text-sm font-bold rounded-lg border-gray-200 focus:ring-indigo-500 focus:border-indigo-500 ${report.status === 'OPEN' ? 'text-red-600 bg-red-50' : report.status === 'INVESTIGATING' ? 'text-yellow-600 bg-yellow-50' : 'text-green-600 bg-green-50'}`}
                                            >
                                                <option value="OPEN">Open</option>
                                                <option value="INVESTIGATING">Investigating</option>
                                                <option value="RESOLVED">Resolved</option>
                                            </select>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default DamageReportsPage;
