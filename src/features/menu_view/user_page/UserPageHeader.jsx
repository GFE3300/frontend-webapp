import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../components/common/Icon.jsx';
import MenuSearchBar from '../subcomponents/MenuSearchBar';
import CategoryFilterBar from '../subcomponents/CategoryFilterBar';
import TagFilterPills from '../subcomponents/TagFilterPills';
import { scriptLines_menu_view as sl } from '../utils/script_lines.js'; // LOCALIZATION
import { interpolate } from '../utils/script_lines.js'; // LOCALIZATION

// --- Styling & Theming Constants ---
const CONTAINER_PADDING_X = "px-4 md:px-6";
const HEADER_AREA_PADDING_Y = "py-3 sm:py-4";
const HEADER_AREA_BG_LIGHT = "bg-white";
const HEADER_AREA_BG_DARK = "dark:bg-neutral-800";
const HEADER_AREA_SHADOW = "shadow-md";

const LOGO_MAX_HEIGHT_MOBILE = "h-12 w-12";
const LOGO_MARGIN_RIGHT = "mr-3 sm:mr-4";
const LOGO_FALLBACK_ICON_SIZE = "w-10 h-10 sm:w-12 sm:h-12";
const LOGO_FALLBACK_ICON_COLOR = "text-neutral-400 dark:text-neutral-500";
const LOGO_ROUNDED = "rounded-full";

const FONT_MONTSERRAT = "font-montserrat";
const FONT_INTER = "font-inter";
const TEXT_PRIMARY = "text-neutral-800 dark:text-neutral-100";
const TEXT_SECONDARY = "text-neutral-600 dark:text-neutral-300";
const TEXT_MUTED = "text-neutral-500 dark:text-neutral-400";
const ROSE_ACCENT_RING_FOCUS = "focus-visible:ring-2 focus-visible:ring-rose-500 dark:focus-visible:ring-rose-400";

/**
 * Header component for the User Page, including business logo, table & guest info, search, and filters.
 */
const UserPageHeader = ({
    venueContext,
    logoError,
    onLogoError,
    onOpenSettingsModal,
    searchProps,
    categoryFilterProps,
    tagFilterProps,
    animationProps,
    scrollToProductCardFn,
}) => {
    const businessName = venueContext?.businessName || (sl.userPageHeader.defaultBusinessName || "Restaurant Menu");
    const businessLogoUrl = venueContext?.businessLogoUrl;
    const displayFallbackIcon = logoError || !businessLogoUrl;

    return (
        <motion.div
            className="sticky top-0 z-30"
            animate={{ y: animationProps.headerTargetY }}
            transition={animationProps.headerTransition}
            style={{'--header-height': 'var(--actual-header-height, 9rem)'}} // CSS var for dynamic height
        >
            <header className={`${CONTAINER_PADDING_X} ${HEADER_AREA_PADDING_Y} ${HEADER_AREA_BG_LIGHT} ${HEADER_AREA_BG_DARK} ${HEADER_AREA_SHADOW}`} role="banner">
                <div className="container mx-auto">
                    <div className="flex justify-between items-center mb-3 sm:mb-4">
                        <div className="flex items-center flex-1 min-w-0">
                            {displayFallbackIcon ? (
                                <div className={`bg-neutral-200 dark:bg-neutral-600 flex items-center justify-center ${LOGO_MAX_HEIGHT_MOBILE} ${LOGO_ROUNDED} ${LOGO_FALLBACK_ICON_SIZE} ${LOGO_MARGIN_RIGHT} ${LOGO_FALLBACK_ICON_COLOR}`}>
                                    <Icon name="storefront" aria-label={interpolate(sl.userPageHeader.logoPlaceholderAriaLabel, { businessName }) || `${businessName} logo placeholder`} style={{ fontSize: "2rem" }} />
                                </div>
                            ) : (
                                <img src={businessLogoUrl} alt={interpolate(sl.userPageHeader.logoAlt, { businessName }) || `${businessName} logo`} className={`${LOGO_MAX_HEIGHT_MOBILE} ${LOGO_MARGIN_RIGHT} w-auto object-contain ${LOGO_ROUNDED}`} onError={onLogoError} loading="lazy" />
                            )}
                            <div className="flex-1 min-w-0">
                                <h1 className={`text-xl sm:text-2xl font-semibold ${FONT_MONTSERRAT} ${TEXT_PRIMARY} truncate`} title={businessName}>{businessName}</h1>
                                <div className="flex items-center mt-0.5">
                                    <p className={`text-xs sm:text-sm ${TEXT_SECONDARY} truncate ${FONT_INTER}`}>
                                        {sl.userPageHeader.tableLabel || "Table:"} {venueContext?.tableNumber || "N/A"}
                                        <span className="mx-1.5 select-none" aria-hidden="true">•</span>
                                        {sl.userPageHeader.guestLabel || "For:"} {venueContext?.userName || (sl.userPageHeader.guestFallback || "Guest")}
                                    </p>
                                    <button
                                        onClick={onOpenSettingsModal}
                                        className={`ml-1.5 p-1 flex items-center justify-center w-7 h-7 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors focus:outline-none focus-visible:ring-offset-1 dark:focus-visible:ring-offset-neutral-800 ${ROSE_ACCENT_RING_FOCUS}`}
                                        aria-label={sl.userPageHeader.settingsAriaLabel || "Open guest settings"}
                                        title={sl.userPageHeader.settingsTitle || "Guest Settings"}
                                    >
                                        <Icon name="badge" className={`w-5 h-5 ${TEXT_MUTED}`} style={{ fontSize: "1.25rem" }} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <MenuSearchBar onSearchSubmit={searchProps.onSearchSubmit} onSuggestionSelect={(suggestion) => searchProps.onSuggestionSelect(suggestion, scrollToProductCardFn)} businessIdentifier={searchProps.businessIdentifier} className="w-full" />
                </div>
            </header>
            <div className={`${CONTAINER_PADDING_X} ${HEADER_AREA_BG_LIGHT} ${HEADER_AREA_BG_DARK} py-1 ${animationProps.headerTargetY === "-100%" ? HEADER_AREA_SHADOW : 'sm:shadow-sm'}`}>
                <div className="container mx-auto">
                    <CategoryFilterBar {...categoryFilterProps} />
                    {tagFilterProps && <TagFilterPills {...tagFilterProps} />}
                </div>
            </div>
        </motion.div>
    );
};

export default UserPageHeader;