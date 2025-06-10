import React, { memo, useCallback, useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDebouncedCallback } from 'use-debounce';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from "../../../components/common/Icon";
import { InputField, PasswordStrength } from '../subcomponents';
import { scriptLines_Steps as scriptLines } from '../utils/script_lines';
import apiService from '../../../services/api';

/**
 * A hook to manage asynchronous validation for a form field.
 * @param {string} fieldName - The name of the field in the API (e.g., 'email').
 * @param {string} value - The current value of the field from formData.
 * @returns {{status: string, errorMessage: string}} - The validation status and error message.
 */
const useAsyncValidation = (fieldName, value) => {
    const [status, setStatus] = useState('idle'); // 'idle', 'validating', 'valid', 'invalid'
    const [errorMessage, setErrorMessage] = useState('');

    const debouncedValidate = useDebouncedCallback(async (val) => {
        if (!val) {
            setStatus('idle');
            return;
        }
        // Basic email format check before hitting API
        if (fieldName === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
            setStatus('idle'); // Don't show error if it's just an invalid format, Yup will handle that.
            return;
        }
        setStatus('validating');
        try {
            const response = await apiService.validateRegistrationField(fieldName, val);
            if (response.data.is_unique) {
                setStatus('valid');
                setErrorMessage('');
            } else {
                setStatus('invalid');
                setErrorMessage(response.data.message || 'This value is already taken.');
            }
        } catch (error) {
            setStatus('invalid');
            setErrorMessage('Could not validate. Please check your connection.');
            console.error(`Validation error for ${fieldName}:`, error);
        }
    }, 500);

    useEffect(() => {
        debouncedValidate(value);
    }, [value, debouncedValidate]);

    return { status, errorMessage };
};

const Step3Profile = ({
    formData,
    updateField,
    errors,
    passwordStrength,
    showPassword,
    setShowPassword,
}) => {
    // ===========================================================================
    // Configuration & State
    // ===========================================================================
    const PHONE_FORMAT_REGEX = useMemo(() => /(\d{0,3})(\d{0,3})(\d{0,4})/, []);
    const PASSWORD_VISIBILITY_ANIMATION = {
        initial: { opacity: 0.6, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0.6, scale: 0.8 },
        transition: { duration: 0.15 }
    };

    // --- Asynchronous Validation State ---
    const { status: emailStatus, errorMessage: emailError } = useAsyncValidation('email', formData.email);

    // ===========================================================================
    // Handlers
    // ===========================================================================
    const handleInputChange = useCallback((field) => (e) => {
        updateField(field, e.target.value);
    }, [updateField]);

    const formatPhoneNumber = useCallback((value) => {
        if (!value) return '';
        const numbers = value.replace(/\D/g, '');
        const match = numbers.match(PHONE_FORMAT_REGEX);
        if (!match) return numbers;
        let formatted = '';
        if (match[1]) formatted += `(${match[1]}`;
        if (match[2]) formatted += `) ${match[2]}`;
        if (match[3]) formatted += `-${match[3]}`;
        return formatted;
    }, [PHONE_FORMAT_REGEX]);

    const handlePhoneChange = useCallback((e) => {
        updateField('phone', formatPhoneNumber(e.target.value));
    }, [updateField, formatPhoneNumber]);

    const togglePasswordVisibility = useCallback(() => {
        setShowPassword(prevShow => !prevShow);
    }, [setShowPassword]);

    // ===========================================================================
    // Prop Validation
    // ===========================================================================
    if (typeof formData !== 'object' || formData === null) {
        console.error(scriptLines.step3Profile.console.invalidFormDataProp);
        return <p className="text-red-500">{scriptLines.step3Profile.errors.formDataMissing}</p>;
    }
    if (typeof updateField !== 'function') {
        console.error(scriptLines.step3Profile.console.invalidUpdateFieldProp);
        return <p className="text-red-500">{scriptLines.step3Profile.errors.updateMechanismMissing}</p>;
    }
    if (typeof passwordStrength !== 'string') {
        console.error(scriptLines.step3Profile.console.invalidPasswordStrengthProp);
        return <p className="text-red-500">{scriptLines.step3Profile.errors.passwordStrengthMissing}</p>;
    }
    if (typeof showPassword !== 'boolean' || typeof setShowPassword !== 'function') {
        console.error(scriptLines.step3Profile.console.invalidPasswordVisibilityProps);
        return <p className="text-red-500">{scriptLines.step3Profile.errors.passwordVisibilityControlMissing}</p>;
    }

    // ===========================================================================
    // Rendering
    // ===========================================================================
    return (
        <div className="space-y-12" data-testid="step3-profile">
            <div className='relative w-full flex md:flex-row flex-col items-start gap-x-8 gap-y-12'>
                <InputField
                    className='w-full'
                    label={scriptLines.step3Profile.label.fullName}
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange('name')}
                    placeholder={scriptLines.step3Profile.placeholder.firstName}
                    error={errors?.name}
                    autoComplete="given-name"
                    required
                />
                <InputField
                    className='w-full'
                    label={scriptLines.step3Profile.label.lastName}
                    name="lastName"
                    value={formData.lastName || ''}
                    onChange={handleInputChange('lastName')}
                    placeholder={scriptLines.step3Profile.placeholder.lastName}
                    error={errors?.lastName}
                    autoComplete="family-name"
                    required
                />
            </div>

            <InputField
                className='w-full'
                label={scriptLines.step3Profile.label.roleAtBusiness}
                name="role"
                value={formData.role || ''}
                onChange={handleInputChange('role')}
                placeholder={scriptLines.step3Profile.placeholder.role}
                error={errors?.role}
                autoComplete="organization-title"
            />

            <div className='relative w-full flex md:flex-row flex-col items-start gap-x-8 gap-y-12'>
                <InputField
                    className='w-full'
                    label={scriptLines.step3Profile.label.contactEmail}
                    name="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={handleInputChange('email')}
                    placeholder={scriptLines.step3Profile.placeholder.contactEmail}
                    error={errors?.email}
                    autoComplete="email"
                    asyncValidationStatus={emailStatus}
                    asyncErrorMessage={emailError}
                    required
                />
                <InputField
                    className='w-full'
                    label={scriptLines.step3Profile.label.contactPhone}
                    name="phone"
                    type="tel"
                    value={formData.phone || ''}
                    onChange={handlePhoneChange}
                    placeholder={scriptLines.step3Profile.placeholder.contactPhone}
                    maxLength={14}
                    error={errors?.phone}
                    autoComplete="tel"
                />
            </div>

            <div className="relative">
                <InputField
                    label={scriptLines.step3Profile.label.createPassword}
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password || ''}
                    onChange={handleInputChange('password')}
                    placeholder={scriptLines.step3Profile.placeholder.passwordMinChars}
                    error={errors?.password}
                    autoComplete="new-password"
                    required
                />
                <AnimatePresence mode="wait">
                    <motion.button
                        key={showPassword ? 'visible-icon' : 'hidden-icon'}
                        type="button"
                        onClick={togglePasswordVisibility}
                        className={`
                            absolute z-10 top-1/2 -translate-y-7 w-8 h-8 flex items-center justify-center
                            text-neutral-500 dark:text-neutral-400 
                            hover:text-rose-500 dark:hover:text-rose-400 
                            focus:outline-none focus:ring-2 focus:ring-rose-100 rounded-full p-1
                            ${(errors?.password) ? 'right-8' : 'right-2'}`}
                        aria-label={showPassword ? scriptLines.step3Profile.aria.hidePassword : scriptLines.step3Profile.aria.showPassword}
                        data-testid="password-visibility-toggle"
                        {...PASSWORD_VISIBILITY_ANIMATION}
                    >
                        <Icon name={showPassword ? "visibility_off" : "visibility"} className="w-6 h-6" />
                    </motion.button>
                </AnimatePresence>
                {formData.password && (
                    <PasswordStrength
                        strength={passwordStrength}
                        className="mt-2"
                    />
                )}
            </div>

            <InputField
                label={scriptLines.step3Profile.label.confirmPassword}
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword || ''}
                onChange={handleInputChange('confirmPassword')}
                placeholder={scriptLines.step3Profile.placeholder.confirmPassword}
                error={errors?.confirmPassword}
                autoComplete="new-password"
                required
            />
        </div>
    );
};

Step3Profile.propTypes = {
    formData: PropTypes.object.isRequired,
    updateField: PropTypes.func.isRequired,
    errors: PropTypes.object,
    passwordStrength: PropTypes.oneOf(['weak', 'fair', 'strong', null, undefined]).isRequired,
    showPassword: PropTypes.bool.isRequired,
    setShowPassword: PropTypes.func.isRequired,
};

export default memo(Step3Profile);