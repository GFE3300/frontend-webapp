import React, { useState, useCallback, useRef, memo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
// eslint-disable-next-line
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'; // Added useReducedMotion
import Icon from "../../../components/common/Icon";
import { scriptLines_Components as scriptLines } from '../utils/script_lines'; // Assuming relative path for localization

/**
 * A sophisticated, internationalized, and production-ready image uploader and cropper component.
 * Allows users to drag & drop or select an image file, crop it (typically to a circular
 * 1:1 aspect ratio for profile images/logos), and previews the result before invoking a callback.
 * Provides visual feedback for various states (idle, drag active, cropping, processing), error handling,
 * and respects reduced motion preferences for animations. It can also display an initial image from a URL.
 *
 * @component ImageUploader
 * @param {Object} props - Component properties.
 * @param {Function} props.onImageUpload - Callback function invoked with the cropped image `File` object
 *                                        or `null` if the image is cleared. This prop is required.
 * @param {string} [props.initialSrc=null] - Optional URL of an initially displayed image. If provided,
 *                                         this image will be loaded into the cropper.
 * @param {number} [props.maxFileSizeMB=5] - Maximum allowed file size in megabytes. Defaults to 5MB.
 * @param {number} [props.outputImageSize=200] - The width and height (in pixels) of the output cropped image.
 *                                             Defaults to 200px.
 * @param {string} [props.themeColor=scriptLines.imageUploader.themeColorDefault] - The primary theme color for accents (e.g., "rose").
 *                                                                                Defaults to a value from `scriptLines`.
 * @param {boolean} [props.circularCrop=true] - Whether the crop selection and output should be circular.
 *                                            Defaults to `true`.
 * @param {number} [props.aspectRatio=1/1] - The aspect ratio for the crop selection. Defaults to 1:1 (square).
 */

const ImageUploader = ({
    onImageUpload,
    initialSrc = null,
    maxFileSizeMB = 5,
    outputImageSize = 200,
    themeColor = '',
    circularCrop = true, // Added prop for circular crop toggle
    aspectRatio = 1 / 1, // Added prop for aspect ratio
}) => {
    // ===========================================================================
    // Configuration
    // ===========================================================================
    const prefersReducedMotion = useReducedMotion();
    const MAX_FILE_SIZE_BYTES = maxFileSizeMB * 1024 * 1024;
    const ACCEPTED_IMAGE_TYPES = { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] }; // Standard image types
    // const CROP_ASPECT_RATIO = 1 / 1; // Replaced by aspectRatio prop

    // Theme classes for dynamic styling based on `themeColor` prop.
    const THEME_CLASSES = {
        rose: {
            borderActive: 'border-rose-500',
            bgActive: 'bg-rose-50 dark:bg-rose-500/10',
            textActive: 'text-rose-600 dark:text-rose-400',
            buttonPrimary: 'bg-rose-500 hover:bg-rose-600 focus-visible:ring-rose-500',
            iconColor: 'text-rose-500 dark:text-rose-400',
        },
        // Add other themes here if needed, e.g., blue, green
        // blue: { /* ... blue theme classes ... */ },
    };
    const currentTheme = THEME_CLASSES[themeColor] || THEME_CLASSES.rose; // Fallback to rose theme.

    // Framer Motion animation configurations, respecting `prefersReducedMotion`.
    const viewAnimation = {
        initial: { scale: prefersReducedMotion ? 1 : 0.95, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: prefersReducedMotion ? 1 : 0.95, opacity: 0 },
        transition: { duration: prefersReducedMotion ? 0 : 0.3, ease: "easeInOut" }
    };

    // ===========================================================================
    // State & Refs
    // ===========================================================================
    const [imageSrc, setImageSrc] = useState(initialSrc); // Current image source for ReactCrop (Data URL or initial URL)
    const [crop, setCrop] = useState(null); // Current crop selection state (percentage-based)
    const [completedCrop, setCompletedCrop] = useState(null); // Completed crop state (pixel-based)
    const [croppedImageUrl, setCroppedImageUrl] = useState(null); // Data URL of the final cropped image for preview
    const [error, setError] = useState(''); // Stores error messages for display
    const [isProcessing, setIsProcessing] = useState(false); // True when an image is being processed (e.g., saving crop)
    const imgRef = useRef(null); // Ref to the <img> element used in ReactCrop

    // ===========================================================================
    // Effects (Lifecycle and State Synchronization)
    // ===========================================================================

    // Effect to handle changes to the `initialSrc` prop after initial render.
    useEffect(() => {
        if (initialSrc) {
            // If initialSrc is provided and it's different from the current imageSrc being used for cropping
            if (initialSrc !== imageSrc) {
                setImageSrc(initialSrc);      // Set this to display the image in the cropper
                setCroppedImageUrl(null); // Clear any previous local "saved" crop preview
                setError('');
                setCrop(null);            // Reset crop selection
            }
        } else {
            // If initialSrc becomes null (e.g., parent wants to clear the displayed image)
            // AND the current imageSrc is not a data URL (i.e., it was from a previous initialSrc)
            if (imageSrc && !imageSrc.startsWith('data:image')) {
                setImageSrc(null);
            }
            // Note: We don't clear `croppedImageUrl` here. If `initialSrc` is cleared but `croppedImageUrl`
            // exists (from a previous crop-and-save operation), the preview should still show.
            // The parent component (StepX) is responsible for clearing `formData.businessLogoFile` etc.
            // which would then lead to `previewUrl` in StepX becoming null, then `initialSrc` here becoming null.
        }
    }, [initialSrc]);; // Rerun if initialSrc or imageSrc changes.

    // Effect to clean up object URLs created for `croppedImageUrl` to prevent memory leaks.
    useEffect(() => {
        const currentUrl = croppedImageUrl; // Capture current URL for cleanup.
        return () => {
            if (currentUrl && currentUrl.startsWith('blob:')) { // Only revoke blob URLs
                URL.revokeObjectURL(currentUrl);
            }
        };
    }, [croppedImageUrl]); // Rerun when croppedImageUrl changes.

    // ===========================================================================
    // Handlers (Memoized for performance and stability)
    // ===========================================================================

    /**
     * Handles file drop from `useDropzone`. Validates files and sets `imageSrc` for cropping.
     * @param {File[]} acceptedFiles - Array of accepted files (should be one).
     * @param {FileRejection[]} fileRejections - Array of rejected files with error details.
     */
    const onFileDrop = useCallback((acceptedFiles, fileRejections) => {
        setError(''); // Clear previous errors.
        setCroppedImageUrl(null); // Clear previous crop preview.
        setImageSrc(null); // Clear previous image source.
        setCrop(null); // Reset crop state.

        if (fileRejections.length > 0) {
            const firstRejection = fileRejections[0].errors[0];
            if (firstRejection.code === 'file-too-large') {
                setError(scriptLines.imageUploader.errors.fileTooLarge.replace('{maxFileSizeMB}', maxFileSizeMB.toString()));
            } else if (firstRejection.code === 'file-invalid-type') {
                setError(scriptLines.imageUploader.errors.invalidFileType);
            } else {
                setError(scriptLines.imageUploader.errors.fileNotAccepted);
            }
            return;
        }

        const file = acceptedFiles[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                // Ensure result is a string before setting state.
                const resultString = reader.result?.toString() || '';
                if (resultString) {
                    setImageSrc(resultString); // Set imageSrc to Data URL for ReactCrop.
                } else {
                    setError(scriptLines.imageUploader.errors.errorReadingFile);
                }
            };
            reader.onerror = () => setError(scriptLines.imageUploader.errors.errorReadingFile);
            reader.readAsDataURL(file);
        }
    }, [maxFileSizeMB]);

    // Configure `useDropzone` hook.
    const { getRootProps, getInputProps, isDragActive, open: openFileDialog } = useDropzone({
        onDrop: onFileDrop,
        accept: ACCEPTED_IMAGE_TYPES,
        maxSize: MAX_FILE_SIZE_BYTES,
        noClick: !!imageSrc, // Disable click to open dialog if an image is already being cropped.
        noKeyboard: !!imageSrc, // Disable keyboard to open dialog similarly.
        multiple: false, // Only allow single file upload.
    });

    /**
     * Callback for when the image in `ReactCrop` has loaded.
     * Initializes the crop selection to be centered and match the aspect ratio.
     * @param {React.SyntheticEvent<HTMLImageElement>} e - The image load event.
     */
    const onImageLoad = useCallback((e) => {
        const { width, height } = e.currentTarget;
        if (width === 0 || height === 0) return; // Prevent errors with zero-dimension images.

        // Create an initial crop selection (e.g., 90% width, centered, respecting aspect ratio).
        const initialCropValue = centerCrop(
            makeAspectCrop({ unit: '%', width: 90 }, aspectRatio, width, height),
            width,
            height
        );
        setCrop(initialCropValue);
        setCompletedCrop(initialCropValue); // Also set completedCrop initially for immediate save possibility.
    }, [aspectRatio]);

    /**
     * Handles saving the current crop. Creates a new canvas, draws the cropped portion of the image,
     * converts it to a blob, then a File object, and calls `onImageUpload`.
     * Updates `croppedImageUrl` for preview and manages `isProcessing` state.
     */
    const handleSaveCrop = useCallback(async () => {
        if (!completedCrop || !imgRef.current || completedCrop.width === 0 || completedCrop.height === 0) {
            setError(scriptLines.imageUploader.errors.cropSaveError);
            return;
        }
        setIsProcessing(true);
        setError('');

        const image = imgRef.current;
        const canvas = document.createElement('canvas');
        // Calculate scale factors based on displayed image size vs. natural image size.
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        // Set canvas dimensions to desired output size.
        canvas.width = outputImageSize;
        canvas.height = circularCrop ? outputImageSize : outputImageSize / aspectRatio; // Adjust height if not square and not circular

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            setError(scriptLines.imageUploader.errors.canvasContextError);
            setIsProcessing(false);
            return;
        }

        // Draw the cropped portion of the image onto the canvas.
        // Arguments: sourceImage, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight
        ctx.drawImage(
            image,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0, 0,
            canvas.width, canvas.height // Draw to fill the output canvas
        );

        // If circular crop is enabled, apply a circular mask.
        if (circularCrop) {
            ctx.globalCompositeOperation = 'destination-in'; // Keep parts of image inside the new shape.
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over'; // Restore default drawing mode.
        }

        // Convert canvas content to a blob, then to a File.
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 0.92)); // PNG format, 92% quality.
        if (!blob) {
            setError(scriptLines.imageUploader.errors.blobCreationError);
            setIsProcessing(false);
            return;
        }
        const file = new File([blob], `cropped-image-${Date.now()}.png`, { type: 'image/png' });

        const newCroppedUrl = URL.createObjectURL(blob);
        setCroppedImageUrl(newCroppedUrl); // Update state for local preview.
        setIsProcessing(false);
        onImageUpload(file); // Pass the File object to the parent component.

        // Reset to dropzone view to show the preview of the newly cropped image and allow new uploads.
        setImageSrc(null);
        setCrop(null);

    }, [completedCrop, onImageUpload, outputImageSize, circularCrop, aspectRatio]);

    /**
     * Handles cancellation of the cropping process or changing the image.
     * Resets states to either re-crop the `initialSrc` (if it was provided and is active)
     * or to clear the user-uploaded image and return to the dropzone.
     */
    const handleCancel = useCallback(() => {
        if (initialSrc && imageSrc === initialSrc) {
            // If `initialSrc` is currently displayed, reset the crop for it.
            // Re-triggering `onImageLoad` will re-calculate the default centered crop.
            if (imgRef.current) {
                onImageLoad({ currentTarget: imgRef.current });
            } else {
                setCrop(null); // Fallback if imgRef is not available.
            }
        } else {
            // If a new file was uploaded (imageSrc is a data URL), clear it.
            setImageSrc(null);
            setCrop(null);
        }
        // Clear any existing cropped image preview and errors.
        // Do not clear `croppedImageUrl` here if we want to keep showing the last *saved* crop
        // when `initialSrc` is re-selected for cropping. If the intent is to always clear, then uncomment.
        // setCroppedImageUrl(null); 
        setError('');
        setIsProcessing(false); // Reset processing state.

        // Clear the value of the hidden file input to allow re-selection of the same file.
        const inputElement = document.querySelector('input[type="file"][data-testid="file-input"]'); // More robust selector might be needed if multiple file inputs exist.
        if (inputElement) {
            inputElement.value = "";
        }

        // If `onImageUpload(null)` is desired on cancel to clear parent state:
        // onImageUpload(null);
    }, [initialSrc, imageSrc, onImageLoad /*, onImageUpload */]); // `getInputProps` was removed as direct DOM manipulation is tricky with refs from hooks.

    // ===========================================================================
    // Validation (Prop Validation - Critical for component operation)
    // ===========================================================================
    // Ensures the essential `onImageUpload` callback is provided.
    if (typeof onImageUpload !== 'function') {
        console.error(scriptLines.imageUploader.console.invalidOnImageUploadProp);
        // Render a fallback UI if the component cannot function correctly.
        return (
            <p className="text-red-500 p-4 bg-red-50 dark:bg-red-900/30 rounded-md font-montserrat text-center">
                {scriptLines.imageUploader.errors.handlerMissing}
            </p>
        );
    }

    // ===========================================================================
    // Rendering Logic
    // ===========================================================================

    // Prepare localized text for dropzone call to action
    const dropzoneCtaText = scriptLines.imageUploader.dropzone.ctaDefault.replace(
        '{clickToUpload}',
        `<span class="${currentTheme.textActive} font-bold">${scriptLines.imageUploader.dropzone.clickToUploadText}</span>`
    );


    return (
        <div className="w-full font-montserrat max-w-lg mx-auto rounded-xl shadow-2xl space-y-6 bg-white dark:bg-neutral-800 p-4 sm:p-6" data-testid="image-uploader">
            <AnimatePresence mode="wait">
                {!imageSrc ? (
                    // Dropzone View: Displayed when no image is loaded for cropping.
                    <motion.div
                        key="dropzone"
                        {...getRootProps()} // Spread props from `useDropzone` for drag & drop functionality.
                        className={`image-uploader-dropzone relative flex flex-col items-center justify-center w-full h-60 sm:h-64 border-2 border-dashed 
                                    rounded-lg cursor-pointer transition-all duration-300 ease-in-out group
                                    hover:border-opacity-70 dark:hover:border-opacity-70
                                    ${isDragActive
                                ? `${currentTheme.borderActive} ${currentTheme.bgActive} dark:bg-opacity-20`
                                : 'border-neutral-400 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700/50'
                            }`}
                        {...viewAnimation} // Apply enter/exit animations.
                    >
                        <input {...getInputProps()} data-testid="file-input" /> {/* Hidden file input. */}
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                            <Icon
                                name={isDragActive ? "cloud_upload" : "add_photo_alternate"}
                                className={`w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 transition-colors group-hover:opacity-80 ${isDragActive ? currentTheme.iconColor : 'text-neutral-400 dark:text-neutral-500'}`}
                                variations={{ opsz: 48, grade: -25 }}
                            />
                            {isDragActive ? (
                                <p className={`text-lg sm:text-xl font-medium ${currentTheme.textActive} dark:text-opacity-90`}>
                                    {scriptLines.imageUploader.dropzone.ctaActive}
                                </p>
                            ) : (
                                <>
                                    <p className="mb-1 text-md sm:text-lg font-medium text-neutral-700 dark:text-neutral-200"
                                        dangerouslySetInnerHTML={{ __html: dropzoneCtaText }} // Render localized HTML for "Click to upload"
                                    />
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                        {scriptLines.imageUploader.dropzone.fileTypes.replace('{maxFileSizeMB}', maxFileSizeMB.toString())}
                                    </p>
                                </>
                            )}
                        </div>
                        {/* Subtle background pattern for visual flair. */}
                        <div className="absolute inset-0 opacity-5 overflow-hidden rounded-lg -z-10">
                            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><pattern id={`smallGridUploaderPattern-${themeColor}`} width="8" height="8" patternUnits="userSpaceOnUse"><path d="M 8 0 L 0 0 0 8" fill="none" stroke="currentColor" strokeWidth="0.5" /></pattern></defs><rect width="100%" height="100%" fill={`url(#smallGridUploaderPattern-${themeColor})`} /></svg>
                        </div>
                    </motion.div>
                ) : (
                    // Cropping View: Displayed when an image (`imageSrc`) is loaded.
                    <motion.div
                        key="cropper"
                        className="image-uploader-cropper space-y-4 sm:space-y-6 flex flex-col items-center"
                        {...viewAnimation} // Apply enter/exit animations.
                    >
                        <p className="text-md sm:text-lg font-medium text-neutral-700 dark:text-neutral-200">
                            {scriptLines.imageUploader.cropper.title}
                        </p>
                        {/* Container for ReactCrop, ensuring it's centered and sized appropriately. */}
                        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md aspect-square bg-neutral-200 dark:bg-neutral-700 rounded-lg overflow-hidden shadow-lg flex items-center justify-center">
                            <ReactCrop
                                crop={crop}
                                onChange={(_, percentCrop) => setCrop(percentCrop)} // `onChange` provides pixel and percent crop.
                                onComplete={(c) => setCompletedCrop(c)} // `onComplete` provides pixel crop.
                                aspect={aspectRatio} // Use prop for aspect ratio.
                                circularCrop={circularCrop} // Use prop for circular crop.
                                ruleOfThirds // Display rule-of-thirds guide.
                                keepSelection // Keep selection when image resizes.
                                minWidth={50} // Minimum crop selection width in pixels.
                                minHeight={50} // Minimum crop selection height in pixels.
                                className="max-h-[300px] sm:max-h-[400px] [&>div>img]:max-h-[300px] sm:[&>div>img]:max-h-[400px]" // Max height for cropper area & image.
                            >
                                <img
                                    ref={imgRef}
                                    src={imageSrc} // Must be a valid image source (Data URL from FileReader or initialSrc URL).
                                    alt="Image to crop"
                                    onLoad={onImageLoad} // Initialize crop when image loads.
                                    crossOrigin={initialSrc && initialSrc.startsWith('http') ? "anonymous" : undefined} // For external initialSrc to work with canvas.
                                    style={{ maxHeight: '70vh', objectFit: 'contain' }} // Ensure image fits within viewport.
                                    data-testid="crop-image"
                                />
                            </ReactCrop>
                        </div>
                        {/* Action Buttons for Cropping */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-xs sm:max-w-sm md:max-w-md justify-center pt-2">
                            <motion.button
                                type="button"
                                onClick={handleSaveCrop}
                                disabled={isProcessing || !completedCrop?.width || !completedCrop?.height}
                                className={`w-full sm:flex-1 flex items-center justify-center px-6 py-3 rounded-full text-white text-sm font-medium 
                                            transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-800
                                            disabled:opacity-50 disabled:cursor-not-allowed ${currentTheme.buttonPrimary} shadow-md hover:shadow-lg`}
                                whileTap={{ scale: 0.98 }}
                                data-testid="save-crop-button"
                            >
                                {isProcessing ? (
                                    <> <Icon name="progress_activity" className="w-5 h-5 mr-2 animate-spin" /> {scriptLines.imageUploader.cropper.buttons.processing} </>
                                ) : (
                                    <> <Icon name="check_circle" className="w-5 h-5 mr-2" /> {scriptLines.imageUploader.cropper.buttons.applyCrop} </>
                                )}
                            </motion.button>
                            <motion.button
                                type="button"
                                onClick={handleCancel}
                                disabled={isProcessing}
                                className="w-full sm:flex-1 flex items-center justify-center px-6 py-3 rounded-full font-medium text-sm
                                            bg-neutral-200 dark:bg-neutral-600 text-neutral-700 dark:text-neutral-200 
                                            hover:bg-neutral-300 dark:hover:bg-neutral-500
                                            transition-colors duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-800
                                            disabled:opacity-50"
                                whileTap={{ scale: 0.98 }}
                                data-testid="cancel-crop-button"
                            >
                                <Icon name="cancel" className="w-5 h-5 mr-2 inline-block" />
                                {/* Dynamically set button text based on current state. */}
                                {initialSrc && imageSrc === initialSrc
                                    ? scriptLines.imageUploader.cropper.buttons.resetCrop
                                    : scriptLines.imageUploader.cropper.buttons.changeImage}
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error Display Area */}
            <AnimatePresence>
                {error && (
                    <motion.p
                        className="mt-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded-md text-center flex items-center justify-center gap-2"
                        role="alert" // Important for accessibility.
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        data-testid="error-message"
                    >
                        <Icon name="error" className="w-5 h-5 flex-shrink-0" />
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>

            {/* Cropped Image Preview Area: Shows the last successfully cropped image if not currently cropping. */}
            <AnimatePresence>
                {croppedImageUrl && !imageSrc && ( // Display only when in dropzone view and a crop exists.
                    <motion.div
                        className="mt-6 sm:mt-8 text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: 0.1 }} // Slight delay to appear after dropzone.
                        data-testid="cropped-preview-area"
                    >
                        <p className="text-sm sm:text-md font-semibold text-neutral-700 dark:text-neutral-300 mb-2 sm:mb-3">
                            {scriptLines.imageUploader.preview.title}
                        </p>
                        <img
                            src={croppedImageUrl}
                            alt="Cropped preview" // More descriptive alt text
                            className={`w-28 h-28 sm:w-36 sm:h-36 ${circularCrop ? 'rounded-full' : 'rounded-md'} mx-auto shadow-xl border-4 border-white dark:border-neutral-700 object-cover`}
                        />
                        {/* Button to trigger file dialog again, allowing user to change the cropped image. */}
                        <button
                            type="button" // Explicitly type="button"
                            onClick={openFileDialog} // Re-uses dropzone's open function.
                            className={`mt-3 sm:mt-4 text-xs sm:text-sm ${currentTheme.textActive} hover:underline focus:outline-none focus-visible:ring-1 ${currentTheme.borderActive} rounded px-1`}
                        >
                            {scriptLines.imageUploader.preview.uploadNew}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Optional: Hidden canvas for other preview methods if needed, though current approach uses URL.createObjectURL. */}
            {/* <canvas ref={canvasPreviewRef} style={{ display: 'none' }} /> */}
        </div>
    );
};

// Define prop types for type safety, improved readability, and developer experience.
ImageUploader.propTypes = {
    /** Callback function invoked with the cropped image `File` object or `null`. Required. */
    onImageUpload: PropTypes.func.isRequired,
    /** Optional URL of an initially displayed image. */
    initialSrc: PropTypes.string,
    /** Maximum allowed file size in megabytes. */
    maxFileSizeMB: PropTypes.number,
    /** The width and height (in pixels) of the output cropped image. */
    outputImageSize: PropTypes.number,
    /** The primary theme color for accents. */
    themeColor: PropTypes.oneOf(['rose', 'blue', 'green']), // Add more themes as they are defined in THEME_CLASSES
    /** Whether the crop selection and output should be circular. */
    circularCrop: PropTypes.bool,
    /** The aspect ratio for the crop selection (e.g., 1/1 for square, 16/9 for widescreen). */
    aspectRatio: PropTypes.number,
};

// Specify default props for optional props, ensuring defined values.
ImageUploader.defaultProps = {
    initialSrc: null,
    maxFileSizeMB: 5,
    outputImageSize: 200,
    themeColor: '',
    circularCrop: true,
    aspectRatio: 1 / 1,
};

// Export the component, memoized for performance optimization.
export default memo(ImageUploader);