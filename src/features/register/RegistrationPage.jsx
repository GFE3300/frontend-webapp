import React, { useEffect, useRef, memo, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { jwtDecode } from 'jwt-decode';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

// Internal Hooks & Services
import { useFormState } from './hooks/useFormState';
import useWindowSize from '../../hooks/useWindowSize';
import apiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

// Components & Stages
import Icon from '../../components/common/Icon';
import {
    Step0BusinessInfo,
    Step1Location,
    Step2BusinessLogo,
    Step3Profile,
    Step4Preferences,
    Step5ProfileImage
} from './stages';
import {
    FormStep,
    StageTracker,
    BubbleAnimation,
    TrustFooter,
} from './subcomponents';

// Internationalization: Centralized text for the registration feature
import { scriptLines_Registration as scriptLines } from './utils/script_lines';

// Animation Configuration (defined once at the module level)
const ANIMATION_CONFIG = {
    modal: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.3 }
    },
    stepTransition: {
        mode: 'wait',
        initial: { x: 300, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: -300, opacity: 0 },
        transition: { duration: 0.3 }
    },
    pageTransition: {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -30 },
        transition: { duration: 0.5, ease: "easeInOut" }
    }
};

/**
 * Multi-step registration form with animated transitions and background effects.
 * This component manages the overall registration flow, displaying different
 * steps and interacting with a dynamic background animation.
 * @component
 */
const RegistrationPage = () => {
    // ===========================================================================
    // State & Refs
    // ===========================================================================
    const navigate = useNavigate();
    const { width } = useWindowSize();
    const vortexRef = useRef(null);
    const formState = useFormState({
        address: { street: '', city: '', state: '', postalCode: '', country: '', formattedAddress: '' },
        locationCoords: { lat: 0, lng: 0 },
    });

    const [showPassword, setShowPassword] = useState(false);
    const [formFlowStatus, setFormFlowStatus] = useState('filling_form');
    const [fileUploadErrors, setFileUploadErrors] = useState({});

    const { login: contextLogin } = useAuth();
    const { addToast } = useToast();

    // ===========================================================================
    // Effects & Handlers
    // ===========================================================================
    useEffect(() => {
        if (vortexRef.current && formState.formData) {
            vortexRef.current.addTurbulence(10000);
        }
    }, [formState.formData]);

    useEffect(() => {
        if (vortexRef.current) {
            vortexRef.current.addTurbulence(25000);
        }
    }, [formState.currentStep]);

    const handleFormCompletion = useCallback(async () => {
        const isFinalStepValid = await formState.validateStep(formState.currentStep);
        if (!isFinalStepValid) return;

        setFormFlowStatus('submitting_main');
        setFileUploadErrors({});

        const businessAddressData = formState.formData.address || {};
        const locationCoordsData = formState.formData.locationCoords || {};

        const registrationData = {
            email: formState.formData.email,
            password: formState.formData.password,
            first_name: formState.formData.name,
            last_name: formState.formData.lastName,
            phone: formState.formData.phone,
            address: formState.formData.userPersonalAddress,
            business_name: formState.formData.businessName,
            business_email: formState.formData.businessEmail,
            business_phone: formState.formData.businessPhone,
            business_website: formState.formData.businessWebsite,
            business_username: formState.formData.businessUsername,
            business_description: formState.formData.businessDescription,
            business_tags: Array.isArray(formState.formData.businessTags) ? formState.formData.businessTags.join(',') : formState.formData.businessTags,
            referral_code: formState.formData.referralCode,
            business_address_street: businessAddressData.street,
            business_address_city: businessAddressData.city,
            business_address_state: businessAddressData.state,
            business_address_postal_code: businessAddressData.postalCode,
            business_address_country: businessAddressData.country,
            business_address_formatted: businessAddressData.formattedAddress,
            business_latitude: typeof locationCoordsData.lat === 'number' ? locationCoordsData.lat : null,
            business_longitude: typeof locationCoordsData.lng === 'number' ? locationCoordsData.lng : null,
        };

        const cleanRegistrationData = Object.fromEntries(
            Object.entries(registrationData).filter(([_, v]) => v !== null && v !== undefined && v !== '')
        );

        let mainRegResponse;
        try {
            mainRegResponse = await apiService.registerUserAndBusiness(cleanRegistrationData);
            if (mainRegResponse.data.access && mainRegResponse.data.refresh) {
                contextLogin(mainRegResponse.data.access, mainRegResponse.data.refresh);
            } else {
                throw new Error(scriptLines.registrationPage.error.noTokensReturned);
            }
        } catch (error) {
            let errorMessage = scriptLines.registrationPage.error.registrationFailed;
            if (error.response) {
                if (error.response.status >= 500) {
                    errorMessage = scriptLines.registrationPage.error.serverError;
                } else if (error.response.data) {
                    const errorData = error.response.data;
                    let messages = [];
                    if (typeof errorData === 'object' && errorData !== null) {
                        for (const key in errorData) {
                            if (key === "detail" && typeof errorData[key] === 'string') messages.push(errorData[key]);
                            else if (Array.isArray(errorData[key])) {
                                const fieldName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                messages.push(`${fieldName}: ${errorData[key].join(', ')}`);
                            } else if (typeof errorData[key] === 'string') {
                                const fieldName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                messages.push(`${fieldName}: ${errorData[key]}`);
                            }
                        }
                    } else if (typeof errorData === 'string') {
                        messages.push(errorData);
                    }
                    if (messages.length > 0) errorMessage = messages.join('; ');
                    else errorMessage = scriptLines.registrationPage.error.genericError.replace('{status}', error.response.status);
                } else {
                    errorMessage = scriptLines.registrationPage.error.genericError.replace('{status}', error.response.status);
                }
            } else if (error.request) {
                errorMessage = scriptLines.registrationPage.error.noResponse;
            } else {
                errorMessage = error.message || scriptLines.registrationPage.error.unknownError;
            }

            formState.setGeneralError(errorMessage);
            setFormFlowStatus('filling_form');
            return;
        }

        let decodedToken;
        const newAccessToken = mainRegResponse.data.access || localStorage.getItem('accessToken');
        if (newAccessToken) {
            try {
                decodedToken = jwtDecode(newAccessToken);
            } catch (e) {
                formState.setGeneralError("Session error after registration. Please try logging in to complete setup.");
                setFormFlowStatus('final_success_with_issues');
                return;
            }
        }

        const businessIdForLogo = decodedToken?.active_business_id;
        let allUploadsSuccessful = true;

        if (formState.formData.businessLogoFile && businessIdForLogo) {
            setFormFlowStatus('uploading_logo');
            try {
                await apiService.uploadBusinessLogo(businessIdForLogo, formState.formData.businessLogoFile);
            } catch (err) {
                allUploadsSuccessful = false;
                setFileUploadErrors(prev => ({ ...prev, logo: err.response?.data?.detail || "Logo upload failed." }));
            }
        }

        if (formState.formData.profileImageFile) {
            setFormFlowStatus('uploading_profile');
            try {
                await apiService.uploadUserProfileImage(formState.formData.profileImageFile);
            } catch (err) {
                allUploadsSuccessful = false;
                setFileUploadErrors(prev => ({ ...prev, profile: err.response?.data?.detail || "Profile image upload failed." }));
            }
        }

        if (formState.formData.referralCode) {
            sessionStorage.setItem('pendingReferralCode', formState.formData.referralCode);
        }

        if (allUploadsSuccessful && Object.keys(fileUploadErrors).length === 0) {
            formState.resetForm();
            setFormFlowStatus('final_success');
            addToast(scriptLines.registrationPage.success.registrationComplete, "success");
            navigate('/plans');
        } else {
            let finalMessage = scriptLines.registrationPage.success.accountCreatedWithIssues.base;
            if (fileUploadErrors.logo) finalMessage += scriptLines.registrationPage.success.accountCreatedWithIssues.logoFail.replace('{error}', fileUploadErrors.logo);
            if (fileUploadErrors.profile) finalMessage += scriptLines.registrationPage.success.accountCreatedWithIssues.profileFail.replace('{error}', fileUploadErrors.profile);
            finalMessage += scriptLines.registrationPage.success.accountCreatedWithIssues.manageInDashboard;

            formState.setGeneralError(finalMessage);
            setFormFlowStatus('final_success_with_issues');
            addToast(scriptLines.registrationPage.success.toastFileUploadWarning, "warning", 5000);
            navigate('/plans');
        }
    }, [formState, contextLogin, navigate, addToast]);

    if (!formState || typeof formState.updateFormData !== 'function') {
        console.error('RegistrationPage: Critical error - useFormState did not initialize correctly.');
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-red-500 text-xl">{scriptLines.registrationPage.error.formLoadError}</p>
            </div>
        );
    }

    // Helper to render form steps with localized titles
    function renderFormStep(stepIndex, titleKey, Component, isFinal = false) {
        if (formState.currentStep !== stepIndex) return null;
        return (
            <FormStep
                key={`step-${stepIndex}`}
                stepIndex={stepIndex}
                title={scriptLines.registrationPage.stepTitles[titleKey]}
                formState={formState}
                onProceed={isFinal ? handleFormCompletion : formState.goNext}
                onBack={formState.goBack}
                isFinalStep={isFinal}
                initial={ANIMATION_CONFIG.stepTransition.initial}
                animate={ANIMATION_CONFIG.stepTransition.animate}
                exit={ANIMATION_CONFIG.stepTransition.exit}
                transition={ANIMATION_CONFIG.stepTransition.transition}
            >
                <Component
                    formData={formState.formData}
                    errors={formState.errors}
                    updateField={formState.updateFormData}
                    setFormData={formState.setFormData}
                    {...(stepIndex === 3 && { showPassword, setShowPassword, passwordStrength: formState.passwordStrength })}
                    {...((stepIndex === 2 || stepIndex === 5) && { themeColor: "rose" })}
                />
            </FormStep>
        );
    }

    return (
        <BubbleAnimation
            ref={vortexRef}
            particleCount={500}
            baseSpeed={0.3}
            rangeSpeed={0.2}
            baseRadius={1}
            rangeRadius={2}
            baseHue={1000}
            backgroundColor="rgba(255, 255, 255, 0)"
        >
            <div className="registration-page-wrapper min-h-screen flex flex-col font-montserrat">
                <AnimatePresence mode="wait">
                    {formFlowStatus === 'filling_form' && (
                        <motion.div
                            key="form-layout"
                            variants={ANIMATION_CONFIG.pageTransition}
                            initial="initial" animate="animate" exit="exit"
                            className="flex-grow flex flex-col h-screen"
                        >
                            <ResponsiveLayout formState={formState}>
                                <AnimatePresence mode="wait">
                                    {renderFormStep(0, 'businessInfo', Step0BusinessInfo)}
                                    {renderFormStep(1, 'businessLocation', Step1Location)}
                                    {renderFormStep(2, 'businessLogo', Step2BusinessLogo)}
                                    {renderFormStep(3, 'yourProfile', Step3Profile)}
                                    {renderFormStep(4, 'setupPreferences', Step4Preferences)}
                                    {renderFormStep(5, 'yourProfileImage', Step5ProfileImage, true)}
                                </AnimatePresence>
                            </ResponsiveLayout>
                        </motion.div>
                    )}

                    {formFlowStatus === 'final_success' && (
                        <motion.div
                            key="final-success-view"
                            className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-neutral-900 p-6"
                        >
                            <div className="text-center p-6 bg-white dark:bg-neutral-800 rounded-lg shadow-2xl max-w-md">
                                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 150 }}>
                                    <Icon name="task_alt" className="text-6xl text-green-500 dark:text-green-400 mx-auto" />
                                </motion.div>
                                <h2 className="text-3xl text-green-600 dark:text-green-400 font-semibold mt-4 mb-2">{scriptLines.registrationPage.success.finalSuccessTitle}</h2>
                                <p className="text-gray-700 dark:text-neutral-300 text-lg mb-6">{scriptLines.registrationPage.success.finalSuccessMessage}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </BubbleAnimation>
    );
};

// ===========================================================================
// Subcomponents (Memoized for performance)
// ===========================================================================
const ResponsiveLayout = memo(({ children, formState }) => (
    <div className="flex flex-col flex-grow">
        <div className="registration-container relative z-10 grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8 flex-grow">
            <aside className="hidden h-full md:flex flex-col justify-center pt-10">
                <StageTracker
                    steps={scriptLines.registrationPage.stageTrackerLabels}
                    currentStep={formState.currentStep}
                    onStepClick={formState.goToStep}
                    orientation={"vertical"}
                    stepValidity={formState.stepValidity}
                    visitedSteps={formState.visitedSteps}
                />
            </aside>
            <main className="form-section flex flex-col justify-center items-center py-6 h-screen">
                {children}
            </main>
        </div>
        <TrustFooter isFixed={false} className="mt-auto" />
    </div>
));

ResponsiveLayout.propTypes = {
    children: PropTypes.node.isRequired,
    formState: PropTypes.shape({
        currentStep: PropTypes.number.isRequired,
        goToStep: PropTypes.func.isRequired,
        visitedSteps: PropTypes.instanceOf(Set).isRequired,
        stepValidity: PropTypes.arrayOf(PropTypes.bool).isRequired,
    }).isRequired,
};

export default memo(RegistrationPage);