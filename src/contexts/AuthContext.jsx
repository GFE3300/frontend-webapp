import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import apiService, { apiInstance } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken'));
    const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refreshToken'));
    const [isLoading, setIsLoading] = useState(true);

    // Centralized function to perform client-side and optional API logout
    const performLogoutOperations = useCallback(async (attemptApiLogout = true) => {
        const currentRefreshToken = localStorage.getItem('refreshToken'); // Get fresh token for logout

        if (attemptApiLogout && currentRefreshToken) {
            try {
                // No need to pass the token in the body if your interceptor handles auth.
                // The LogoutView expects the refresh token in the request body.
                await apiService.post('auth/logout/', { refresh: currentRefreshToken });
                console.log("Successfully logged out on server.");
            } catch (error) {
                console.error("API Logout failed (token might be already invalid/blacklisted or network issue):", error);
                // Continue with client-side cleanup regardless of API logout success
            }
        }

        setUser(null);
        setAccessToken(null); // Update state
        setRefreshToken(null); // Update state
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        // Clear the default authorization header from the apiInstance
        if (apiInstance && apiInstance.defaults && apiInstance.defaults.headers && apiInstance.defaults.headers.common) {
            delete apiInstance.defaults.headers.common['Authorization'];
        }
        console.log("Client-side logout completed.");
    }, []); // No dependencies that change often

    useEffect(() => {
        const initializeAuth = async () => {
            const storedAccessToken = localStorage.getItem('accessToken');
            const storedRefreshToken = localStorage.getItem('refreshToken');

            if (storedAccessToken) {
                try {
                    const decodedToken = jwtDecode(storedAccessToken);
                    const isExpired = decodedToken.exp * 1000 < Date.now();

                    if (!isExpired) {
                        setUser({
                            id: decodedToken.user_id,
                            email: decodedToken.email,
                            firstName: decodedToken.first_name,
                            lastName: decodedToken.last_name,
                            activeBusinessId: decodedToken.active_business_id,
                            activeBusinessName: decodedToken.active_business_name,
                            role: decodedToken.role,
                        });
                        if (apiInstance?.defaults?.headers?.common) {
                            apiInstance.defaults.headers.common['Authorization'] = `Bearer ${storedAccessToken}`;
                        }
                        // Ensure state is synced with localStorage on init
                        setAccessToken(storedAccessToken);
                        setRefreshToken(storedRefreshToken);
                    } else {
                        // Access token is expired
                        if (storedRefreshToken) {
                            console.log("Access token expired, attempting refresh on init...");
                            try {
                                // Use a clean axios instance for refresh to avoid interceptor loops if not careful
                                const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/'}auth/refresh/`, {
                                    refresh: storedRefreshToken,
                                });
                                const newAccessToken = response.data.access;
                                const newRefreshTokenIfRotated = response.data.refresh || storedRefreshToken;

                                localStorage.setItem('accessToken', newAccessToken);
                                if (response.data.refresh) {
                                    localStorage.setItem('refreshToken', newRefreshTokenIfRotated);
                                }

                                const newDecodedToken = jwtDecode(newAccessToken);
                                setUser({
                                    id: newDecodedToken.user_id,
                                    email: newDecodedToken.email,
                                    firstName: newDecodedToken.first_name,
                                    lastName: newDecodedToken.last_name,
                                    activeBusinessId: newDecodedToken.active_business_id,
                                    activeBusinessName: newDecodedToken.active_business_name,
                                    role: newDecodedToken.role,
                                });
                                if (apiInstance?.defaults?.headers?.common) {
                                    apiInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                                }
                                setAccessToken(newAccessToken);
                                setRefreshToken(newRefreshTokenIfRotated);

                            } catch (refreshError) {
                                console.error("Token refresh failed on init:", refreshError);
                                await performLogoutOperations(false); // Logout client-side only
                            }
                        } else {
                            await performLogoutOperations(false); // No refresh token, client-side logout
                        }
                    }
                } catch (e) {
                    console.error("Error processing token on init (invalid token?):", e);
                    await performLogoutOperations(false);
                }
            }
            setIsLoading(false);
        };

        initializeAuth();
    }, []); // Run only once on mount


    const login = (newAccessToken, newRefreshToken) => {
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        const decodedToken = jwtDecode(newAccessToken);

        if (apiInstance?.defaults?.headers?.common) {
            apiInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        }

        setAccessToken(newAccessToken);
        setRefreshToken(newRefreshToken);
        setUser({
            id: decodedToken.user_id,
            email: decodedToken.email,
            firstName: decodedToken.first_name,
            lastName: decodedToken.last_name,
            activeBusinessId: decodedToken.active_business_id,
            activeBusinessName: decodedToken.active_business_name,
            role: decodedToken.role,
        });
    };

    const logout = async () => {
        await performLogoutOperations(true); // Attempt API logout
        // Navigation should be handled by the component calling logout
    };

    const value = {
        user,
        accessToken,
        // refreshToken, // Usually not needed by components directly
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
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