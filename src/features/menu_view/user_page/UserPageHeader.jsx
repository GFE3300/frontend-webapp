import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import Icon from '../../../components/common/Icon.jsx';
import MenuSearchBar from '../subcomponents/MenuSearchBar';
import CategoryFilterBar from '../subcomponents/CategoryFilterBar';
import TagFilterPills from '../subcomponents/TagFilterPills';

// --- Styling & Theming Constants ---
const CONTAINER_PADDING_X = "px-4 md:px-6";
const HEADER_AREA_PADDING_Y = "py-3 sm:py-4";
const HEADER_AREA_BG_LIGHT = "bg-white";
const HEADER_AREA_BG_DARK = "dark:bg-neutral-800";
const HEADER_AREA_SHADOW = "shadow-md";

const LOGO_MAX_HEIGHT_MOBILE = "h-12 w-12";
const LOGO_MAX_HEIGHT_DESKTOP = "h-12 sm:w-12";
const LOGO_MARGIN_RIGHT = "mr-3 sm:mr-4";
const LOGO_FALLBACK_ICON_SIZE_MOBILE = "w-10 h-10";
const LOGO_FALLBACK_ICON_SIZE_DESKTOP = "w-12 h-12";
const LOGO_FALLBACK_ICON_COLOR = "text-neutral-400 dark:text-neutral-500";
const LOGO_ROUNDED = "rounded-full";

const FONT_MONTSERRAT = "font-montserrat";
const FONT_INTER = "font-inter";
const FULL_PAGE_TEXT_PRIMARY = "text-neutral-800 dark:text-neutral-100";
const FULL_PAGE_TEXT_SECONDARY = "text-neutral-600 dark:text-neutral-300";
const NEUTRAL_TEXT_MUTED = "text-neutral-500 dark:text-neutral-400";
const ROSE_ACCENT_RING_FOCUS = "focus-visible:ring-rose-500 dark:focus-visible:ring-rose-400";

/**
 * Header component for the User Page, including business logo, table & guest info, search, and filters.
 * @param {object} props - Component props.
 * @param {object} props.venueContext - Venue context containing business name, logo, table info, etc.
 * @param {boolean} props.logoError - Flag indicating if the logo image failed to load.
 * @param {Function} props.onLogoError - Callback for logo image load failure.
 * @param {Function} props.onOpenSettingsModal - Callback to open the guest settings modal.
 * @param {object} props.searchProps - Props for the MenuSearchBar component.
 * @param {object} props.categoryFilterProps - Props for the CategoryFilterBar component.
 * @param {object} props.tagFilterProps - Props for the TagFilterPills component.
 * @param {object} props.animationProps - Props for controlling the header's animation.
 * @param {Function} props.scrollToProductCardFn - Callback to scroll to a product card.
 * @returns {React.ReactElement} The header component.
 */
const UserPageHeader = ({
    venueContext,
    logoError,
    onLogoError,
    onOpenSettingsModal, // Changed from onEditGuestProfile
    searchProps,
    categoryFilterProps,
    // tagFilterProps, // Temporarily commented if not used
    animationProps,
    scrollToProductCardFn,
}) => {
    const businessName = venueContext?.businessName || "Restaurant Menu";
    const businessLogoUrl = venueContext?.businessLogoUrl;

    const displayFallbackIcon = logoError || !businessLogoUrl;

    return (
        <motion.div
            className="sticky top-0 z-30"
            animate={{ y: animationProps.headerTargetY }}
            transition={animationProps.headerTransition}
        >
            <header className={`${CONTAINER_PADDING_X} ${HEADER_AREA_PADDING_Y} ${HEADER_AREA_BG_LIGHT} ${HEADER_AREA_BG_DARK} ${HEADER_AREA_SHADOW}`} role="banner">
                <div className="container mx-auto">
                    <div className="flex justify-between items-center mb-3 sm:mb-4">
                        <div className="flex items-center flex-1 min-w-0">
                            {displayFallbackIcon ? (
                                <div
                                    className={`bg-neutral-200 dark:bg-neutral-600 flex items-center justify-center ${LOGO_MAX_HEIGHT_MOBILE} sm:${LOGO_MAX_HEIGHT_DESKTOP} ${LOGO_ROUNDED} ${LOGO_FALLBACK_ICON_SIZE_MOBILE} sm:${LOGO_FALLBACK_ICON_SIZE_DESKTOP} ${LOGO_MARGIN_RIGHT} ${LOGO_FALLBACK_ICON_COLOR}`}
                                >
                                    <Icon
                                        name="storefront"
                                        aria-label={`${businessName} logo placeholder`}
                                        variations={{ fill: 0, weight: 600, grade: 0, opsz: 48 }}
                                    />
                                </div>
                            ) : (
                                <img
                                    src={businessLogoUrl}
                                    alt={`${businessName} logo`}
                                    className={`${LOGO_MAX_HEIGHT_MOBILE} sm:${LOGO_MAX_HEIGHT_DESKTOP} ${LOGO_MARGIN_RIGHT} w-auto object-contain ${LOGO_ROUNDED}`}
                                    onError={() => {
                                        if (onLogoError) onLogoError();
                                    }}
                                    loading="lazy"
                                />
                            )}
                            <div className="flex-1 min-w-0 font-montserrat">
                                <h1 className={`text-xl sm:text-2xl font-semibold ${FONT_MONTSERRAT} ${FULL_PAGE_TEXT_PRIMARY} truncate`} title={businessName}>
                                    {businessName}
                                </h1>
                                <div className="flex items-center font-medium mt-0.5">
                                    <p className={`text-xs sm:text-sm ${FULL_PAGE_TEXT_SECONDARY} truncate ${FONT_INTER}`}>
                                        Table: {venueContext?.tableNumber || "N/A"}
                                        <span className="mx-1 sm:mx-1.5 select-none" aria-hidden="true">•</span>
                                        Guests: {venueContext?.numberOfPeople || 1}
                                        <span className="mx-1 sm:mx-1.5 select-none" aria-hidden="true">•</span>
                                        For: {venueContext?.userName || "Guest"}
                                    </p>
                                    {/* --- MODIFIED SECTION START --- */}
                                    {onOpenSettingsModal && (
                                        <button
                                            onClick={onOpenSettingsModal}
                                            className={`ml-1.5 sm:ml-2 p-1 flex items-center justify-center w-6 h-6 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-neutral-800 ${ROSE_ACCENT_RING_FOCUS}`}
                                            aria-label="Open guest settings"
                                            title="Guest Settings"
                                        >
                                            <Icon name="settings" className={`w-4 h-4 ${NEUTRAL_TEXT_MUTED}`} style={{ fontSize: "1rem" }} />
                                        </button>
                                    )}
                                    {/* --- MODIFIED SECTION END --- */}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Search Bar */}
                    <MenuSearchBar
                        onSearchSubmit={searchProps.onSearchSubmit}
                        onSuggestionSelect={(suggestion) => searchProps.onSuggestionSelect(suggestion, scrollToProductCardFn)}
                        businessIdentifier={searchProps.businessIdentifier}
                        className="w-full"
                    />
                </div>
            </header>

            <div className={`${CONTAINER_PADDING_X} ${HEADER_AREA_BG_LIGHT} ${HEADER_AREA_BG_DARK} py-1 ${animationProps.headerTargetY === "-100%" ? HEADER_AREA_SHADOW : 'sm:shadow-sm'}`}>
                <div className="container mx-auto">
                    <CategoryFilterBar
                        categoriesData={categoryFilterProps.categoriesData}
                        activeCategoryId={categoryFilterProps.activeCategoryId}
                        onSelectCategory={categoryFilterProps.onSelectCategory}
                        isLoading={categoryFilterProps.isLoading}
                        isError={categoryFilterProps.isError}
                        error={categoryFilterProps.error}
                    />

                    {/* Placeholder for TagFilterPills if it were to be used here */}
                    {/* 
                    <TagFilterPills
                        tagsData={tagFilterProps.tagsData}
                        activeTagIds={tagFilterProps.activeTagIds}
                        onToggleTag={tagFilterProps.onToggleTag}
                        isLoading={tagFilterProps.isLoading}
                        isError={tagFilterProps.isError}
                        error={tagFilterProps.error}
                    /> 
                    */}
                </div>
            </div>
        </motion.div>
    );
};

export default UserPageHeader;