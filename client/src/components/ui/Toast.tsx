import React, { useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

export type ToastType = 'success' | 'error';

interface ToastProps {
    id: string;
    message: string;
    type: ToastType;
    onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, 5000); 

        return () => clearTimeout(timer);
    }, [id, onClose]);

    const bgColor = type === 'success' ? 'bg-green-50' : 'bg-red-50';
    const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
    const iconColor = type === 'success' ? 'text-green-400' : 'text-red-400';
    const Icon = type === 'success' ? CheckCircleIcon : XCircleIcon;

    return (
        <div className={`rounded-md p-4 mb-3 shadow-lg pointer-events-auto w-full max-w-sm overflow-hidden ${bgColor}`}>
            <div className="flex">
                <div className="flex-shrink-0">
                    <Icon className={`h-5 w-5 ${iconColor}`} aria-hidden="true" />
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className={`text-sm font-medium ${textColor}`}>{message}</p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                    <button
                        className={`bg-transparent rounded-md inline-flex ${textColor} hover:${textColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                        onClick={() => onClose(id)}
                    >
                        <span className="sr-only">Close</span>
                        <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Toast;
