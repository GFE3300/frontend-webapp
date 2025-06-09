import React, { createContext, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import MetricStore from '../data_models/MetricStore';

/**
 * React context for metric data access
 * @type {React.Context<MetricStore>}
 */
const MetricContext = createContext(null);

/**
 * Provides metric data access to component tree
 * @component
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Child components
 */
export const MetricProvider = ({ children }) => {
    const store = useMemo(() => new MetricStore(), []);

    return (
        <MetricContext.Provider value={store}>
            {children}
        </MetricContext.Provider>
    );
};

MetricProvider.propTypes = {
    children: PropTypes.node.isRequired
};

/**
 * Hook for accessing metric store instance
 * @returns {MetricStore} Metric data store
 * @throws {Error} If used outside MetricProvider
 */
export const useMetricStore = () => {
    const context = useContext(MetricContext);
    if (!context) {
        throw new Error(
            'Metric context unavailable - wrap components in <MetricProvider>'
        );
    }
    return context;
};