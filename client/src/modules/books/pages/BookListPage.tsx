import React, { useMemo } from 'react';
import { useToast } from '../../../context/ToastContext';
import { useSearchCatalogQuery, useDeleteWorkMutation } from '../../../services/booksApi';
import { useGetLibrariesQuery } from '../../../services/libraryApi';
import { useGetMeQuery } from '../../../services/authApi';
import { Link } from 'react-router-dom';

const BookListPage = () => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedLibraryId, setSelectedLibraryId] = React.useState('');

    const { data: catalogResults, isLoading, error } = useSearchCatalogQuery(searchTerm || undefined);
    const { data: libraries } = useGetLibrariesQuery();
    const { data: user } = useGetMeQuery();
    const [deleteWork] = useDeleteWorkMutation();
    const { success: showSuccess, error: showError } = useToast();

    const sortedCatalog = useMemo(() => {
        let results = catalogResults ? [...catalogResults] : [];
        if (selectedLibraryId) {
            results = results.filter(result =>
                result.editions.some(ed => ed.totalCopies > 0)
            );
        }
        return results.sort((a, b) => a.work.title.localeCompare(b.work.title));
    }, [catalogResults, selectedLibraryId]);

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this work and all its editions/copies?')) {
            try {
                await deleteWork(id).unwrap();
                showSuccess('Work deleted successfully');
            } catch (err) {
                showError('Failed to delete work');
            }
        }
    };

    if (isLoading) return (
        <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-pulse text-indigo-600 font-medium">Opening the archives...</div>
        </div>
    );

    if (error) return (
        <div className="text-center py-20 bg-red-50 rounded-xl border border-red-100 m-4">
            <p className="text-red-600 font-medium">Error loading library collection.</p>
        </div>
    );

    const isStaff = user?.role === 'LIBRARIAN' || user?.role === 'ADMIN';

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="md:flex md:items-center md:justify-between mb-8 flex-wrap gap-4">
                <div className="flex-1 min-w-0">
                    <h2 className="text-3xl font-bold leading-7 text-gray-900 sm:truncate">
                        Library Collection
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        {sortedCatalog.length} works available in the catalog.
                    </p>
                </div>

                <div className="flex flex-1 flex-col md:flex-row gap-4 items-center justify-end">
                    <div className="w-full max-w-sm relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="text-gray-500 sm:text-sm">🔍</span>
                        </div>
                        <input
                            type="text"
                            className="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2"
                            placeholder="Search by title, author, or ISBN..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="w-full max-w-[16rem]">
                        <select
                            value={selectedLibraryId}
                            onChange={(e) => setSelectedLibraryId(e.target.value)}
                            className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="">All Consortium Libraries</option>
                            {libraries?.map((lib) => (
                                <option key={lib._id} value={lib._id}>{lib.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-2">
                        {isStaff && (
                            <>
                                <Link to="/books/import" className="whitespace-nowrap inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition">
                                    Import CSV
                                </Link>
                                <Link to="/books/add" className="whitespace-nowrap inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition">
                                    Add New Work
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedCatalog.map((result) => {
                    const totalAvailable = result.editions?.reduce((sum, ed) => sum + ed.availableCopies, 0) || 0;
                    const totalCopies = result.editions?.reduce((sum, ed) => sum + ed.totalCopies, 0) || 0;

                    return (
                        <div key={result.work._id} className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col">
                            <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 flex-shrink-0">
                                {result.work.coverImageUrl ? (
                                    <img
                                        src={result.work.coverImageUrl.startsWith('http') ? result.work.coverImageUrl : `http://localhost:5000${result.work.coverImageUrl}`}
                                        alt={result.work.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                        <span className="text-4xl shadow-sm">📖</span>
                                        <span className="text-xs mt-2 font-medium">No Cover Available</span>
                                    </div>
                                )}

                                <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${totalAvailable > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {totalAvailable > 0 ? 'Available' : 'Out of Stock'}
                                </div>
                            </div>

                            <div className="p-5 flex-grow flex flex-col">
                                <div className="mb-2">
                                    <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                                        {result.work.genres?.join(', ') || 'Various'}
                                    </p>
                                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mt-1">{result.work.title}</h3>
                                    <p className="text-sm text-gray-600 mt-1">by {result.work.originalAuthor}</p>
                                </div>

                                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                                    <div className="text-xs text-gray-500">
                                        <span className="block font-medium text-gray-900">{totalAvailable} of {totalCopies}</span>
                                        <span>copies left across {result.editions?.length || 0} editions</span>
                                    </div>
                                </div>

                                <div className="mt-5 grid grid-cols-1 gap-2">
                                    <Link to={`/books/works/${result.work._id}`} className="w-full text-center py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition">
                                        View Editions
                                    </Link>
                                    {isStaff && (
                                        <div className="flex gap-2">
                                            <Link to={`/books/works/edit/${result.work._id}`} className="flex-1 text-center py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition">
                                                Edit Work
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(result.work._id)}
                                                className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {sortedCatalog.length === 0 && !isLoading && (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 mt-8">
                    <p className="text-gray-500 font-medium">No results found for your search.</p>
                </div>
            )}
        </div>
    );
};

export default React.memo(BookListPage);