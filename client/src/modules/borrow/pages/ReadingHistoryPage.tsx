import { useGetReadingHistoryQuery } from '../../../services/borrowApi';
import { format } from 'date-fns';
import { BookOpenIcon, CalendarIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';


const ReadingHistoryPage = () => {
    const { data: history, isLoading, error } = useGetReadingHistoryQuery();

    if (isLoading) return (
        <div className="max-w-4xl mx-auto p-8 animate-pulse">
            <div className="h-8 w-64 bg-gray-200 rounded mb-8"></div>
            {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-100 rounded-xl mb-4"></div>
            ))}
        </div>
    );

    if (error) return (
        <div className="max-w-4xl mx-auto p-12 text-center text-red-500 bg-red-50 rounded-3xl border border-red-100 mt-10">
            <p className="font-bold">Oops! We couldn't load your history.</p>
            <p className="text-sm">Try refreshing the page in a moment.</p>
        </div>
    );

    const totalBooks = history?.length || 0;

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            {/* Stats Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Reading Journey</h1>
                    <p className="text-gray-500 mt-1">A timeline of every world you've visited.</p>
                </div>
                <div className="bg-indigo-600 text-white px-6 py-3 rounded-2xl shadow-lg shadow-indigo-100 flex items-center gap-4">
                    <div className="bg-white/20 p-2 rounded-lg">
                        <CheckBadgeIcon className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs uppercase font-black tracking-widest text-indigo-100">Total Read</p>
                        <p className="text-2xl font-bold leading-none">{totalBooks}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {!history || history.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <BookOpenIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">Your history is a blank page.</p>
                        <p className="text-sm text-gray-400">Start borrowing to build your journey!</p>
                    </div>
                ) : (
                    history.map((record, index) => (
                        <div
                            key={record._id}
                            className="group relative bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all duration-300 flex items-center gap-6"
                        >
                            {index !== history.length - 1 && (
                                <div className="absolute left-10 top-20 bottom-[-24px] w-0.5 bg-gray-100 -z-10 hidden md:block" />
                            )}

                            <div className="flex-shrink-0 w-16 h-22 md:w-20 md:h-28 bg-gray-100 rounded-lg overflow-hidden shadow-sm border border-gray-50">
                                {record.book?.coverImageUrl ? (
                                    <img
                                        src={record.book.coverImageUrl}
                                        alt={record.book.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <BookOpenIcon className="h-8 w-8" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                                    {record.book?.title}
                                </h3>
                                <p className="text-sm text-gray-500 font-medium">by {record.book?.author}</p>

                                <div className="mt-3 flex flex-wrap gap-y-2 gap-x-4">
                                    <div className="flex items-center text-xs text-gray-400">
                                        <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
                                        Borrowed: {format(new Date(record.borrowDate), 'MMM d, yyyy')}
                                    </div>
                                    {record.returnDate && (
                                        <div className="flex items-center text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                                            <CheckBadgeIcon className="h-3.5 w-3.5 mr-1.5" />
                                            Returned: {format(new Date(record.returnDate), 'MMM d')}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="hidden sm:block">
                                <button className="p-2 text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
                                    <ChevronRightIcon className="h-6 w-6" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const ChevronRightIcon = ({ className }: { className: string }) => (
    <img src="/ChevronRightIcon.svg" alt="Chevron Right" className={className} />
);

export default ReadingHistoryPage;