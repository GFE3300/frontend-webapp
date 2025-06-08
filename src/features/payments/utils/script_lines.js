/**
 * @auto-managed
 *
 * This file is managed by the I18N script. Any manual changes to this file will be
 * overwritten during the next synchronization. To add or modify text, please
 * update the original string in this file and then run the 'sync' command.
 *
 * @last-synced 2025-06-07 11:26:40 UTC
 */

import i18n from '../../../i18n';

export const scriptLines_Components = {

    planSelection: { 
        themeColorDefault: i18n.t('payments.components.planSelection.themeColorDefault'), // "rose"
        messages: {
            loadingSubscription: i18n.t('payments.components.planSelection.messages.loadingSubscription'), // "Loading your subscription details..."
            subscriptionErrorTitle: i18n.t('payments.components.planSelection.messages.subscriptionErrorTitle'),
            subscriptionLoadError: i18n.t('payments.components.planSelection.messages.subscriptionLoadError') // "Could not load your current subscription status. Please try again or contact support."
        },
        buttons: {
            chooseThisPlan: i18n.t('payments.components.planSelection.buttons.chooseThisPlan'), // "Choose This Plan"
            manageSubscription: i18n.t('payments.components.planSelection.buttons.manageSubscription'), // "Manage Subscription"
            upgradePlan: i18n.t('payments.components.planSelection.buttons.upgradePlan'), // "Upgrade Plan"
            downgradePlan: i18n.t('payments.components.planSelection.buttons.downgradePlan'), // "Downgrade Plan"
            switchPlan: i18n.t('payments.components.planSelection.buttons.switchPlan'), // "Switch Plan"
            processing: i18n.t('payments.components.planSelection.buttons.processing'), // "Processing..."
            planSelected: i18n.t('payments.components.planSelection.buttons.planSelected'), // "Plan Selected!"
        },
        badges: {
            mostPopular: i18n.t('payments.components.planSelection.badges.mostPopular'), // "Most Popular"
            recommended: i18n.t('payments.components.planSelection.badges.recommended'), // "Recommended"
            specialOffer: i18n.t('payments.components.planSelection.badges.specialOffer'), // "SPECIAL OFFER"
            currentPlan: i18n.t('payments.components.planSelection.badges.currentPlan') // "Current Plan"
        },
        whyThisPlanTemplate: i18n.t('payments.components.planSelection.whyThisPlanTemplate'),
        plans: [
            {
                id: i18n.t('payments.components.planSelection.plans.0.id'), // Non-translatable identifier // "starter_essentials"
                name: i18n.t('register.components.planSelection.plans.0.name'), // "The First Batch"
                price: i18n.t('payments.components.planSelection.plans.0.price'), // "29.99"
                frequency: i18n.t('payments.components.planSelection.plans.0.frequency'), // "/month"
                description: [
                    i18n.t('payments.components.planSelection.plans.0.description.0'), // "Perfect for solo and micro-shops."
                    i18n.t('payments.components.planSelection.plans.0.description.1') // "Get up and running fast with essential order & inventory tools."
                ],
                features: [
                    { text: i18n.t('payments.components.planSelection.plans.0.features.0.text') }, // "Unlimited Orders"
                    { text: i18n.t('payments.components.planSelection.plans.0.features.1.text') }, // "Menu-Style Order Entry"
                    { text: i18n.t('payments.components.planSelection.plans.0.features.2.text') }, // "Live Low-Stock Alerts"
                    { text: i18n.t('payments.components.planSelection.plans.0.features.3.text') }, // "Basic Consumption Charts"
                    { text: i18n.t('payments.components.planSelection.plans.0.features.4.text') }, // "Email Support (48 hr response)"
                    { text: i18n.t('payments.components.planSelection.plans.0.features.5.text') }, // "Advanced Forecasting"
                    { text: i18n.t('payments.components.planSelection.plans.0.features.6.text') }, // "Custom Feature Requests"
                    { text: i18n.t('payments.components.planSelection.plans.0.features.7.text') } // "Dedicated Account Manager"
                ],
                whyThisPlan: i18n.t('register.components.planSelection.plans.0.whyThisPlan') // "Lightweight, powerful, and cost-effective\u2014First Batch gives independent bakers core tools to manage orders, track key ingredients, and see basic usage trends. Ideal if you\u2019re just starting or run a very small operation."
            },
            {
                id: i18n.t('payments.components.planSelection.plans.1.id'), // Non-translatable identifier // "growth_accelerator"
                name: i18n.t('register.components.planSelection.plans.1.name'), // "The Artisan Oven"
                price: i18n.t('register.components.planSelection.plans.1.price'), // "49.99"
                frequency: i18n.t('payments.components.planSelection.plans.0.frequency'), // "/month"
                description: [
                    i18n.t('payments.components.planSelection.plans.1.description.0'), // "For growing businesses ready to scale."
                    i18n.t('payments.components.planSelection.plans.1.description.1') // "All-in-one order management + deep insights to optimize and grow."
                ],
                features: [
                    { text: i18n.t('register.components.planSelection.plans.1.features.0.text') }, // "Everything in First Batch"
                    { text: i18n.t('payments.components.planSelection.plans.1.features.1.text') }, // "Advanced Cost & Consumption Forecasts"
                    { text: i18n.t('payments.components.planSelection.plans.1.features.2.text') }, // "Monthly Performance Reports"
                    { text: i18n.t('payments.components.planSelection.plans.1.features.3.text') }, // "Multi-Location Support (2 shops)"
                    { text: i18n.t('payments.components.planSelection.plans.1.features.4.text') }, // "Priority Email & Chat Support"
                    { text: i18n.t('payments.components.planSelection.plans.1.features.5.text') }, // "Access to Beta Features"
                    { text: i18n.t('payments.components.planSelection.plans.0.features.7.text') }, // "Dedicated Account Manager"
                    { text: i18n.t('payments.components.planSelection.plans.1.features.7.text') } // "Custom Integrations"
                ],
                whyThisPlan: i18n.t('register.components.planSelection.plans.1.whyThisPlan'), // "You\u2019re beyond the basics\u2014now you need real data to plan purchases, optimize recipes, orders, and spot sales trends. Artisan Oven brings forecasting, polished reports, and faster support so you bake bigger profits and expand efficiently."
                badgeText: i18n.t('payments.components.planSelection.badges.mostPopular'), // "Most Popular"
                discount: {
                    offerTitle: i18n.t('register.components.planSelection.plans.1.discount.offerTitle'), // "First Month FREE!"
                    displayPrice: i18n.t('register.components.planSelection.plans.1.discount.displayPrice'), // "0.00"
                    priceSuffix: i18n.t('payments.components.planSelection.plans.1.discount.priceSuffix'), // "/first month"
                    originalPriceText: i18n.t('register.components.planSelection.plans.1.discount.originalPriceText'), // "$49.99/month"
                    details: i18n.t('register.components.planSelection.plans.1.discount.details'), // "Then $49.99/month. Renews automatically, cancel anytime."
                    badgeText: i18n.t('payments.components.planSelection.badges.specialOffer') // "SPECIAL OFFER"
                }
            },
            {
                id: i18n.t('payments.components.planSelection.plans.2.id'), // Non-translatable identifier // "premium_pro_suite"
                name: i18n.t('register.components.planSelection.plans.2.name'), // "Master Baker Suite"
                price: i18n.t('register.components.planSelection.plans.2.price'), // "99.99"
                frequency: i18n.t('payments.components.planSelection.plans.0.frequency'), // "/month"
                description: [
                    i18n.t('payments.components.planSelection.plans.2.description.0'), // "For established bakeries that demand excellence."
                    i18n.t('payments.components.planSelection.plans.2.description.1') // "Full-featured, white-glove service, and limitless scalability."
                ],
                features: [
                    { text: i18n.t('register.components.planSelection.plans.2.features.0.text') }, // "Everything in Artisan Oven, plus:"
                    { text: i18n.t('payments.components.planSelection.plans.2.features.1.text') }, // "Unlimited Locations & Team Users"
                    { text: i18n.t('payments.components.planSelection.plans.2.features.2.text') }, // "Personalized Onboarding & Training"
                    { text: i18n.t('payments.components.planSelection.plans.2.features.3.text') }, // "Custom Feature Roadmap Input"
                    { text: i18n.t('payments.components.planSelection.plans.2.features.4.text') }, // "24/7 Priority Phone & Emergency Support"
                    { text: i18n.t('payments.components.planSelection.plans.2.features.5.text') }, // "Bespoke API & System Integrations"
                    { text: i18n.t('payments.components.planSelection.plans.2.features.6.text') } // "SLA-backed Uptime & Performance"
                ],
                whyThisPlan: i18n.t('register.components.planSelection.plans.2.whyThisPlan') // "If you\u2019re running multiple sites, handling high order volume, or need bespoke workflows\u2014Master Baker is your all-inclusive suite, complete with real-time SLAs, hands-on training, and a dedicated team that evolves the app around your unique needs."
            }
        ]
    },

    paymentSuccessPage: {
        title: i18n.t('payments.components.paymentSuccessPage.title'), // "Payment Successful!" // "Payment Successful!"
        titleSubscriptionActivated: i18n.t('payments.components.paymentSuccessPage.titleSubscriptionActivated'), // "Subscription Activated!" // "Subscription Activated!"
        thankYouMessage: i18n.t('payments.components.paymentSuccessPage.thankYouMessage'), // "Thank you, {userName}! Your subscription to the **{planName}** plan has been successfully activated." // "Thank you, {userName}! Your subscription to the **{planName}** plan has been successfully activated."
        thankYouGeneric: i18n.t('payments.components.paymentSuccessPage.thankYouGeneric'), // "Thank you! Your payment was successful and your subscription is now active." // "Thank you! Your payment was successful and your subscription is now active."
        accessMessage: i18n.t('payments.components.paymentSuccessPage.accessMessage'), // "You can now access all the premium features." // "You can now access all the premium features."
        transactionIdLabel: i18n.t('payments.components.paymentSuccessPage.transactionIdLabel'), // "Transaction ID:" // "Transaction ID:"
        buttons: {
            goToDashboard: i18n.t('payments.components.paymentSuccessPage.buttons.goToDashboard'), // "Go to Dashboard" // "Go to Dashboard"
            viewBilling: i18n.t('payments.components.paymentSuccessPage.buttons.viewBilling'), // "View Billing Details" // "View Billing Details"
        },
        links: {
            contactSupport: i18n.t('payments.components.paymentSuccessPage.links.contactSupport'), // "contact our support team" // "contact our support team"
        },
        loading: {
            finalizingSubscription: i18n.t('payments.components.paymentSuccessPage.loading.finalizingSubscription'), // "Finalizing your subscription..." // "Finalizing your subscription..."
            checkingDetails: i18n.t('payments.components.paymentSuccessPage.loading.checkingDetails'), // "Checking payment details..." // "Checking payment details..."
        },
        errors: {
            missingSessionId: i18n.t('payments.components.paymentSuccessPage.errors.missingSessionId'), // "Payment confirmation details are missing. If you've just subscribed, please check your dashboard or contact support." // "Payment confirmation details are missing. If you've just subscribed, please check your dashboard or contact support."
            subscriptionUpdateFailed: i18n.t('payments.components.paymentSuccessPage.errors.subscriptionUpdateFailed'), // "Your payment was successful, but we couldn't update your subscription details immediately. Please check your dashboard or contact support." // "Your payment was successful, but we couldn't update your subscription details immediately. Please check your dashboard or contact support."
        }
    },

    paymentCancelPage: {
        title: i18n.t('payments.components.paymentCancelPage.title'), // "Payment Not Completed" // "Payment Not Completed"
        message: i18n.t('payments.components.paymentCancelPage.message'), // "It looks like the payment process was not completed, or you chose to cancel. Your subscription has not been activated." // "It looks like the payment process was not completed, or you chose to cancel. Your subscription has not been activated."
        buttons: {
            tryAgain: i18n.t('payments.components.paymentCancelPage.buttons.tryAgain'), // "Try Again" // "Try Again"
            contactSupport: i18n.t('payments.components.paymentCancelPage.buttons.contactSupport'), // "Contact Support" // "Contact Support"
        },
        footerNote: i18n.t('payments.components.paymentCancelPage.footerNote') // "If you believe this is an error or need assistance, please don't hesitate to reach out." // "If you believe this is an error or need assistance, please don't hesitate to reach out."
    }
};