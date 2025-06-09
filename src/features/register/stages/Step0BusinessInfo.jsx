import React, { useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import { InputField, TagInput } from '../subcomponents'; // Assuming relative path to subcomponents
import { scriptLines_Steps as scriptLines } from '../utils/script_lines'; // Import localization strings
import Icon from '../../../components/common/Icon'; // Import Icon component

/**
 * Business Information step (Step 0) of the registration form.
 * Collects essential details about the user's business, such as name,
 * contact information, and descriptive tags.
 * @component
 * @param {Object} props - Component properties
 * @param {Object} props.formData - The current state of the form data.
 * @param {Function} props.updateField - Callback function to update a specific field in the formData.
 * @param {Object} [props.errors] - An object containing validation errors, where keys correspond to field names.
 */
const Step0BusinessInfo = ({ formData, updateField, errors }) => {
    // ===========================================================================
    // Configuration
    // ===========================================================================

    /**
     * @constant {string[]} DEFAULT_BUSINESS_TAGS
     * A predefined list of suggested tags, sourced from localized strings.
     */
    const DEFAULT_BUSINESS_TAGS = scriptLines.step0BusinessInfo.defaultBusinessTags;

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
    // Validation (Prop validation using localized strings for console messages)
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
            {/* Business Name and Username Row */}
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
                    required
                />
            </div>

            {/* Business Email Field */}
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
                    required
                />
            </div>

            {/* Business Phone and Website Row */}
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

            {/* MODIFICATION: Added relative positioning and confirmation icon */}
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
                    <div className="absolute top-1.5 right-2 flex items-center pointer-events-none" title="Discount code applied">
                        <Icon name="check_circle" className="w-6 h-6 text-green-500" />
                    </div>
                )}
            </div>

            {/* Business Tags Input */}
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