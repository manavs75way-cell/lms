import { useGetNotificationsQuery, useMarkAsReadMutation, useMarkAllAsReadMutation } from '../../../services/notificationApi';
import { format } from 'date-fns';
import { BellIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const getTypeColor = (type: string) => {
    switch (type) {
        case 'DUE_SOON':
            return 'bg-yellow-100 text-yellow-800';
        case 'OVERDUE':
            return 'bg-red-100 text-red-800';
        case 'RESERVATION_AVAILABLE':
            return 'bg-green-100 text-green-800';
        case 'SYSTEM':
            return 'bg-blue-100 text-blue-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const NotificationPage = () => {
    const { data: notifications, isLoading } = useGetNotificationsQuery();
    const [markAsRead] = useMarkAsReadMutation();
    const [markAllAsRead] = useMarkAllAsReadMutation();

    if (isLoading) {
        return <div className="text-center mt-10">Loading notifications...</div>;
    }

    if (!notifications || notifications.length === 0) {
        return (
            <div className="text-center mt-10 text-gray-500">
                <BellIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                No notifications yet.
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <button
                    onClick={() => markAllAsRead()}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                    Mark all as read
                </button>
            </div>

            <div className="space-y-4">
                {notifications.map((notification) => (
                    <div
                        key={notification._id}
                        className={`p-4 rounded-lg shadow-sm border ${notification.isRead ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
                            }`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start">
                                <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-3 ${getTypeColor(
                                        notification.type
                                    )}`}
                                >
                                    {notification.type.replace('_', ' ')}
                                </span>
                                <div>
                                    <h3
                                        className={`text-sm font-medium ${notification.isRead ? 'text-gray-900' : 'text-blue-900'
                                            }`}
                                    >
                                        {notification.title}
                                    </h3>
                                    <p className={`mt-1 text-sm ${notification.isRead ? 'text-gray-500' : 'text-blue-700'}`}>
                                        {notification.message}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-400">
                                        {format(new Date(notification.createdAt), 'MMM d, yyyy h:mm a')}
                                    </p>
                                </div>
                            </div>
                            {!notification.isRead && (
                                <button
                                    onClick={() => markAsRead(notification._id)}
                                    className="text-gray-400 hover:text-indigo-600"
                                    title="Mark as read"
                                >
                                    <CheckCircleIcon className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NotificationPage;
