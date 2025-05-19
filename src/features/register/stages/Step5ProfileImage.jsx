import React, { memo, useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { ImageUploader } from '../subcomponents';
import Icon from "../../../components/common/Icon";
import { scriptLines_Steps as scriptLines } from '../utils/script_lines'; // Import localization strings

/**
 * Profile Image step (Step 5) for the registration form.
 * This component allows users to upload and crop a profile image using the
 * `ImageUploader` subcomponent. It integrates with the main form state by
 * updating the `profileImage` field with the processed `File` object and
 * can display a previously saved image via `existingProfileImageUrl`.
 * The component is memoized for performance and includes prop validation
 * and localized text for a production-ready experience.
 * @component Step5ProfileImage
 * @param {Object} props - Component properties.
 * @param {Object} props.formData - The current state of the form data.
 *        Expected to have `profileImage` (for the new `File` object after upload/crop) and
 *        optionally `existingProfileImageUrl` (a URL string of a previously saved profile image).
 * @param {Function} props.updateField - Callback function to update a specific field in the main form's formData.
 *        This function should be stable (e.g., memoized by `useFormState`) to ensure optimal performance.
 * @param {Object} [props.errors=null] - An object containing validation errors, specifically for the `profileImage` field if any.
 *        Defaults to `null` if not provided.
 * @param {string} [props.themeColor=scriptLines.step5ProfileImage.themeColorDefault] - The primary theme color for accents, passed to `ImageUploader`.
 *        Defaults to a value from `scriptLines`.
 */
const Step5ProfileImage = ({
    formData,
    updateField,
    errors,
    themeColor = scriptLines.step5ProfileImage.themeColorDefault,
}) => {

    // ===========================================================================
    // Configuration
    // ===========================================================================
    const [previewUrl, setPreviewUrl] = useState(null);

    // ===========================================================================
    // Effect & Handlers (Memoized for performance to prevent unnecessary re-renders of ImageUploader)
    // ===========================================================================

    useEffect(() => {
        let objectUrl = null;
        if (formData.profileImage instanceof File) {
            objectUrl = URL.createObjectURL(formData.profileImage);
            setPreviewUrl(objectUrl);
        } else if (formData.existingProfileImageUrl) {
            setPreviewUrl(formData.existingProfileImageUrl);
        } else {
            setPreviewUrl(null);
        }

        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [formData.profileImage, formData.existingProfileImageUrl]);

    const handleImageUploaded = useCallback((imageFile) => {
        updateField('profileImage', imageFile);
        if (imageFile) { // If a new file is uploaded, existing URL is no longer the source
            updateField('existingProfileImageUrl', null);
        }
        // The useEffect above will handle setting the previewUrl from profileImage
    }, [updateField]);
    
    // ===========================================================================
    // Validation (Prop Validation - Critical for component stability and operation)
    // ===========================================================================
    // This section validates essential props (`formData`, `updateField`).
    // If critical props are missing or invalid, the component renders a fallback UI
    // with a localized error message and logs a localized error to the console.
    // This ensures graceful failure and aids developers in debugging.

    if (typeof formData !== 'object' || formData === null) {
        console.error(scriptLines.step5ProfileImage.console.invalidFormDataProp);
        return (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <Icon name="error_outline" className="w-12 h-12 text-red-500 mb-2" />
                <p className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded-md">
                    {scriptLines.step5ProfileImage.errors.formDataUnavailable}
                </p>
            </div>
        );
    }
    if (typeof updateField !== 'function') {
        console.error(scriptLines.step5ProfileImage.console.invalidUpdateFieldProp);
        return (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <Icon name="settings_alert" className="w-12 h-12 text-red-500 mb-2" />
                <p className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded-md">
                    {scriptLines.step5ProfileImage.errors.updateMechanismImproperlyConfigured}
                </p>
            </div>
        );
    }
    // Optional prop check: `errors` can be undefined/null, but if provided, it should be an object.
    if (errors !== undefined && errors !== null && (typeof errors !== 'object')) {
        console.warn(scriptLines.step5ProfileImage.console.invalidErrorsProp);
        // Component can still render; error display might be affected.
    }

    // ===========================================================================
    // Rendering Logic
    // ===========================================================================
    return (
        <div
            className="step5-profile-image-container flex flex-col items-center space-y-8 pt-4 pb-8" // Consistent class naming
            data-testid="step5-profile-image" // Consistent test ID
        >
            {/* Step Instructions: Provides context and guidance to the user. */}
            <div className="text-center px-4 font-montserrat">
                <h3 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100 mb-2 font-montserrat">
                    {scriptLines.step5ProfileImage.title}
                </h3>
                <p className="text-md text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
                    {scriptLines.step5ProfileImage.description}
                </p>
            </div>

            {/* ImageUploader Component: Handles the core functionality of image selection, cropping, and preview. */}
            <div className="w-full max-w-md px-2"> {/* Adjusted max-w-md for better visual balance */}
                <ImageUploader
                    onImageUpload={handleImageUploaded}
                    initialSrc={previewUrl}
                    themeColor={themeColor}
                />
            </div>

            {/* Validation Error Display: Shows errors related to the 'profileImage' field. */}
            {errors?.profileImage && (
                <div
                    className="mt-4 w-full max-w-md text-sm text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/40 p-3 rounded-lg flex items-center justify-center gap-2 shadow"
                    role="alert" // Informs assistive technologies that this is an important message.
                    data-testid="profile-image-error"
                >
                    <Icon name="warning" className="w-5 h-5 flex-shrink-0" />
                    {/* The error message (errors.profileImage) is expected to be already localized
                        by the validation schema (e.g., Yup in useFormState). This component just displays it.
                    */}
                    <span>{errors.profileImage}</span>
                </div>
            )}
            {/*
                Note on Preview:
                The preview of a *newly uploaded and cropped* image is managed internally by the `ImageUploader`
                component (likely using its own state for the `croppedImageUrl`). This `Step5ProfileImage` component's
                role is to integrate `ImageUploader` into this specific form step, manage the `File` object that
                will be part of `formData` for submission, and handle the display of an `existingProfileImageUrl`
                when the step is first loaded or revisited before a new image interaction.
            */}
        </div>
    );
};

// Define prop types for type safety, improved readability, and robust development.
Step5ProfileImage.propTypes = {
    /** 
     * The current state of the form data. Must be an object.
     * - `profileImage`: The new profile image `File` object (after upload/crop).
     * - `existingProfileImageUrl`: Optional URL string of a previously saved profile image.
     */
    formData: PropTypes.shape({
        profileImage: PropTypes.instanceOf(File), // Can be null if no image is selected/uploaded.
        existingProfileImageUrl: PropTypes.string, // Can be null or undefined.
        // Include other formData properties if they are directly accessed or relevant to this component's logic.
    }).isRequired, // formData is critical for this component.

    /** Callback function to update a field in the main form's formData. Must be a function. */
    updateField: PropTypes.func.isRequired, // updateField is critical.

    /** 
     * An object containing validation errors for this step's fields (e.g., `profileImage`). 
     * Optional; defaults to `null`. If provided, must be an object.
     */
    errors: PropTypes.object,

    /** The primary theme color for accents, passed to `ImageUploader`. Optional string. */
    themeColor: PropTypes.string,
};

// Specify default props for optional props, ensuring the component has defined values to work with.
Step5ProfileImage.defaultProps = {
    errors: null, // If no errors prop is passed, it defaults to null.
    themeColor: scriptLines.step5ProfileImage.themeColorDefault, // Use localized default for themeColor.
};

// Export the component, memoized for performance optimization.
// `React.memo` performs a shallow comparison of props, preventing re-renders if props have not changed.
// This is particularly useful for form steps that might be part of a larger, frequently updating form.
export default memo(Step5ProfileImage);