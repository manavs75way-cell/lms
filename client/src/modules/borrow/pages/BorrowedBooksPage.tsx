

import { useGetMyBorrowsQuery, useReturnBookMutation } from '../../../services/borrowApi';
import { format, isAfter } from 'date-fns';
import React, { useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '../../../context/ToastContext';
import {
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { BookOpenIcon } from 'lucide-react';

const returnBookSchema = z.object({
    condition: z.enum(['NEW', 'GOOD', 'FAIR', 'DAMAGED']),
    damageNotes: z.string().optional(),
});

type ReturnBookForm = z.infer<typeof returnBookSchema>;

const BorrowedBooksPage = React.memo(() => {
    const { data: borrows, isLoading, error } = useGetMyBorrowsQuery();
    const [returnBook, { isLoading: isReturning }] = useReturnBookMutation();
    const [selectedBorrowId, setSelectedBorrowId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');

    const { success, error: showError } = useToast();
    const { register, handleSubmit, reset, formState: { errors } } = useForm<ReturnBookForm>({
        resolver: zodResolver(returnBookSchema),
        defaultValues: { condition: 'GOOD', damageNotes: '' },
    });

    const { current, history } = useMemo(() => {
        const data = borrows || [];
        return {
            current: data.filter(b => b.status === 'BORROWED'),
            history: data.filter(b => b.status === 'RETURNED'),
        };
    }, [borrows]);

    const onSubmit = useCallback(async (data: ReturnBookForm) => {
        if (!selectedBorrowId) return;
        try {
            await returnBook({
                id: selectedBorrowId,
                condition: data.condition,
                damageNotes: data.damageNotes,
            }).unwrap();
            success('Book returned successfully!');
            setSelectedBorrowId(null);
        } catch (err) {
            showError('Failed to return book');
        }
    }, [selectedBorrowId, returnBook, success, showError]);

    if (isLoading) return <div className="p-20 text-center animate-pulse text-indigo-600">Loading your bookshelf...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Borrows</h1>
                <p className="text-gray-500 mt-1">Manage your active rentals and viewing history.</p>
            </header>

            {/* Tabs Navigation */}
            <div className="flex space-x-1 bg-gray-200/50 p-1 rounded-xl w-fit mb-8">
                <button
                    onClick={() => setActiveTab('current')}
                    className={`px-6 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'current' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Active ({current.length})
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-6 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'history' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    History
                </button>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 gap-6">
                {(activeTab === 'current' ? current : history).length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpenIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">No books found in this section.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(activeTab === 'current' ? current : history).map((borrow) => (
                            <BorrowCard
                                key={borrow._id}
                                borrow={borrow}
                                onReturn={() => {
                                    setSelectedBorrowId(borrow._id);
                                    reset();
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Return Modal (Condensed) */}
            {selectedBorrowId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                        <div className="bg-indigo-600 p-6 text-white">
                            <h3 className="text-xl font-bold">Return Book</h3>
                            <p className="text-indigo-100 text-sm mt-1">Please confirm the current state of the book.</p>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Book Condition</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['NEW', 'GOOD', 'FAIR', 'DAMAGED'].map((c) => (
                                        <label key={c} className="cursor-pointer">
                                            <input type="radio" value={c} {...register('condition')} className="peer sr-only" />
                                            <div className="p-3 text-center rounded-xl border-2 border-gray-100 peer-checked:border-indigo-600 peer-checked:bg-indigo-50 transition-all text-xs font-bold text-gray-600 peer-checked:text-indigo-700">
                                                {c}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Notes (Optional)</label>
                                <textarea
                                    {...register('damageNotes')}
                                    className="w-full rounded-xl border-gray-200 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                    rows={3}
                                    placeholder="Any new scratches or marks?"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setSelectedBorrowId(null)} className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition">Cancel</button>
                                <button type="submit" disabled={isReturning} className="flex-1 py-3 text-sm font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-200">
                                    {isReturning ? 'Processing...' : 'Confirm Return'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
});

import { Borrow } from '../../../services/borrowApi';

interface BorrowCardProps {
    borrow: Borrow;
    onReturn: () => void;
}

const BorrowCard = ({ borrow, onReturn }: BorrowCardProps) => {
    const isOverdue = borrow.status === 'BORROWED' && isAfter(new Date(), new Date(borrow.dueDate));

    return (
        <div className={`bg-white rounded-2xl border ${isOverdue ? 'border-red-200' : 'border-gray-100'} shadow-sm overflow-hidden flex flex-col`}>
            <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${borrow.status === 'BORROWED' ? (isOverdue ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600') : 'bg-gray-100 text-gray-500'
                        }`}>
                        {isOverdue ? 'Overdue' : borrow.status}
                    </span>
                    {borrow.fine > 0 && (
                        <span className="text-red-600 font-bold text-sm bg-red-50 px-2 py-1 rounded-md">Fine: ${borrow.fine}</span>
                    )}
                </div>
                <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{borrow.book?.title}</h3>
                <p className="text-sm text-gray-500 mb-4">by {borrow.book?.author}</p>

                <div className="space-y-2 py-3 border-t border-gray-50">
                    <div className="flex items-center text-xs text-gray-500">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        <span>Borrowed: {format(new Date(borrow.borrowDate), 'MMM d, yyyy')}</span>
                    </div>
                    <div className={`flex items-center text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                        <ArrowPathIcon className="h-4 w-4 mr-2" />
                        <span>Due Date: {format(new Date(borrow.dueDate), 'MMM d, yyyy')}</span>
                    </div>
                </div>
            </div>
            {borrow.status === 'BORROWED' && (
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <button
                        onClick={onReturn}
                        className="w-full py-2 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm"
                    >
                        Return Book
                    </button>
                </div>
            )}
        </div>
    );
};

export default BorrowedBooksPage;