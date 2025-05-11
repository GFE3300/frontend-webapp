import React, { createContext, useContext, useEffect, useState } from 'react'
import { getErrorMessage } from '../utils/getErrorMessage'
import apiService from '../services/api'
import { useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [requiresProfile, setRequiresProfile] = useState(false);
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        if (!navigate) {
            console.error('useNavigate must be used within a Router context.')
            return
        }
        const checkAuth = async () => {
            const token = localStorage.getItem('accessToken'); // Changed from 'access'
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    if (decoded.exp * 1000 < Date.now()) {
                        logout();
                    } else {
                        setUser(decoded);
                    }
                } catch (error) {
                    console.error('Invalid token:', error);
                    logout();
                }
            }
            setLoading(false);
        }
        checkAuth();
    }, [navigate]);

    const login = async (email, password) => {
        try {
            const { data } = await apiService.post('/auth/login/', { email, password });

            if (!data?.access) {
                console.error('Invalid login response:', data);
                throw new Error('Invalid login response');
            }

            localStorage.setItem('accessToken', data.access);
            localStorage.setItem('refreshToken', data.refresh);

            const decoded = jwtDecode(data.access);
            setUser(decoded);
            navigate('/');

        } catch (error) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            throw new Error(getErrorMessage(error));
        }
    };

    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            await apiService.post('/auth/logout/', { refresh: refreshToken });
        } catch (error) {
            console.error('Logout failed:', getErrorMessage(error));
        } finally {
            // Clear frontend state regardless of backend success
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
            navigate('/login');
        }
    };

    const register = async (email, password) => {
        try {
            await apiService.post('/auth/register/', {
                email,
                password
            });

            const { data } = await apiService.post('/auth/login/', { email, password });	

            // Verify the token structure
            if (!data?.access || !data?.refresh) {
                console.error('Invalid server response - missing tokens:', data);
                throw new Error('Invalid server response - missing tokens');
            }

            // Store tokens
            localStorage.setItem('accessToken', data.access);
            localStorage.setItem('refreshToken', data.refresh);

            // Verify token validity
            try {
                const decodedUser = jwtDecode(data.access);
                setUser(decodedUser);
                setRequiresProfile(true);
                navigate('/complete-profile');
            } catch (decodeError) {
                console.error('Token decode error:', decodeError);
                throw new Error('Invalid token format received');
            }

        } catch (error) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            throw new Error(getErrorMessage(error));
        }
    };

    const completeProfile = (profileData) => {
        setUser(prev => ({ ...prev, ...profileData }));
        setRequiresProfile(false);
        navigate('/');
    };

    const value = {
        user,
        requiresProfile,
        login,
        register,
        completeProfile,
        logout
    };
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)