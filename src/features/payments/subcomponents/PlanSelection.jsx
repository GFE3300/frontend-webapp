import React, { memo, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Icon from "../../../components/common/Icon";
import { scriptLines_Components as scriptLines } from '../utils/script_lines';
import { useSubscription } from '../../../contexts/SubscriptionContext'; 
import { useAuth } from '../../../contexts/AuthContext';

// Simple skeleton loader for plan cards
const PlanCardSkeleton = ({ themeColor = 'rose' }) => {
    const skeletonTheme = {
        rose: 'bg-rose-200 dark:bg-rose-800',
        blue: 'bg-blue-200 dark:bg-blue-800',
        purple: 'bg-purple-200 dark:bg-purple-800',
        yellow: 'bg-yellow-200 dark:bg-yellow-800',
    };
    return (
        <div className={`animate-pulse flex flex-col rounded-2xl border-2 border-neutral-200 dark:border-neutral-700 overflow-hidden shadow-lg bg-white/20 dark:bg-neutral-800/20 backdrop-blur-md p-6 sm:p-8`}>
            <div className="flex items-center mb-5">
                <div className={`w-10 h-10 rounded-full ${skeletonTheme[themeColor] || skeletonTheme.rose} mr-4`}></div>
                <div className={`h-7 w-3/5 rounded ${skeletonTheme[themeColor] || skeletonTheme.rose}`}></div>
            </div>
            <div className="mb-6">
                <div className={`h-10 w-1/2 rounded mb-2 ${skeletonTheme[themeColor] || skeletonTheme.rose}`}></div>
                <div className={`h-4 w-3/4 rounded ${skeletonTheme[themeColor] || skeletonTheme.rose}`}></div>
            </div>
            <div className="space-y-2.5 mb-8 flex-grow">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center">
                        <div className={`w-6 h-6 rounded-full ${skeletonTheme[themeColor] || skeletonTheme.rose} mr-2.5`}></div>
                        <div className={`h-4 w-4/5 rounded ${skeletonTheme[themeColor] || skeletonTheme.rose}`}></div>
                    </div>
                ))}
            </div>
            <div className={`h-12 w-full rounded-lg ${skeletonTheme[themeColor] || skeletonTheme.rose}`}></div>
        </div>
    );
};
PlanCardSkeleton.propTypes = {
    themeColor: PropTypes.string,
};


const PlanSelection = ({
    onPlanSelect,
    onManageSubscription, // New prop for handling "Manage Subscription" click
    themeColor = scriptLines.planSelection.themeColorDefault,
    isLoading = false, // Global loading state from parent (e.g., checkout processing)
}) => {
    const prefersReducedMotion = useReducedMotion();
    const { isAuthenticated } = useAuth(); // For completeness, though SubscriptionContext handles auth checks internally
    const {
        subscription: currentSubscription,
        isLoading: isSubscriptionLoading,
        error: subscriptionError,
    } = useSubscription();

    const PLAN_TIER_ORDER = useMemo(() => ({
        'starter_essentials': 0,
        'growth_accelerator': 1,
        'premium_pro_suite': 2,
    }), []);

    const PLANS_DATA = useMemo(() => {
        const staticPlanData = [
            {
                id: 'starter_essentials',
                iconName: 'bolt',
                featuresLogic: [true, true, true, true, true, false, false, false],
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
                id: 'growth_accelerator',
                iconName: 'mode_heat',
                featuresLogic: [true, true, true, true, true, true, true, true],
                theme: {
                    borderColor: themeColor === "rose" ? 'border-rose-500 dark:border-rose-400' : 'border-blue-500 dark:border-blue-400',
                    buttonClass: `${themeColor === "rose" ? 'bg-rose-500 hover:bg-rose-600' : 'bg-blue-500 hover:bg-blue-600'} text-white shadow-lg`,
                    textColor: themeColor === "rose" ? 'text-rose-500 dark:text-rose-400' : 'text-blue-500 dark:text-blue-400',
                    gradientFrom: themeColor === "rose" ? 'from-rose-50 dark:from-rose-900/30' : 'from-blue-50 dark:from-blue-900/30',
                    gradientTo: 'to-transparent',
                },
                highlight: true,
                discountLogic: {
                    isActive: true,
                    badgeColor: 'bg-green-500',
                    textColor: 'text-green-600 dark:text-green-400',
                }
            },
            {
                id: 'premium_pro_suite',
                iconName: 'verified',
                featuresLogic: [true, true, true, true, true, true, true, true], // Assuming all features for premium
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

        return scriptLines.planSelection.plans.map((localizedPlan) => {
            const staticData = staticPlanData.find(p => p.id === localizedPlan.id);
            if (!staticData) {
                console.warn(`[PlanSelection] No static data found for plan ID: ${localizedPlan.id}. Using localized data only.`);
                return {
                    ...localizedPlan,
                    theme: staticPlanData[0].theme, // Fallback theme
                    features: localizedPlan.features.map(f => ({ ...f, check: false })), // Default all features to false if no logic
                    highlight: false,
                };
            }
            return {
                ...staticData,
                ...localizedPlan,
                features: localizedPlan.features.map((feature, fIndex) => ({
                    text: feature.text,
                    check: staticData.featuresLogic?.[fIndex] ?? false // Handle cases where featuresLogic might be shorter
                })),
                discount: localizedPlan.discount ? {
                    ...staticData.discountLogic,
                    ...localizedPlan.discount
                } : null,
                badgeText: staticData.highlight ? (localizedPlan.badgeText || scriptLines.planSelection.badges.mostPopular) : null,
            };
        });
    }, [themeColor]);

    const containerAnimationVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { delayChildren: 0.2, staggerChildren: 0.15, duration: 0.4 } },
        exit: { opacity: 0, transition: { duration: 0.3 } }
    };
    const planCardAnimationVariants = {
        hidden: { y: prefersReducedMotion ? 0 : 25, opacity: 0, scale: prefersReducedMotion ? 1 : 0.97 },
        visible: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 120, damping: 14, duration: prefersReducedMotion ? 0 : 0.5 } },
    };

    const [selectedPlanIdForProcessing, setSelectedPlanIdForProcessing] = useState(null);

    const handleSelectAndProceed = useCallback((plan) => {
        if (isLoading || isSubscriptionLoading) return;

        setSelectedPlanIdForProcessing(plan.id);

        // If the selected plan is the current active plan, do not call onPlanSelect to go to checkout.
        // The button text and handler should ideally prevent this path.
        if (currentSubscription && currentSubscription.is_active && currentSubscription.plan_name === plan.id) {
            console.warn("[PlanSelection] Attempted to re-select current active plan. This should be handled by 'Manage Subscription' button.");
            // Optionally show a toast here if button logic didn't prevent it.
            // The parent (PlanAndPaymentPage) will also have a check.
            setSelectedPlanIdForProcessing(null); // Reset
            return;
        }

        // Simulate processing time before calling the parent callback.
        setTimeout(() => {
            onPlanSelect(plan);
            // Note: Parent's `isLoading` prop will take over.
            // We don't reset selectedPlanIdForProcessing here immediately;
            // it can be reset if the parent's isLoading state changes or component unmounts.
        }, 800);
    }, [onPlanSelect, isLoading, isSubscriptionLoading, currentSubscription]);


    if (typeof onPlanSelect !== 'function') {
        console.error(scriptLines.planSelection.console.invalidOnPlanSelectProp);
        return (
            <div className="flex items-center justify-center h-screen p-4">
                <p className="text-red-600 dark:text-red-400 p-4 bg-red-100 dark:bg-red-900/30 rounded-lg shadow-md text-center">
                    {scriptLines.planSelection.errors.functionalityUnavailable}
                </p>
            </div>
        );
    }

    if (isSubscriptionLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-medium text-neutral-700 dark:text-neutral-200 mb-3">
                        {scriptLines.planSelection.messages.loadingSubscription}
                    </h1>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto"></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl w-full">
                    <PlanCardSkeleton themeColor="purple" />
                    <PlanCardSkeleton themeColor={themeColor} />
                    <PlanCardSkeleton themeColor="yellow" />
                </div>
            </div>
        );
    }

    if (subscriptionError) {
        return (
            <div className="flex items-center justify-center h-screen p-4 text-center">
                <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-6 py-4 rounded-lg shadow-md">
                    <Icon name="error_outline" className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-3" />
                    <p className="font-semibold mb-1">Error Loading Subscription</p>
                    <p>{scriptLines.planSelection.messages.subscriptionLoadError}</p>
                    {/* Optionally add a retry button if `fetchSubscriptionStatus` is exposed */}
                </div>
            </div>
        );
    }

    return (
        <motion.div
            className="plan-selection-container flex flex-col items-center justify-center py-12 sm:py-16 px-4 sm:px-6 lg:px-8 font-montserrat"
            variants={containerAnimationVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            data-testid="plan-selection"
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl w-full">
                {PLANS_DATA.map((plan) => {
                    const isCurrentActivePlan = isAuthenticated && currentSubscription?.is_active && currentSubscription?.plan_name === plan.id;
                    const discountActive = plan.discount?.isActive;
                    const discountTextColor = plan.discount?.textColor || (plan.discountLogic?.textColor || 'text-green-600 dark:text-green-400');
                    const discountBadgeBgColor = plan.discount?.badgeColor || (plan.discountLogic?.badgeColor || 'bg-green-500');
                    const discountOfferBadgeText = plan.discount?.badgeText || scriptLines.planSelection.badges.specialOffer;

                    let ctaText = scriptLines.planSelection.buttons.chooseThisPlan;
                    let ctaHandler = () => handleSelectAndProceed(plan);
                    let isCurrentPlanButton = false;

                    if (isCurrentActivePlan) {
                        ctaText = scriptLines.planSelection.buttons.manageSubscription;
                        ctaHandler = () => onManageSubscription(plan); // Parent handles this click
                        isCurrentPlanButton = true;
                    } else if (currentSubscription?.is_active) { // User has an active plan, but it's not this one
                        const currentPlanTier = PLAN_TIER_ORDER[currentSubscription.plan_name] ?? -1;
                        const targetPlanTier = PLAN_TIER_ORDER[plan.id] ?? -1;

                        if (targetPlanTier > currentPlanTier) {
                            ctaText = scriptLines.planSelection.buttons.upgradePlan;
                        } else if (targetPlanTier < currentPlanTier && targetPlanTier !== -1) {
                            ctaText = scriptLines.planSelection.buttons.downgradePlan;
                        } else if (targetPlanTier === currentPlanTier && targetPlanTier !== -1) {
                            ctaText = scriptLines.planSelection.buttons.switchPlan; // Same tier
                        }
                        // If targetPlanTier is -1 (unknown plan), keep "Choose This Plan" or "Switch Plan"
                    }

                    const cardClassNames = `
                        plan-card relative flex flex-col rounded-2xl border-2 overflow-hidden
                        ${selectedPlanIdForProcessing === plan.id && !isCurrentPlanButton
                            ? `${plan.theme.borderColor} ring-4 ${plan.theme.borderColor.replace('border-', 'ring-')}/40 transform scale-105 shadow-2xl z-20`
                            : `${plan.theme.borderColor} shadow-lg hover:shadow-xl z-10`}
                        ${plan.highlight && selectedPlanIdForProcessing !== plan.id && !isCurrentActivePlan ? 'lg:scale-105' : ''}
                        bg-white/60 dark:bg-neutral-800/60 backdrop-blur-lg transition-all duration-300 ease-out
                        ${isCurrentActivePlan ? 'opacity-80 border-dashed' : ''}
                    `;

                    return (
                        <motion.div
                            key={plan.id}
                            className={cardClassNames}
                            variants={planCardAnimationVariants}
                            whileHover={(!isLoading && !isSubscriptionLoading && !isCurrentActivePlan && (!selectedPlanIdForProcessing || selectedPlanIdForProcessing === plan.id)) ? { y: prefersReducedMotion ? 0 : -8, transition: { type: 'spring', stiffness: 250, damping: 15 } } : {}}
                            data-testid={`plan-card-${plan.id}`}
                        >
                            {isCurrentActivePlan && (
                                <div className={`absolute -top-px -left-px px-4 py-1.5 text-xs font-semibold text-white ${plan.theme.buttonClass.split(' ')[0]} rounded-br-xl rounded-tl-lg shadow-md z-20`}>
                                    {scriptLines.planSelection.badges.currentPlan}
                                </div>
                            )}
                            {discountActive && plan.discount.offerTitle && !isCurrentActivePlan && (
                                <div className={`absolute ${plan.highlight ? 'top-10 -left-px' : '-top-px -left-px'} px-4 py-1.5 text-xs font-semibold text-white ${discountBadgeBgColor} rounded-br-xl ${plan.highlight ? 'rounded-tr-xl' : 'rounded-tl-lg'} shadow-md z-10`}>
                                    {discountOfferBadgeText}
                                </div>
                            )}
                            {plan.highlight && !isCurrentActivePlan && (
                                <div className={`absolute -top-px -right-px px-5 py-1.5 text-xs font-semibold text-white ${plan.theme.buttonClass.split(' ')[0]} rounded-bl-xl rounded-tr-lg shadow-md z-10`}>
                                    {plan.badgeText}
                                </div>
                            )}

                            <div className="p-6 sm:p-8 flex flex-col flex-grow">
                                <div className="flex items-center mb-5">
                                    <Icon name={plan.iconName} className={`w-9 h-9 sm:w-10 sm:h-10 mr-3 sm:mr-4 ${plan.theme.textColor}`} style={{ fontSize: '36px' }} variations={{ fill: 0, weight: 400, grade: 0, opsz: 40 }} />
                                    <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-800 dark:text-white">{plan.name}</h2>
                                </div>

                                <div className="mb-6">
                                    {discountActive && plan.discount && !isCurrentActivePlan ? (
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
                                        <>
                                            <span className={`text-4xl sm:text-5xl font-medium ${plan.theme.textColor}`}>€ {plan.price}</span>
                                            <span className="text-lg font-medium text-neutral-500 dark:text-neutral-400">{plan.frequency}</span>
                                        </>
                                    )}
                                    <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">
                                        {plan.description.join(' ')}
                                    </p>
                                </div>

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

                                <div className="mb-8 text-xs text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-700/60 p-3 rounded-md">
                                    <p className={`font-semibold mb-1 ${plan.theme.textColor}`}>Why {plan.name}?</p>
                                    {plan.whyThisPlan}
                                </div>

                                <motion.button
                                    onClick={ctaHandler}
                                    disabled={isLoading || isSubscriptionLoading || (selectedPlanIdForProcessing === plan.id && !isCurrentPlanButton)}
                                    className={`w-full mt-auto py-3.5 px-6 rounded-lg font-semibold text-md sm:text-lg transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900
                                                ${(isLoading || isSubscriptionLoading) ? 'opacity-50 cursor-not-allowed' : ''}
                                                ${selectedPlanIdForProcessing === plan.id && !isCurrentPlanButton ? 'opacity-70 cursor-wait' : ''} 
                                                ${isCurrentActivePlan && isCurrentPlanButton ?
                                            (plan.theme.buttonClass.replace(/bg-\w+-\d+/, 'bg-neutral-500 dark:bg-neutral-600').replace(/hover:bg-\w+-\d+/, 'hover:bg-neutral-600 dark:hover:bg-neutral-700') + ' border border-neutral-400 dark:border-neutral-500 text-white')
                                            : plan.theme.buttonClass} 
                                                shadow-md hover:shadow-lg`}
                                    whileHover={{ scale: (isLoading || isSubscriptionLoading || (selectedPlanIdForProcessing === plan.id && !isCurrentPlanButton)) ? 1 : 1.03, y: (isLoading || isSubscriptionLoading || (selectedPlanIdForProcessing === plan.id && !isCurrentPlanButton)) ? 0 : -2 }}
                                    whileTap={{ scale: (isLoading || isSubscriptionLoading || (selectedPlanIdForProcessing === plan.id && !isCurrentPlanButton)) ? 1 : 0.97 }}
                                    data-testid={`select-plan-${plan.id}-button`}
                                    aria-live="polite"
                                >
                                    {selectedPlanIdForProcessing === plan.id && !isCurrentPlanButton ? (
                                        <> <Icon name="hourglass_top" className="animate-spin w-5 h-5 mr-2 inline" /> {scriptLines.planSelection.buttons.processing} </>
                                    ) : (
                                        ctaText
                                    )}
                                </motion.button>
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </motion.div>
    );
};

PlanSelection.propTypes = {
    onPlanSelect: PropTypes.func.isRequired,
    onManageSubscription: PropTypes.func.isRequired, // New prop
    themeColor: PropTypes.string,
    isLoading: PropTypes.bool,
};

PlanSelection.defaultProps = {
    themeColor: 'rose',
    isLoading: false,
};

export default memo(PlanSelection);