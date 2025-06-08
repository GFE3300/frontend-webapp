import React, { useState, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../components/common/Icon';
// MODIFICATION: Import the centralized script lines
import { scriptLines_Registration as scriptLines } from '../utils/script_lines';

/**
 * @typedef {Object} Coordinates
 * @property {number} lat - Latitude.
 * @property {number} lng - Longitude.
 */

const ButtonSpinner = () => (
    <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-5 h-5"
    >
        <Icon name="progress_activity" className="w-full h-full" />
    </motion.div>
);

/**
 * GeolocationButton Component
 * ... (docstring remains the same) ...
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
    const [errorState, setErrorState] = useState(null);
    const [isHovered, setIsHovered] = useState(false);

    const handleGeolocation = useCallback(async () => {
        if (!navigator.geolocation) {
            // MODIFICATION: Use centralized script lines
            const err = { code: -1, message: scriptLines.geolocationButton.error.notSupported };
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
            // MODIFICATION: Use centralized script lines
            let message = scriptLines.geolocationButton.error.unknown;
            switch (err.code) {
                case err.PERMISSION_DENIED:
                    message = scriptLines.geolocationButton.error.permissionDenied;
                    break;
                case err.POSITION_UNAVAILABLE:
                    message = scriptLines.geolocationButton.error.unavailable;
                    break;
                case err.TIMEOUT:
                    message = scriptLines.geolocationButton.error.timeout;
                    break;
                default:
                    break;
            }
            setErrorState(message);
            onError?.({ code: err.code, message });
            console.error("Geolocation error:", err);
        }
    }, [onLocate, onError, geolocationOptions]);

    // MODIFICATION: Use centralized script lines
    const effectiveLabel = isLoading ? scriptLines.geolocationButton.label.locating : scriptLines.geolocationButton.label.useMyLocation;
    const tooltipText = errorState || scriptLines.geolocationButton.tooltip.default;

    return (
        <div className="relative inline-block"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onFocus={() => setIsHovered(true)}
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
                        <div className="absolute top-full left-1/2 w-2 h-2 
                                        bg-neutral-200 dark:bg-neutral-200 
                                        transform -translate-x-1/2 rotate-45"
                            style={{ marginTop: '-4px' }}
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