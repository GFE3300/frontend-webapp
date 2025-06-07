import { t } from '../../../i18n';

export const scriptLines_Components = {

    planSelection: {
        title: t('payments.components.planSelection.title'),
        subtitle: t('payments.components.planSelection.subtitle'),
        footerNote: t('payments.components.planSelection.footerNote'),
        buttons: {
            chooseThisPlan: t('payments.components.planSelection.buttons.chooseThisPlan'),
            processing: t('payments.components.planSelection.buttons.processing'),
            planSelected: t('payments.components.planSelection.buttons.planSelected'),
            manageSubscription: t('payments.components.planSelection.buttons.manageSubscription'),
            upgradePlan: t('payments.components.planSelection.buttons.upgradePlan'),
            downgradePlan: t('payments.components.planSelection.buttons.downgradePlan'),
            switchPlan: t('payments.components.planSelection.buttons.switchPlan'), // Fallback or for comparable tiers
        },
        badges: {
            mostPopular: t('payments.components.planSelection.badges.mostPopular'),
            recommended: t('payments.components.planSelection.badges.recommended'),
            specialOffer: t('payments.components.planSelection.badges.specialOffer'),
            currentPlan: t('payments.components.planSelection.badges.currentPlan'),
        },
        messages: {
            loadingSubscription: t('payments.components.planSelection.messages.loadingSubscription'),
            subscriptionLoadError: t('payments.components.planSelection.messages.subscriptionLoadError'),
            alreadySubscribedError: t('payments.components.planSelection.messages.alreadySubscribedError'),
        },
        errors: {
            functionalityUnavailable: t('payments.components.planSelection.errors.functionalityUnavailable'),
        },
        console: {
            invalidOnPlanSelectProp: t('payments.components.planSelection.console.invalidOnPlanSelectProp'),
        },
        themeColorDefault: t('payments.components.planSelection.themeColorDefault'),

        plans: [
            {
                id: t('payments.components.planSelection.plans.0.id'),
                name: t('payments.components.planSelection.plans.0.name'),
                price: t('payments.components.planSelection.plans.0.price'),
                frequency: t('payments.components.planSelection.plans.0.frequency'),
                description: [t('payments.components.planSelection.plans.0.description.0'), t('payments.components.planSelection.plans.0.description.1')],
                features: [
                    { text: t('payments.components.planSelection.plans.0.features.0.text') },
                    { text: t('payments.components.planSelection.plans.0.features.1.text') },
                    { text: t('payments.components.planSelection.plans.0.features.2.text') },
                    { text: t('payments.components.planSelection.plans.0.features.3.text') },
                    { text: t('payments.components.planSelection.plans.0.features.4.text') },
                    { text: t('payments.components.planSelection.plans.0.features.5.text') }, // (featureLogic: false)
                    { text: t('payments.components.planSelection.plans.0.features.6.text') }, // (featureLogic: false)
                    { text: t('payments.components.planSelection.plans.0.features.7.text') } // (featureLogic: false)
                ],
                iconName: t('payments.components.planSelection.plans.0.iconName'),
                whyThisPlan: t('payments.components.planSelection.plans.0.whyThisPlan'),
            },
            {
                id: t('payments.components.planSelection.plans.1.id'),
                name: t('payments.components.planSelection.plans.1.name'),
                price: t('payments.components.planSelection.plans.1.price'),
                frequency: t('payments.components.planSelection.plans.0.frequency'),
                description: [t('payments.components.planSelection.plans.1.description.0'), t('payments.components.planSelection.plans.1.description.1')],
                features: [
                    { text: t('payments.components.planSelection.plans.1.features.0.text') },
                    { text: t('payments.components.planSelection.plans.1.features.1.text') },
                    { text: t('payments.components.planSelection.plans.1.features.2.text') },
                    { text: t('payments.components.planSelection.plans.1.features.3.text') },
                    { text: t('payments.components.planSelection.plans.1.features.4.text') },
                    { text: t('payments.components.planSelection.plans.1.features.5.text') },
                    { text: t('payments.components.planSelection.plans.0.features.7.text') }, // (featureLogic: true for Growth?) Assuming yes for all features
                    { text: t('payments.components.planSelection.plans.1.features.7.text') }       // (featureLogic: true for Growth?) Assuming yes
                ],
                iconName: t('payments.components.planSelection.plans.1.iconName'),
                whyThisPlan: t('payments.components.planSelection.plans.1.whyThisPlan'),
                badgeText: t('payments.components.planSelection.badges.mostPopular'),
                discount: {
                    offerTitle: t('payments.components.planSelection.plans.1.discount.offerTitle'),
                    displayPrice: t('payments.components.planSelection.plans.1.discount.displayPrice'),
                    priceSuffix: t('payments.components.planSelection.plans.1.discount.priceSuffix'),
                    originalPriceText: t('payments.components.planSelection.plans.1.discount.originalPriceText'),
                    details: t('payments.components.planSelection.plans.1.discount.details'),
                    badgeText: t('payments.components.planSelection.badges.specialOffer'),
                }
            },
            {
                id: t('payments.components.planSelection.plans.2.id'),
                name: t('payments.components.planSelection.plans.2.name'),
                price: t('payments.components.planSelection.plans.2.price'),
                frequency: t('payments.components.planSelection.plans.0.frequency'),
                description: [t('payments.components.planSelection.plans.2.description.0'), t('payments.components.planSelection.plans.2.description.1')],
                features: [
                    { text: t('payments.components.planSelection.plans.2.features.0.text') },
                    { text: t('payments.components.planSelection.plans.2.features.1.text') },
                    { text: t('payments.components.planSelection.plans.2.features.2.text') },
                    { text: t('payments.components.planSelection.plans.2.features.3.text') },
                    { text: t('payments.components.planSelection.plans.2.features.4.text') },
                    { text: t('payments.components.planSelection.plans.2.features.5.text') },
                    { text: t('payments.components.planSelection.plans.2.features.6.text') }
                ],
                iconName: t('payments.components.planSelection.plans.2.iconName'),
                whyThisPlan: t('payments.components.planSelection.plans.2.whyThisPlan'),
            }
        ]
    },

    paymentSuccessPage: {
        title: t('payments.components.paymentSuccessPage.title'),
        titleSubscriptionActivated: t('payments.components.paymentSuccessPage.titleSubscriptionActivated'),
        thankYouMessage: t('payments.components.paymentSuccessPage.thankYouMessage'),
        thankYouGeneric: t('payments.components.paymentSuccessPage.thankYouGeneric'),
        accessMessage: t('payments.components.paymentSuccessPage.accessMessage'),
        transactionIdLabel: t('payments.components.paymentSuccessPage.transactionIdLabel'),
        buttons: {
            goToDashboard: t('payments.components.paymentSuccessPage.buttons.goToDashboard'),
            viewBilling: t('payments.components.paymentSuccessPage.buttons.viewBilling'),
        },
        links: {
            contactSupport: t('payments.components.paymentSuccessPage.links.contactSupport'),
        },
        loading: {
            finalizingSubscription: t('payments.components.paymentSuccessPage.loading.finalizingSubscription'),
            checkingDetails: t('payments.components.paymentSuccessPage.loading.checkingDetails'),
        },
        errors: {
            missingSessionId: t('payments.components.paymentSuccessPage.errors.missingSessionId'),
            subscriptionUpdateFailed: t('payments.components.paymentSuccessPage.errors.subscriptionUpdateFailed'),
        }
    },

    paymentCancelPage: {
        title: t('payments.components.paymentCancelPage.title'),
        message: t('payments.components.paymentCancelPage.message'),
        buttons: {
            tryAgain: t('payments.components.paymentCancelPage.buttons.tryAgain'),
            contactSupport: t('payments.components.paymentCancelPage.buttons.contactSupport'),
        },
        footerNote: t('payments.components.paymentCancelPage.footerNote')
    }
};