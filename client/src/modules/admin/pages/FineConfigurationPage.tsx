import React, { useState, useEffect } from 'react';
import { useGetFineConfigQuery, useUpdateFineConfigMutation } from '../../../services/configApi';
import { useToast } from '../../../context/ToastContext';

const FineConfigurationPage = () => {
    const { data: config, isLoading } = useGetFineConfigQuery();
    const [updateFineConfig, { isLoading: isUpdating }] = useUpdateFineConfigMutation();
    const { success: showSuccess, error: showError } = useToast();
    const [rate, setRate] = useState<number>(10);

    useEffect(() => {
        if (config) {
            setRate(config.value);
        }
    }, [config]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateFineConfig({ value: rate }).unwrap();
            showSuccess('Fine rate updated successfully');
        } catch (err) {
            showError('Failed to update fine rate');
        }
    };

    if (isLoading) return <div>Loading config...</div>;

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">Fine Configuration</h1>
            <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Late Fee Per Day ($)
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={rate}
                            onChange={(e) => setRate(parseFloat(e.target.value))}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        <p className="mt-2 text-sm text-gray-500">
                            This amount will be charged for each day a book is overdue.
                        </p>
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isUpdating}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {isUpdating ? 'Saving...' : 'Save Configuration'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FineConfigurationPage;
