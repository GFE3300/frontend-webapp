import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import apiService, { apiInstance } from '../services/api';
import i18n from '../i18n';

const AuthContext = createContext(null);

/**
 * Creates a normalized user object from a decoded JWT payload.
 * @param {object} decodedToken - The payload from jwt-decode.
 * @returns {object} A structured user object for the AuthContext state.
 */
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
        language: decodedToken.language || 'en', // Add language with fallback
        is_staff: decodedToken.is_staff || false,
        is_superuser: decodedToken.is_superuser || false,
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

    const updateUser = useCallback((updatedFields) => {
        setUser(prevUser => (prevUser ? { ...prevUser, ...updatedFields } : null));
    }, []);

    useEffect(() => {
        const initializeAuth = async () => {
            const storedAccessToken = localStorage.getItem('accessToken');
            const storedRefreshToken = localStorage.getItem('refreshToken');

            if (storedAccessToken) {
                try {
                    const decodedToken = jwtDecode(storedAccessToken);
                    const isExpired = decodedToken.exp * 1000 < Date.now();

                    if (!isExpired) {
                        const userObject = createUserObjectFromToken(decodedToken);
                        setUser(userObject);

                        // Sync language
                        if (userObject.language && i18n.language !== userObject.language) {
                            await i18n.changeLanguage(userObject.language);
                        }

                        if (apiInstance?.defaults?.headers?.common) {
                            apiInstance.defaults.headers.common['Authorization'] = `Bearer ${storedAccessToken}`;
                        }
                        setAccessToken(storedAccessToken);
                        setRefreshToken(storedRefreshToken);
                    } else {
                        if (storedRefreshToken) {
                            console.log("Access token expired, attempting refresh on init...");
                            try {
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
                                const userObject = createUserObjectFromToken(newDecodedToken);
                                setUser(userObject);

                                // Sync language
                                if (userObject.language && i18n.language !== userObject.language) {
                                    await i18n.changeLanguage(userObject.language);
                                }

                                if (apiInstance?.defaults?.headers?.common) {
                                    apiInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                                }
                                setAccessToken(newAccessToken);
                                setRefreshToken(newRefreshTokenIfRotated);

                            } catch (refreshError) {
                                console.error("Token refresh failed on init:", refreshError);
                                await performLogoutOperations(false);
                            }
                        } else {
                            await performLogoutOperations(false);
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
    }, [performLogoutOperations]);

    const login = async (newAccessToken, newRefreshToken) => {
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        const decodedToken = jwtDecode(newAccessToken);

        if (apiInstance?.defaults?.headers?.common) {
            apiInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        }

        const userObject = createUserObjectFromToken(decodedToken);
        setAccessToken(newAccessToken);
        setRefreshToken(newRefreshToken);
        setUser(userObject);

        // Sync language
        if (userObject.language && i18n.language !== userObject.language) {
            await i18n.changeLanguage(userObject.language);
        }
    };

    const logout = async () => {
        await performLogoutOperations(true);
    };

    const value = {
        user,
        accessToken,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
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