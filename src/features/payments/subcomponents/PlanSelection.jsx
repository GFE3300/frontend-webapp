// frontend/src/features/payments/subcomponents/PlanSelection.jsx
// Content is identical to the provided frontend/src/features/register/subcomponents/PlanSelection.jsx
// The key change is its new file path and the import below:

import React, { memo, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import { motion, useReducedMotion } from 'framer-motion';
import Icon from "../../../components/common/Icon";
// This import path is relative to the new location and should still work:
import { scriptLines_Components as scriptLines } from '../utils/script_lines';

/**
 * PlanSelection component displays available subscription plans with detailed information.
 * It allows the user to choose a plan, triggering a callback with the selected plan's details.
 * Features enhanced aesthetics, animations, clear presentation of plan benefits, and dynamic discount display capabilities.
 * This component is memoized for performance, internationalized, and adheres to high code quality standards.
 * @component PlanSelection
 * @param {Object} props - Component properties.
 * @param {Function} props.onPlanSelect - Callback function invoked when a plan is selected. It receives the full plan object,
 *                                        including any applicable discount information. This prop is required.
 * @param {string} [props.themeColor=scriptLines.planSelection.themeColorDefault] - The primary theme color used for highlighting the recommended plan
 *                                         and other accents (e.g., "rose", "blue"). Defaults to a value from `scriptLines`.
 * @param {boolean} [props.isLoading=false] - If true, indicates a global loading state (e.g., parent component is submitting payment),
 *                                          which disables interactions on plan selection buttons. Defaults to `false`.
 */
const PlanSelection = ({ onPlanSelect, themeColor = '', isLoading = false }) => {
    // ===========================================================================
    // Configuration
    // ===========================================================================
    const prefersReducedMotion = useReducedMotion();

    // Construct PLANS_DATA by merging static configuration (IDs, icons, logic flags)
    // with localized text from scriptLines. This is crucial for i18n.
    const PLANS_DATA = useMemo(() => {
        const staticPlanData = [ // Define non-localizable parts here
            {
                id: 'starter_essentials', // Matches updated ID in script_lines
                iconName: 'bolt',
                featuresLogic: [true, true, true, true, true, false, false, false], // Corresponds to features text
                theme: {
                    borderColor: 'border-purple-500 dark:border-purple-400',
                    buttonClass: 'bg-purple-500 hover:bg-purple-600 text-white',
                    textColor: 'text-purple-500 dark:text-purple-400',
                    gradientFrom: 'from-purple-50 dark:from-purple-900/30',
                    gradientTo: 'to-transparent',
                },
                highlight: false,
            },
            {
                id: 'growth_accelerator', // Matches updated ID in script_lines
                iconName: 'mode_heat',
                featuresLogic: [true, true, true, true, true, true, true, true],
                theme: { // Theme for standard plan depends on the global themeColor prop
                    borderColor: themeColor === "rose" ? 'border-rose-500 dark:border-rose-400' : 'border-blue-500 dark:border-blue-400',
                    buttonClass: `${themeColor === "rose" ? 'bg-rose-500 hover:bg-rose-600' : 'bg-blue-500 hover:bg-blue-600'} text-white shadow-lg`,
                    textColor: themeColor === "rose" ? 'text-rose-500 dark:text-rose-400' : 'text-blue-500 dark:text-blue-400',
                    gradientFrom: themeColor === "rose" ? 'from-rose-50 dark:from-rose-900/30' : 'from-blue-50 dark:from-blue-900/30',
                    gradientTo: 'to-transparent',
                },
                highlight: true, // This plan is marked as highlighted (e.g., "Most Popular")
                discountLogic: { // Non-localizable discount logic/flags
                    isActive: true,
                    badgeColor: 'bg-green-500',
                    textColor: 'text-green-600 dark:text-green-400',
                }
            },
            {
                id: 'premium_pro_suite', // Matches updated ID in script_lines
                iconName: 'verified',
                featuresLogic: [true, true, true, true, true, true, true],
                theme: {
                    borderColor: 'border-yellow-500 dark:border-yellow-400',
                    buttonClass: 'bg-yellow-500 hover:bg-yellow-600 text-white',
                    textColor: 'text-yellow-500 dark:text-yellow-400',
                    gradientFrom: 'from-yellow-50 dark:from-yellow-900/30',
                    gradientTo: 'to-transparent',
                },
                highlight: false,
            }
        ];

        // Merge static data with localized text
        return scriptLines.planSelection.plans.map((localizedPlan, index) => {
            const staticData = staticPlanData.find(p => p.id === localizedPlan.id) || staticPlanData[index]; // Fallback to index if IDs mismatch
            return {
                ...staticData, // Static parts like id, iconName, theme, highlight
                ...localizedPlan, // Localized text: name, price, frequency, description, features texts, whyThisPlan
                features: localizedPlan.features.map((feature, fIndex) => ({
                    text: feature.text,
                    check: staticData.featuresLogic[fIndex] // Combine localized text with logic for checkmark
                })),
                // Merge discount: localized text from scriptLines, logic/styling from staticData
                discount: localizedPlan.discount ? {
                    ...staticData.discountLogic, // isActive, badgeColor, textColor from static
                    ...localizedPlan.discount    // offerTitle, displayPrice, etc. from localized
                } : null,
                // Ensure badgeText is localized, falling back if necessary
                badgeText: staticData.highlight ? (localizedPlan.badgeText || scriptLines.planSelection.badges.mostPopular) : null,
            };
        });
    }, [themeColor]); // Recalculate if themeColor changes, affecting standard plan's theme

    // Animation variants for container and plan cards, respecting reduced motion preferences.
    const containerAnimationVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { delayChildren: 0.2, staggerChildren: 0.15, duration: 0.4 } },
        exit: { opacity: 0, transition: { duration: 0.3 } }
    };
    const planCardAnimationVariants = {
        hidden: { y: prefersReducedMotion ? 0 : 25, opacity: 0, scale: prefersReducedMotion ? 1 : 0.97 },
        visible: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 120, damping: 14, duration: prefersReducedMotion ? 0 : 0.5 } },
    };

    // ===========================================================================
    // State
    // ===========================================================================
    const [selectedPlanId, setSelectedPlanId] = useState(null); // Tracks the ID of the currently visually selected plan.
    const [isProcessingSelection, setIsProcessingSelection] = useState(false); // True when a plan selection is in progress (after click, before onPlanSelect completes).

    // ===========================================================================
    // Handlers
    // ===========================================================================
    /**
     * Handles the selection of a plan. Sets processing state, updates selected plan ID for visual feedback,
     * and then invokes the `onPlanSelect` callback after a short delay to allow UI updates.
     * @param {Object} plan - The full plan object that was selected.
     */
    const handleSelectAndProceed = useCallback((plan) => {
        console.log("[PlanSelection] handleSelectAndProceed() called for plan:", plan);
        if (isProcessingSelection || isLoading) return; // Prevent multiple clicks or selection during global load

        setIsProcessingSelection(true);
        setSelectedPlanId(plan.id);

        // Simulate processing time before calling the parent callback.
        // In a real app, this might be an API call or other async operation.
        setTimeout(() => {
            onPlanSelect(plan); // Pass the full plan object, now constructed with localized and static data.
            // The parent component is responsible for managing its own loading/success/error states
            // and potentially resetting this component's `isProcessingSelection` via a prop if needed,
            // or this component will reset upon unmount/re-render if `isLoading` from parent changes.
            // For this example, we don't automatically reset isProcessingSelection here.
            // setIsProcessingSelection(false); // Parent should control this via isLoading or other means
        }, 800); // 800ms delay for visual feedback of processing.
    }, [onPlanSelect, isProcessingSelection, isLoading]);

    // ===========================================================================
    // Validation (Prop Validation)
    // ===========================================================================
    // Ensures that the critical `onPlanSelect` callback is provided.
    if (typeof onPlanSelect !== 'function') {
        console.error(scriptLines.planSelection.console.invalidOnPlanSelectProp);
        // Render a fallback UI if the component cannot function correctly.
        return (
            <div className="flex items-center justify-center h-screen p-4">
                <p className="text-red-600 dark:text-red-400 p-4 bg-red-100 dark:bg-red-900/30 rounded-lg shadow-md text-center">
                    {scriptLines.planSelection.errors.functionalityUnavailable}
                </p>
            </div>
        );
    }

    // ===========================================================================
    // Rendering
    // ===========================================================================
    return (
        <motion.div
            className="plan-selection-container flex flex-col items-center justify-center min-h-screen py-12 sm:py-16 px-4 sm:px-6 lg:px-8 font-montserrat"
            variants={containerAnimationVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            data-testid="plan-selection"
        >
            {/* Page Header: Title and Subtitle - This part is often handled by the parent page (PlanAndPaymentPage) */}
            {/* 
            <motion.div
                className="text-center mb-12 sm:mb-16"
                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : -20 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }}
            >
                <h1 className="text-4xl sm:text-5xl font-medium text-neutral-800 dark:text-white tracking-tight">
                    {scriptLines.planSelection.title}
                </h1>
                <p className="mt-4 text-lg sm:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
                    {scriptLines.planSelection.subtitle}
                </p>
            </motion.div> 
            */}

            {/* Plan Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl w-full">
                {PLANS_DATA.map((plan) => {
                    const discountActive = plan.discount?.isActive;
                    // Determine colors for discount elements, falling back to defaults if not specified in plan's discount object
                    const discountTextColor = plan.discount?.textColor || (plan.discountLogic?.textColor || 'text-green-600 dark:text-green-400');
                    const discountBadgeBgColor = plan.discount?.badgeColor || (plan.discountLogic?.badgeColor || 'bg-green-500');
                    const discountOfferBadgeText = plan.discount?.badgeText || scriptLines.planSelection.badges.specialOffer;

                    return (
                        <motion.div
                            key={plan.id}
                            className={`plan-card relative flex flex-col rounded-2xl border-2 overflow-hidden
                                        ${selectedPlanId === plan.id
                                    ? `${plan.theme.borderColor} ring-4 ${plan.theme.borderColor.replace('border-', 'ring-')}/40 transform scale-105 shadow-2xl z-20` // Elevate selected card
                                    : `${plan.theme.borderColor} shadow-lg hover:shadow-xl z-10`} 
                                        ${plan.highlight && selectedPlanId !== plan.id ? 'lg:scale-105' : ''}
                                        bg-white/20 dark:bg-neutral-800/20 backdrop-blur-md transition-all duration-300 ease-out
                                      `}
                            variants={planCardAnimationVariants}
                            whileHover={!isProcessingSelection && !isLoading && (!selectedPlanId || selectedPlanId === plan.id) ? { y: prefersReducedMotion ? 0 : -8, transition: { type: 'spring', stiffness: 250, damping: 15 } } : {}}
                            data-testid={`plan-card-${plan.id}`}
                        >
                            {/* Background Gradient Effect */}
                            <div className={`absolute inset-0 opacity-30 ${plan.theme.gradientFrom} ${plan.theme.gradientTo}`} />

                            {/* Discount Badge (Top-Left, if applicable) */}
                            {discountActive && plan.discount.offerTitle && ( // Ensure offerTitle exists to display this badge
                                <div className={`absolute -top-px -left-px px-4 py-1.5 text-xs font-semibold text-white ${discountBadgeBgColor} rounded-br-xl rounded-tl-lg shadow-md z-10`}>
                                    {discountOfferBadgeText}
                                </div>
                            )}

                            {/* Recommended/Popular Badge (Top-Right, if applicable) */}
                            {plan.highlight && (
                                <div className={`absolute -top-px -right-px px-5 py-1.5 text-xs font-semibold text-white ${plan.theme.buttonClass.split(' ')[0]} rounded-bl-xl rounded-tr-lg shadow-md z-10`}>
                                    {plan.badgeText} {/* Uses localized badgeText from merged PLANS_DATA */}
                                </div>
                            )}

                            {/* Plan Content Area */}
                            <div className="p-6 sm:p-8 flex flex-col flex-grow">
                                {/* Plan Header: Icon and Name */}
                                <div className="flex items-center mb-5">
                                    <Icon name={plan.iconName} className={`w-9 h-9 sm:w-10 sm:h-10 mr-3 sm:mr-4 ${plan.theme.textColor}`} style={{ fontSize: '36px' }} variations={{ fill: 0, weight: 400, grade: 0, opsz: 40 }} />
                                    <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-800 dark:text-white">{plan.name}</h2>
                                </div>

                                {/* Price Section: Displays normal price or discount information */}
                                <div className="mb-6">
                                    {discountActive && plan.discount ? (
                                        // Discounted Price Display
                                        <div className={`p-3 -m-3 mb-3 rounded-lg ${discountTextColor ? discountTextColor.replace('text-', 'bg-').replace(/-(\d+)/, '-50 dark:$&-900/30').replace('-50 dark:text-green-400-900/30', '-50 dark:bg-green-900/30') : 'bg-green-50 dark:bg-green-900/30'} border ${discountTextColor ? discountTextColor.replace('text-', 'border-').replace(/-(\d+)/, '-200 dark:$&-700').replace('-200 dark:text-green-400-700', '-200 dark:border-green-700') : 'border-green-200 dark:border-green-700'}`}>
                                            {plan.discount.offerTitle && (
                                                <p className={`text-xl font-semibold mb-1 ${discountTextColor}`}>{plan.discount.offerTitle}</p>
                                            )}
                                            <div className="flex items-baseline mb-1">
                                                <span className={`text-4xl sm:text-5xl font-medium ${discountTextColor}`}>{plan.discount.displayPrice}</span>
                                                {plan.discount.priceSuffix && (
                                                    <span className={`text-lg font-medium ml-1.5 ${discountTextColor}`}>{plan.discount.priceSuffix}</span>
                                                )}
                                            </div>
                                            {plan.discount.originalPriceText && (
                                                <p className="text-sm text-neutral-500 dark:text-neutral-400 line-through">
                                                    {plan.discount.originalPriceText}
                                                </p>
                                            )}
                                            {plan.discount.details && (
                                                <p className="mt-2 text-xs text-neutral-700 dark:text-neutral-300">
                                                    {plan.discount.details}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        // Standard Price Display
                                        <>
                                            <span className={`text-4xl sm:text-5xl font-medium ${plan.theme.textColor}`}>€ {plan.price}</span>
                                            <span className="text-lg font-medium text-neutral-500 dark:text-neutral-400">{plan.frequency}</span>
                                        </>
                                    )}
                                    {/* Plan Description */}
                                    <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">
                                        {plan.description.join(' ')}
                                    </p>
                                </div>

                                {/* Features List */}
                                <ul className="space-y-2.5 text-sm text-neutral-700 dark:text-neutral-200 mb-8 flex-grow">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className={`flex items-center ${!feature.check ? 'opacity-60' : ''}`}>
                                            <Icon
                                                name={feature.check ? "check_circle" : "remove_circle_outline"}
                                                className={`w-6 h-6 ${feature.check ? 'text-green-500 dark:text-green-400' : 'text-neutral-400 dark:text-neutral-500'} mr-2.5 flex-shrink-0`}
                                                variations={{ fill: feature.check ? 1 : 0, weight: 400 }}
                                            />
                                            <span>{feature.text}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* "Why This Plan?" Section */}
                                <div className="mb-8 text-xs text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-700/60 p-3 rounded-md">
                                    <p className={`font-semibold mb-1 ${plan.theme.textColor}`}>Why {plan.name}?</p>
                                    {plan.whyThisPlan}
                                </div>

                                {/* Action Button: Select Plan */}
                                <motion.button
                                    onClick={() => handleSelectAndProceed(plan)}
                                    disabled={isProcessingSelection || isLoading}
                                    className={`w-full mt-auto py-3.5 px-6 rounded-lg font-semibold text-md sm:text-lg transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900
                                                ${isProcessingSelection && selectedPlanId === plan.id ? 'opacity-70 cursor-wait' : ''}
                                                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} 
                                                ${plan.theme.buttonClass} shadow-md hover:shadow-lg`}
                                    whileHover={{ scale: (isProcessingSelection || isLoading) ? 1 : 1.03, y: (isProcessingSelection || isLoading) ? 0 : -2 }}
                                    whileTap={{ scale: (isProcessingSelection || isLoading) ? 1 : 0.97 }}
                                    data-testid={`select-plan-${plan.id}-button`}
                                    aria-live="polite" // Announce changes in button text (e.g., Processing...)
                                >
                                    {isProcessingSelection && selectedPlanId === plan.id ? (
                                        <> <Icon name="hourglass_top" className="animate-spin w-5 h-5 mr-2 inline" /> {scriptLines.planSelection.buttons.processing} </>
                                    ) : selectedPlanId === plan.id ? ( // This state might not be reached if parent handles redirect quickly
                                        <> <Icon name="done_all" className="w-5 h-5 mr-2 inline" /> {scriptLines.planSelection.buttons.planSelected} </>
                                    ) : (
                                        scriptLines.planSelection.buttons.chooseThisPlan
                                    )}
                                </motion.button>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Footer Note - This part is often handled by the parent page (PlanAndPaymentPage) */}
            {/* 
            <p className="mt-12 sm:mt-16 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 text-center max-w-md mx-auto">
                {scriptLines.planSelection.footerNote}
            </p> 
            */}
        </motion.div>
    );
};

// Define prop types for type safety and improved documentation.
PlanSelection.propTypes = {
    /** Callback function invoked when a plan is selected. Receives the full plan object. Required. */
    onPlanSelect: PropTypes.func.isRequired,
    /** The primary theme color for accents. Optional. */
    themeColor: PropTypes.string,
    /** If true, indicates a global loading state, disabling interactions. Optional. */
    isLoading: PropTypes.bool,
};

// Specify default props for optional props.
PlanSelection.defaultProps = {
    themeColor: scriptLines.planSelection.themeColorDefault, // Default theme color from localized strings
    isLoading: false, // Not loading by default
};

// Export the component, memoized for performance.
export default memo(PlanSelection);