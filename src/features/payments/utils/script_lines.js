export const scriptLines_Components = {

    planSelection: {
        title: "Unlock Your Potential",
        subtitle: "You're one step away! Choose the plan that aligns with your ambition and let's start baking success together.",
        footerNote: "All plans are billed monthly or annually. You can upgrade, downgrade, or cancel your plan at any time from your account settings.",
        buttons: {
            chooseThisPlan: "Choose This Plan",
            processing: "Processing...",
            planSelected: "Plan Selected!",
        },
        badges: {
            mostPopular: "Most Popular",
            recommended: "Recommended", // Fallback if plan.badgeText is not set for a highlighted plan
            specialOffer: "SPECIAL OFFER", // Default for discount badge if not specified in plan data
        },
        errors: {
            functionalityUnavailable: "Error: Plan selection functionality is unavailable.",
        },
        console: {
            invalidOnPlanSelectProp: "PlanSelection: Invalid `onPlanSelect` prop. Expected a function.",
        },
        themeColorDefault: "rose", // Default theme color if not provided

        // Plan Data - This is the most complex part for i18n.
        // Each plan's name, description, features, whyThisPlan, etc., needs to be localizable.
        // The structure below mirrors PLANS_DATA from the component.
        plans: [
            {
                id: 'starter_essentials', // Updated ID
                name: 'CrumbData - Starter Essentials', // Updated Name
                price: '29.99', // Price confirmed
                frequency: '/month',
                description: ['Perfect for solo and micro-shops.', 'Get up and running fast with essential order & inventory tools.'],
                features: [
                    { text: 'Unlimited Orders' }, // `check` boolean is logic, not text
                    { text: 'Menu-Style Order Entry' },
                    { text: 'Live Low-Stock Alerts' },
                    { text: 'Basic Consumption Charts' },
                    { text: 'Email Support (48 hr response)' }, // Note: "48 hr" might need specific localization
                    { text: 'Advanced Forecasting' },
                    { text: 'Custom Feature Requests' },
                    { text: 'Dedicated Account Manager' }
                ],
                iconName: 'bolt', // Icon name is usually not localized
                whyThisPlan: 'Lightweight, powerful, and cost-effective—Starter Essentials gives independent bakers core tools to manage orders, track key ingredients, and see basic usage trends. Ideal if you’re just starting or run a very small operation.', // Updated plan name in description
                // Theme related properties are typically not part of i18n text strings.
                // highlight and discount.isActive are also logic.
            },
            {
                id: 'growth_accelerator', // Updated ID
                name: 'CrumbData - Growth Accelerator', // Updated Name
                price: '39.99', // Updated Price
                frequency: '/month',
                description: ['For growing businesses ready to scale.', 'All-in-one order management + deep insights to optimize and grow.'],
                features: [
                    { text: 'Everything in Starter Essentials' }, // Updated previous plan name
                    { text: 'Advanced Cost & Consumption Forecasts' },
                    { text: 'Monthly Performance Reports' },
                    { text: 'Multi-Location Support (2 shops)' }, // "2 shops" might need localization
                    { text: 'Priority Email & Chat Support' },
                    { text: 'Access to Beta Features' },
                    { text: 'Dedicated Account Manager' },
                    { text: 'Custom Integrations' }
                ],
                iconName: 'mode_heat',
                whyThisPlan: 'You’re beyond the basics—now you need real data to plan purchases, optimize recipes, orders, and spot sales trends. Growth Accelerator brings forecasting, polished reports, and faster support so you bake bigger profits and expand efficiently.', // Updated plan name in description
                badgeText: "Most Popular", // This specific badge text can be localized here
                discount: { // Assuming discount structure is still desired
                    offerTitle: 'First Month 60% Off!',
                    displayPrice: '16.00',
                    priceSuffix: '/first month',
                    originalPriceText: '€39.99/month', // Updated original price
                    details: 'Then €39.99/month. Renews automatically, cancel anytime.', // Updated price in details
                    badgeText: 'SPECIAL OFFER',
                }
            },
            {
                id: 'premium_pro_suite', // Updated ID
                name: 'CrumbData - Premium Pro Suite', // Updated Name
                price: '89.99', // Updated Price
                frequency: '/month',
                description: ['For established bakeries that demand excellence.', 'Full-featured, white-glove service, and limitless scalability.'],
                features: [
                    { text: 'Everything in Growth Accelerator, plus:' }, // Updated previous plan name
                    { text: 'Unlimited Locations & Team Users' },
                    { text: 'Personalized Onboarding & Training' },
                    { text: 'Custom Feature Roadmap Input' },
                    { text: '24/7 Priority Phone & Emergency Support' }, // "24/7" might need localization
                    { text: 'Bespoke API & System Integrations' },
                    { text: 'SLA-backed Uptime & Performance' }
                ],
                iconName: 'verified',
                whyThisPlan: 'If you’re running multiple sites, handling high order volume, or need bespoke workflows—Premium Pro Suite is your all-inclusive suite, complete with real-time SLAs, hands-on training, and a dedicated team that evolves the app around your unique needs.', // Updated plan name in description
            }
        ]
    },
};