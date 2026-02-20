import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    useGetWorkQuery,
    useGetEditionsQuery,
    useGetCopiesQuery,
} from '../../../services/booksApi';
import { useGetLibrariesQuery } from '../../../services/libraryApi';
import { useBorrowBookMutation } from '../../../services/borrowApi';
import { useCreateReservationMutation } from '../../../services/reservationApi';
import { useGetChildAccountsQuery } from '../../../services/authApi';
import { useToast } from '../../../context/ToastContext';
import { ApiError } from '../../../services/api';

const EditionRow: React.FC<{ editionId: string }> = ({ editionId }) => {
    const { data: copies, isLoading } = useGetCopiesQuery(editionId);
    const { data: libraries } = useGetLibrariesQuery();
    const { data: children } = useGetChildAccountsQuery();
    const hasChildren = (children?.length ?? 0) > 0;
    const [borrowBook, { isLoading: isBorrowing }] = useBorrowBookMutation();
    const [reserveEdition, { isLoading: isReserving }] = useCreateReservationMutation();
    const { success: showSuccess, error: showError } = useToast();
    const [selectedLibraryId, setSelectedLibraryId] = useState<string>('');
    const [selectedChildId, setSelectedChildId] = useState<string>('');

    if (isLoading) return <div className="text-sm text-gray-500 py-2">Loading copies...</div>;
    if (!copies || copies.length === 0) return <div className="text-sm text-gray-500 py-2">No physical copies available for this edition.</div>;

    const handleBorrow = async (copyId: string, libId: string) => {
        try {
            await borrowBook({
                copyId,
                libraryId: libId,
                onBehalfOfUserId: selectedChildId || undefined,
            }).unwrap();
            const forWho = selectedChildId
                ? ` for ${children?.find(c => c._id === selectedChildId)?.name}`
                : '';
            showSuccess(`Successfully borrowed copy${forWho}!`);
        } catch (err) {
            showError((err as ApiError).data?.message || 'Failed to borrow copy');
        }
    };

    const handleReserve = async () => {
        try {
            await reserveEdition({ editionId, preferredLibraryId: selectedLibraryId || undefined }).unwrap();
            showSuccess('Successfully reserved edition!');
        } catch (err) {
            showError((err as ApiError).data?.message || 'Failed to reserve edition');
        }
    };

    const availableCopies = copies.filter(c => c.status === 'AVAILABLE');

    return (
        <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-100">
            <h5 className="text-sm font-bold text-gray-900 mb-3">Available Copies ({availableCopies.length})</h5>

            {availableCopies.length > 0 ? (
                <div className="flex flex-wrap gap-4">
                    {availableCopies.map(copy => {
                        const lib = (typeof copy.currentLibrary === 'object' ? copy.currentLibrary : libraries?.find(l => l._id === copy.currentLibrary));
                        const owningLib = (typeof copy.owningLibrary === 'object' ? copy.owningLibrary : libraries?.find(l => l._id === copy.owningLibrary));

                        return (
                            <div key={copy._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between group flex-1 min-w-[280px]">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-sm font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md inline-block">{lib?.name || 'Unknown Library'}</p>
                                        <p className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">Cond: <span className="font-semibold text-gray-700">{copy.condition}</span></p>
                                    </div>
                                    <p className="text-xs text-gray-500 font-mono mb-3 bg-gray-50 p-1.5 rounded border border-gray-100 flex items-center justify-center">ID: {copy.copyCode}</p>

                                    <div className="flex flex-col sm:flex-row items-center gap-4 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100 justify-center">
                                        {copy.barcodeUrl && (
                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">1D Barcode</span>
                                                <img src={`http://localhost:5000${copy.barcodeUrl}`} alt="Barcode" className="h-10 object-contain mix-blend-multiply" />
                                            </div>
                                        )}
                                        {copy.barcodeUrl && copy.qrCodeUrl && <div className="w-px h-12 bg-gray-200 hidden sm:block"></div>}
                                        {copy.qrCodeUrl && (
                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">QR Deep-Link</span>
                                                <img src={`http://localhost:5000${copy.qrCodeUrl}`} alt="QR Code" className="h-14 w-14 object-contain mix-blend-multiply" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {hasChildren && (
                                    <div className="mt-2">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Borrow for</label>
                                        <select
                                            value={selectedChildId}
                                            onChange={(e) => setSelectedChildId(e.target.value)}
                                            className="w-full text-xs border border-gray-200 rounded-lg py-1.5 px-2 focus:ring-2 focus:ring-indigo-300 focus:outline-none bg-white"
                                        >
                                            <option value="">Myself</option>
                                            {children?.map((child) => (
                                                <option key={child._id} value={child._id}>{child.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <button
                                    onClick={() => handleBorrow(copy._id, lib?._id || owningLib?._id || '')}
                                    disabled={isBorrowing}
                                    className="mt-3 w-full py-1.5 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                                >
                                    {selectedChildId ? `Borrow for ${children?.find(c => c._id === selectedChildId)?.name?.split(' ')[0]}` : 'Borrow Copy'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-start bg-orange-50 p-4 rounded-md border border-orange-100">
                    <p className="text-sm text-orange-800 mb-3">All copies of this edition are currently checked out.</p>
                    <div className="flex gap-2 items-center w-full max-w-sm">
                        <select
                            value={selectedLibraryId}
                            onChange={(e) => setSelectedLibraryId(e.target.value)}
                            className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                        >
                            <option value="">No Preferred Library</option>
                            {libraries?.map((lib) => (
                                <option key={lib._id} value={lib._id}>{lib.name}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleReserve}
                            disabled={isReserving}
                            className="whitespace-nowrap py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-sm font-medium transition disabled:opacity-50"
                        >
                            Reserve Edition
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const WorkDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const isValidId = id && id !== 'undefined' && id !== 'null';

    const { data: work, isLoading: workLoading, error: workError } = useGetWorkQuery(id || '', { skip: !isValidId });
    const { data: editions, isLoading: editionsLoading } = useGetEditionsQuery(id || '', { skip: !isValidId });

    if (!isValidId) return (
        <div className="text-center py-20 bg-red-50 rounded-xl border border-red-100 m-4">
            <p className="text-red-600 font-medium">Invalid book reference.</p>
            <button onClick={() => navigate('/books')} className="mt-4 text-indigo-600 underline">Back to Catalog</button>
        </div>
    );

    if (workLoading) return (
        <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-pulse text-indigo-600 font-medium">Loading catalog details...</div>
        </div>
    );

    if (workError || !work) return (
        <div className="text-center py-20 bg-red-50 rounded-xl border border-red-100 m-4">
            <p className="text-red-600 font-medium">Work not found.</p>
            <button onClick={() => navigate('/books')} className="mt-4 text-indigo-600 underline">Back to Catalog</button>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <button onClick={() => navigate('/books')} className="mb-6 text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-1 transition">
                <span>&larr;</span> Back to Catalog
            </button>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                <div className="md:flex">
                    <div className="md:w-1/3 bg-gray-50 flex-shrink-0">
                        {work.coverImageUrl ? (
                            <img
                                src={work.coverImageUrl.startsWith('http') ? work.coverImageUrl : `http://localhost:5000${work.coverImageUrl}`}
                                alt={work.title}
                                className="w-full h-full object-cover aspect-[3/4]"
                            />
                        ) : (
                            <div className="w-full h-full aspect-[3/4] flex justify-center items-center text-gray-400">
                                <span className="text-6xl">📖</span>
                            </div>
                        )}
                    </div>
                    <div className="p-8 md:w-2/3 flex flex-col justify-center">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-full">
                                {work.genres?.join(', ') || 'Various'}
                            </span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">{work.title}</h1>
                        <p className="text-xl text-gray-600 mb-6 font-medium">by {work.originalAuthor}</p>

                        {work.description && (
                            <div className="prose prose-sm text-gray-600 mb-6">
                                <p>{work.description}</p>
                            </div>
                        )}

                        <div className="text-sm text-gray-500 mt-auto pt-6 border-t border-gray-100">
                            <strong>{editions?.length || 0}</strong> registered editions in the consortium.
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Available Editions</h3>

                {editionsLoading ? (
                    <div className="text-center py-10"><span className="animate-pulse text-indigo-600">Loading editions...</span></div>
                ) : editions && editions.length > 0 ? (
                    <div className="space-y-6">
                        {editions.map(edition => (
                            <div key={edition._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="px-2.5 py-1 bg-gray-100 text-gray-800 text-xs font-bold uppercase rounded shadow-sm">
                                                {edition.format}
                                            </span>
                                            <span className="text-sm font-medium text-gray-500">Published {edition.publicationYear}</span>
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-900">{edition.publisher} Edition</h4>
                                        <div className="text-sm text-gray-500 mt-2 grid grid-cols-2 gap-x-8 gap-y-1">
                                            <div><span className="font-medium text-gray-700">ISBN:</span> {edition.isbn}</div>
                                            <div><span className="font-medium text-gray-700">Language:</span> {edition.language}</div>
                                        </div>
                                    </div>

                                </div>

                                <EditionRow editionId={edition._id} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                        <p className="text-gray-500 font-medium">No editions have been added to this work yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkDetailsPage;
