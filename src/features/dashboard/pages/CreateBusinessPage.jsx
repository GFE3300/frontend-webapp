import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import * as yup from 'yup';

// Internal Hooks & Services
import { useCreateBusiness } from '../hooks/useCreateBusiness';

// Reusable Components from Registration Feature
import {
    Step0BusinessInfo,
    Step1Location,
    Step2BusinessLogo,
} from '../../register/stages';
import {
    FormStep,
    StageTracker,
} from '../../register/subcomponents';

import {
    scriptLines_Registration,
    scriptLines_useFormState,
} from '../../register/utils/script_lines';

// Animation Configuration for smooth step transitions
const stepTransition = {
    custom: (direction) => ({
        x: direction > 0 ? '100%' : '-100%',
        opacity: 0,
        scale: 0.95
    }),
    center: {
        x: 0,
        opacity: 1,
        scale: 1,
        transition: { type: 'spring', stiffness: 260, damping: 30 }
    },
    exit: (direction) => ({
        x: direction < 0 ? '100%' : '-100%',
        opacity: 0,
        scale: 0.95,
        transition: { duration: 0.2 }
    })
};

// Define the labels for the StageTracker
const stageTrackerLabels = [
    scriptLines_Registration.registrationPage.stageTrackerLabels[0],
    scriptLines_Registration.registrationPage.stageTrackerLabels[1],
    scriptLines_Registration.registrationPage.stageTrackerLabels[2],
];

const validationSchemas = [
    // Step 0: Business Details
    yup.object().shape({
        businessName: yup.string().required(scriptLines_useFormState.validation.businessNameRequired),
        businessUsername: yup.string()
            .matches(/^[a-zA-Z0-9_.-]+$/, scriptLines_useFormState.validation.businessUsernameInvalidFormat)
            .required(scriptLines_useFormState.validation.businessUsernameRequired),
    }),
    // Step 1: Location
    yup.object().shape({
        locationCoords: yup.object().shape({
            lat: yup.number().required(),
            lng: yup.number().required(),
        }).required(scriptLines_useFormState.validation.locationRequiredOnMap),
        address: yup.object().shape({
            street: yup.string().required(scriptLines_useFormState.validation.addressStreetRequired),
            city: yup.string().required(scriptLines_useFormState.validation.addressCityRequired),
            postalCode: yup.string().required(scriptLines_useFormState.validation.addressPostalCodeRequired),
            country: yup.string().required(scriptLines_useFormState.validation.addressCountryRequired),
        }).required(scriptLines_useFormState.validation.addressDetailsRequired),
    }),
    // Step 2: Branding (Logo) - No required fields for this step.
    yup.object().shape({
        businessLogoFile: yup.mixed().nullable(),
    }),
];

const CreateBusinessPage = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        businessName: '', businessEmail: '', businessUsername: '', businessPhone: '',
        businessWebsite: '', businessDescription: '', businessTags: [],
        address: { street: '', city: '', state: '', postalCode: '', country: '', formattedAddress: '' },
        locationCoords: null, businessLogoFile: null,
    });
    const [errors, setErrors] = useState({});
    const [visitedSteps, setVisitedSteps] = useState(new Set([0]));
    const [navigationDirection, setNavigationDirection] = useState(1);

    const createBusinessMutation = useCreateBusiness();

    const updateFormData = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    }, [errors]);

    const validateStep = useCallback(async (stepToValidate) => {
        const schema = validationSchemas[stepToValidate];
        if (!schema) return true;

        try {
            await schema.validate(formData, { abortEarly: false });
            setErrors({});
            return true;
        } catch (err) {
            if (err instanceof yup.ValidationError) {
                const fieldErrors = err.inner.reduce((acc, currentError) => {
                    const pathParts = currentError.path.split('.');
                    if (pathParts.length > 1) {
                        if (!acc[pathParts[0]]) acc[pathParts[0]] = {};
                        acc[pathParts[0]][pathParts[1]] = currentError.message;
                    } else {
                        acc[currentError.path] = currentError.message;
                    }
                    return acc;
                }, {});
                setErrors(fieldErrors);
            }
            return false;
        }
    }, [formData]);

    const handleNext = useCallback(async () => {
        const isValid = await validateStep(currentStep);
        if (isValid && currentStep < stageTrackerLabels.length - 1) {
            setNavigationDirection(1);
            setVisitedSteps(prev => new Set([...prev, currentStep + 1]));
            setCurrentStep(prev => prev + 1);
        }
    }, [currentStep, validateStep]);

    const handleBack = useCallback(() => {
        if (currentStep > 0) {
            setNavigationDirection(-1);
            setCurrentStep(prev => prev - 1);
        }
    }, [currentStep]);

    const goToStep = useCallback(async (targetStep) => {
        if (targetStep > currentStep) {
            const isValid = await validateStep(currentStep);
            if (!isValid) return;
        }
        setNavigationDirection(targetStep > currentStep ? 1 : -1);
        setVisitedSteps(prev => new Set([...prev, targetStep]));
        setCurrentStep(targetStep);
    }, [currentStep, validateStep]);

    const handleSubmit = async () => {
        const isFinalStepValid = await validateStep(currentStep);
        if (!isFinalStepValid) return;

        const payload = {
            name: formData.businessName,
            username: formData.businessUsername,
            email: formData.businessEmail,
            phone: formData.businessPhone,
            website: formData.businessWebsite,
            description: formData.businessDescription,
            tags: Array.isArray(formData.businessTags) ? formData.businessTags.join(',') : formData.businessTags,
            address_street: formData.address?.street,
            address_city: formData.address?.city,
            address_state: formData.address?.state,
            address_postal_code: formData.address?.postalCode,
            address_country: formData.address?.country,
            address_formatted: formData.address?.formattedAddress,
            // --- FIX: Convert latitude and longitude numbers to strings ---
            latitude: formData.locationCoords?.lat ? String(formData.locationCoords.lat) : null,
            longitude: formData.locationCoords?.lng ? String(formData.locationCoords.lng) : null,
        };

        const cleanedPayload = Object.fromEntries(
            Object.entries(payload).filter(([, v]) => v !== null && v !== undefined && v !== '')
        );

        createBusinessMutation.mutate(cleanedPayload);
    };

    const renderCurrentStep = () => {
        const formStateForStep = {
            currentStep, formData, errors, validateStep, updateFormData, setFormData,
            submissionStatus: createBusinessMutation.isPending ? 'submitting' : 'idle',
            navigationDirection, visitedSteps, goToStep,
        };

        const stepProps = { formData, errors, updateField: updateFormData, setFormData };

        const formStepWrapperProps = {
            key: `step-${currentStep}`,
            stepIndex: currentStep,
            formState: formStateForStep,
            onBack: handleBack,
            totalFormSteps: stageTrackerLabels.length,
        };

        switch (currentStep) {
            case 0:
                return (
                    <FormStep {...formStepWrapperProps} title="Business Details" onProceed={handleNext}>
                        <Step0BusinessInfo {...stepProps} />
                    </FormStep>
                );
            case 1:
                return (
                    <FormStep {...formStepWrapperProps} title="Business Location" onProceed={handleNext}>
                        <Step1Location {...stepProps} />
                    </FormStep>
                );
            case 2:
                return (
                    <FormStep {...formStepWrapperProps} title="Business Branding" onProceed={handleSubmit} isFinalStep={true}>
                        <Step2BusinessLogo {...stepProps} />
                    </FormStep>
                );
            default:
                return null;
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
            <header className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                    {sl.createBusinessPage.title || 'Create a New Business'}
                </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    Set up a new venture in just a few steps. This will count towards your plan's limit.
                </p>
            </header>

            <div className="flex flex-col md:flex-row gap-8">
                <aside className="w-full md:w-1/4">
                    <StageTracker
                        steps={stageTrackerLabels}
                        currentStep={currentStep}
                        onStepClick={goToStep}
                        orientation="vertical"
                        visitedSteps={visitedSteps}
                    />
                </aside>
                <main className="flex-1 overflow-hidden">
                    <AnimatePresence mode="wait" custom={navigationDirection}>
                        {renderCurrentStep()}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default CreateBusinessPage;