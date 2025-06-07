// src/features/register/stages/Step5ProfileImage.jsx
import React, { memo, useCallback, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { ImageUploader } from '../subcomponents'; // Assuming ImageUploader is in subcomponents
import Icon from "../../../components/common/Icon"; // Assuming Icon path
import { scriptLines_Steps as scriptLines } from '../utils/script_lines'; // Localization strings

/**
 * @typedef {object} FormDataForProfileImage
 * @property {File} [profileImageFile] - The new profile image File object after upload/crop.
 * @property {string} [existingProfileImageUrl] - Optional URL string of a previously saved profile image.
 */

/**
 * Step5ProfileImage Component
 * Allows users to upload and crop a profile image.
 *
 * @component
 * @param {object} props - Component properties.
 * @param {FormDataForProfileImage} props.formData - Current form data for the profile image.
 * @param {(fieldName: string, value: File | string | null) => void} props.updateField - Callback to update form state.
 * @param {object} [props.errors] - Validation errors (e.g., `errors.profileImageFile`).
 * @param {string} [props.themeColor] - Theme color for `ImageUploader`.
 */
const Step5ProfileImage = ({
    formData,
    updateField,
    errors,
    themeColor = scriptLines.step5ProfileImage.themeColorDefault || 'rose', // Fallback theme
}) => {
    const [uploaderKey, setUploaderKey] = useState(Date.now());
    const [parentPreviewUrl, setParentPreviewUrl] = useState(null);
    const objectUrlRef = useRef(null);

    /**
     * Effect to manage the parent-level preview URL (`parentPreviewUrl`).
     */
    useEffect(() => {
        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
        }

        if (formData.profileImageFile instanceof File) {
            const newObjectUrl = URL.createObjectURL(formData.profileImageFile);
            setParentPreviewUrl(newObjectUrl);
            objectUrlRef.current = newObjectUrl;
        } else if (formData.existingProfileImageUrl) {
            setParentPreviewUrl(formData.existingProfileImageUrl);
        } else {
            setParentPreviewUrl(null);
        }

        return () => {
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
                objectUrlRef.current = null;
            }
        };
    }, [formData.profileImageFile, formData.existingProfileImageUrl]);

    /**
     * Callback for when `ImageUploader` successfully processes an image.
     * @param {File | null} imageFile - The cropped image File object, or null if cleared.
     */
    const handleImageUploaded = useCallback((imageFile) => {
        updateField('profileImageFile', imageFile);
        if (imageFile) {
            updateField('existingProfileImageUrl', null); // New upload overrides existing URL
        }
    }, [updateField]);

    /**
     * Handles clearing the current profile image selection.
     */
    const handleClearImage = useCallback(() => {
        updateField('profileImageFile', null);
        updateField('existingProfileImageUrl', null);
        setParentPreviewUrl(null);
        setUploaderKey(Date.now()); // Force ImageUploader to re-mount
    }, [updateField]);

    // `initialSrc` for ImageUploader should primarily be an existing persisted URL.
    // If `profileImageFile` (a File object) exists, ImageUploader's internal `croppedImageUrl`
    // (after a crop) or its `imageSrc` (if a file is just selected but not yet cropped) handles the preview.
    // We don't want to create an object URL from `profileImageFile` and pass it back as `initialSrc`
    // right after a crop, as that would cause the "stuck in crop" loop.
    const initialSrcForUploader = formData.existingProfileImageUrl || null;

    return (
        <div
            className="step5-profile-image-container flex flex-col items-center space-y-6 sm:space-y-8 pt-4 pb-8"
            data-testid="step5-profile-image"
        >
            <div className="text-center px-4">
                <h3 className="text-xl sm:text-2xl font-semibold text-neutral-800 dark:text-neutral-100 mb-2">
                    {scriptLines.step5ProfileImage.title}
                </h3>
                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-md sm:max-w-lg mx-auto">
                    {scriptLines.step5ProfileImage.description}
                </p>
            </div>

            <div className="w-full max-w-xs sm:max-w-sm px-2"> {/* Adjusted max-width for profile image context */}
                <ImageUploader
                    key={uploaderKey}
                    onImageUpload={handleImageUploaded}
                    initialSrc={initialSrcForUploader} // Use existing URL or null
                    themeColor={themeColor}
                    outputImageSize={scriptLines.step5ProfileImage.outputImageSize || 200}
                    maxFileSizeMB={scriptLines.step5ProfileImage.maxFileSizeMB || 2}
                    circularCrop={scriptLines.step5ProfileImage.circularCrop !== undefined ? scriptLines.step5ProfileImage.circularCrop : true}
                    aspectRatio={scriptLines.step5ProfileImage.aspectRatio || 1 / 1}
                />
            </div>

            {parentPreviewUrl && (
                <div className="mt-4 flex flex-col items-center gap-3" data-testid="parent-profile-preview-section">
                    <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                        {scriptLines.step5ProfileImage.currentImagePreview || "Current Profile Image:"}
                    </p>
                    <img
                        src={parentPreviewUrl}
                        alt="Current profile image"
                        className={`w-24 h-24 sm:w-32 sm:h-32 ${(scriptLines.step5ProfileImage.circularCrop !== undefined ? scriptLines.step5ProfileImage.circularCrop : true) ? 'rounded-full' : 'rounded-md'} 
                                   object-cover shadow-lg border-2 border-neutral-200 dark:border-neutral-600`}
                    />
                    <button
                        type="button"
                        onClick={handleClearImage}
                        className={`text-xs sm:text-sm font-medium transition-colors
                                    ${themeColor === 'rose' ? 'text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-300' : 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'} 
                                    focus:outline-none focus:ring-1 ${themeColor === 'rose' ? 'focus:ring-rose-500' : 'focus:ring-blue-500'} rounded p-1`}
                        aria-label={scriptLines.step5ProfileImage.buttons?.changeImage || "Change or remove image"}
                    >
                        {scriptLines.step5ProfileImage.buttons?.changeImage || "Change/Remove"}
                    </button>
                </div>
            )}

            {errors?.profileImageFile && (
                <div
                    className="mt-4 w-full max-w-sm text-sm text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/40 p-3 rounded-lg flex items-center justify-center gap-2 shadow"
                    role="alert"
                    data-testid="profile-image-error"
                >
                    <Icon name="warning" className="w-5 h-5 flex-shrink-0" />
                    <span>{errors.profileImageFile}</span>
                </div>
            )}
        </div>
    );
};

Step5ProfileImage.propTypes = {
    formData: PropTypes.shape({
        profileImageFile: PropTypes.instanceOf(File), // For the newly uploaded/cropped File
        existingProfileImageUrl: PropTypes.string,    // For a URL of an already saved image
    }).isRequired,
    updateField: PropTypes.func.isRequired,
    errors: PropTypes.object,
    themeColor: PropTypes.string,
};

Step5ProfileImage.defaultProps = {
    errors: null,
    themeColor: 'rose',
};

export default memo(Step5ProfileImage);