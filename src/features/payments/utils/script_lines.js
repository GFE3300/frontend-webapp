/**
 * @auto-managed
 *
 * This file is managed by the I18N script. Any manual changes to this file will be
 * overwritten during the next synchronization. To add or modify text, please
 * update the original string in this file and then run the 'sync' command.
 *
 * @last-synced 2025-06-09 12:00:00 UTC
 */

import i18n from '../../../i18n';

export const scriptLines_Components = {
    planSelection: {
        title: i18n.t('payments.components.planSelection.title'), // "Unlock Your Potential"
        subtitle: i18n.t('payments.components.planSelection.subtitle'), // "You're one step away! Choose the plan that aligns with your ambition and let's start baking success together."
        footerNote: i18n.t('payments.components.planSelection.footerNote'), // "All plans are billed monthly or annually. You can upgrade, downgrade, or cancel your plan at any time from your account settings."
        buttons: {
            chooseThisPlan: i18n.t('payments.components.planSelection.buttons.chooseThisPlan'), // "Choose This Plan"
            processing: i18n.t('payments.components.planSelection.buttons.processing'), // "Processing..."
            planSelected: i18n.t('payments.components.planSelection.buttons.planSelected'), // "Plan Selected!"
            manageSubscription: i18n.t('payments.components.planSelection.buttons.manageSubscription'), // "Manage Subscription"
            upgradePlan: i18n.t('payments.components.planSelection.buttons.upgradePlan'), // "Upgrade Plan"
            downgradePlan: i18n.t('payments.components.planSelection.buttons.downgradePlan'), // "Downgrade Plan"
            switchPlan: i18n.t('payments.components.planSelection.buttons.switchPlan'), // "Switch Plan"
        },
        badges: {
            mostPopular: i18n.t('payments.components.planSelection.badges.mostPopular'), // "Most Popular"
            recommended: i18n.t('payments.components.planSelection.badges.recommended'), // "Recommended"
            specialOffer: i18n.t('payments.components.planSelection.badges.specialOffer'), // "SPECIAL OFFER"
            currentPlan: i18n.t('payments.components.planSelection.badges.currentPlan'), // "Current Plan"
        },
        messages: {
            loadingSubscription: i18n.t('payments.components.planSelection.messages.loadingSubscription'), // "Loading your subscription details..."
            subscriptionErrorTitle: i18n.t('payments.components.planSelection.messages.subscriptionErrorTitle'), // "Error Loading Subscription"
            subscriptionLoadError: i18n.t('payments.components.planSelection.messages.subscriptionLoadError'), // "We couldn't load your subscription details. Please refresh the page or contact support if the problem persists."
            alreadySubscribedError: i18n.t('payments.components.planSelection.messages.alreadySubscribedError'), // "You are already subscribed to this plan. To make changes, please use 'Manage Subscription'."
        },
        errors: {
            functionalityUnavailable: i18n.t('payments.components.planSelection.errors.functionalityUnavailable'), // "Error: Plan selection functionality is unavailable."
        },
        console: {
            invalidOnPlanSelectProp: i18n.t('payments.components.planSelection.console.invalidOnPlanSelectProp'), // "PlanSelection: Invalid `onPlanSelect` prop. Expected a function."
        },
        themeColorDefault: i18n.t('payments.components.planSelection.themeColorDefault'), // "rose"
        whyThisPlanTemplate: i18n.t('payments.components.planSelection.whyThisPlanTemplate'), // "Why {{planName}}?"
        plans: [
            { // Corresponds to starter_essentials
                name: i18n.t('payments.components.planSelection.plans.0.name'), // "Starter Essentials"
                frequency: i18n.t('payments.components.planSelection.plans.0.frequency'), // "/month"
                description: i18n.t('payments.components.planSelection.plans.0.description'), // "Perfect for solo and micro-shops. Get up and running fast with essential order & inventory tools."
                features: [
                    {
                        text: i18n.t('payments.components.planSelection.plans.0.features.0.text') // "3 Business Users"
                    },
                    {
                        text: i18n.t('payments.components.planSelection.plans.0.features.1.text') // "Full Product Management"
                    },
                    {
                        text: i18n.t('payments.components.planSelection.plans.0.features.2.text') // "Digital Menu & QR Codes"
                    },
                    {
                        text: i18n.t('live_orders_view.liveOrders.pageTitle') // "Live Orders View"
                    },
                    {
                        text: i18n.t('payments.components.planSelection.plans.0.features.4.text') // "Venue Layout Designer"
                    },
                    {
                        text: i18n.t('payments.components.planSelection.plans.0.features.5.text') // "Basic Inventory (Manual Entry)"
                    },
                    {
                        text: i18n.t('payments.components.planSelection.plans.0.features.6.text') // "Basic (Today) Analytics"
                    },
                    {
                        text: i18n.t('payments.components.planSelection.plans.0.features.7.text') // "Email Support"
                    }
                ],
                whyThisPlan: i18n.t('payments.components.planSelection.plans.0.whyThisPlan'), // "Get off paper and get digital. Fast. This plan gives you everything needed to run your daily operations smoothly, from digital menus to live order tracking."
            },
            { // Corresponds to growth_accelerator
                name: i18n.t('payments.components.planSelection.plans.1.name'), // "Growth Accelerator"
                frequency: i18n.t('payments.components.planSelection.plans.0.frequency'), // "/month"
                description: i18n.t('payments.components.planSelection.plans.1.description'), // "For growing businesses ready to scale. All-in-one order management + deep insights to optimize and grow."
                features: [
                    {
                        text: i18n.t('payments.components.planSelection.plans.1.features.0.text') // "Everything in Starter, plus:"
                    },
                    {
                        text: i18n.t('payments.components.planSelection.plans.1.features.1.text') // "10 Business Users"
                    },
                    {
                        text: i18n.t('payments.components.planSelection.plans.1.features.2.text') // "Automated Inventory (via Recipes)"
                    },
                    {
                        text: i18n.t('payments.components.planSelection.plans.1.features.3.text') // "Low Stock Alerts"
                    },
                    {
                        text: i18n.t('payments.components.planSelection.plans.1.features.4.text') // "Full History Analytics"
                    },
                    {
                        text: i18n.t('payments.components.planSelection.plans.1.features.5.text') // "10 Active Promo Codes"
                    },
                    {
                        text: i18n.t('payments.components.planSelection.plans.1.features.6.text') // "Remove 'Powered by' Branding"
                    },
                    {
                        text: i18n.t('payments.components.planSelection.plans.1.features.7.text') // "Priority Email Support"
                    }
                ],
                whyThisPlan: i18n.t('payments.components.planSelection.plans.1.whyThisPlan'), // "Automate your operations and understand your growth. Automated inventory saves hours, and full analytics history helps you make smarter decisions."
                badgeText: i18n.t('payments.components.planSelection.badges.mostPopular'), // "Most Popular"
                discount: {
                    offerTitle: i18n.t('payments.components.planSelection.plans.1.discount.offerTitle'), // "First Month 60% Off!"
                    priceSuffix: i18n.t('payments.components.planSelection.plans.1.discount.priceSuffix'), // "/first month"
                    originalPriceText: i18n.t('payments.components.planSelection.plans.1.discount.originalPriceText'), // "\u20ac39.99/month"
                    details: i18n.t('payments.components.planSelection.plans.1.discount.details'), // "Then \u20ac39.99/month. Renews automatically, cancel anytime."
                    badgeText: i18n.t('payments.components.planSelection.badges.specialOffer'), // "SPECIAL OFFER"
                }
            },
            { // Corresponds to premium_pro_suite
                name: i18n.t('payments.components.planSelection.plans.2.name'), // "Premium Pro Suite"
                frequency: i18n.t('payments.components.planSelection.plans.0.frequency'), // "/month"
                description: i18n.t('payments.components.planSelection.plans.2.description'), // "For established bakeries that demand excellence. Full-featured, white-glove service, and limitless scalability."
                features: [
                    {
                        text: i18n.t('payments.components.planSelection.plans.2.features.0.text') // "Everything in Growth, plus:"
                    },
                    {
                        text: i18n.t('payments.components.planSelection.plans.2.features.1.text') // "Unlimited User Seats"
                    },
                    {
                        text: i18n.t('payments.components.planSelection.plans.2.features.2.text') // "Advanced Analytics Page"
                    },
                    {
                        text: i18n.t('payments.components.planSelection.plans.2.features.3.text') // "Data Export (CSV)"
                    },
                    {
                        text: i18n.t('payments.components.planSelection.plans.2.features.4.text') // "Unlimited Promo Codes"
                    },
                    {
                        text: i18n.t('payments.components.planSelection.plans.2.features.5.text') // "Advanced Menu Customization"
                    },
                    {
                        text: i18n.t('payments.components.planSelection.plans.2.features.6.text') // "Dedicated Onboarding Specialist"
                    }
                ],
                whyThisPlan: i18n.t('payments.components.planSelection.plans.2.whyThisPlan'), // "Unleash the full power of your data and brand. This is the ultimate, no-compromise package with deep-dive analytics and white-glove service."
            }
        ]
    },

    paymentSuccessPage: {
        title: i18n.t('payments.components.paymentSuccessPage.title'), // "Payment Successful!"
        titleSubscriptionActivated: i18n.t('payments.components.paymentSuccessPage.titleSubscriptionActivated'), // "Subscription Activated!"
        thankYouMessage: i18n.t('payments.components.paymentSuccessPage.thankYouMessage'), // "Thank you, {userName}! Your subscription to the **{planName}** plan has been successfully activated."
        thankYouGeneric: i18n.t('payments.components.paymentSuccessPage.thankYouGeneric'), // "Thank you! Your payment was successful and your subscription is now active."
        accessMessage: i18n.t('payments.components.paymentSuccessPage.accessMessage'), // "You can now access all the premium features."
        transactionIdLabel: i18n.t('payments.components.paymentSuccessPage.transactionIdLabel'), // "Transaction ID:"
        buttons: {
            goToDashboard: i18n.t('payments.components.paymentSuccessPage.buttons.goToDashboard'), // "Go to Dashboard"
            viewBilling: i18n.t('payments.components.paymentSuccessPage.buttons.viewBilling'), // "View Billing Details"
        },
        links: {
            contactSupport: i18n.t('payments.components.paymentSuccessPage.links.contactSupport'), // "contact our support team"
        },
        loading: {
            finalizingSubscription: i18n.t('payments.components.paymentSuccessPage.loading.finalizingSubscription'), // "Finalizing your subscription..."
            checkingDetails: i18n.t('payments.components.paymentSuccessPage.loading.checkingDetails'), // "Checking payment details..."
        },
        errors: {
            missingSessionId: i18n.t('payments.components.paymentSuccessPage.errors.missingSessionId'), // "Payment confirmation details are missing. If you've just subscribed, please check your dashboard or contact support."
            subscriptionUpdateFailed: i18n.t('payments.components.paymentSuccessPage.errors.subscriptionUpdateFailed'), // "Your payment was successful, but we couldn't update your subscription details immediately. Please check your dashboard or contact support."
        }
    },

    paymentCancelPage: {
        title: i18n.t('payments.components.paymentCancelPage.title'), // "Payment Not Completed"
        message: i18n.t('payments.components.paymentCancelPage.message'), // "It looks like the payment process was not completed, or you chose to cancel. Your subscription has not been activated."
        buttons: {
            tryAgain: i18n.t('payments.components.paymentCancelPage.buttons.tryAgain'), // "Try Again"
            contactSupport: i18n.t('payments.components.paymentCancelPage.buttons.contactSupport'), // "Contact Support"
        },
        footerNote: i18n.t('payments.components.paymentCancelPage.footerNote') // "If you believe this is an error or need assistance, please don't hesitate to reach out."
    },
    planAndPaymentPage: {
    messages: {
        discountAppliedSuccess: "Discount applied!",
        discountAppliedSuccessMessage: "Discount applied successfully!",
        invalidDiscountCode: "Invalid discount code.",
        invalidCodeShort: "Invalid Code",
        codeValidationError: "Could not validate code. Please try again.",
        affiliateCodeAppliedToast: "Affiliate code '{{code}}' will be applied at checkout.",
        loginToSelectPlan: "Please log in to select a plan.",
        stripeNotReady: "Stripe is not ready.",
        sessionInitFailed: "Failed to initialize payment session.",
        subscriptionInitFailed: "Could not initiate your subscription.",
        redirectingToManage: "Redirecting to subscription management...",
        manageAccessError: "Error accessing subscription management.",
        affiliateDiscountNotice: "Affiliate discount for code '{{code}}' will be applied at checkout.",
    },
    promoCodeInput: {
        label: "Discount Code",
        placeholder: "Enter code here",
        applyButton: "Apply",
    }
},
};