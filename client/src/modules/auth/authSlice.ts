import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthResponse } from '../../services/authApi';
import { authApi } from '../../services/authApi';

interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
}

const getUserFromStorage = () => {
    try {
        const userStr = localStorage.getItem('user');
        if (!userStr || userStr === 'undefined') return null;
        return JSON.parse(userStr);
    } catch (e) {
        return null;
    }
};

const initialState: AuthState = {
    user: getUserFromStorage(),
    token: localStorage.getItem('token'),
    refreshToken: localStorage.getItem('refreshToken'),
    isAuthenticated: !!localStorage.getItem('token'),
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
        },
    },
    extraReducers: (builder) => {
        builder
            .addMatcher(
                authApi.endpoints.login.matchFulfilled,
                (state, action: PayloadAction<AuthResponse>) => {
                    state.user = action.payload.user;
                    state.token = action.payload.accessToken;
                    state.refreshToken = action.payload.refreshToken;
                    state.isAuthenticated = true;
                    localStorage.setItem('user', JSON.stringify(action.payload.user));
                    localStorage.setItem('token', action.payload.accessToken);
                    localStorage.setItem('refreshToken', action.payload.refreshToken);
                }
            )
            .addMatcher(
                authApi.endpoints.register.matchFulfilled,
                (state, action: PayloadAction<AuthResponse>) => {
                    state.user = action.payload.user;
                    state.token = action.payload.accessToken;
                    state.refreshToken = action.payload.refreshToken;
                    state.isAuthenticated = true;
                    localStorage.setItem('user', JSON.stringify(action.payload.user));
                    localStorage.setItem('token', action.payload.accessToken);
                    localStorage.setItem('refreshToken', action.payload.refreshToken);
                }
            )
            .addMatcher(
                authApi.endpoints.getMe.matchFulfilled,
                (state, action: PayloadAction<User>) => {
                    state.user = action.payload;
                    state.isAuthenticated = true;
                    localStorage.setItem('user', JSON.stringify(action.payload));
                }
            );
    },
});

export const { logout } = authSlice.actions;

export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;

export default authSlice.reducer;
