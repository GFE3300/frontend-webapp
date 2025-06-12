import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import apiService, { apiInstance } from '../services/api';
import i18n from '../i18n';

const AuthContext = createContext(null);

const createUserObjectFromToken = (decodedToken) => {
    if (!decodedToken) return null;

    return {
        id: decodedToken.user_id,
        email: decodedToken.email,
        firstName: decodedToken.first_name,
        lastName: decodedToken.last_name,
        activeBusinessId: decodedToken.active_business_id,
        activeBusinessName: decodedToken.active_business_name,
        role: decodedToken.role,
        language: decodedToken.language || 'en',
        is_staff: decodedToken.is_staff || false,
        is_superuser: decodedToken.is_superuser || false,
        activeBusinessCurrency: decodedToken.active_business_currency || 'EUR',
        profile_image_url: decodedToken.profile_image_url || null,

    };
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken'));
    const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refreshToken'));
    const [isLoading, setIsLoading] = useState(true);

    const performLogoutOperations = useCallback(async (attemptApiLogout = true) => {
        const currentRefreshToken = localStorage.getItem('refreshToken');
        if (attemptApiLogout && currentRefreshToken) {
            try {
                await apiService.post('auth/logout/', { refresh: currentRefreshToken });
                console.log("Successfully logged out on server.");
            } catch (error) {
                console.error("API Logout failed:", error);
            }
        }
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (apiInstance?.defaults?.headers?.common) {
            delete apiInstance.defaults.headers.common['Authorization'];
        }
        console.log("Client-side logout completed.");
    }, []);

    const login = useCallback(async (newAccessToken, newRefreshToken) => {
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        const decodedToken = jwtDecode(newAccessToken);
        const userObject = createUserObjectFromToken(decodedToken);

        if (apiInstance?.defaults?.headers?.common) {
            apiInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        }

        setAccessToken(newAccessToken);
        setRefreshToken(newRefreshToken);
        setUser(userObject);

        if (userObject.language && i18n.language !== userObject.language) {
            await i18n.changeLanguage(userObject.language);
        }
    }, []);

    const updateUser = useCallback((updatedFields) => {
        setUser(prevUser => (prevUser ? { ...prevUser, ...updatedFields } : null));
    }, []);

    const refreshSession = useCallback(async () => {
        console.log("AuthContext: Attempting to refresh session to get new token...");
        const currentRefreshToken = localStorage.getItem('refreshToken');
        if (!currentRefreshToken) {
            console.error("AuthContext.refreshSession: No refresh token available.");
            throw new Error("No refresh token available.");
        }
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/'}auth/refresh/`,
                { refresh: currentRefreshToken }
            );
            const newAccessToken = response.data.access;
            const newRefreshToken = response.data.refresh || currentRefreshToken;

            await login(newAccessToken, newRefreshToken);
            console.log("AuthContext: Session refreshed successfully.");
            return true;
        } catch (error) {
            console.error("AuthContext.refreshSession: Failed to refresh token.", error);
            await performLogoutOperations(false);
            throw error;
        }
    }, [login, performLogoutOperations]);

    useEffect(() => {
        const initializeAuth = async () => {
            const storedAccessToken = localStorage.getItem('accessToken');

            if (storedAccessToken) {
                try {
                    const decodedToken = jwtDecode(storedAccessToken);
                    const isExpired = decodedToken.exp * 1000 < Date.now();

                    if (!isExpired) {
                        // For initial load, just use the existing login logic
                        await login(storedAccessToken, localStorage.getItem('refreshToken'));
                    } else {
                        console.log("Access token expired, attempting refresh on init...");
                        await refreshSession();
                    }
                } catch (e) {
                    console.error("Error processing token on init (invalid token?):", e);
                    await performLogoutOperations(false);
                }
            }
            setIsLoading(false);
        };

        initializeAuth();
    }, [login, performLogoutOperations, refreshSession]); // login is a dependency now

    const logout = async () => {
        await performLogoutOperations(true);
    };

    const switchBusiness = useCallback(async (businessId) => {
        try {
            const response = await apiService.switchBusiness(businessId);
            const { access, refresh } = response.data;
            if (access && refresh) {
                await login(access, refresh);
                return true;
            }
        } catch (error) {
            console.error("Failed to switch business:", error);
            throw error;
        }
        return false;
    }, [login]);

    const value = {
        user,
        accessToken,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
        switchBusiness,
        refreshSession,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};