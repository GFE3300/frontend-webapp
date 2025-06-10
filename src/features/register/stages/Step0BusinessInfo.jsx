import React, { useCallback, memo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDebouncedCallback } from 'use-debounce';
import { InputField, TagInput } from '../subcomponents';
import { scriptLines_Steps as scriptLines } from '../utils/script_lines';
import Icon from '../../../components/common/Icon';
import apiService from '../../../services/api';

/**
 * A hook to manage asynchronous validation for a form field.
 * @param {string} fieldName - The name of the field in the API (e.g., 'business_username').
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

const Step0BusinessInfo = ({ formData, updateField, errors }) => {
    // ===========================================================================
    // Configuration & State
    // ===========================================================================
    const DEFAULT_BUSINESS_TAGS = scriptLines.step0BusinessInfo.defaultBusinessTags;

    // --- Asynchronous Validation State ---
    const { status: usernameStatus, errorMessage: usernameError } = useAsyncValidation('business_username', formData.businessUsername);
    const { status: businessNameStatus, errorMessage: businessNameError } = useAsyncValidation('business_name', formData.businessName);
    const { status: businessEmailStatus, errorMessage: businessEmailError } = useAsyncValidation('business_email', formData.businessEmail);

    // ===========================================================================
    // Handlers
    // ===========================================================================
    const handleInputChange = useCallback((field) => (e) => {
        updateField(field, e.target.value);
    }, [updateField]);

    const handleTagsChange = useCallback((tags) => {
        updateField('businessTags', tags);
    }, [updateField]);

    // ===========================================================================
    // Prop Validation
    // ===========================================================================
    if (typeof formData !== 'object' || formData === null) {
        console.error(scriptLines.step0BusinessInfo.console.invalidFormDataProp);
        return <p className="text-red-500">{scriptLines.step0BusinessInfo.errors.formDataMissing}</p>;
    }
    if (typeof updateField !== 'function') {
        console.error(scriptLines.step0BusinessInfo.console.invalidUpdateFieldProp);
        return <p className="text-red-500">{scriptLines.step0BusinessInfo.errors.updateFieldMissing}</p>;
    }
    if (errors !== undefined && (typeof errors !== 'object' || errors === null)) {
        console.warn(scriptLines.step0BusinessInfo.console.invalidErrorsProp);
    }

    // ===========================================================================
    // Rendering
    // ===========================================================================
    const isReferralCodeDisabled = !!formData.referralCode;

    return (
        <>
            <div className='relative w-full flex md:flex-row flex-col items-start gap-x-8 gap-y-12 mb-12'>
                <InputField
                    className='w-full'
                    label={scriptLines.step0BusinessInfo.label.businessName}
                    name="businessName"
                    value={formData.businessName || ''}
                    onChange={handleInputChange('businessName')}
                    placeholder={scriptLines.step0BusinessInfo.placeholder.businessName}
                    error={errors?.businessName}
                    autoComplete="organization"
                    asyncValidationStatus={businessNameStatus}
                    asyncErrorMessage={businessNameError}
                    required
                />
                <InputField
                    className='w-full'
                    label={scriptLines.step0BusinessInfo.label.businessUsername}
                    name="businessUsername"
                    value={formData.businessUsername || ''}
                    onChange={handleInputChange('businessUsername')}
                    placeholder={scriptLines.step0BusinessInfo.placeholder.businessUsername}
                    error={errors?.businessUsername}
                    autoComplete="nickname"
                    asyncValidationStatus={usernameStatus}
                    asyncErrorMessage={usernameError}
                    helpTooltipText="This will be your unique URL (e.g., smore.com/your-username)."
                    required
                />
            </div>

            <div className="mb-12">
                <InputField
                    label={scriptLines.step0BusinessInfo.label.businessEmail}
                    name="businessEmail"
                    type="email"
                    value={formData.businessEmail || ''}
                    onChange={handleInputChange('businessEmail')}
                    placeholder={scriptLines.step0BusinessInfo.placeholder.businessEmail}
                    error={errors?.businessEmail}
                    autoComplete="email"
                    asyncValidationStatus={businessEmailStatus}
                    asyncErrorMessage={businessEmailError}
                    required
                />
            </div>

            <div className='relative w-full flex md:flex-row flex-col items-start gap-x-8 gap-y-12 mb-12'>
                <InputField
                    className='w-full'
                    label={scriptLines.step0BusinessInfo.label.businessPhone}
                    name="businessPhone"
                    type="tel"
                    value={formData.businessPhone || ''}
                    onChange={handleInputChange('businessPhone')}
                    placeholder={scriptLines.step0BusinessInfo.placeholder.businessPhone}
                    error={errors?.businessPhone}
                    autoComplete="tel"
                    required
                />
                <InputField
                    className='w-full'
                    label={scriptLines.step0BusinessInfo.label.businessWebsiteOptional}
                    name="businessWebsite"
                    type="url"
                    value={formData.businessWebsite || ''}
                    onChange={handleInputChange('businessWebsite')}
                    placeholder={scriptLines.step0BusinessInfo.placeholder.businessWebsite}
                    error={errors?.businessWebsite}
                    autoComplete="url"
                />
            </div>

            <div className="relative mb-12">
                <InputField
                    label={scriptLines.step0BusinessInfo.label.referralCodeOptional}
                    name="referralCode"
                    value={formData.referralCode || ''}
                    onChange={handleInputChange('referralCode')}
                    placeholder={scriptLines.step0BusinessInfo.placeholder.referralCode}
                    error={errors?.referralCode}
                    autoComplete="off"
                    disabled={isReferralCodeDisabled}
                />
                {isReferralCodeDisabled && (
                    <div className="absolute top-1/2 right-3 -translate-y-1/2 flex items-center pointer-events-none" title="Discount code applied">
                        <Icon name="check_circle" className="w-6 h-6 text-green-500" />
                    </div>
                )}
            </div>

            <div className="mb-12">
                <TagInput
                    label={scriptLines.step0BusinessInfo.label.businessTags}
                    defaultTags={DEFAULT_BUSINESS_TAGS}
                    value={formData.businessTags || []}
                    maxTags={7}
                    onTagsChange={handleTagsChange}
                    validateTag={(tag) => tag.length > 0 && tag.length <= 25}
                    placeholder={scriptLines.step0BusinessInfo.placeholder.businessTags}
                    error={errors?.businessTags}
                    helptext={scriptLines.step0BusinessInfo.helptext.businessTags}
                />
            </div>
        </>
    );
};

Step0BusinessInfo.propTypes = {
    formData: PropTypes.object.isRequired,
    updateField: PropTypes.func.isRequired,
    errors: PropTypes.object,
};

export default memo(Step0BusinessInfo);