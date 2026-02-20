import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useImportBooksMutation, useResolveImportDuplicateMutation, NearDuplicate } from '../../../services/booksApi';
import { ApiError } from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ImportFormData {
    file: FileList;
}


const ImportBooksPage = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<ImportFormData>();
    const [importBooks, { isLoading }] = useImportBooksMutation();
    const [resolveDuplicate] = useResolveImportDuplicateMutation();
    const navigate = useNavigate();

    const [serverError, setServerError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [nearDuplicates, setNearDuplicates] = useState<NearDuplicate[]>([]);
    const [resolvingIndex, setResolvingIndex] = useState<number | null>(null);

    const onSubmit = async (data: ImportFormData) => {
        if (!data.file[0]) return;
        const file = data.file[0];

        try {
            setServerError(null);
            setSuccessMessage(null);
            setNearDuplicates([]);

            const response = await importBooks(file).unwrap();

            if (response.data?.nearDuplicates?.length > 0) {
                setNearDuplicates(response.data.nearDuplicates);
                setSuccessMessage(`Imported ${response.data.newBooks?.length || 0} books. Please review ${response.data.nearDuplicates.length} near-duplicates.`);
            } else {
                setSuccessMessage('All works imported successfully with no duplicates detected!');
                setTimeout(() => navigate('/books'), 2000);
            }
        } catch (err: unknown) {
            setServerError((err as ApiError)?.data?.message || 'Failed to import books');
        }
    };

    const handleResolve = async (index: number, resolution: 'SKIP' | 'MERGE' | 'CREATE_NEW') => {
        const dup = nearDuplicates[index];
        setResolvingIndex(index);

        try {
            await resolveDuplicate({
                csvRow: dup.csvRow,
                resolution,
                matchId: resolution === 'MERGE' ? dup.existingMatch._id : undefined
            }).unwrap();

            const updated = nearDuplicates.filter((_, i) => i !== index);
            setNearDuplicates(updated);

            if (updated.length === 0) {
                setSuccessMessage('All duplicates resolved!');
                setTimeout(() => navigate('/books'), 2000);
            }
        } catch (err: unknown) {
            setServerError((err as ApiError)?.data?.message || 'Failed to resolve duplicate');
        } finally {
            setResolvingIndex(null);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Bulk Import Catalog via CSV</h1>

            {serverError && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-3">
                    <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
                    {serverError}
                </div>
            )}

            {successMessage && (
                <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-center gap-3">
                    <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
                    {successMessage}
                </div>
            )}

            {nearDuplicates.length === 0 && (
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Upload Catalog File (.csv)</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-indigo-400 transition-colors bg-gray-50/50">
                                <div className="space-y-1 text-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <div className="flex text-sm text-gray-600 justify-center">
                                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 mx-auto px-2">
                                            <span>Select a file</span>
                                            <input type="file" accept=".csv" {...register('file', { required: 'Please select a CSV file' })} className="sr-only" />
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500">CSV up to 10MB</p>
                                </div>
                            </div>
                            {errors.file && <p className="text-red-500 text-xs mt-2 font-medium">{errors.file.message as string}</p>}
                        </div>

                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-sm text-indigo-900">
                            <p className="font-bold flex items-center gap-2 mb-2">
                                <span className="text-indigo-600">ℹ️</span> Required CSV Columns:
                            </p>
                            <code className="block bg-white/60 p-2 rounded text-indigo-800 font-mono text-xs">
                                title, originalAuthor, genres, isbn, format, publisher, publicationYear, language, replacementCost, copyCode, libraryId, condition
                            </code>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all"
                        >
                            {isLoading ? 'Analyzing File...' : 'Upload & Scan Catalog'}
                        </button>
                    </form>
                </div>
            )}

            {nearDuplicates.length > 0 && (
                <div className="space-y-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 mb-6">
                        <h3 className="text-lg font-bold text-yellow-800">Review Near-Duplicates</h3>
                        <p className="text-sm text-yellow-700 mt-1">
                            We found {nearDuplicates.length} records in your CSV that closely match existing Works in the database.
                            Please review them to avoid adding duplicate catalog entries.
                        </p>
                    </div>

                    {nearDuplicates.map((dup, idx) => (
                        <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                                <div className="p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded">Importing from CSV</span>
                                    </div>
                                    <p className="text-sm text-gray-500 font-mono break-all bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        Row Data: {JSON.stringify(dup.csvRow)}
                                    </p>
                                </div>

                                <div className="p-6 bg-indigo-50/30">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded">Existing Match</span>
                                        <span className="text-xs font-bold text-indigo-600 bg-white px-2 rounded-full border border-indigo-200">
                                            {Math.round(dup.similarityScore * 100)}% Match
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-gray-900">{dup.existingMatch.title}</h4>
                                    <p className="text-sm text-gray-600 mt-1">By {dup.existingMatch.originalAuthor}</p>
                                    <p className="text-xs text-gray-400 mt-2 font-mono">ID: {dup.existingMatch._id}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <button
                                    disabled={resolvingIndex === idx}
                                    onClick={() => handleResolve(idx, 'MERGE')}
                                    className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    Merge (Add Edition/Copy)
                                </button>
                                <button
                                    disabled={resolvingIndex === idx}
                                    onClick={() => handleResolve(idx, 'CREATE_NEW')}
                                    className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    It's Different (Create New)
                                </button>
                                <button
                                    disabled={resolvingIndex === idx}
                                    onClick={() => handleResolve(idx, 'SKIP')}
                                    className="px-4 py-2 border border-red-200 rounded-lg shadow-sm text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                                >
                                    Skip Row (Do Nothing)
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImportBooksPage;
