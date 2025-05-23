// src/components/register/hooks/useFormState.jsx

import { useState, useEffect, useCallback, useMemo } from 'react';
import * as yup from 'yup';
import { scriptLines_useFormState as scriptLines } from '../utils/script_lines';

/**
 * Custom hook for managing multi-step form state with validation, persistence, and navigation context.
 * @component useFormState
 * @param {Object} [initialFormStateData={}] - Initial values for the form data.
 * @returns {Object} Form state management utilities including:
 * - currentStep: Active step index.
 * - formData: Collected form data.
 * - errors: Current field-specific validation errors.
 * - generalError: A general error message for the current step or form.
 * - visitedSteps: Set of visited step indices.
 * - stepValidity: Array tracking validation status per step.
 * - submissionStatus: Form submission status ('idle', 'submitting', 'success', 'error').
 * - navigationHistory: Array tracking the sequence of visited steps.
 * - navigationDirection: Indicates direction of navigation (1 for next, -1 for back) for animations.
 * - updateFormData: Function to update a single field in formData.
 * - setFormData: Function to set the entire formData object.
 * - validateStep: Function to validate a specific step.
 * - goToStep: Function to navigate to a specific step.
 * - goNext: Function to navigate to the next step.
 * - goBack: Function to navigate to the previous step.
 * - passwordStrength: Calculated strength of the password ('weak', 'fair', 'strong').
 * - submitForm: Function to validate all steps (typically before proceeding to plan selection or final API call).
 * - resetForm: Function to reset the form to its initial state.
 * - setGeneralError: Function to manually set a general error message.
 * - isCurrentStepValid: Boolean indicating if the current step is valid.
 * - canGoNext: Boolean indicating if navigation to the next step is possible.
 * - canGoBack: Boolean indicating if navigation to the previous step is possible.
 */
export const useFormState = (initialFormStateData = {}) => {
    // ===========================================================================
    // Configuration
    // ===========================================================================
    const TOTAL_STEPS = 6; // 0:Info, 1:Location, 2:Logo, 3:Profile, 4:Preferences, 5:ProfileImage
    const SESSION_STORAGE_KEY = 'formRegistrationState'; // More specific key (Internal, not typically localized)

    const defaultInitialData = {
        businessName: '',
        businessEmail: '',
        businessUsername: '',
        businessPhone: '',
        businessWebsite: '',
        businessDescription: '', // NEW
        businessTags: [],
        address: { // This is for BUSINESS address from Step1Location
            street: '', city: '', state: '', postalCode: '', country: '', formattedAddress: '',
        },
        locationCoords: { lat: 0, lng: 0 },
        businessLogoFile: null,
        existingBusinessLogoUrl: '',
        name: '', // User's first name
        lastName: '', // User's last name
        role: '', // User's role in the business
        email: '', // User's email
        phone: '', // User's phone
        password: '',
        confirmPassword: '',
        timezone: '',
        preferredChannel: '',
        currency: '',
        dailySummaryTime: '',
        language: '',
        referralSources: [],
        acceptTerms: false,
        profileImageFile: null,
        existingProfileImageUrl: '',
        ...initialFormStateData // Allows override from component prop
    };

    const STEP_VALIDATIONS = useMemo(() => ({
        0: yup.object().shape({ // Step 0: Business Information
            businessName: yup.string().required(scriptLines.validation.businessNameRequired),
            businessEmail: yup.string().email(scriptLines.validation.emailInvalid).required(scriptLines.validation.businessEmailRequired),
            businessUsername: yup.string()
                .matches(/^[a-zA-Z0-9_.-]+$/, scriptLines.validation.businessUsernameInvalidFormat) // Allow . and -
                .required(scriptLines.validation.businessUsernameRequired),
            businessPhone: yup.string().required(scriptLines.validation.businessPhoneRequired),
            businessTags: yup.array().min(1, scriptLines.validation.businessTagsMin).required(),
            businessWebsite: yup.string().url(scriptLines.validation.businessWebsiteInvalidUrl).nullable(),
        }),
        1: yup.object().shape({ // Step 1: Business Location
            locationCoords: yup.object().shape({
                lat: yup.number().required(),
                lng: yup.number().required(),
            }).typeError(scriptLines.validation.locationRequiredOnMap).required(scriptLines.validation.locationRequiredOnMap),
            address: yup.object().shape({
                street: yup.string().required(scriptLines.validation.addressStreetRequired),
                city: yup.string().required(scriptLines.validation.addressCityRequired),
                postalCode: yup.string().required(scriptLines.validation.addressPostalCodeRequired),
                country: yup.string().required(scriptLines.validation.addressCountryRequired),
            }).typeError(scriptLines.validation.addressDetailsRequired).required(scriptLines.validation.addressDetailsRequired),
        }),
        2: yup.object().shape({ // Step 2: Business Logo
            businessLogoFile: yup.mixed().nullable()
            // .test('fileSize', scriptLines.validation.logoFileSizeTooLarge, value => !value || (value && value.size <= 5 * 1024 * 1024))
            // .test('fileType', scriptLines.validation.logoFileTypeUnsupported, value => !value || (value && ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(value.type)))
        }),
        3: yup.object().shape({ // Step 3: Your Profile
            name: yup.string().required(scriptLines.validation.profileNameRequired),
            email: yup.string().email(scriptLines.validation.emailInvalid).required(scriptLines.validation.profileEmailRequired),
            phone: yup.string().required(scriptLines.validation.profilePhoneRequired),
            password: yup.string()
                .min(8, scriptLines.validation.passwordMinLength)
                .matches(/[A-Z]/, scriptLines.validation.passwordRequiresUppercase)
                .matches(/[a-z]/, scriptLines.validation.passwordRequiresLowercase)
                .matches(/[0-9]/, scriptLines.validation.passwordRequiresNumber)
                .matches(/[\W_]/, scriptLines.validation.passwordRequiresSpecialChar)
                .required(scriptLines.validation.passwordRequired),
            confirmPassword: yup.string()
                .oneOf([yup.ref('password')], scriptLines.validation.confirmPasswordMatch)
                .required(scriptLines.validation.confirmPasswordRequired),
            role: yup.string().nullable(),
        }),
        4: yup.object().shape({ // Step 4: Preferences
            timezone: yup.string().required(scriptLines.validation.timezoneRequired),
            currency: yup.string().required(scriptLines.validation.currencyRequired),
            language: yup.string().required(scriptLines.validation.languageRequired),
            acceptTerms: yup.boolean().oneOf([true], scriptLines.validation.acceptTermsRequired),
            preferredChannel: yup.string().nullable(),
            dailySummaryTime: yup.string().nullable(),
            referralSources: yup.array().nullable(),
        }),
        5: yup.object().shape({ // Step 5: Profile Image
            profileImage: yup.mixed().nullable()
            // .test('fileSize', scriptLines.validation.profileImageFileSizeTooLarge, value => ...)
            // .test('fileType', scriptLines.validation.profileImageFileTypeUnsupported, value => ...)
        }),
    }), [scriptLines]); // scriptLines dependency added, though it's static import

    // ===========================================================================
    // State Management
    // ===========================================================================
    const [state, setState] = useState(() => {
        let persistedState = {};
        // ... (session storage loading logic)
        if (typeof window !== 'undefined') {
            try {
                const item = sessionStorage.getItem(SESSION_STORAGE_KEY);
                if (item) {
                    persistedState = JSON.parse(item);
                }
            } catch (error) {
                console.error(scriptLines.log.failedToParseSessionStorage, error);
            }
        }
        return {
            currentStep: persistedState.currentStep || 0,
            formData: { ...defaultInitialData, ...persistedState.formData }, // Use defaultInitialData
            errors: {},
            generalError: null,
            visitedSteps: new Set(
                Array.isArray(persistedState.visitedSteps)
                    ? persistedState.visitedSteps.map(Number)
                    : [0]
            ),
            stepValidity: Array(TOTAL_STEPS).fill(false),
            submissionStatus: 'idle',
            navigationHistory: Array.isArray(persistedState.navigationHistory)
                ? persistedState.navigationHistory
                : [0],
            navigationDirection: undefined,
        };
    });

    // ===========================================================================
    // Persistence Layer
    // ===========================================================================
     useEffect(() => {
        if (typeof window !== 'undefined') {
            const stateToPersist = {
                currentStep: state.currentStep,
                formData: state.formData,
                navigationHistory: state.navigationHistory,
                visitedSteps: Array.from(state.visitedSteps),
            };
            try {
                sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(stateToPersist));
            } catch (error) {
                console.error(scriptLines.log.failedToSaveSessionStorage, error);
            }
        }
    }, [state.currentStep, state.formData, state.navigationHistory, state.visitedSteps]);

    // ===========================================================================
    // Validation Logic
    // ===========================================================================
    const validateStep = useCallback(async (stepToValidate) => {
        setState(prev => ({ ...prev, generalError: null }));
        try {
            const schema = STEP_VALIDATIONS[stepToValidate];
            if (!schema) {
                setState(prev => ({
                    ...prev,
                    errors: { ...prev.errors, [stepToValidate]: {} },
                    stepValidity: prev.stepValidity.map((v, i) => (i === stepToValidate ? true : v)),
                }));
                return true;
            }

            await schema.validate(state.formData, { abortEarly: false });
            setState(prev => ({
                ...prev,
                errors: { ...prev.errors, [stepToValidate]: {} },
                stepValidity: prev.stepValidity.map((v, i) => (i === stepToValidate ? true : v)),
            }));
            return true;
        } catch (err) {
            const fieldErrors = err.inner ? err.inner.reduce((acc, curr) => {
                acc[curr.path] = curr.message;
                return acc;
            }, {}) : { [err.path || 'general']: err.message };

            setState(prev => ({
                ...prev,
                errors: { ...prev.errors, ...fieldErrors },
                generalError: scriptLines.error.form.correctErrorsInStep.replace('{stepNumber}', (stepToValidate + 1).toString()),
                stepValidity: prev.stepValidity.map((v, i) => (i === stepToValidate ? false : v)),
            }));
            return false;
        }
    }, [state.formData, STEP_VALIDATIONS, scriptLines.error.form.correctErrorsInStep]);

    // ===========================================================================
    // Form Operations
    // ===========================================================================
    const updateFormData = useCallback((field, value) => {
        setState(prev => {
            const newFormData = { ...prev.formData, [field]: value };
            const newErrors = { ...prev.errors, [field]: undefined };
            const newStepValidity = prev.stepValidity.map((valid, idx) =>
                idx >= prev.currentStep ? false : valid
            );
            return {
                ...prev,
                formData: newFormData,
                errors: newErrors,
                stepValidity: newStepValidity,
                generalError: null,
            };
        });
    }, []);

    const setFormData = useCallback((newFormDataOrCallback) => {
        setState(prev => {
            const newFormData = typeof newFormDataOrCallback === 'function'
                ? newFormDataOrCallback(prev.formData)
                : newFormDataOrCallback;
            const newStepValidity = prev.stepValidity.map((valid, idx) =>
                idx >= prev.currentStep ? false : valid
            );
            return {
                ...prev,
                formData: newFormData,
                errors: {},
                stepValidity: newStepValidity,
                generalError: null,
            };
        });
    }, []);

    const setGeneralError = useCallback((message) => {
        setState(prev => ({ ...prev, generalError: message }));
    }, []);


    // ===========================================================================
    // Navigation Logic
    // ===========================================================================
    const goToStep = useCallback(async (targetStep, direction) => {
        if (targetStep < 0 || targetStep >= TOTAL_STEPS || targetStep === state.currentStep) return;

        if (direction > 0 && targetStep > state.currentStep) {
            const currentStepIsValid = await validateStep(state.currentStep);
            if (!currentStepIsValid) return;
        }

        setState(prev => ({
            ...prev,
            currentStep: targetStep,
            visitedSteps: new Set([...prev.visitedSteps, targetStep]),
            navigationHistory: [...prev.navigationHistory, targetStep],
            navigationDirection: direction,
            generalError: null,
        }));
    }, [state.currentStep, validateStep]);

    const goNext = useCallback(async () => {
        if (state.currentStep < TOTAL_STEPS - 1) {
            await goToStep(state.currentStep + 1, 1);
        }
    }, [state.currentStep, goToStep]);

    const goBack = useCallback(() => {
        if (state.currentStep > 0) {
            setState(prev => ({
                ...prev,
                currentStep: prev.currentStep - 1,
                navigationHistory: [...prev.navigationHistory, prev.currentStep - 1],
                navigationDirection: -1,
                generalError: null,
            }));
        }
    }, []);

    // ===========================================================================
    // Password Strength Calculator
    // ===========================================================================
    const calculatePasswordStrength = useCallback((password) => {
        if (!password || password.length < 8) return scriptLines.passwordStrength.weak;
        const strengthFactors = [
            /[A-Z]/.test(password), /\d/.test(password), /[^A-Za-z0-9]/.test(password)
        ];
        const strengthScore = strengthFactors.filter(Boolean).length;
        // Returning the localized string directly.
        // For more advanced i18n, might return keys like 'weak', 'fair', 'strong'
        // and let the UI component handle translation.
        return strengthScore >= 3 ? scriptLines.passwordStrength.strong :
            strengthScore >= 2 ? scriptLines.passwordStrength.fair :
                scriptLines.passwordStrength.weak;
    }, [scriptLines.passwordStrength]);

    // ===========================================================================
    // Form Submission (Conceptual - validates all steps)
    // ===========================================================================
    const submitForm = useCallback(async () => {
        setState(prev => ({ ...prev, submissionStatus: 'submitting', generalError: null }));
        for (let i = 0; i < TOTAL_STEPS; i++) {
            if (STEP_VALIDATIONS[i]) {
                const stepIsValid = await validateStep(i);
                if (!stepIsValid) {
                    setState(prev => ({
                        ...prev,
                        currentStep: i,
                        submissionStatus: 'idle',
                        generalError: scriptLines.error.form.correctErrorsInStepTitleCase.replace('{stepNumber}', (i + 1).toString())
                    }));
                    return false;
                }
            }
        }
        setState(prev => ({ ...prev, submissionStatus: 'idle' }));
        return true;
    }, [validateStep, STEP_VALIDATIONS]);


    // ===========================================================================
    // Reset Form
    // ===========================================================================
    const resetForm = useCallback(() => {
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
        }
        setState({
            currentStep: 0,
            formData: initialFormStateData,
            errors: {},
            generalError: null,
            visitedSteps: new Set([0]),
            stepValidity: Array(TOTAL_STEPS).fill(false),
            submissionStatus: 'idle',
            navigationHistory: [0],
            navigationDirection: undefined,
        });
    }, [initialFormStateData]);

    // ===========================================================================
    // Memoized Values for Export
    // ===========================================================================
    const passwordStrength = useMemo(
        () => calculatePasswordStrength(state.formData.password),
        [state.formData.password, calculatePasswordStrength]
    );

    const isCurrentStepValid = useMemo(
        () => state.stepValidity[state.currentStep] === true,
        [state.stepValidity, state.currentStep]
    );

    // ===========================================================================
    // Exposed API of the Hook
    // ===========================================================================
    return {
        currentStep: state.currentStep,
        formData: state.formData,
        errors: state.errors,
        generalError: state.generalError,
        visitedSteps: state.visitedSteps,
        stepValidity: state.stepValidity,
        submissionStatus: state.submissionStatus,
        navigationHistory: state.navigationHistory,
        navigationDirection: state.navigationDirection,
        updateFormData,
        setFormData,
        validateStep,
        goToStep,
        goNext,
        goBack,
        submitForm,
        resetForm,
        setGeneralError,
        passwordStrength, // Assuming this is calculated and returned
        isCurrentStepValid, // Assuming this is calculated and returned
        canGoNext: state.currentStep < TOTAL_STEPS - 1,
        canGoBack: state.currentStep > 0,
    };
};