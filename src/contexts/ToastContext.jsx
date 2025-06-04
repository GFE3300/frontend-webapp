import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid'; // For unique toast IDs

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = uuidv4();
        setToasts(prevToasts => [...prevToasts, { id, message, type, duration }]);

        // Automatically remove toast after duration
        if (duration) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
        return id; // Return id in case manual removal is needed earlier
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, []);

    const value = useMemo(() => ({
        toasts,
        addToast,
        removeToast,
    }), [toasts, addToast, removeToast]);

    return (
        <ToastContext.Provider value={value}>
            {children}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};