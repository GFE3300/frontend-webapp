import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { deepEqual } from '../../utils/utils';

// Initial state shape
const INITIAL_STATE = {
    center: { lat: 39.45548341788058, lng: -0.35036396564111183 },
    marker: { lat: 39.45548341788058, lng: -0.35036396564111183 },
    address: null,
    flags: {
        source: 'initial',
        userMovedMarker: false,
        userUsedGeolocation: false,
        skipNextReverseGeocode: false
    }
};

const MapContext = createContext({
    ...INITIAL_STATE,
    updateMarker: () => { },
    updateAddress: () => { },
    setFlag: () => { },
    reset: () => { }
});

export const MapProvider = ({ children }) => {
    // Unified state management
    const [state, setState] = useState(INITIAL_STATE);
    const [someOtherState, setSomeOtherState] = useState();

    const updateMarker = useCallback((coords, shouldUpdateCenter = true) => {
        setState(prev => ({
            ...prev,
            marker: coords,
            center: shouldUpdateCenter ? coords : prev.center,
            flags: {
                ...prev.flags,
                userMovedMarker: true
            }
        }));
    }, []);

    const updateAddress = useCallback((data) => {
        setState(prev => {
            const newAddress = { ...(prev.address || {}), ...data };
            // Return early if no actual changes
            return deepEqual(prev.address, newAddress)
                ? prev
                : { ...prev, address: newAddress };
        });
    }, []);

    useEffect(() => {
        if (state.address && !deepEqual(state.address, someOtherState)) {
            setSomeOtherState(state.address);
        }
    }, [state.address]);

    const setFlag = useCallback((flag, value) => {
        setState(prev => {
            if (prev.flags[flag] === value) return prev;
            return {
                ...prev,
                flags: { ...prev.flags, [flag]: value }
            };
        });
    }, []);

    const reset = useCallback(() => {
        setState(INITIAL_STATE);
    }, []);

    const value = {
        ...state,
        updateMarker,
        updateAddress,
        setFlag,
        reset
    };

    return (
        <MapContext.Provider value={value}>
            {children}
        </MapContext.Provider>
    );
};

export const useMapContext = () => {
    const context = useContext(MapContext);
    if (!context) {
        throw new Error('useMapContext must be used within a MapProvider');
    }
    return context;
};