// src/features/register/stages/Step2BusinessLogo.jsx
import React, { memo, useCallback, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { ImageUploader } from '../subcomponents'; // Assuming ImageUploader is in subcomponents
import Icon from "../../../components/common/Icon"; // Assuming Icon path
import { scriptLines_Steps as scriptLines } from '../utils/script_lines'; // Localization strings

/**
 * @typedef {object} FormDataForLogo
 * @property {File} [businessLogoFile] - The new logo File object after upload/crop.
 * @property {string} [existingBusinessLogoUrl] - Optional URL string of a previously saved logo.
 */

/**
 * Step2BusinessLogo Component
 * @component
 * @param {object} props - Component properties.
 * @param {FormDataForLogo} props.formData - The current form data relevant to the business logo.
 * @param {(fieldName: string, value: File | string | null) => void} props.updateField - Callback to update form state.
 * @param {object} [props.errors] - Validation errors (e.g., `errors.businessLogoFile`).
 * @param {string} [props.themeColor] - Theme color for `ImageUploader`.
 */
const Step2BusinessLogo = ({
    formData,
    updateField,
    errors,
    themeColor = scriptLines.step2BusinessLogo.themeColorDefault || 'rose', // Fallback theme
}) => {
    // A key to force re-mount ImageUploader for a full reset if needed (e.g., on clear)
    const [uploaderKey, setUploaderKey] = useState(Date.now());

    // URL for displaying a preview within this parent component (optional, ImageUploader has its own internal preview)
    // This is useful if you want to show the "saved" logo even when ImageUploader is in dropzone mode.
    const [parentPreviewUrl, setParentPreviewUrl] = useState(null);
    const objectUrlRef = useRef(null); // To manage object URLs created from File objects

    /**
     * Effect to manage the parent-level preview URL (`parentPreviewUrl`).
     * This URL is derived from `formData.businessLogoFile` (a new upload) or
     * `formData.existingBusinessLogoUrl` (a persisted URL).
     * It ensures object URLs are created and revoked properly.
     */
    useEffect(() => {
        // Revoke previous object URL if it exists
        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
        }

        if (formData.businessLogoFile instanceof File) {
            // If a new File is staged, create an object URL for parent preview
            const newObjectUrl = URL.createObjectURL(formData.businessLogoFile);
            setParentPreviewUrl(newObjectUrl);
            objectUrlRef.current = newObjectUrl;
        } else if (formData.existingBusinessLogoUrl) {
            // If an existing URL is present (and no new file is staged), use it
            setParentPreviewUrl(formData.existingBusinessLogoUrl);
        } else {
            // Otherwise, no preview
            setParentPreviewUrl(null);
        }

        // Cleanup function to revoke the object URL when the component unmounts
        // or when dependencies change leading to a new URL.
        return () => {
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
                objectUrlRef.current = null;
            }
        };
    }, [formData.businessLogoFile, formData.existingBusinessLogoUrl]);

    /**
     * Callback for when `ImageUploader` successfully processes an image.
     * Updates the main form state with the new logo `File` object.
     * @param {File | null} imageFile - The cropped image File object, or null if cleared.
     */
    const handleLogoUploaded = useCallback((imageFile) => {
        updateField('businessLogoFile', imageFile); // Store the File object for submission
        if (imageFile) {
            // If a new file is uploaded, it takes precedence over any existing URL for SSoT.
            // The parent might still hold existingBusinessLogoUrl if it's needed for a "revert" feature,
            // but for submission, businessLogoFile is now the primary.
            // We can clear existingBusinessLogoUrl if it's no longer relevant.
            updateField('existingBusinessLogoUrl', null);
        }
        // `parentPreviewUrl` will be updated by the useEffect above based on `formData.businessLogoFile`.
    }, [updateField]);

    /**
     * Handles clearing the current logo selection (both staged File and existing URL).
     * Resets the `ImageUploader` by changing its key.
     */
    const handleClearLogo = useCallback(() => {
        updateField('businessLogoFile', null);
        updateField('existingBusinessLogoUrl', null);
        setParentPreviewUrl(null); // Clear parent preview immediately
        setUploaderKey(Date.now()); // Force ImageUploader to re-mount and reset its internal state
    }, [updateField]);

    const initialSrcForUploader = formData.existingBusinessLogoUrl || null;

    return (
        <div
            className="step2-business-logo-container flex flex-col items-center space-y-6 sm:space-y-8 pt-4 pb-8"
            data-testid="step2-business-logo"
        >
            <div className="text-center px-4">
                <h3 className="text-xl sm:text-2xl font-semibold text-neutral-800 dark:text-neutral-100 mb-2">
                    {scriptLines.step2BusinessLogo.title}
                </h3>
                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-md sm:max-w-lg mx-auto">
                    {scriptLines.step2BusinessLogo.description}
                </p>
            </div>

            <div className="w-full max-w-sm sm:max-w-md px-2">
                <ImageUploader
                    key={uploaderKey} // Changing key will re-mount ImageUploader
                    onImageUpload={handleLogoUploaded}
                    initialSrc={initialSrcForUploader} // Use existing URL or null
                    themeColor={themeColor}
                    outputImageSize={scriptLines.step2BusinessLogo.outputImageSize || 250}
                    maxFileSizeMB={scriptLines.step2BusinessLogo.maxFileSizeMB || 5}
                    circularCrop={scriptLines.step2BusinessLogo.circularCrop !== undefined ? scriptLines.step2BusinessLogo.circularCrop : true}
                    aspectRatio={scriptLines.step2BusinessLogo.aspectRatio || 1 / 1}
                // ImageUploader itself should handle its internal text localization
                />
            </div>

            {/* Display parent-level preview and clear/change button if a logo is set */}
            {parentPreviewUrl && (
                <div className="mt-4 flex flex-col items-center gap-3" data-testid="parent-logo-preview-section">
                    <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                        {scriptLines.step2BusinessLogo.currentLogoPreview || "Current Logo:"}
                    </p>
                    <img
                        src={parentPreviewUrl}
                        alt="Current business logo"
                        className={`w-24 h-24 sm:w-32 sm:h-32 ${(scriptLines.step2BusinessLogo.circularCrop !== undefined ? scriptLines.step2BusinessLogo.circularCrop : true) ? 'rounded-full' : 'rounded-md'} 
                                   object-cover shadow-lg border-2 border-neutral-200 dark:border-neutral-600`}
                    />
                    <button
                        type="button"
                        onClick={handleClearLogo}
                        className={`text-xs sm:text-sm font-medium transition-colors
                                    ${themeColor === 'rose' ? 'text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-300' : 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'} 
                                    focus:outline-none focus:ring-1 ${themeColor === 'rose' ? 'focus:ring-rose-500' : 'focus:ring-blue-500'} rounded p-1`}
                        aria-label={scriptLines.step2BusinessLogo.buttons?.changeLogo || "Change or remove logo"}
                    >
                        {scriptLines.step2BusinessLogo.buttons?.changeLogo || "Change/Remove"}
                    </button>
                </div>
            )}

            {errors?.businessLogoFile && (
                <div
                    className="mt-4 w-full max-w-md text-sm text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/40 p-3 rounded-lg flex items-center justify-center gap-2 shadow"
                    role="alert"
                    data-testid="business-logo-error"
                >
                    <Icon name="warning" className="w-5 h-5 flex-shrink-0" />
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
    themeColor: scriptLines.step2BusinessLogo.themeColorDefault,
};

export default memo(Step2BusinessLogo);