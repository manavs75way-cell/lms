


import React, { useMemo } from 'react';
import { useToast } from '../../../context/ToastContext';
import { ApiError } from '../../../services/api';
import { useGetBooksQuery, useDeleteBookMutation } from '../../../services/booksApi';
import { useBorrowBookMutation, useGetMyBorrowsQuery } from '../../../services/borrowApi';
import { useCreateReservationMutation } from '../../../services/reservationApi';
import { useGetMeQuery } from '../../../services/authApi';
import { Link } from 'react-router-dom';

const BookListPage = () => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const { data: books, isLoading, error } = useGetBooksQuery(searchTerm); // Pass searchTerm
    const { data: user } = useGetMeQuery();
    const [deleteBook] = useDeleteBookMutation();
    const [borrowBook, { isLoading: isBorrowing }] = useBorrowBookMutation();
    const { data: myBorrows } = useGetMyBorrowsQuery(undefined, { skip: !user });
    const [createReservation, { isLoading: isReserving }] = useCreateReservationMutation();
    const { success: showSuccess, error: showError } = useToast();

    const sortedBooks = useMemo(() => {
        return books ? [...books].sort((a, b) => a.title.localeCompare(b.title)) : [];
    }, [books]);

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this book?')) {
            try {
                await deleteBook(id).unwrap();
                showSuccess('Book deleted successfully');
            } catch (err) {
                showError('Failed to delete book');
            }
        }
    };

    const handleBorrow = async (bookId: string) => {
        try {
            await borrowBook(bookId).unwrap();
            showSuccess('Book borrowed successfully!');
        } catch (err: unknown) {
            showError((err as ApiError).data?.message || 'Failed to borrow book');
        }
    };

    const handleReserve = async (bookId: string) => {
        try {
            await createReservation({ bookId }).unwrap();
            showSuccess('Book reserved successfully!');
        } catch (err: unknown) {
            showError((err as ApiError).data?.message || 'Failed to reserve book');
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
            {/* Header Section */}
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="flex-1 min-w-0">
                    <h2 className="text-3xl font-bold leading-7 text-gray-900 sm:truncate">
                        Library Collection
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        {sortedBooks.length} books available in the catalog.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="mt-4 md:mt-0 md:ml-4 flex-1 max-w-md">
                    <div className="relative rounded-md shadow-sm">
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
                </div>

                <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
                    {isStaff && (
                        <>
                            <Link to="/books/import" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition">
                                Import CSV
                            </Link>
                            <Link to="/books/add" className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition">
                                Add New Book
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* Books Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedBooks.map((book) => (
                    <div key={book._id} className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col">

                        {/* Book Cover Area */}
                        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                            {book.coverImageUrl ? (
                                <img src={book.coverImageUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                    <span className="text-4xl">📖</span>
                                    <span className="text-xs mt-2 font-medium">No Cover Available</span>
                                </div>
                            )}

                            {/* Availability Badge */}
                            <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${book.availableCopies > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                {book.availableCopies > 0 ? 'Available' : 'Out of Stock'}
                            </div>
                        </div>

                        {/* Details Area */}
                        <div className="p-5 flex-grow flex flex-col">
                            <div className="mb-2">
                                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">{book.genre}</p>
                                <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{book.title}</h3>
                                <p className="text-sm text-gray-600">by {book.author}</p>
                            </div>

                            <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                                <div className="text-xs text-gray-500">
                                    <span className="block font-medium text-gray-900">{book.availableCopies} of {book.totalCopies}</span>
                                    <span>copies left</span>
                                </div>
                                {book.barcodeUrl && (
                                    <img src={`http://localhost:5000${book.barcodeUrl}`} alt="barcode" className="h-6 opacity-60 hover:opacity-100 transition" />
                                )}
                            </div>

                            {/* Actions Area */}
                            <div className="mt-5 grid grid-cols-1 gap-2">
                                {!isStaff ? (
                                    book.availableCopies > 0 ? (
                                        (() => {
                                            if (!myBorrows) return null;
                                            const isBorrowed = myBorrows.some((b) => b.book._id === book._id && b.status === 'BORROWED');
                                            return (
                                                <button
                                                    onClick={() => handleBorrow(book._id)}
                                                    disabled={isBorrowing || isBorrowed}
                                                    className={`w-full py-2 rounded-lg text-sm font-semibold transition ${isBorrowed
                                                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50'
                                                        }`}
                                                >
                                                    {isBorrowed ? 'Already Borrowed' : 'Borrow Now'}
                                                </button>
                                            );
                                        })()
                                    ) : (
                                        <button
                                            onClick={() => handleReserve(book._id)}
                                            disabled={isReserving}
                                            className="w-full py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-semibold hover:bg-orange-200 disabled:opacity-50 transition"
                                        >
                                            Reserve Copy
                                        </button>
                                    )
                                ) : (
                                    <div className="flex gap-2">
                                        <Link to={`/books/edit/${book._id}`} className="flex-1 text-center py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition">
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(book._id)}
                                            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default React.memo(BookListPage);