// frontend/src/features/menu_view/user_page/UserPageHeader.jsx
import React from 'react';
import { motion } from 'framer-motion'; // Ensured motion is imported
import Icon from '../../../components/common/Icon.jsx';
import MenuSearchBar from '../subcomponents/MenuSearchBar';
import CategoryFilterBar from '../subcomponents/CategoryFilterBar';
import TagFilterPills from '../subcomponents/TagFilterPills';

// Styling Constants (as per Userpage.jsx definitions for consistency)
const CONTAINER_PADDING_X = "px-4 md:px-6"; // Used by this component directly
const HEADER_AREA_PADDING_Y = "py-3 sm:py-4";
const HEADER_AREA_BG_LIGHT = "bg-white";
const HEADER_AREA_BG_DARK = "dark:bg-neutral-800";
const HEADER_AREA_SHADOW = "shadow-md"; // Applied to the overall header and filter bar container

const LOGO_MAX_HEIGHT_MOBILE = "h-10";
const LOGO_MAX_HEIGHT_DESKTOP = "h-12";
const LOGO_MARGIN_RIGHT = "mr-3 sm:mr-4";
const LOGO_FALLBACK_ICON_SIZE_MOBILE = "w-10 h-10"; // For icon when logo fails/missing
const LOGO_FALLBACK_ICON_SIZE_DESKTOP = "w-12 h-12";
const LOGO_FALLBACK_ICON_COLOR = "text-neutral-400 dark:text-neutral-500";
const LOGO_ROUNDED = "rounded-md"; // Radius for the actual logo image

const FONT_MONTSERRAT = "font-montserrat";
const FONT_INTER = "font-inter";
const FULL_PAGE_TEXT_PRIMARY = "text-neutral-800 dark:text-neutral-100"; // Adjusted for UserPageHeader title
const FULL_PAGE_TEXT_SECONDARY = "text-neutral-600 dark:text-neutral-300"; // Adjusted for UserPageHeader subtitle
const NEUTRAL_TEXT_MUTED = "text-neutral-500 dark:text-neutral-400";
const ROSE_ACCENT_RING_FOCUS = "focus-visible:ring-rose-500 dark:focus-visible:ring-rose-400"; // For focus states

const UserPageHeader = ({
    venueContext,
    logoError,
    onLogoError,
    onEditGuestProfile,
    searchProps,
    categoryFilterProps,
    tagFilterProps,
    animationProps, // { headerTargetY, headerTransition }
    scrollToProductCardFn,
}) => {
    const businessName = venueContext?.businessName || "Restaurant Menu";
    const businessLogoUrl = venueContext?.businessLogoUrl;

    // Task 3.1: Logo Display Verification
    const displayFallbackIcon = logoError || !businessLogoUrl;

    return (
        <motion.div
            className="sticky top-0 z-30"
            animate={{ y: animationProps.headerTargetY }} // Task 3.2: Scroll Animation
            transition={animationProps.headerTransition}   // Task 3.2: Scroll Animation
        >
            <header className={`${CONTAINER_PADDING_X} ${HEADER_AREA_PADDING_Y} ${HEADER_AREA_BG_LIGHT} ${HEADER_AREA_BG_DARK} ${HEADER_AREA_SHADOW}`} role="banner">
                <div className="container mx-auto"> {/* Standard container for content centering & max-width */}
                    <div className="flex justify-between items-center mb-3 sm:mb-4">
                        <div className="flex items-center flex-1 min-w-0"> {/* min-w-0 for truncation */}
                            {displayFallbackIcon ? (
                                <Icon
                                    name="storefront"
                                    className={`${LOGO_FALLBACK_ICON_SIZE_MOBILE} sm:${LOGO_FALLBACK_ICON_SIZE_DESKTOP} ${LOGO_MARGIN_RIGHT} ${LOGO_FALLBACK_ICON_COLOR}`}
                                    aria-label={`${businessName} logo placeholder`}
                                />
                            ) : (
                                <img
                                    src={businessLogoUrl}
                                    alt={`${businessName} logo`}
                                    className={`${LOGO_MAX_HEIGHT_MOBILE} sm:${LOGO_MAX_HEIGHT_DESKTOP} ${LOGO_MARGIN_RIGHT} w-auto object-contain ${LOGO_ROUNDED}`}
                                    onError={() => {
                                        console.warn("[UserPageHeader] Logo image failed to load:", businessLogoUrl);
                                        if (onLogoError) onLogoError();
                                    }}
                                    loading="lazy"
                                />
                            )}
                            <div className="flex-1 min-w-0"> {/* For text truncation */}
                                <h1 className={`text-xl sm:text-2xl font-bold ${FONT_MONTSERRAT} ${FULL_PAGE_TEXT_PRIMARY} truncate`} title={businessName}>
                                    {businessName}
                                </h1>
                                <div className="flex items-center mt-0.5">
                                    <p className={`text-xs sm:text-sm ${FULL_PAGE_TEXT_SECONDARY} truncate ${FONT_INTER}`}>
                                        Table: {venueContext?.tableNumber || "N/A"}
                                        <span className="mx-1 sm:mx-1.5 select-none" aria-hidden="true">•</span>
                                        Guests: {venueContext?.numberOfPeople || 1}
                                        <span className="mx-1 sm:mx-1.5 select-none" aria-hidden="true">•</span>
                                        For: {venueContext?.userName || "Guest"}
                                    </p>
                                    {/* Task 3.3: Edit Info Button */}
                                    {onEditGuestProfile && (
                                        <button
                                            onClick={onEditGuestProfile}
                                            className={`ml-1.5 sm:ml-2 p-1 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-neutral-800 ${ROSE_ACCENT_RING_FOCUS}`}
                                            aria-label="Edit guest name and number of guests"
                                            title="Edit guest info"
                                        >
                                            <Icon name="edit" className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${NEUTRAL_TEXT_MUTED}`} />
                                        </button>
                                    )}
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

            {/* Filter Bars Area - applies its own shadow if header is hidden */}
            {/* The shadow here might need to be conditional based on scroll state if the main header part is very tall */}
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
                    <TagFilterPills
                        tagsData={tagFilterProps.tagsData}
                        activeTagIds={tagFilterProps.activeTagIds}
                        onToggleTag={tagFilterProps.onToggleTag}
                        isLoading={tagFilterProps.isLoading}
                        isError={tagFilterProps.isError}
                        error={tagFilterProps.error}
                    />
                </div>
            </div>
        </motion.div>
    );
};

export default UserPageHeader;