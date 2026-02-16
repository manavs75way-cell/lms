import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { ExclamationTriangleIcon, HomeIcon } from '@heroicons/react/24/outline';

export const ErrorPage = () => {
    const error = useRouteError();

    let errorMessage = 'An unexpected error occurred';
    let errorStatus = 'Error';

    if (isRouteErrorResponse(error)) {
        errorStatus = `${error.status}`;
        errorMessage = error.statusText || error.data?.message || 'Page not found';
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <div className="mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
                        <ExclamationTriangleIcon className="w-10 h-10 text-red-600" />
                    </div>
                    <h1 className="text-6xl font-bold text-gray-900 mb-2">{errorStatus}</h1>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Oops! Something went wrong</h2>
                    <p className="text-gray-600 mb-8">{errorMessage}</p>
                </div>

                <div className="space-y-4">
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                    >
                        <HomeIcon className="w-5 h-5" />
                        Back to Home
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="w-full px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                    >
                        Go Back
                    </button>
                </div>

                <p className="mt-8 text-sm text-gray-500">
                    If this problem persists, please contact support.
                </p>
            </div>
        </div>
    );
};
