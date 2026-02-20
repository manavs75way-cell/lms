import React, { useState } from 'react';
import { PredictiveHold } from '../../../types/dashboard.types';
import { ArrowTrendingUpIcon, SparklesIcon, PencilSquareIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useOverridePredictiveHoldMutation } from '../../../services/dashboardApi';
import { useToast } from '../../../context/ToastContext';

interface PredictiveHoldsTableProps {
    data: PredictiveHold[];
}

const PredictiveHoldsTable: React.FC<PredictiveHoldsTableProps> = ({ data }) => {
    const [overrideHold] = useOverridePredictiveHoldMutation();
    const { success, error } = useToast();

    const [selectedHold, setSelectedHold] = useState<PredictiveHold | null>(null);
    const [overrideValue, setOverrideValue] = useState<string>('');
    const [overrideReason, setOverrideReason] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOverrideSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedHold || !overrideValue || !overrideReason) return;

        setIsSubmitting(true);
        try {
            await overrideHold({
                editionId: selectedHold.editionId,
                reservations: parseInt(overrideValue, 10),
                reason: overrideReason
            }).unwrap();
            success('Forecast overridden successfully. Active for 7 days.');
            setSelectedHold(null);
            setOverrideValue('');
            setOverrideReason('');
        } catch (err) {
            error('Failed to override forecast.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 overflow-hidden">
            <div className="p-6 border-b border-indigo-50 bg-gradient-to-r from-indigo-50/50 to-white flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5 text-indigo-500" />
                        AI Predictive Holds Forecast
                    </h3>
                    <p className="text-sm text-indigo-600/80 mt-1">Expected demand for the next 7 days based on recent velocity.</p>
                </div>
            </div>

            {data && data.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Work & Edition
                                </th>
                                <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Predicted Reservations
                                </th>
                                <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Confidence
                                </th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Action Suggestion
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                            {data.map((hold, idx) => {
                                return (
                                    <tr key={hold.editionId || idx} className="hover:bg-indigo-50/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="ml-0">
                                                    <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                                        {hold.title || '(Unknown Title)'}
                                                        {hold.isOverridden && (
                                                            <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 text-[10px] uppercase font-bold tracking-wider" title={hold.overrideReason}>
                                                                Manual Override
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        ISBN: {hold.isbn || '—'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center group">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className={`inline-flex items-center justify-center px-3 py-1 rounded-full font-bold text-sm ${hold.isOverridden ? 'bg-purple-100 text-purple-800' : 'bg-indigo-100 text-indigo-800'}`}>
                                                    +{Math.round(hold.predictedReservations)} holds
                                                    {!hold.isOverridden && <ArrowTrendingUpIcon className="w-4 h-4 ml-1.5" />}
                                                </div>
                                                <button
                                                    onClick={() => { setSelectedHold(hold); setOverrideValue(Math.round(hold.predictedReservations).toString()); setOverrideReason(''); }}
                                                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-indigo-600 transition"
                                                    title="Override Forecast"
                                                >
                                                    <PencilSquareIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${hold.confidence > 0.8 ? 'bg-green-500' : hold.confidence > 0.5 ? 'bg-yellow-400' : 'bg-red-400'}`}
                                                        style={{ width: `${hold.confidence * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-medium text-gray-500 w-8">
                                                    {Math.round(hold.confidence * 100)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            {hold.predictedReservations > 3 ? (
                                                <span className="text-orange-600 font-semibold text-xs bg-orange-50 px-2 py-1 rounded">Procure Copies</span>
                                            ) : (
                                                <span className="text-gray-400 text-xs">Monitor</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="p-8 text-center text-gray-500">
                    <p>No predictive holds data available yet. Needs more historical velocity data.</p>
                </div>
            )}

            {selectedHold && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-gray-900">Override Forecast</h3>
                            <button onClick={() => setSelectedHold(null)} className="text-gray-400 hover:text-gray-600">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleOverrideSubmit} className="p-6 space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-1">Book</p>
                                <p className="text-sm text-gray-900 font-bold bg-gray-50 p-2 rounded border">{selectedHold.title}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Manual Forecast (Holds)</label>
                                <input
                                    type="number"
                                    min="0"
                                    required
                                    value={overrideValue}
                                    onChange={e => setOverrideValue(e.target.value)}
                                    className="w-full rounded-xl border-gray-300 focus:ring-indigo-500 py-2.5"
                                />
                                <p className="text-xs text-gray-500 mt-1">AI predicted: {Math.round(selectedHold.predictedReservations)}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Override</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g., Upcoming local author event"
                                    value={overrideReason}
                                    onChange={e => setOverrideReason(e.target.value)}
                                    className="w-full rounded-xl border-gray-300 focus:ring-indigo-500 py-2.5"
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setSelectedHold(null)} className="flex-1 py-2 font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 py-2 font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-md">
                                    {isSubmitting ? 'Saving...' : 'Apply Override'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PredictiveHoldsTable;
