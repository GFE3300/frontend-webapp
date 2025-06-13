import React, { memo, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { motion, useReducedMotion } from 'framer-motion';
import Icon from "../../../components/common/Icon";
import { scriptLines_Components as scriptLines } from '../utils/script_lines';
import { useSubscription } from '../../../contexts/SubscriptionContext';
import { useAuth } from '../../../contexts/AuthContext';

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
    onManageSubscription,
    themeColor = scriptLines.planSelection.themeColorDefault,
    isLoading = false,
    appliedDiscount = null, // MODIFICATION: Accept the new prop
}) => {
    const prefersReducedMotion = useReducedMotion();
    const { isAuthenticated } = useAuth();
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
            { id: 'starter_essentials', iconName: 'bolt', price: '29.99', featuresLogic: [true, true, true, true, true, false, false, false], theme: { borderColor: 'border-purple-500 dark:border-purple-400', buttonClass: 'bg-purple-500 hover:bg-purple-600 text-white', textColor: 'text-purple-500 dark:text-purple-400' }, highlight: false },
            { id: 'growth_accelerator', iconName: 'mode_heat', price: '39.99', featuresLogic: [true, true, true, true, true, true, true, true], theme: { borderColor: themeColor === "rose" ? 'border-rose-500 dark:border-rose-400' : 'border-blue-500 dark:border-blue-400', buttonClass: `${themeColor === "rose" ? 'bg-rose-500 hover:bg-rose-600' : 'bg-blue-500 hover:bg-blue-600'} text-white shadow-lg`, textColor: themeColor === "rose" ? 'text-rose-500 dark:text-rose-400' : 'text-blue-500 dark:text-blue-400' }, highlight: true },
            { id: 'premium_pro_suite', iconName: 'verified', price: '89.99', featuresLogic: [true, true, true, true, true, true, true, true], theme: { borderColor: 'border-yellow-500 dark:border-yellow-400', buttonClass: 'bg-yellow-500 hover:bg-yellow-600 text-white', textColor: 'text-yellow-500 dark:text-yellow-400' }, highlight: false }
        ];

        return staticPlanData.map((staticData, index) => {
            const localizedPlan = scriptLines.planSelection.plans[index];
            if (!localizedPlan) return { ...staticData, features: [] };
            const features = (localizedPlan.features || []).map((feature, fIndex) => ({
                text: feature.text,
                check: staticData.featuresLogic?.[fIndex] ?? false,
            }));
            return { ...staticData, ...localizedPlan, features };
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
        onPlanSelect(plan);
    }, [onPlanSelect, isLoading, isSubscriptionLoading]);

    if (isSubscriptionLoading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl w-full">
                <PlanCardSkeleton themeColor="purple" />
                <PlanCardSkeleton themeColor={themeColor} />
                <PlanCardSkeleton themeColor="yellow" />
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
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl w-full">
                {PLANS_DATA.map((plan) => {
                    const isCurrentActivePlan = isAuthenticated && currentSubscription?.is_active && currentSubscription?.plan_name === plan.id;

                    // --- MODIFICATION: Dynamic Price Calculation ---
                    const originalPrice = parseFloat(plan.price);
                    let discountedPrice = originalPrice;
                    let hasApplicableDiscount = false;

                    // This logic assumes the affiliate discount applies as a percentage to any plan.
                    // The backend validation ensures the code itself is valid.
                    if (appliedDiscount?.valid && appliedDiscount.type === 'order_total_percentage') {
                        const discountPercentage = parseFloat(appliedDiscount.value) / 100;
                        discountedPrice = originalPrice * (1 - discountPercentage);
                        hasApplicableDiscount = true;
                    }
                    // --- END MODIFICATION ---

                    let ctaText = isCurrentActivePlan ? scriptLines.planSelection.buttons.manageSubscription : scriptLines.planSelection.buttons.chooseThisPlan;
                    if (!isCurrentActivePlan && currentSubscription?.is_active) {
                        const currentTier = PLAN_TIER_ORDER[currentSubscription.plan_name] ?? -1;
                        const targetTier = PLAN_TIER_ORDER[plan.id] ?? -1;
                        if (targetTier > currentTier) ctaText = scriptLines.planSelection.buttons.upgradePlan;
                        else if (targetTier < currentTier && targetTier !== -1) ctaText = scriptLines.planSelection.buttons.downgradePlan;
                        else ctaText = scriptLines.planSelection.buttons.switchPlan;
                    }

                    const isThisPlanProcessing = isLoading && selectedPlanIdForProcessing === plan.id;

                    return (
                        <motion.div
                            key={plan.id}
                            className={`plan-card relative flex flex-col rounded-2xl border-2 overflow-hidden ${plan.theme.borderColor} shadow-lg hover:shadow-xl z-10 ${plan.highlight && !isCurrentActivePlan ? 'lg:scale-105' : ''} bg-white/60 dark:bg-neutral-800/60 backdrop-blur-lg transition-all duration-300 ease-out`}
                            variants={planCardAnimationVariants}
                            whileHover={!isLoading && !isCurrentActivePlan ? { y: -8 } : {}}
                        >
                            {isCurrentActivePlan && (
                                <div className={`absolute -top-px -left-px px-4 py-1.5 text-xs font-semibold text-white ${plan.theme.buttonClass.split(' ')[0]} rounded-br-xl rounded-tl-lg shadow-md z-20`}>
                                    {scriptLines.planSelection.badges.currentPlan}
                                </div>
                            )}
                            {plan.highlight && !isCurrentActivePlan && (
                                <div className={`absolute -top-px -right-px px-5 py-1.5 text-xs font-semibold text-white ${plan.theme.buttonClass.split(' ')[0]} rounded-bl-xl rounded-tr-lg shadow-md z-10`}>
                                    {plan.badgeText}
                                </div>
                            )}

                            <div className="p-6 sm:p-8 flex flex-col flex-grow">
                                <div className="flex items-center mb-5">
                                    <Icon name={plan.iconName} className={`w-9 h-9 sm:w-10 sm:h-10 mr-3 sm:mr-4 ${plan.theme.textColor}`} />
                                    <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-800 dark:text-white">{plan.name}</h2>
                                </div>

                                {/* --- MODIFICATION: Conditional Price Rendering --- */}
                                <div className="mb-6">
                                    {hasApplicableDiscount ? (
                                        <div className="flex items-baseline gap-x-2">
                                            <span className={`text-4xl sm:text-5xl font-medium ${plan.theme.textColor}`}>€{discountedPrice.toFixed(2)}</span>
                                            <span className="text-lg font-medium text-neutral-500 dark:text-neutral-400 line-through">€{originalPrice.toFixed(2)}</span>
                                        </div>
                                    ) : (
                                        <span className={`text-4xl sm:text-5xl font-medium ${plan.theme.textColor}`}>€{originalPrice.toFixed(2)}</span>
                                    )}
                                    <span className="text-lg font-medium text-neutral-500 dark:text-neutral-400">{plan.frequency}</span>
                                    <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300 h-10">{plan.description}</p>
                                </div>
                                {/* --- END MODIFICATION --- */}

                                <ul className="space-y-2.5 text-sm text-neutral-700 dark:text-neutral-200 mb-8 flex-grow">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className={`flex items-center ${!feature.check ? 'opacity-60' : ''}`}>
                                            <Icon name={feature.check ? "check_circle" : "remove_circle_outline"} className={`w-6 h-6 ${feature.check ? 'text-green-500 dark:text-green-400' : 'text-neutral-400 dark:text-neutral-500'} mr-2.5 flex-shrink-0`} variations={{ fill: feature.check ? 1 : 0 }} />
                                            <span>{feature.text}</span>
                                        </li>
                                    ))}
                                </ul>

                                <motion.button
                                    onClick={() => isCurrentActivePlan ? onManageSubscription(plan) : handleSelectAndProceed(plan)}
                                    disabled={isLoading}
                                    className={`w-full mt-auto py-3.5 px-6 rounded-lg font-semibold text-md sm:text-lg transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${isCurrentActivePlan ? 'bg-neutral-500 dark:bg-neutral-600 hover:bg-neutral-600 dark:hover:bg-neutral-700 text-white' : plan.theme.buttonClass} shadow-md hover:shadow-lg`}
                                    whileHover={{ scale: isLoading ? 1 : 1.03 }}
                                    whileTap={{ scale: isLoading ? 1 : 0.97 }}
                                >
                                    {isThisPlanProcessing ? (
                                        <><Icon name="hourglass_top" className="animate-spin w-5 h-5 mr-2 inline" /> {scriptLines.planSelection.buttons.processing} </>
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
    onManageSubscription: PropTypes.func.isRequired,
    themeColor: PropTypes.string,
    isLoading: PropTypes.bool,
    appliedDiscount: PropTypes.object,
};

PlanSelection.defaultProps = {
    themeColor: 'rose',
    isLoading: false,
    appliedDiscount: null,
};

export default memo(PlanSelection);