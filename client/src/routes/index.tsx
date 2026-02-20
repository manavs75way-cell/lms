import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ErrorPage } from '../pages/ErrorPage';
import { LoginPage } from '../modules/auth/pages/LoginPage';
import { RegisterPage } from '../modules/auth/pages/RegisterPage';
import { ProtectedRoute } from '../modules/auth/components/ProtectedRoute';
import BookListPage from '../modules/books/pages/BookListPage';
import WorkDetailsPage from '../modules/books/pages/WorkDetailsPage';
import AddBookPage from '../modules/books/pages/AddBookPage';
import ImportBooksPage from '../modules/books/pages/ImportBooksPage';
import EditBookPage from '../modules/books/pages/EditBookPage';
import BorrowedBooksPage from '../modules/borrow/pages/BorrowedBooksPage';
import ReservationsPage from '../modules/borrow/pages/ReservationsPage';
import DashboardPage from '../modules/dashboard/pages/DashboardPage';
import ShipmentsPage from '../modules/shipment/pages/ShipmentsPage';
import DamageReportsPage from '../modules/damage/pages/DamageReportsPage';
import ReadingHistoryPage from '../modules/borrow/pages/ReadingHistoryPage';
import ProfilePage from '../modules/auth/pages/ProfilePage';
import NotificationPage from '../modules/notification/pages/NotificationPage';
import LibrarianDashboardPage from '../modules/dashboard/pages/LibrarianDashboardPage';
import FineConfigurationPage from '../modules/admin/pages/FineConfigurationPage';

export const router = createBrowserRouter([
    {
        path: '/login',
        element: <LoginPage />,
        errorElement: <ErrorPage />,
    },
    {
        path: '/register',
        element: <RegisterPage />,
        errorElement: <ErrorPage />,
    },
    {
        path: '/',
        element: (
            <ErrorBoundary>
                <ProtectedRoute />
            </ErrorBoundary>
        ),
        errorElement: <ErrorPage />,
        children: [
            {
                path: '/',
                element: <MainLayout />,
                children: [
                    {
                        path: '/',
                        element: <DashboardPage />,
                    },
                    {
                        path: '/books',
                        element: <BookListPage />,
                    },
                    {
                        path: '/books/works/:id',
                        element: <WorkDetailsPage />,
                    },
                    {
                        path: '/books/works/edit/:id',
                        element: <EditBookPage />,
                    },
                    {
                        path: '/books/add',
                        element: <AddBookPage />,
                    },
                    {
                        path: '/books/import',
                        element: <ImportBooksPage />,
                    },
                    {
                        path: '/books/edit/:id',
                        element: <EditBookPage />,
                    },
                    {
                        path: '/my-borrows',
                        element: <BorrowedBooksPage />,
                    },
                    {
                        path: '/reservations',
                        element: <ReservationsPage />,
                    },
                    {
                        path: '/history',
                        element: <ReadingHistoryPage />,
                    },
                    {
                        path: '/profile',
                        element: <ProfilePage />,
                    },
                    {
                        path: '/notifications',
                        element: <NotificationPage />,
                    },
                    {
                        path: '/dashboard-librarian',
                        element: (
                            <ProtectedRoute allowedRoles={['LIBRARIAN', 'ADMIN']}>
                                <LibrarianDashboardPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/admin/fine-config',
                        element: (
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <FineConfigurationPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/admin/shipments',
                        element: (
                            <ProtectedRoute allowedRoles={['LIBRARIAN', 'ADMIN']}>
                                <ShipmentsPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/admin/damage-reports',
                        element: (
                            <ProtectedRoute allowedRoles={['LIBRARIAN', 'ADMIN']}>
                                <DamageReportsPage />
                            </ProtectedRoute>
                        ),
                    },
                ],
            },
        ],
    },
]);
