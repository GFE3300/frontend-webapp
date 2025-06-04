// 1. Imports
import React, { useEffect, useRef, memo, useState, useCallback } from 'react';
// eslint-disable-next-line
import { AnimatePresence, motion } from 'framer-motion';
import { jwtDecode } from 'jwt-decode';
import PropTypes from 'prop-types';
import { useFormState } from './hooks/useFormState';
import useWindowSize from '../../hooks/useWindowSize';
import apiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../../components/common/Icon';
import {
    Step0BusinessInfo,
    Step1Location,
    Step2BusinessLogo,
    Step3Profile,
    Step4Preferences,
    Step5ProfileImage
} from './stages';
import { useToast } from '../../contexts/ToastContext';
import { Navigate, useNavigate } from 'react-router-dom';
import {
    FormStep,
    StageTracker,
    BubbleAnimation,
    TrustFooter,
} from './subcomponents';

// Animation Configuration (defined once at the module level)
const ANIMATION_CONFIG = {
    modal: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.3 }
    },
    stepTransition: { // This could be used by FormStep if FormStep applies motion.div directly
        mode: 'wait', // ensure AnimatePresence mode is set on AnimatePresence itself
        initial: { x: 300, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: -300, opacity: 0 },
        transition: { duration: 0.3 } // Default transition for steps
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
    const vortexRef = useRef(null); // Ref for BubbleAnimation to trigger turbulence
    const formState = useFormState({
        address: {
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: '',
            formattedAddress: '',
        },
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
            // Moderate intensity for general form data changes
            vortexRef.current.addTurbulence(10000);
        }
    }, [formState.formData]); // Trigger on any change in formData

    useEffect(() => {
        if (vortexRef.current) {
            // Higher intensity for step changes, creating a "strike" effect
            vortexRef.current.addTurbulence(25000);
        }
    }, [formState.currentStep]); // Trigger when the current step changes

    /**
     * Called when the last form step is valid and user proceeds.
     * Transitions to the plan selection view.
     */
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

            business_address_street: businessAddressData.street,
            business_address_city: businessAddressData.city,
            business_address_state: businessAddressData.state,
            business_address_postal_code: businessAddressData.postalCode,
            business_address_country: businessAddressData.country,
            business_address_formatted: businessAddressData.formattedAddress,

            business_latitude: typeof locationCoordsData.lat === 'number' ? locationCoordsData.lat : null,
            business_longitude: typeof locationCoordsData.lng === 'number' ? locationCoordsData.lng : null,
        };

        if (typeof locationCoordsData.lat === 'number' && isFinite(locationCoordsData.lat)) {
            registrationData.business_latitude = locationCoordsData.lat;
        }
        if (typeof locationCoordsData.lng === 'number' && isFinite(locationCoordsData.lng)) {
            registrationData.business_longitude = locationCoordsData.lng;
        }

        const cleanRegistrationData = Object.fromEntries(
            Object.entries(registrationData).filter(([_, v]) => v !== null && v !== undefined && v !== '')
        );

        let mainRegResponse;
        try {
            mainRegResponse = await apiService.registerUserAndBusiness(cleanRegistrationData);
            console.log("Main registration successful:", mainRegResponse.data);

            if (mainRegResponse.data.access && mainRegResponse.data.refresh) {
                contextLogin(mainRegResponse.data.access, mainRegResponse.data.refresh);
            } else {
                throw new Error("Registration succeeded but no tokens were returned.");
            }
        } catch (error) {
            console.error('Main registration error details:', error); // Log the full error object
            let errorMessage = "Registration failed. Please try again.";

            if (error.response) {
                // Handle HTTP errors (e.g., 400, 401, 500)
                console.error('Backend error response status:', error.response.status);
                console.error('Backend error response data:', error.response.data);

                if (error.response.status >= 500) { // Handle 500 and other 5xx errors
                    errorMessage = "A server error occurred. Please try again later or contact support.";
                } else if (error.response.data) {
                    const errorData = error.response.data;
                    let messages = [];
                    if (typeof errorData === 'object' && errorData !== null) {
                        // Handle structured JSON errors (typically 400 Bad Request from DRF validation)
                        for (const key in errorData) {
                            if (key === "detail" && typeof errorData[key] === 'string') {
                                messages.push(errorData[key]); // Common for single error messages
                            } else if (Array.isArray(errorData[key])) {
                                const fieldName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                messages.push(`${fieldName}: ${errorData[key].join(', ')}`);
                            } else if (typeof errorData[key] === 'string') {
                                // Handle non-array values if they represent errors
                                const fieldName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                messages.push(`${fieldName}: ${errorData[key]}`);
                            }
                        }
                    } else if (typeof errorData === 'string') {
                        // For plain string errors (less common for DRF validation but possible)
                        messages.push(errorData);
                    }

                    if (messages.length > 0) {
                        errorMessage = messages.join('; ');
                    } else {
                        // If errorData is present but couldn't be parsed into specific messages
                        errorMessage = `An error occurred (Status: ${error.response.status}). Please check your input.`;
                    }
                } else {
                    // No error.response.data, but there is an error.response status
                    errorMessage = `An error occurred (Status: ${error.response.status}). Please try again.`;
                }
            } else if (error.request) {
                // The request was made but no response was received
                errorMessage = "No response from the server. Please check your network connection.";
            } else {
                // Something happened in setting up the request that triggered an Error
                errorMessage = error.message || "An unknown error occurred during registration.";
            }

            formState.setGeneralError(errorMessage);
            setFormFlowStatus('filling_form');
            return;
        }

        // --- File Uploads ---
        // (Rest of the file upload logic remains the same)
        let decodedToken;
        const newAccessToken = mainRegResponse.data.access || localStorage.getItem('accessToken');
        if (newAccessToken) {
            try {
                decodedToken = jwtDecode(newAccessToken);
            } catch (e) {
                console.error("Error decoding token for file uploads:", e);
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
                console.log(`Uploading logo for business ${businessIdForLogo}...`);
                await apiService.uploadBusinessLogo(businessIdForLogo, formState.formData.businessLogoFile);
                console.log("Business logo uploaded.");
            } catch (err) {
                allUploadsSuccessful = false;
                console.error("Logo upload failed:", err.response?.data || err.message);
                setFileUploadErrors(prev => ({ ...prev, logo: err.response?.data?.detail || "Logo upload failed." }));
            }
        }

        if (formState.formData.profileImageFile) {
            setFormFlowStatus('uploading_profile');
            try {
                console.log("Uploading profile image...");
                await apiService.uploadUserProfileImage(formState.formData.profileImageFile);
                console.log("Profile image uploaded.");
            } catch (err) {
                allUploadsSuccessful = false;
                console.error("Profile image upload failed:", err.response?.data || err.message);
                setFileUploadErrors(prev => ({ ...prev, profile: err.response?.data?.detail || "Profile image upload failed." }));
            }
        }

        if (allUploadsSuccessful && Object.keys(fileUploadErrors).length === 0) {
            formState.resetForm();
            setFormFlowStatus('final_success');
        } else {
            let finalMessage = "Account created successfully. ";
            if (fileUploadErrors.logo) finalMessage += `However, the business logo could not be uploaded: ${fileUploadErrors.logo} `;
            if (fileUploadErrors.profile) finalMessage += `The profile image could not be uploaded: ${fileUploadErrors.profile} `;
            finalMessage += "You can manage these from your dashboard.";
            formState.setGeneralError(finalMessage);
            setFormFlowStatus('final_success_with_issues');
        }

        if (allUploadsSuccessful && Object.keys(fileUploadErrors).length === 0) {
            // formState.resetForm(); // Optional: reset form if needed, though navigation will occur
            addToast("Registration successful! Please choose a plan to activate your account.", "success"); // Optional toast
            navigate('/plans'); // Redirect
        } else {
            // Handle success with issues, but still redirect to plans.
            // The error message from formState.setGeneralError will still be relevant.
            // The user can sort out file uploads later from their dashboard.
            addToast("Account created! Some file uploads had issues, you can manage them from your dashboard. Please choose a plan.", "warning", 5000);
            navigate('/plans'); // Redirect
        }

    }, [formState, contextLogin]);


    /**
     * Called when a plan is selected. Adds plan to formData and submits everything.
     */
    const handlePlanSelectedAndSubmit = useCallback(async (selectedPlan) => {
        setFormFlowStatus('submitting_final');

        // Add selected plan to formData
        // It's important that `useFormState`'s `formData` is updated
        // before calling the final submit if that submit relies on the hook's `formData`.
        // We'll update it directly for the API call payload.
        const finalFormData = {
            ...formState.formData,
            selectedPlanId: selectedPlan.id,
            // You might want to include more plan details if needed by backend
            // selectedPlanName: selectedPlan.name,
            // selectedPlanPrice: selectedPlan.price,
        };

        try {
            // Simulate final API call with all data including the plan
            console.log("Submitting final data:", finalFormData);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay

            // const response = await fetch('/api/register-with-plan', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(finalFormData)
            // });
            // if (!response.ok) throw new Error('Final submission failed');

            sessionStorage.removeItem('formState'); // Clear persisted form state
            formState.resetForm(); // Reset the form state in the hook
            setFormFlowStatus('final_success');

        } catch (error) {
            console.error('Final submission error:', error);
            // You might want to set an error message to display on the PlanSelection screen
            // or revert to 'selecting_plan' with an error.
            setFormFlowStatus('selecting_plan'); // Revert to plan selection on error
            // formStateHook.setGeneralError(error.message || "Failed to complete registration."); // If useFormState has setGeneralError
            alert(`Error: ${error.message || "Failed to complete registration."}`); // Simple alert for now
        }
    }, [formState]);

    // ===========================================================================
    // Validation (Early exit if formState is not properly initialized)
    // ===========================================================================
    if (!formState || typeof formState.updateFormData !== 'function') {
        console.error('RegistrationPage: Critical error - useFormState did not initialize correctly.');
        // Potentially render an error message or fallback UI
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-red-500 text-xl">
                    An error occurred while loading the registration form. Please try again later.
                </p>
            </div>
        );
    }

    console.log("Form Data:", formState);

    // ===========================================================================
    // Rendering
    // ===========================================================================
    return (
        <BubbleAnimation
            ref={vortexRef}
            particleCount={500}
            baseSpeed={0.3}
            rangeSpeed={0.2}
            baseRadius={1}
            rangeRadius={2}
            baseHue={1000}
            backgroundColor="rgba(255, 255, 255, 0)" // matches bg-gray-50 with opacity
        >
            <div className="registration-page-wrapper min-h-screen flex flex-col font-montserrat">

                <AnimatePresence mode="wait">

                    {formFlowStatus === 'filling_form' && (
                        <motion.div
                            key="form-layout"
                            variants={ANIMATION_CONFIG.pageTransition}
                            initial="initial" animate="animate" exit="exit"
                            className="flex-grow flex flex-col" // Ensure it takes space
                        >
                            <ResponsiveLayout
                                width={width}
                                formState={formState}
                            >
                                <AnimatePresence mode="wait">
                                    {renderFormStep(0, 'Business Information', Step0BusinessInfo)}
                                    {renderFormStep(1, 'Business Location', Step1Location)}
                                    {renderFormStep(2, 'Business Logo', Step2BusinessLogo)}
                                    {renderFormStep(3, 'Your Profile', Step3Profile)}
                                    {renderFormStep(4, 'Setup Preferences', Step4Preferences)}
                                    {renderFormStep(5, 'Your Profile Image', Step5ProfileImage, true)}
                                </AnimatePresence>
                            </ResponsiveLayout>
                        </motion.div>
                    )}

                    {formFlowStatus === 'final_success' && (
                        <motion.div
                            key="final-success-view"
                            // ... animation props for success page ...
                            className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-neutral-900 p-6"
                        >
                            <div className="text-center p-6 bg-white dark:bg-neutral-800 rounded-lg shadow-2xl max-w-md">
                                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 150 }}>
                                    <Icon name="task_alt" className="text-6xl text-green-500 dark:text-green-400 mx-auto" />
                                </motion.div>
                                <h2 className="text-3xl text-green-600 dark:text-green-400 font-semibold mt-4 mb-2">Registration Complete!</h2>
                                <p className="text-gray-700 dark:text-neutral-300 text-lg mb-6">Your account and business profile have been successfully created. You are now logged in.</p>
                                {/* Link to dashboard or next step */}
                                {/* <Link to="/dashboard" className="...">Go to Dashboard</Link> */}
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>

                <SuccessModal
                    submissionStatus={formState.submissionStatus}
                    onClose={formState.resetForm} // Assuming resetForm should also close the modal
                />
            </div>
        </BubbleAnimation>
    );

    // ===========================================================================
    // Helper Functions
    // ===========================================================================
    function renderFormStep(stepIndex, title, Component, isFinal = false) {
        if (formState.currentStep !== stepIndex) {
            return null;
        }

        // Pass animation props to FormStep if it's a motion component
        // or if it uses them internally to wrap its content
        return (
            <>
                <FormStep
                    key={`step-${stepIndex}`}
                    stepIndex={stepIndex}
                    title={title}
                    formState={formState}
                    onProceed={isFinal ? handleFormCompletion : formState.goNext}
                    onBack={formState.goBack}
                    isFinalStep={isFinal}
                    // For Framer Motion step transitions, FormStep itself should be a motion component
                    // or wrap its content. Assuming FormStep is designed to accept these:
                    initial={ANIMATION_CONFIG.stepTransition.initial}
                    animate={ANIMATION_CONFIG.stepTransition.animate}
                    exit={ANIMATION_CONFIG.stepTransition.exit}
                    transition={ANIMATION_CONFIG.stepTransition.transition}
                >
                    <Component
                        formData={formState.formData}
                        errors={formState.errors}
                        updateField={formState.updateFormData} // Consistent naming with useFormState
                        setFormData={formState.setFormData} // If useFormState exposes bulk update
                        // Pass specific props for Step2Profile
                        {...(stepIndex === 3 && {
                            showPassword: showPassword,
                            setShowPassword: setShowPassword,
                            passwordStrength: formState.passwordStrength,
                        })}
                        // Pass themeColor to image upload steps
                        {...((stepIndex === 2 || stepIndex === 5) && {
                            themeColor: "rose" // Or a dynamic theme prop
                        })}
                    />
                </FormStep>
            </>
        );
    }
};

// ===========================================================================
// Subcomponents (Memoized for performance)
// ===========================================================================
const ResponsiveLayout = memo(({ children, formState }) => (
    <div className="flex flex-col flex-grow"> {/* Ensure ResponsiveLayout can grow */}
        <div className="registration-container relative z-10 grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8 flex-grow">
            {/* StageTracker (Now with updated steps) */}
            <aside className="hidden h-full md:flex flex-col justify-center pt-10">
                <StageTracker
                    steps={['Business', 'Location', 'Logo', 'Profile', 'Preferences', 'Image']} // Shortened names
                    currentStep={formState.currentStep}
                    onStepClick={formState.goToStep}
                    orientation={"vertical"}
                    stepValidity={formState.stepValidity}
                    visitedSteps={formState.visitedSteps}
                />
            </aside>
            <main className="form-section flex flex-col justify-center py-6"> {/* Allow main to take space */}
                {children}
            </main>
        </div>
        <TrustFooter isFixed={false} className="mt-auto" /> {/* Static footer at the bottom of the form area */}
    </div>
));

const SuccessModal = memo(({ submissionStatus, onClose }) => (
    <AnimatePresence>
        {submissionStatus === 'success' && (
            <motion.div
                className="success-modal fixed inset-0 bg-white bg-opacity-95 flex flex-col items-center justify-center z-50"
                variants={ANIMATION_CONFIG.modal} // Using variants for consistency
                initial="initial"
                animate="animate"
                exit="exit"
                transition={ANIMATION_CONFIG.modal.transition}
            >
                <div className="text-center p-6 bg-white rounded-lg shadow-2xl">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
                    >
                        <span role="img" aria-label="Party Popper" className="text-6xl">🎉</span>
                    </motion.div>
                    <h2 className="text-3xl text-green-600 font-semibold mt-4 mb-2">Registration Complete!</h2>
                    <p className="text-gray-700 text-lg mb-6">Your account has been successfully created.</p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onClose}
                        className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                    >
                        Done
                    </motion.button>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
));

// ===========================================================================
// Prop Types
// ===========================================================================
ResponsiveLayout.propTypes = {
    children: PropTypes.node.isRequired,
    summaryContent: PropTypes.node.isRequired,
    formState: PropTypes.shape({
        currentStep: PropTypes.number.isRequired,
        goToStep: PropTypes.func.isRequired, // Updated from handleStepClick
        visitedSteps: PropTypes.instanceOf(Set).isRequired,
        stepValidity: PropTypes.arrayOf(PropTypes.bool).isRequired,
    }).isRequired,
};

SuccessModal.propTypes = {
    submissionStatus: PropTypes.oneOf(['idle', 'submitting', 'success', 'error']),
    onClose: PropTypes.func.isRequired,
};

// Ensure FormStep also has its prop types defined, likely in its own file or subcomponents/index.js
// For example:
// FormStep.propTypes = {
//     stepIndex: PropTypes.number.isRequired,
//     title: PropTypes.string.isRequired,
//     formState: PropTypes.object.isRequired,
//     onProceed: PropTypes.func.isRequired,
//     onBack: PropTypes.func.isRequired,
//     isFinalStep: PropTypes.bool,
//     onSubmit: PropTypes.func,
//     children: PropTypes.node.isRequired,
//     initial: PropTypes.object, // For framer-motion
//     animate: PropTypes.object, // For framer-motion
//     exit: PropTypes.object,    // For framer-motion
//     transition: PropTypes.object, // For framer-motion
// };


// ===========================================================================
// Performance Considerations (as comments - good practice)
// ===========================================================================
/**
 * 1. Memoized subcomponents (ResponsiveLayout, SuccessModal, potentially others) prevent unnecessary re-renders.
 * 2. `useCallback` should be used in `useFormState` for all returned functions to stabilize them.
 * 3. Animation logic in `BubbleAnimation` is optimized (e.g., rAF, limited frame rate).
 * 4. `AnimatePresence` handles exit animations gracefully.
 * 5. Form state updates are managed by `useFormState`, which should be optimized for selective re-renders.
 * 6. `useEffect` dependency arrays are specific to minimize effect re-runs.
 */

// ===========================================================================
// Testing Procedures (as comments - good practice)
// ===========================================================================
/**
 * Manual Testing Checklist:
 * 1. Form navigation: Next, Back, clicking on StageTracker steps (active, visited, future).
 * 2. Input validation: Error messages display correctly for each field and step.
 * 3. Form submission: Mock successful and error submissions.
 * 4. Success modal: Appears on successful submission, can be closed.
 * 5. Background animation: `BubbleAnimation` is visible and responsive.
 *    - Test turbulence effect on form input changes.
 *    - Test turbulence effect on step navigation.
 * 6. Responsiveness: Check layout on different screen sizes (mobile, tablet, desktop).
 * 7. Data persistence: Form data and current step should persist on page refresh (via sessionStorage in useFormState).
 * 8. Accessibility: Check keyboard navigation, ARIA attributes, color contrast.
 */

export default memo(RegistrationPage);