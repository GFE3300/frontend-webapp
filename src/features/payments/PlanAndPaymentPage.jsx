import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStripe } from '@stripe/react-stripe-js';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

// Local Imports
import apiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useToast } from '../../contexts/ToastContext';
import { useValidatePromoCode } from '../../contexts/ProductDataContext';
import PlanSelection from './subcomponents/PlanSelection.jsx';
import Spinner from '../../components/common/Spinner';
import BubbleAnimation from '../../features/register/subcomponents/BubbleAnimation';
import { scriptLines_Components as sl } from './utils/script_lines';
import Icon from '../../components/common/Icon';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import { interpolate } from '../../utils/utils'; // Assuming a utility function

const PlanAndPaymentPage = () => {
    const stripe = useStripe();
    const { addToast } = useToast();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const { subscription: currentSubscription, isLoading: isSubscriptionDataLoading } = useSubscription();

    const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
    const [error, setError] = useState(null);
    const vortexRef = useRef(null);

    // --- State Management Correction ---
    // This state is for affiliate referrals, automatically applied.
    const [affiliateReferralCode, setAffiliateReferralCode] = useState(null);
    // This state is for manual promo codes the user can enter.
    const [promoCodeInput, setPromoCodeInput] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    const [validationStatus, setValidationStatus] = useState('idle'); // 'idle', 'validating', 'valid', 'invalid'
    const [validationMessage, setValidationMessage] = useState('');
    const s = sl.planAndPaymentPage;

    // This mutation is ONLY for the manually entered promo code.
    const validateCodeMutation = useValidatePromoCode({
        onMutate: () => {
            setValidationStatus('validating');
            setValidationMessage('');
        },
        onSuccess: (data) => {
            if (data.valid) {
                setAppliedDiscount(data);
                setValidationStatus('valid');
                setValidationMessage(s.messages.discountAppliedSuccessMessage || 'Discount applied successfully!');
                addToast(s.messages.discountAppliedSuccess || 'Discount applied!', 'success');
            } else {
                setAppliedDiscount(null);
                setValidationStatus('invalid');
                const message = data.message || s.messages.invalidDiscountCode || 'Invalid discount code.';
                setValidationMessage(message);
                addToast(data.message || s.messages.invalidCodeShort || 'Invalid Code', 'error');
            }
        },
        onError: (err) => {
            setAppliedDiscount(null);
            setValidationStatus('invalid');
            const errorMessage = err.response?.data?.message || s.messages.codeValidationError || 'Could not validate code. Please try again.';
            setValidationMessage(errorMessage);
            addToast(errorMessage, 'error');
        },
    });

    // This effect ONLY handles the affiliate code from registration.
    useEffect(() => {
        const pendingCode = sessionStorage.getItem('pendingReferralCode');
        if (pendingCode) {
            console.log(`[PlanAndPaymentPage] Found affiliate referral code in sessionStorage: '${pendingCode}'. Storing for checkout.`);
            setAffiliateReferralCode(pendingCode);
            addToast(
                interpolate(s.messages.affiliateCodeAppliedToast || "Affiliate code '{{code}}' will be applied at checkout.", { code: pendingCode }),
                'info', 
                5000
            );
            sessionStorage.removeItem('pendingReferralCode');
        }
    }, [addToast, s.messages.affiliateCodeAppliedToast]); // Run only once on mount

    const handlePlanSelected = useCallback(async (selectedPlan) => {
        if (!isAuthenticated || !stripe) {
            const toastMessage = !isAuthenticated 
                ? (s.messages.loginToSelectPlan || 'Please log in to select a plan.') 
                : (s.messages.stripeNotReady || 'Stripe is not ready.');
            addToast(toastMessage, 'error');
            return;
        }

        setIsProcessingCheckout(true);
        setError(null);
        if (vortexRef.current) vortexRef.current.addTurbulence(15000);

        try {
            // Correctly pass the affiliate code to the backend.
            const payload = {
                plan_name: selectedPlan.id,
                referral_code: affiliateReferralCode,
            };
            console.log('[PlanAndPaymentPage] Creating checkout session with payload:', payload);

            const response = await apiService.createCheckoutSession(payload);
            const { sessionId } = response.data;

            if (!sessionId) throw new Error(s.messages.sessionInitFailed || "Failed to initialize payment session.");

            const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });
            if (stripeError) throw stripeError;

        } catch (apiError) {
            const errorMessage = apiError.response?.data?.error || apiError.message || s.messages.subscriptionInitFailed || 'Could not initiate your subscription.';
            setError(errorMessage);
            addToast(errorMessage, 'error', 5000);
            setIsProcessingCheckout(false);
        }
    }, [stripe, addToast, isAuthenticated, affiliateReferralCode, s.messages]);

    const handleManageSubscription = useCallback((plan) => {
        addToast(s.messages.redirectingToManage || "Redirecting to subscription management...", "info");
        apiService.post('payments/create-customer-portal-session/')
            .then(response => {
                if (response.data.url) window.location.href = response.data.url;
            })
            .catch(err => {
                addToast(s.messages.manageAccessError || "Error accessing subscription management.", "error");
            });
    }, [addToast, s.messages]);

    const pageIsOverallLoading = isProcessingCheckout || isSubscriptionDataLoading;

    return (
        <BubbleAnimation
            ref={vortexRef}
            particleCount={300}
            baseSpeed={0.15}
            rangeSpeed={0.1}
            baseRadius={0.8}
            rangeRadius={1.5}
            backgroundColor="rgba(249, 250, 251, 0)"
            containerClassName="dark:bg-gradient-to-br dark:from-purple-950/50 dark:via-neutral-900 dark:to-rose-950/30"
        >
            <div className="flex flex-col items-center justify-start min-h-screen py-12 px-4 font-montserrat">
                <header className="text-center mb-10 mt-8 sm:mt-12 relative z-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl">
                        {sl.planSelection.title}
                    </h1>
                    <p className="mt-4 text-xl text-gray-600 dark:text-neutral-300 max-w-2xl mx-auto">
                        {sl.planSelection.subtitle}
                    </p>
                </header>

                <div className="w-full max-w-lg mx-auto relative z-10 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        {/* Display a message if an affiliate code is active */}
                        {affiliateReferralCode ? (
                            <div className="p-3 mb-4 text-center bg-green-100 dark:bg-green-900/50 border border-green-200 dark:border-green-700 rounded-lg">
                                <p className="text-sm flex items-center text-left font-semibold text-green-800 dark:text-green-200">
                                    <Icon name="verified" className="w-5 h-5 mr-4 inline-block" style={{ fontSize: '1.25rem' }} />
                                    {interpolate(s.messages.affiliateDiscountNotice || "Affiliate discount for code '{{code}}' will be applied at checkout.", { code: affiliateReferralCode })}
                                </p>
                            </div>
                        ) : (
                            <InputField
                                label={s.promoCodeInput.label || "Discount Code"}
                                name="promoCodeInput"
                                value={promoCodeInput}
                                onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                                placeholder={s.promoCodeInput.placeholder || "Enter code here"}
                                disabled={validateCodeMutation.isPending}
                                adornment={
                                    <Button
                                        variant="solid"
                                        color="primary"
                                        size="sm"
                                        className="mr-1 my-1"
                                        onClick={() => validateCodeMutation.mutate({ code_name: promoCodeInput, business_identifier: user.activeBusinessId })}
                                        isLoading={validationStatus === 'validating'}
                                        disabled={!promoCodeInput || validationStatus === 'validating' || !user?.activeBusinessId}
                                    >
                                        {s.promoCodeInput.applyButton || "Apply"}
                                    </Button>
                                }
                            />
                        )}
                        <AnimatePresence>
                            {validationMessage && (
                                <motion.p
                                    key="validation-message"
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className={`text-xs mt-1.5 ml-1 ${validationStatus === 'valid' ? 'text-green-600 dark:text-green-400'
                                        : validationStatus === 'invalid' ? 'text-red-600 dark:text-red-400' : 'text-neutral-500'
                                        }`}
                                >
                                    {validationMessage}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {error && !isProcessingCheckout && (
                    <div
                        className="my-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-200 rounded-md shadow-md max-w-xl w-full mx-auto text-left relative z-10"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                <div className="w-full max-w-7xl mx-auto relative z-10">
                    <PlanSelection
                        onPlanSelect={handlePlanSelected}
                        onManageSubscription={handleManageSubscription}
                        isLoading={pageIsOverallLoading}
                        themeColor="rose"
                        appliedDiscount={appliedDiscount}
                    />
                </div>

                <footer className="mt-16 mb-8 text-center text-sm text-gray-500 dark:text-neutral-400 relative z-10">
                    <p>{sl.planSelection.footerNote}</p>
                </footer>
            </div>
        </BubbleAnimation>
    );
};

export default PlanAndPaymentPage;