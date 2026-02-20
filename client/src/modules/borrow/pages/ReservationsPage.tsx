
import { useGetMyReservationsQuery, useCancelReservationMutation } from '../../../services/reservationApi';
import { useToast } from '../../../context/ToastContext';
import { format, differenceInDays } from 'date-fns';
import { ArrowTrendingUpIcon, ClockIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline';

const ReservationsPage = () => {
    const { data: reservations, isLoading, error } = useGetMyReservationsQuery();
    const [cancelReservation, { isLoading: isCanceling }] = useCancelReservationMutation();
    const { success, error: showError } = useToast();

    if (isLoading) return <div className="p-20 text-center text-indigo-600 animate-pulse font-medium">Loading reservations...</div>;
    if (error) return <div className="p-20 text-center text-red-500">Failed to load reservations.</div>;

    const handleCancel = async (id: string) => {
        if (confirm('Are you sure you want to cancel this reservation?')) {
            try {
                await cancelReservation(id).unwrap();
                success('Reservation canceled successfully.');
            } catch (err) {
                showError('Failed to cancel reservation.');
            }
        }
    };

    const pending = reservations?.filter(r => r.status === 'PENDING') || [];
    const past = reservations?.filter(r => r.status !== 'PENDING') || [];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <header className="mb-8 border-b pb-6">
                <h1 className="text-3xl font-bold text-gray-900">My Reservations</h1>
                <p className="text-gray-600 mt-2">Track your place in line and monitor priority upgrades.</p>
            </header>

            <div className="mb-12">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Active Queue</h3>

                {pending.length === 0 ? (
                    <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center">
                        <p className="text-gray-500 font-medium">You have no active reservations.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {pending.map(reservation => {
                            const daysWaiting = differenceInDays(new Date(), new Date(reservation.createdAt));
                            const libraryName = typeof reservation.preferredLibrary === 'object' ? reservation.preferredLibrary.name : 'Any Available Library';

                            return (
                                <div key={reservation._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                                    <div className="p-5 flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="inline-block px-2.5 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold uppercase rounded shadow-sm">
                                                {reservation.status}
                                            </span>
                                            {reservation.priorityBoostedAt && (
                                                <span className="inline-flex items-center text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded">
                                                    <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
                                                    Boosted
                                                </span>
                                            )}
                                        </div>

                                        <h4 className="text-lg font-bold text-gray-900 line-clamp-2 mt-1">
                                            {reservation.edition.work?.title || 'Unknown Title'}
                                        </h4>
                                        <div className="text-sm font-medium text-gray-500 mt-1 mb-4 flex divide-x divide-gray-300">
                                            <span className="pr-3">{reservation.edition.format} Edition</span>
                                            <span className="pl-3">{reservation.edition.publisher}</span>
                                        </div>

                                        <div className="space-y-3 pt-4 border-t border-gray-50">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <ClockIcon className="w-5 h-5 mr-3 text-gray-400" />
                                                <div>
                                                    <p className="font-semibold text-gray-900">Priority Score: {reservation.effectivePriority}</p>
                                                    <p className="text-xs">Waiting for {daysWaiting} days</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <BuildingLibraryIcon className="w-5 h-5 mr-3 text-gray-400" />
                                                <div>
                                                    <p className="font-semibold">Pickup Preference</p>
                                                    <p className="text-xs">{libraryName}</p>
                                                </div>
                                            </div>

                                            <div className="mt-4 bg-indigo-50/50 rounded-lg p-3 border border-indigo-100/50 text-xs text-indigo-900">
                                                <strong className="block mb-1">How Priority Works:</strong>
                                                Your score increases by 1 each day you wait. After 14 days, Standard members receive an automated +50 Premium boost to jump the queue!
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                        <span className="text-xs text-gray-500 font-medium">
                                            Reserved {format(new Date(reservation.createdAt), 'MMM d, yyyy')}
                                        </span>
                                        <button
                                            onClick={() => handleCancel(reservation._id)}
                                            disabled={isCanceling}
                                            className="px-4 py-2 text-sm font-semibold text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {past.length > 0 && (
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Past Reservations</h3>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <ul className="divide-y divide-gray-100">
                            {past.map(reservation => (
                                <li key={reservation._id} className="p-4 sm:pl-6 flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900">{reservation.edition.work?.title || 'Unknown Work'}</h4>
                                        <p className="text-xs text-gray-500">Reserved on {format(new Date(reservation.createdAt), 'MMM d, yyyy')}</p>
                                    </div>
                                    <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded ${reservation.status === 'FULFILLED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                                        {reservation.status}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReservationsPage;
