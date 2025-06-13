import React, { useRef, useState, useCallback, memo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// eslint-disable-next-line
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

import { useLoginForm } from '../hooks/useLoginForm';
import { BubbleAnimation, TrustFooter, InputField } from '../features/register/subcomponents';
import Icon from '../components/common/Icon';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { scriptLines_pages as sl } from './script_lines.js';

// Animation configurations (can be shared or adapted from RegistrationPage)
const ANIMATION_CONFIG = {
    pageTransition: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.4, ease: "easeInOut" }
    },
    formElements: {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
    },
    buttonHover: { scale: 1.03, transition: { type: "spring", stiffness: 400, damping: 10 } },
    buttonTap: { scale: 0.97 },
};

const LoginPage = () => {
    const vortexRef = useRef(null);
    const {
        email, setEmail,
        password, setPassword,
        errors, setErrors,
        isSubmitting, setIsSubmitting,
        generalError, setGeneralError,
        validate, resetForm
    } = useLoginForm();

    const { login: contextLogin } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const handleBubbleEffect = useCallback(() => {
        vortexRef.current?.addTurbulence(15000);
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setGeneralError(null);
        setErrors({}); // Clear previous errors

        const isValid = await validate();
        if (!isValid) {
            setIsSubmitting(false);
            handleBubbleEffect(); // Trigger effect on validation error
            return;
        }

        setIsSubmitting(true);
        handleBubbleEffect(); // Trigger effect on submission attempt

        try {
            const response = await apiService.post('auth/login/', { email, password });
            // Assuming backend returns access and refresh tokens on successful login
            if (response.data.access && response.data.refresh) {
                contextLogin(response.data.access, response.data.refresh);
                resetForm();
                navigate('/dashboard/business'); // Or wherever business users should go
            } else {
                throw new Error(sl.businessLoginPage.errorNoTokens || "Login successful, but no tokens received.");
            }
        } catch (error) {
            console.error('Login error:', error);
            let errorMessage = sl.businessLoginPage.errorLoginFailed || "Login failed. Please check your credentials and try again.";
            if (error.response && error.response.data) {
                const backendError = error.response.data.detail || error.response.data.non_field_errors;
                if (backendError) {
                    errorMessage = Array.isArray(backendError) ? backendError.join(' ') : String(backendError);
                } else if (typeof error.response.data === 'object') {
                    // Handle field-specific errors if backend provides them for login
                    const fieldSpecificErrors = {};
                    Object.entries(error.response.data).forEach(([key, value]) => {
                        fieldSpecificErrors[key] = Array.isArray(value) ? value.join(' ') : String(value);
                    });
                    setErrors(fieldSpecificErrors);
                    errorMessage = sl.businessLoginPage.errorCorrectFields || "Please correct the errors shown."
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            setGeneralError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const togglePasswordVisibility = useCallback(() => {
        setShowPassword(prev => !prev);
    }, []);

    return (
        <BubbleAnimation
            ref={vortexRef}
            particleCount={300} // Fewer particles for login page perhaps
            baseSpeed={0.2}
            rangeRadius={1.5}
            backgroundColor="rgba(250, 250, 255, 0)" // Slightly different hue or keep same
        >
            <div className="min-h-screen flex flex-col items-center justify-center p-4 font-montserrat">
                <motion.div
                    className="login-form-container relative w-full max-w-md bg-white dark:bg-neutral-800/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl"
                    variants={ANIMATION_CONFIG.pageTransition}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                >
                    <header className="text-center mb-8">
                        {/* Optional: Logo or Branding */}
                        <h1 className="text-3xl font-semibold text-neutral-800 dark:text-white mb-2">
                            {sl.businessLoginPage.title || "Business Portal Login"}
                        </h1>
                        <p className="text-sm text-neutral-600 dark:text-neutral-300">
                            {sl.businessLoginPage.subtitle || "Access your business dashboard."}
                        </p>
                    </header>

                    <motion.form
                        onSubmit={handleSubmit}
                        className="space-y-12 mt-12"
                        variants={ANIMATION_CONFIG.formElements} // Stagger children
                    >
                        <InputField
                            label={sl.businessLoginPage.emailLabel || "Business Email"}
                            name="email"
                            type="email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); handleBubbleEffect(); }}
                            placeholder={sl.businessLoginPage.emailPlaceholder || "you@company.com"}
                            error={errors.email}
                            autoComplete="email"
                            disabled={isSubmitting}
                            required
                        />

                        <div className="relative">
                            <InputField
                                label={sl.businessLoginPage.passwordLabel || "Password"}
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); handleBubbleEffect(); }}
                                placeholder={sl.businessLoginPage.passwordPlaceholder || "Enter your password"}
                                error={errors.password}
                                autoComplete="current-password"
                                disabled={isSubmitting}
                                required
                            />
                            <AnimatePresence mode="wait">
                                <motion.button
                                    key={showPassword ? 'visible-icon' : 'hidden-icon'}
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className={`
                                        absolute z-10 top-0.5 w-8 h-8 
                                        text-neutral-500 dark:text-neutral-400 
                                        hover:text-rose-500 dark:hover:text-rose-400 
                                        focus:outline-none focus:ring-2 focus:ring-rose-100 rounded-full p-1
                                        ${(errors?.password) ? 'right-8' : 'right-2'}`}
                                    aria-label={showPassword ? (sl.businessLoginPage.hidePasswordAria || "Hide password") : (sl.businessLoginPage.showPasswordAria || "Show password")}
                                    variants={{ initial: { opacity: 0.6, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0.6, scale: 0.8 } }}
                                    initial="initial" animate="animate" exit="exit"
                                >
                                    <Icon name={showPassword ? "visibility_off" : "visibility"} className="w-6 h-6" />
                                </motion.button>
                            </AnimatePresence>
                        </div>


                        <AnimatePresence>
                            {generalError && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded-lg flex items-center gap-2"
                                    role="alert"
                                >
                                    <Icon name="error" className="w-6 h-6 flex-shrink-0" />
                                    <span>{generalError}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-semibold text-white transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900
                                ${isSubmitting
                                    ? 'bg-neutral-400 dark:bg-neutral-600 cursor-not-allowed'
                                    : 'bg-rose-500 hover:bg-rose-600 focus-visible:ring-rose-500'
                                }`}
                            whileHover={!isSubmitting ? ANIMATION_CONFIG.buttonHover : {}}
                            whileTap={!isSubmitting ? ANIMATION_CONFIG.buttonTap : {}}
                            variants={ANIMATION_CONFIG.formElements} // Individual animation for button
                        >
                            {isSubmitting ? (
                                <>
                                    <Icon name="progress_activity" className="animate-spin w-6 h-6" />
                                    {sl.businessLoginPage.buttonLoggingIn || "Logging In..."}
                                </>
                            ) : (
                                <>
                                    {sl.businessLoginPage.buttonLogin || "Login to Your Business"}
                                    <Icon name="arrow_forward" className="w-5 h-5 ml-1" />
                                </>
                            )}
                        </motion.button>
                    </motion.form>

                    <p className="mt-8 text-center text-xs text-neutral-500 dark:text-neutral-400">
                        {sl.businessLoginPage.promptNoAccount || "Don't have a business account?"}{' '}
                        <Link to="/register" className="font-medium text-rose-600 hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-300">
                            {sl.businessLoginPage.linkRegister || "Register your business"}
                        </Link>
                    </p>
                    <p className="mt-2 text-center text-xs text-neutral-500 dark:text-neutral-400">
                        {sl.businessLoginPage.promptIsCustomer || "Are you a customer?"}{' '}
                        <Link to="/login" className="font-medium text-rose-600 hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-300">
                            {sl.businessLoginPage.linkCustomerLogin || "Login here"}
                        </Link>
                    </p>
                </motion.div>
            </div>
            <TrustFooter isFixed={false} className="mt-10" />
        </BubbleAnimation>
    );
};

// PropTypes for LoginPage can be added if it accepts any external props.
// For now, it's self-contained.

export default memo(LoginPage);