import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { router } from './routes';
import { ToastProvider } from './context/ToastContext';

const App: React.FC = () => {
    return (
        <Provider store={store}>
            <ToastProvider>
                <RouterProvider router={router} />
            </ToastProvider>
        </Provider>
    );
};

export default App;
