import React, { useState } from 'react';
import { useGetLibrariesQuery } from '../../../services/libraryApi';
import { useGetFinePoliciesQuery, useCreateFinePolicyMutation } from '../../../services/finePolicyApi';
import { useToast } from '../../../context/ToastContext';
import { format } from 'date-fns';

const FineConfigurationPage = () => {
    const { data: libraries, isLoading: librariesLoading } = useGetLibrariesQuery();
    const { success: showSuccess, error: showError } = useToast();

    const [selectedLibraryId, setSelectedLibraryId] = useState<string>('');
    const [ratePerDay, setRatePerDay] = useState<string>('');
    const [effectiveFrom, setEffectiveFrom] = useState<string>(
        new Date().toISOString().slice(0, 10)
    );

    const { data: policies, isLoading: policiesLoading } = useGetFinePoliciesQuery(
        selectedLibraryId,
        { skip: !selectedLibraryId }
    );

    const [createPolicy, { isLoading: isCreating }] = useCreateFinePolicyMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLibraryId || !ratePerDay) return;
        try {
            await createPolicy({
                library: selectedLibraryId,
                ratePerDay: parseFloat(ratePerDay),
                effectiveFrom: new Date(effectiveFrom).toISOString(),
            }).unwrap();
            showSuccess('Fine policy created. Previous policy auto-closed.');
            setRatePerDay('');
        } catch {
            showError('Failed to create fine policy');
        }
    };

    const currentPolicy = policies?.[0]; 

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-gray-900">Fine Rate Configuration</h1>
                <p className="text-gray-500 mt-1 text-sm">
                    Set per-library fine rates with effective dates. Overdue fines are calculated
                    retroactively — old rate for days before the change, new rate for days after.
                </p>
            </header>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <label className="block text-sm font-bold text-gray-700 mb-2">Select Library</label>
                <select
                    value={selectedLibraryId}
                    onChange={(e) => setSelectedLibraryId(e.target.value)}
                    className="w-full rounded-xl border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 text-sm py-3"
                >
                    <option value="">-- Choose a library --</option>
                    {libraries?.map((lib) => (
                        <option key={lib._id} value={lib._id}>{lib.name} ({lib.code})</option>
                    ))}
                </select>
                {librariesLoading && <p className="text-sm text-gray-400 mt-2">Loading libraries...</p>}
            </div>

            {selectedLibraryId && (
                <>
                    {currentPolicy && !currentPolicy.effectiveTo && (
                        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 flex items-center gap-4">
                            <div className="bg-indigo-600 rounded-full w-12 h-12 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                                $
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-indigo-800">Current Active Rate</p>
                                <p className="text-3xl font-extrabold text-indigo-900">
                                    ${currentPolicy.ratePerDay.toFixed(2)}<span className="text-base font-medium text-indigo-600">/day</span>
                                </p>
                                <p className="text-xs text-indigo-500 mt-0.5">
                                    Active since {format(new Date(currentPolicy.effectiveFrom), 'PPP')}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">
                            {currentPolicy ? 'Change Fine Rate' : 'Set Initial Fine Rate'}
                        </h2>
                        {currentPolicy && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
                                <strong>Retroactive calculation:</strong> Books already overdue will
                                accrue at the <em>current</em> rate (${currentPolicy.ratePerDay}/day) up to
                                the effective date, then at the <em>new</em> rate thereafter.
                                Old rate records are preserved — never deleted.
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">
                                        New Rate ($ per day)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={ratePerDay}
                                        onChange={(e) => setRatePerDay(e.target.value)}
                                        placeholder="e.g. 0.50"
                                        required
                                        className="w-full rounded-xl border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 text-sm py-3"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">
                                        Effective From
                                    </label>
                                    <input
                                        type="date"
                                        value={effectiveFrom}
                                        onChange={(e) => setEffectiveFrom(e.target.value)}
                                        required
                                        className="w-full rounded-xl border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 text-sm py-3"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isCreating || !ratePerDay}
                                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 shadow-lg shadow-indigo-100"
                            >
                                {isCreating ? 'Saving Policy...' : 'Save New Fine Policy'}
                            </button>
                        </form>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Rate History</h2>
                        {policiesLoading ? (
                            <p className="text-sm text-gray-400 animate-pulse">Loading history...</p>
                        ) : !policies || policies.length === 0 ? (
                            <p className="text-sm text-gray-500">No fine policies set for this library yet.</p>
                        ) : (
                            <div className="relative">
                                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-100" />
                                <div className="space-y-4">
                                    {policies.map((policy, i) => (
                                        <div key={policy._id} className="flex items-start gap-4 ml-10">
                                            <div className={`absolute left-3.5 w-3 h-3 rounded-full border-2 ${!policy.effectiveTo ? 'bg-indigo-600 border-indigo-300' : 'bg-gray-300 border-gray-200'}`} style={{ top: `${i * 76 + 6}px` }} />
                                            <div className={`flex-1 rounded-xl p-4 border text-sm ${!policy.effectiveTo ? 'border-indigo-200 bg-indigo-50' : 'border-gray-100 bg-gray-50'}`}>
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-gray-900 text-base">
                                                        ${policy.ratePerDay.toFixed(2)}/day
                                                    </span>
                                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${!policy.effectiveTo ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                                        {!policy.effectiveTo ? 'Active' : 'Expired'}
                                                    </span>
                                                </div>
                                                <p className="text-gray-500 mt-1">
                                                    From: <span className="font-medium text-gray-700">{format(new Date(policy.effectiveFrom), 'PPP')}</span>
                                                    {policy.effectiveTo && (
                                                        <> · To: <span className="font-medium text-gray-700">{format(new Date(policy.effectiveTo), 'PPP')}</span></>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default FineConfigurationPage;
