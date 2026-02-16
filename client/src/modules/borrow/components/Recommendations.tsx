import React, { useMemo } from 'react';
import { useGetRecommendationsQuery } from '../../../services/borrowApi';
import {  ChevronRightIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';

const Recommendations = React.memo(() => {
    const { data: recommendations, isLoading } = useGetRecommendationsQuery();

    const recommendedBooks = useMemo(() => {
        return recommendations || [];
    }, [recommendations]);

    if (isLoading) {
        return (
            <div className="p-8">
                <div className="h-6 w-48 bg-gray-200 animate-pulse rounded mb-6"></div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse rounded-2xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (!recommendedBooks || recommendedBooks.length === 0) return null;

    return (
        <div className="py-6 px-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Recommended for You</h2>
                </div>
                <Link to="/books" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center">
                    Browse all <ChevronRightIcon className="h-4 w-4 ml-1" />
                </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {recommendedBooks.map((book) => (
                    <Link 
                        key={book._id} 
                        to={`/books/${book._id}`} 
                        className="group block"
                    >
                        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 shadow-sm border border-gray-100 transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
                            {book.coverImageUrl ? (
                                <img
                                    src={book.coverImageUrl}
                                    alt={book.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                                    <span className="text-2xl mb-2">📖</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest">No Cover</span>
                                </div>
                            )}
                            
                            
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                <span className="text-white text-xs font-bold py-1 px-3 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                                    View Details
                                </span>
                            </div>
                        </div>

                        <div className="mt-3 px-1">
                            <h3 className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                {book.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{book.author}</p>
                            
                            {book.genre && (
                                <span className="inline-block mt-2 text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-tighter">
                                    {book.genre}
                                </span>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
});

export default Recommendations;
