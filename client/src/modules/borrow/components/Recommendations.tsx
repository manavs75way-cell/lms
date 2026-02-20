import React, { useMemo } from 'react';
import { useGetRecommendationsQuery } from '../../../services/borrowApi';
import { ChevronRightIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';

const Recommendations = React.memo(() => {
    const { data: recommendations, isLoading } = useGetRecommendationsQuery();

    const recommendedItems = useMemo(() => {
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

    if (!recommendedItems || recommendedItems.length === 0) return null;

    return (
        <div className="py-6 px-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <SparklesIcon className="h-6 w-6 text-purple-600" />
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Curated for You</h2>
                </div>
                <Link to="/books" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center bg-indigo-50 px-3 py-1.5 rounded-full transition-colors">
                    Browse all <ChevronRightIcon className="h-4 w-4 ml-1" />
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {recommendedItems.map((item, index) => (
                    <Link
                        key={item.edition._id + index}
                        to={`/books/works/${item.edition.work._id}`}
                        className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                    >
                        <div className="flex p-4 gap-4 flex-col">
                            <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                {item.edition.coverImageUrl ? (
                                    <img
                                        src={item.edition.coverImageUrl.startsWith('http') ? item.edition.coverImageUrl : `http://localhost:5000${item.edition.coverImageUrl}`}
                                        alt={item.edition.work.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-2 text-center bg-gray-50">
                                        <span className="text-3xl mb-2">📖</span>
                                        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">No Cover</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0 py-1">
                                <h3 className="text-base font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                                    {item.edition.work.title}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1 line-clamp-1">by {item.edition.work.originalAuthor}</p>

                                {item.edition.work.genres && item.edition.work.genres.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider border border-indigo-100">
                                            {item.edition.work.genres[0]}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-auto bg-gradient-to-br from-indigo-50/80 to-purple-50/80 px-4 py-3 border-t border-indigo-100/30">
                            <div className="flex items-start gap-2">
                                <span className="text-sm mt-0.5">💡</span>
                                <p className="text-xs font-semibold text-indigo-900 leading-relaxed">
                                    {item.explanation}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
});

export default Recommendations;
