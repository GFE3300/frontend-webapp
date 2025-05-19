import React, { useState, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import { motion, AnimatePresence } from 'framer-motion'; // For animations
import Icon from '../../../components/common/Icon'; // Assuming Icon component path

// Placeholder for localized strings. Replace with your actual localization setup.
const scriptLines_Geolocation = {
    label: {
        useMyLocation: "Use my current location",
        locating: "Locating...",
    },
    error: {
        notSupported: "Geolocation is not supported by your browser.",
        permissionDenied: "Permission denied. Please enable location services.",
        unavailable: "Location information is unavailable.",
        timeout: "The request to get user location timed out.",
        unknown: "An unknown error occurred while trying to get your location.",
    },
    tooltip: {
        default: "Get current location",
    }
};

/**
 * @typedef {Object} Coordinates
 * @property {number} lat - Latitude.
 * @property {number} lng - Longitude.
 */

// Simple spinner for loading state within the button
const ButtonSpinner = () => (
    <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-5 h-5" // Adjust size as needed
    >
        <Icon name="progress_activity" className="w-full h-full" />
    </motion.div>
);

/**
 * GeolocationButton Component
 *
 * A button that, when clicked, attempts to get the user's current
 * geographical location using the browser's Geolocation API.
 * It handles loading and error states and calls `onLocate` with the coordinates.
 *
 * This component is self-contained regarding geolocation logic.
 *
 * @component
 * @param {object} props
 * @param {(coords: Coordinates) => void} props.onLocate - Callback function invoked with the user's coordinates on success.
 * @param {(error: GeolocationPositionError | { code: number, message: string }) => void} [props.onError] - Optional callback for geolocation errors.
 * @param {string} [props.buttonClassName] - Custom CSS class for the button.
 * @param {React.ReactNode} [props.children] - Custom content for the button (overrides default icon).
 * @param {boolean} [props.disabled] - If true, the button is disabled.
 * @param {object} [props.geolocationOptions] - Options for navigator.geolocation.getCurrentPosition().
 */
const GeolocationButton = memo(({
    onLocate,
    onError,
    buttonClassName,
    children,
    disabled = false,
    geolocationOptions = { timeout: 10000, enableHighAccuracy: true, maximumAge: 0 },
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [errorState, setErrorState] = useState(null); // Stores error message for tooltip or display
    const [isHovered, setIsHovered] = useState(false);

    const handleGeolocation = useCallback(async () => {
        if (!navigator.geolocation) {
            const err = { code: -1, message: scriptLines_Geolocation.error.notSupported };
            setErrorState(err.message);
            onError?.(err);
            return;
        }

        setIsLoading(true);
        setErrorState(null);

        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, geolocationOptions);
            });

            const coords = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };
            onLocate(coords);
            setIsLoading(false);
        } catch (err) {
            setIsLoading(false);
            let message = scriptLines_Geolocation.error.unknown;
            switch (err.code) {
                case err.PERMISSION_DENIED:
                    message = scriptLines_Geolocation.error.permissionDenied;
                    break;
                case err.POSITION_UNAVAILABLE:
                    message = scriptLines_Geolocation.error.unavailable;
                    break;
                case err.TIMEOUT:
                    message = scriptLines_Geolocation.error.timeout;
                    break;
                default:
                    break;
            }
            setErrorState(message);
            onError?.({ code: err.code, message }); // Pass a simplified error object
            console.error("Geolocation error:", err);
        }
    }, [onLocate, onError, geolocationOptions]);

    const effectiveLabel = isLoading ? scriptLines_Geolocation.label.locating : scriptLines_Geolocation.label.useMyLocation;
    const tooltipText = errorState || scriptLines_Geolocation.tooltip.default;

    return (
        <div className="relative inline-block"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onFocus={() => setIsHovered(true)} // Show tooltip on focus for accessibility
            onBlur={() => setIsHovered(false)}
        >
            <motion.button
                type="button"
                onClick={handleGeolocation}
                disabled={disabled || isLoading}
                className={
                    buttonClassName ||
                    `p-1 rounded-full flex items-center justify-center w-9 h-9
                     bg-neutral-100 dark:bg-neutral-700
                     hover:bg-neutral-200 dark:hover:bg-neutral-600
                     focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                     transition-colors duration-150
                     disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg`
                }
                aria-label={effectiveLabel}
                whileHover={{ scale: disabled || isLoading ? 1 : 1.05 }}
                whileTap={{ scale: disabled || isLoading ? 1 : 0.95 }}
            >
                {isLoading ? (
                    <ButtonSpinner />
                ) : children ? (
                    children
                ) : (
                    <Icon name="my_location" className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                )}
            </motion.button>

            <AnimatePresence>
                {isHovered && !isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-30 bottom-full left-1/2 mb-2 px-3 py-2
                                   text-xs font-medium text-neutral-800 dark:text-neutral-200
                                   bg-neutral-200 dark:bg-neutral-200
                                   rounded-md shadow-lg whitespace-nowrap
                                   transform -translate-x-1/2"
                        role="tooltip"
                    >
                        {tooltipText}
                        {/* Optional: Tooltip arrow - adjust styling as needed */}
                        <div className="absolute top-full left-1/2 w-2 h-2 
                                        bg-neutral-200 dark:bg-neutral-200 
                                        transform -translate-x-1/2 rotate-45"
                            style={{ marginTop: '-4px' }} // Overlap slightly for seamless look
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});

GeolocationButton.displayName = 'GeolocationButton';

GeolocationButton.propTypes = {
    onLocate: PropTypes.func.isRequired,
    onError: PropTypes.func,
    buttonClassName: PropTypes.string,
    children: PropTypes.node,
    disabled: PropTypes.bool,
    geolocationOptions: PropTypes.shape({
        enableHighAccuracy: PropTypes.bool,
        timeout: PropTypes.number,
        maximumAge: PropTypes.number,
    }),
};

export default GeolocationButton;