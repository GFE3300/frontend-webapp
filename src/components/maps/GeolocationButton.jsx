import React, { useState } from 'react';
//eslint-disable-next-line
import { motion, AnimatePresence } from 'framer-motion';
import { useMap } from './MapLoader';
import Icon from '../common/Icon';

// Spinner component for loading state
const Spinner = () => (
    <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity }}
        className="w-6 h-6 flex items-center justify-center text-[var(--color-cream)]"
    >
        <Icon name="refresh" className={"w-6 h-6"} />
    </motion.div>
);

const GeolocationButton = ({ onLocate, centerMap = false, label = "Use my location" }) => {
    const { map } = useMap();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isHovered, setIsHovered] = useState(false);

    const handleGeolocation = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            return;
        }

        setIsLoading(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                onLocate(coords);

                if (centerMap && map) {
                    map.panTo(coords);
                }

                setIsLoading(false);
            },
            (err) => {
                setIsLoading(false);
                setError(
                    err.code === err.PERMISSION_DENIED
                        ? "Enable location access in your browser"
                        : "Unable to determine your location"
                );
            },
            { timeout: 10000 }
        );
    };

    return (
        <div className="relative w-8 h-8    " aria-live="polite">
            <motion.div
                className="relative"
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
            >
                {/* Compact Icon Button */}
                <motion.button
                    onClick={handleGeolocation}
                    disabled={isLoading}
                    className={`rounded-full transition-all w-8 h-8
                        flex items-center justify-center
                        ${isLoading ?
                            'bg-[var(--color-chocolate)] cursor-wait' :
                            'bg-[var(--color-chocolate)] hover:bg-[var(--color-caramel)]'}   
                        shadow-md hover:shadow-lg focus:outline-none`}
                    aria-label={isLoading ? "Locating..." : label}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {isLoading ? (
                        <Spinner />
                    ) : (
                        <Icon
                            name="my_location"
                            className="text-[var(--color-cream)]"
                            style={{ fontSize: '1.5rem' }}
                        />
                    )}
                </motion.button>

                {/* Animated Tooltip */}
                <AnimatePresence>
                    {isHovered && !isLoading && (
                        <motion.div
                            className="absolute z-50 top-11 left-1/2 -translate-x-1/2 mb-2"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="px-3 py-2 rounded-lg bg-[var(--color-chocolate)] text-[var(--color-cream)] text-sm font-inter shadow-lg">
                                {error
                                    ? error
                                    : label
                                }
                                <div className="absolute w-3 h-3 bg-[var(--color-chocolate)] rotate-45 -top-1 left-1/2 -translate-x-1/2" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default GeolocationButton;