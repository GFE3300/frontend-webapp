import React, { memo, useCallback, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ImageUploader } from '../subcomponents'; // Assuming relative path
import Icon from "../../../components/common/Icon";
import { scriptLines_Steps as scriptLines } from '../utils/script_lines'; // Import localization strings

/**
 * Business Logo step (New Step 2) for the registration form.
 * Allows users to upload and crop a logo for their business using the ImageUploader component.
 * Displays the current business logo if one exists in the form data.
 * @component
 * @param {Object} props - Component properties.
 * @param {Object} props.formData - The current state of the form data.
 * @param {Function} props.updateField - Callback function to update fields in the formData.
 * @param {Object} [props.errors] - An object containing validation errors.
 * @param {string} [props.themeColor] - The primary theme color for accents.
 */
const Step2BusinessLogo = ({
    formData,
    updateField,
    errors,
    themeColor = scriptLines.step2BusinessLogo.themeColorDefault,
}) => {
    // ===========================================================================
    // Configuration
    // ===========================================================================
    const LOGO_OUTPUT_SIZE = 250;
    const LOGO_MAX_FILE_SIZE_MB = 5;

    const [previewUrl, setPreviewUrl] = useState(null);

    // ===========================================================================
    // Handlers & Effects
    // ===========================================================================
    useEffect(() => {
        let objectUrl = null;
        // Critical: Check if formData.businessLogoFile is a File object
        if (formData.businessLogoFile instanceof File) {
            objectUrl = URL.createObjectURL(formData.businessLogoFile);
            setPreviewUrl(objectUrl);
        } else if (formData.existingBusinessLogoUrl) {
            setPreviewUrl(formData.existingBusinessLogoUrl);
        } else {
            setPreviewUrl(null); // Clear preview if no file or existing URL
        }

        // Cleanup function to revoke the object URL when the component unmounts
        // or when the file/URL dependencies change.
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [formData.businessLogoFile, formData.existingBusinessLogoUrl]);

    const handleLogoUploaded = useCallback((imageFile) => {
        updateField('businessLogoFile', imageFile);
        if (imageFile) {
            updateField('existingBusinessLogoUrl', null); // Prioritize newly uploaded file
        }
        // `previewUrl` will be updated by the useEffect above.
    }, [updateField]);

    // ===========================================================================
    // Validation (Prop Validation)
    // ===========================================================================
    if (typeof formData !== 'object' || formData === null) {
        console.error(scriptLines.step2BusinessLogo.console.invalidFormDataProp);
        return (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <Icon name="error_outline" className="w-12 h-12 text-red-500 mb-2" />
                <p className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded-md">
                    {scriptLines.step2BusinessLogo.errors.formDataUnavailable}
                </p>
            </div>
        );
    }
    if (typeof updateField !== 'function') {
        console.error(scriptLines.step2BusinessLogo.console.invalidUpdateFieldProp);
        return (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <Icon name="settings_alert" className="w-12 h-12 text-red-500 mb-2" />
                <p className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded-md">
                    {scriptLines.step2BusinessLogo.errors.updateMechanismImproperlyConfigured}
                </p>
            </div>
        );
    }
    if (errors !== undefined && (typeof errors !== 'object' || errors === null)) {
        console.warn(scriptLines.step2BusinessLogo.console.invalidErrorsProp);
    }

    // ===========================================================================
    // Rendering
    // ===========================================================================
    return (
        <div
            className="step2-business-logo-container flex flex-col items-center space-y-8 pt-4 pb-8"
            data-testid="step2-business-logo"
        >
            {/* Step Instructions */}
            <div className="text-center px-4 font-montserrat">
                <h3 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100 mb-2 font-montserrat">
                    {scriptLines.step2BusinessLogo.title}
                </h3>
                <p className="text-md text-neutral-600 dark:text-neutral-400 max-w-lg mx-auto">
                    {scriptLines.step2BusinessLogo.description}
                </p>
            </div>

            {/* ImageUploader Component for Business Logo */}
            <div className="w-full max-w-lg px-2">
                <ImageUploader
                    onImageUpload={handleLogoUploaded}
                    initialSrc={previewUrl}
                    themeColor={themeColor}
                    outputImageSize={LOGO_OUTPUT_SIZE}
                    maxFileSizeMB={LOGO_MAX_FILE_SIZE_MB}
                // Assuming ImageUploader itself is internationalized for its internal texts
                // (e.g., "Drag 'n' drop", "Browse file", "Crop", etc.)
                // If not, those strings would need to be passed as props and localized here.
                />
            </div>

            {/* Validation Error Display for 'businessLogoFile' field */}
            {errors?.businessLogoFile && (
                <div
                    className="mt-4 w-full max-w-lg text-sm text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/40 p-3 rounded-lg flex items-center justify-center gap-2 shadow"
                    role="alert"
                    data-testid="business-logo-error"
                >
                    <Icon name="warning" className="w-5 h-5 flex-shrink-0" />
                    {/* The error message itself (errors.businessLogoFile) comes from yup schema in useFormState,
                        which should also be localized there. So, no direct scriptLines lookup here for the message content.
                    */}
                    <span>{errors.businessLogoFile}</span>
                </div>
            )}
        </div>
    );
};

Step2BusinessLogo.propTypes = {
    formData: PropTypes.shape({
        businessLogoFile: PropTypes.instanceOf(File),
        existingBusinessLogoUrl: PropTypes.string,
    }).isRequired,
    updateField: PropTypes.func.isRequired,
    errors: PropTypes.object,
    themeColor: PropTypes.string,
};

Step2BusinessLogo.defaultProps = {
    errors: null,
    themeColor: scriptLines.step2BusinessLogo.themeColorDefault, // Ensure default prop also uses localized value
};

export default memo(Step2BusinessLogo);