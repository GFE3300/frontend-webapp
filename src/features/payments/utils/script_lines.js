// frontend/src/features/payments/utils/script_lines.js
export const scriptLines_Components = {

    planSelection: {
        title: "Unlock Your Potential",
        subtitle: "You're one step away! Choose the plan that aligns with your ambition and let's start baking success together.",
        footerNote: "All plans are billed monthly or annually. You can upgrade, downgrade, or cancel your plan at any time from your account settings.",
        buttons: {
            chooseThisPlan: "Choose This Plan",
            processing: "Processing...",
            planSelected: "Plan Selected!",
            manageSubscription: "Manage Subscription",
            upgradePlan: "Upgrade Plan",
            downgradePlan: "Downgrade Plan",
            switchPlan: "Switch Plan", // Fallback or for comparable tiers
        },
        badges: {
            mostPopular: "Most Popular",
            recommended: "Recommended",
            specialOffer: "SPECIAL OFFER",
            // NEW BADGE TEXT
            currentPlan: "Current Plan",
        },
        messages: {
            // NEW MESSAGES
            loadingSubscription: "Loading your subscription details...",
            subscriptionLoadError: "Could not load your current subscription status. Please try again or contact support.",
            alreadySubscribedError: "You are already subscribed to this plan. To make changes, please use 'Manage Subscription'.",
        },
        errors: {
            functionalityUnavailable: "Error: Plan selection functionality is unavailable.",
        },
        console: {
            invalidOnPlanSelectProp: "PlanSelection: Invalid `onPlanSelect` prop. Expected a function.",
        },
        themeColorDefault: "rose",

        plans: [
            {
                id: 'starter_essentials',
                name: 'CrumbData - Starter Essentials',
                price: '29.99',
                frequency: '/month',
                description: ['Perfect for solo and micro-shops.', 'Get up and running fast with essential order & inventory tools.'],
                features: [
                    { text: 'Unlimited Orders' },
                    { text: 'Menu-Style Order Entry' },
                    { text: 'Live Low-Stock Alerts' },
                    { text: 'Basic Consumption Charts' },
                    { text: 'Email Support (48 hr response)' },
                    { text: 'Advanced Forecasting' }, // (featureLogic: false)
                    { text: 'Custom Feature Requests' }, // (featureLogic: false)
                    { text: 'Dedicated Account Manager' } // (featureLogic: false)
                ],
                iconName: 'bolt',
                whyThisPlan: 'Lightweight, powerful, and cost-effective—Starter Essentials gives independent bakers core tools to manage orders, track key ingredients, and see basic usage trends. Ideal if you’re just starting or run a very small operation.',
            },
            {
                id: 'growth_accelerator',
                name: 'CrumbData - Growth Accelerator',
                price: '39.99',
                frequency: '/month',
                description: ['For growing businesses ready to scale.', 'All-in-one order management + deep insights to optimize and grow.'],
                features: [
                    { text: 'Everything in Starter Essentials' },
                    { text: 'Advanced Cost & Consumption Forecasts' },
                    { text: 'Monthly Performance Reports' },
                    { text: 'Multi-Location Support (2 shops)' },
                    { text: 'Priority Email & Chat Support' },
                    { text: 'Access to Beta Features' },
                    { text: 'Dedicated Account Manager' }, // (featureLogic: true for Growth?) Assuming yes for all features
                    { text: 'Custom Integrations' }       // (featureLogic: true for Growth?) Assuming yes
                ],
                iconName: 'mode_heat',
                whyThisPlan: 'You’re beyond the basics—now you need real data to plan purchases, optimize recipes, orders, and spot sales trends. Growth Accelerator brings forecasting, polished reports, and faster support so you bake bigger profits and expand efficiently.',
                badgeText: "Most Popular",
                discount: {
                    offerTitle: 'First Month 60% Off!',
                    displayPrice: '16.00',
                    priceSuffix: '/first month',
                    originalPriceText: '€39.99/month',
                    details: 'Then €39.99/month. Renews automatically, cancel anytime.',
                    badgeText: 'SPECIAL OFFER',
                }
            },
            {
                id: 'premium_pro_suite',
                name: 'CrumbData - Premium Pro Suite',
                price: '89.99',
                frequency: '/month',
                description: ['For established bakeries that demand excellence.', 'Full-featured, white-glove service, and limitless scalability.'],
                features: [
                    { text: 'Everything in Growth Accelerator, plus:' },
                    { text: 'Unlimited Locations & Team Users' },
                    { text: 'Personalized Onboarding & Training' },
                    { text: 'Custom Feature Roadmap Input' },
                    { text: '24/7 Priority Phone & Emergency Support' },
                    { text: 'Bespoke API & System Integrations' },
                    { text: 'SLA-backed Uptime & Performance' }
                ],
                iconName: 'verified',
                whyThisPlan: 'If you’re running multiple sites, handling high order volume, or need bespoke workflows—Premium Pro Suite is your all-inclusive suite, complete with real-time SLAs, hands-on training, and a dedicated team that evolves the app around your unique needs.',
            }
        ]
    },
};