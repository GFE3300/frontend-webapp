import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from './AuthContext';
import apiService from '../services/api';

const SubscriptionContext = createContext(null);

export const SubscriptionProvider = ({ children }) => {
    const { user, isAuthenticated, isLoading: authIsLoading } = useAuth();
    const [subscription, setSubscription] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Start true as we'll fetch on mount if authenticated
    const [error, setError] = useState(null);

    const fetchSubscriptionStatus = useCallback(async () => {
        if (!isAuthenticated || !user) {
            // Should not happen if called correctly, but as a safeguard
            setSubscription(null);
            setError(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null); // Clear previous errors

        try {
            const response = await apiService.getSubscriptionStatus();
            console.log('[SubscriptionContext] Subscription status fetched:', response.data);
            setSubscription(response.data); // Backend returns the subscription object or 404
        } catch (err) {
            // console.error('[SubscriptionContext] Error fetching subscription status:', err.response?.data || err.message);
            if (err.response?.status === 404) {
                // 404 means no active/trialing subscription found, which is a valid state
                setSubscription(null); // No active subscription
                setError(null); // Not an "error" state in the context of having no subscription
                // console.log('[SubscriptionContext] No active subscription found (404).');
            } else {
                // For other errors (network, server errors other than 404)
                setSubscription(null); // Clear any potentially stale subscription data
                setError({
                    message: err.response?.data?.detail || err.message || 'Failed to fetch subscription status.',
                    status: err.response?.status,
                });
            }
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, user]); // Dependencies: re-fetch if auth state changes

    useEffect(() => {
        if (authIsLoading) {
            // Wait for auth to initialize before deciding to fetch subscription
            setIsLoading(true); // Reflect that we are waiting for auth state
            return;
        }

        if (isAuthenticated && user) {
            // Only fetch if authenticated and user object is available
            // console.log('[SubscriptionContext] Auth state changed, user authenticated. Fetching subscription status.');
            fetchSubscriptionStatus();
        } else {
            // User is not authenticated, clear subscription state
            // console.log('[SubscriptionContext] User not authenticated or auth still loading. Clearing subscription state.');
            setSubscription(null);
            setError(null);
            setIsLoading(false); // Not loading subscription if not authenticated
        }
    }, [isAuthenticated, user, fetchSubscriptionStatus, authIsLoading]); // Effect dependencies

    const contextValue = useMemo(() => ({
        subscription,
        isLoading,
        error,
        fetchSubscriptionStatus, // Expose refetch function
    }), [subscription, isLoading, error, fetchSubscriptionStatus]);

    return (
        <SubscriptionContext.Provider value={contextValue}>
            {children}
        </SubscriptionContext.Provider>
    );
};

SubscriptionProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useSubscription = () => {
    const context = useContext(SubscriptionContext);
    if (context === undefined) {
        throw new Error('useSubscription must be used within a SubscriptionProvider');
    }
    return context;
};