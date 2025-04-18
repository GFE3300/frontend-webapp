import React, { createContext, useContext, useEffect, useState } from 'react'
import { getErrorMessage } from '../utils/getErrorMessage'
import apiService from '../services/api'
import { useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        if (!navigate) {
            console.error('useNavigate must be used within a Router context.')
            return
        }
        const checkAuth = async () => {
            const token = localStorage.getItem('access')
            if (token) {
                try {
                    const decoded = jwtDecode(token)
                    if (decoded.exp * 1000 < Date.now()) {
                        logout()
                    } else {
                        setUser(decoded)
                    }
                } catch (error) {
                    console.error('Invalid token:', error)
                    logout()
                }
            }
            setLoading(false)
        }
        checkAuth()
    }, [navigate])

    const login = async (email, password) => {
        try {
            const { data } = await apiService.post('/auth/login/', { email, password });
            localStorage.setItem('accessToken', data.access);
            localStorage.setItem('refreshToken', data.refresh);
            const userData = await apiService.get('/auth/user/');
            setUser(userData.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    };

    const logout = () => {
        apiService.post('/auth/logout/');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
    };

    const register = async (email, username, password) => {
        const response = await fetch('http://localhost:8000/api/auth/register/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, username, password }),
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.detail || 'Registration failed')
        }

        const data = await response.json()
        return data
    }

    const value = { user, loading, login, register, logout };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)