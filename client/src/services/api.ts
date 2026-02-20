import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api/v1',
    prepareHeaders: (headers) => {
        const token = localStorage.getItem('token');
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
            const refreshResult = await baseQuery(
                {
                    url: 'auth/refresh-token',
                    method: 'POST',
                    body: { refreshToken },
                },
                api,
                extraOptions
            );

            interface RefreshTokenResponse {
                user: {
                    _id: string;
                    name: string;
                    email: string;
                    role: string;
                    membershipType: string;
                };
                accessToken: string;
                refreshToken: string;
            }

            if (refreshResult.data) {
                const data = refreshResult.data as RefreshTokenResponse;
                const user = data.user;
                const accessToken = data.accessToken;
                const newRefreshToken = data.refreshToken;

                localStorage.setItem('token', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);
                if (user) {
                    localStorage.setItem('user', JSON.stringify(user));
                }

                result = await baseQuery(args, api, extraOptions);
            } else {
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
    }
    return result;
};

export const api = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Books', 'Users', 'Borrows', 'Auth', 'Reservations', 'Notifications', 'Config', 'Libraries', 'Shipments', 'DamageReports', 'FinePolicies'],
    endpoints: () => ({}),
});

export interface ApiError {
    data?: {
        message: string;
        success?: boolean;
    };
    status?: number;
}
