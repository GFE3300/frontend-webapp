import React, { useEffect, useState } from 'react';
//eslint-disable-next-line
import { motion, AnimatePresence } from 'framer-motion';
import { MapLoader } from '../../../components/maps/MapLoader';
import { MapProvider, useMapContext } from '../../../components/maps/MapContextProvider';
import AutocompleteInput from '../../../components/maps/AutocompleteInput';
import MapViewport from '../../../components/maps/MapViewport';
import GeolocationButton from '../../../components/maps/GeolocationButton';
import ReverseGeocodeHandler from '../../../components/maps/ReverseGeocodeHandler';
import AddressForm from '../../../components/maps/AddressForm';
import Navigation from './Navigation';
import Icon from '../../../components/common/Icon';

const SourceBadge = ({ icon, message }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            className="relative"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            aria-label={`Location source: ${message}`}
        >
            {/* Gold Badge Container */}
            <motion.div
                className="w-12 h-12 rounded-full text-[var(color-cream)] flex items-center justify-center"
                animate={{
                    scale: isHovered ? 1.1 : 1,
                    rotate: isHovered ? [0, -15, 15, 0] : 0
                }}
                transition={{
                    scale: { type: 'spring', stiffness: 300 },
                    rotate: { duration: 0.4 }
                }}
            >
                <Icon
                    name={icon}
                    className="text-[var(--color-cream)]"
                    style={{ fontSize: '2rem' }}
                    variations={{ fill: 0, weight: 300, grade: 0, opsz: 48 }}
                />
            </motion.div>

            {/* Tooltip */}
            <AnimatePresence>
                {isHovered && (
                    <motion.span
                        className="absolute bottom-15 mt-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-[var(--color-chocolate)] text-[var(--color-cream)] text-xs font-inter whitespace-nowrap shadow-lg"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            transition: { type: 'spring', stiffness: 200 }
                        }}
                        exit={{
                            opacity: 1,
                            y: -5,
                            transition: { duration: 0.15 }
                        }}
                    >
                        {message}
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const LocationPageCore = ({ prevPage, nextPage, isRight, isMobile }) => {
    const context = useMapContext();
    const [fieldToPulse, setFieldToPulse] = useState(null);

    // Pulse animation for address updates
    useEffect(() => {
        if (context.address) {
            setFieldToPulse(Date.now());
            const timer = setTimeout(() => setFieldToPulse(null), 1500);
            return () => clearTimeout(timer);
        }
    }, [context.address]);

    useEffect(() => {
        return () => {
            context.setFlag('skipNextReverseGeocode', false);
        };
    }, []);

    // Submit handler
    const submitLocation = () => {
        const locationData = {
            coords: context.marker,
            address: context.address,
            source: context.flags.source
        };
        nextPage(locationData);
    };

    const ReverseGeocodeUpdater = ({ result, loading }) => {
        const context = useMapContext();

        useEffect(() => {
            if (result && !loading) {
                context.updateAddress(result);
            }
        }, [result, loading]);

        return null;
    };

    return (
        <div className="w-full h-full">
            {/* Header */}
            <div className="flex flex-row-reverse items-center gap-4 mb-4">
                {/* Gold Source Badge */}
                <div
                    className="
                    w-15 h-15 rounded-full border-4 border-[var(--color-gold)]
                    flex items-center justify-center cursor-pointer text-[var(--color-cream)]"
                    style={{
                        background: `linear-gradient(18deg,var(--color-gold) 0%,rgb(238, 203, 89) 95%)`,
                    }}
                >
                    <motion.div
                        key={context.flags.source}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        {context.flags.source === 'initial' && <SourceBadge icon="cottage" message="No location" />}
                        {context.flags.source === 'map' && <SourceBadge icon="map" message="Map adjusted" />}
                        {context.flags.source === 'search' && <SourceBadge icon="search" message="Address found" />}
                        {context.flags.source === 'geolocation' && <SourceBadge icon="podcasts" message="Location detected" />}
                        {context.flags.source === 'manual' && <SourceBadge icon="edit" message="Custom entry" />}
                    </motion.div>
                </div>

                {/* Header Text */}
                <div className="font-playfair h-full flex flex-col items-end justify-center gap-1 text-xl text-[var(--color-chocolate)]">
                    <h2 className='font-bold text-2xl overflow-hidden text-ellipsis'>Destination</h2>
                    <p className="text-[var(--color-chocolate)] text-[0.85rem] overflow-hidden text-ellipsis">
                        Where we should bring your delicacies
                    </p>
                </div>
            </div>

            {/* Search Section */}
            <div className="relative flex flex-row-reverse items-center justify-between gap-4">
                <AutocompleteInput
                    onPlaceSelect={({ location, autoFormValues }) => {
                        context.updateMarker(location);
                        context.updateAddress(autoFormValues);
                        context.setFlag('source', 'search');
                        context.setFlag('skipNextReverseGeocode', true);
                    }}
                />

                {/* Geolocation Button */}
                <div className="relative">
                    <GeolocationButton
                        onLocate={(coords) => {
                            context.updateMarker(coords);
                            context.setFlag('userUsedGeolocation', true);
                            context.setFlag('source', 'geolocation');
                        }}
                        centerMap={true}
                    />
                </div>
            </div>

            {/* Map Section */}
            <div className="relative flex flex-row mt-4">
                <MapViewport
                    center={context.center}
                    markerPosition={context.marker}
                    onMarkerDragEnd={(coords) => {
                        context.updateMarker(coords, false);
                        context.setFlag('source', 'map');
                    }}
                />
            </div>

            {/* Address Section */}
            <div className="relative flex-grow mt-4">
                <ReverseGeocodeHandler coords={context.marker}>
                    {({ loading, result }) => (
                        <>
                            <ReverseGeocodeUpdater result={result} loading={loading} />
                            <AddressForm
                                initialValues={context.address}
                                onChange={(address) => {
                                    context.updateAddress(address);
                                    context.setFlag('source', 'manual');
                                }}
                                validationErrors={context.validationErrors}
                                fieldToPulse={fieldToPulse}
                            />
                        </>
                    )}
                </ReverseGeocodeHandler>
            </div>

            {/* Navigation & Accessibility */}
            <div className="relative mt-6">
                <Navigation
                    onBack={prevPage}
                    onNext={nextPage}
                    onFinish={submitLocation}
                    isRight={isRight}
                    isMobile={isMobile}
                />
                <div
                    aria-live="polite"
                    className="sr-only"
                >
                    {context.address && `Location set to ${context.address.city}, ${context.address.country}`}
                </div>
            </div>

            <button
                onClick={() => console.log({
                    ...context.address,
                    location: context.marker,
                    source: context.flags.source
                })}
                className="bg-amber-600 text-white px-4 py-2 rounded"
            >
                Test Submit
            </button>
        </div>
    );
};

// Outer wrapper with required providers
export const LocationPage = ({ prevPage, nextPage, isRight, isMobile }) => (
    <MapLoader>
        <MapProvider>
            <LocationPageCore
                prevPage={prevPage}
                nextPage={nextPage}
                isRight={isRight}
                isMobile={isMobile}
            />
        </MapProvider>
    </MapLoader>
);