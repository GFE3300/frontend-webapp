import React, { useState, useCallback, useRef, memo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
// eslint-disable-next-line
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Icon from "../../../components/common/Icon"; // Adjust path as needed

const PLATE_ASPECT_RATIO = 1; // Always 1:1 for circular plate

async function getCroppedImg(image, crop, outputWidth, circular = true, fileName = `cropped-image-${Date.now()}.png`) {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    if (crop.width === 0 || crop.height === 0) {
        console.error("Crop dimensions are zero.");
        return null;
    }

    canvas.width = outputWidth;
    canvas.height = outputWidth;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error("Could not get canvas 2D context.");
        return null;
    }

    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;
    const cropWidth = crop.width * scaleX;
    const cropHeight = crop.height * scaleY;

    ctx.drawImage(
        image,
        cropX, cropY,
        cropWidth, cropHeight,
        0, 0,
        outputWidth, outputWidth
    );

    if (circular) {
        ctx.globalCompositeOperation = 'destination-in';
        ctx.beginPath();
        ctx.arc(outputWidth / 2, outputWidth / 2, outputWidth / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
    }

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                console.error("Canvas to Blob conversion failed.");
                reject(new Error("Canvas to Blob conversion failed."));
                return;
            }
            resolve(new File([blob], fileName, { type: 'image/png' }));
        }, 'image/png', 0.95);
    });
}


const ProductImageUploader = ({
    onImageUpload,
    initialSrc = null,
    maxFileSizeMB = 5,
    outputImageSize = 300,
    dropzoneIcon = <Icon name="restaurant" className="w-10 h-10 sm:w-12 sm:h-12 text-neutral-400 dark:text-neutral-500 mb-2 group-hover:text-rose-500 transition-colors" />,
    dropzoneMessage = "Tap or Drag Your Food Photo",
    dropzoneSubMessage = `PNG, JPG, WEBP up to ${maxFileSizeMB}MB`,
    className = "",
}) => {
    const prefersReducedMotion = useReducedMotion();
    const MAX_FILE_SIZE_BYTES = maxFileSizeMB * 1024 * 1024;
    const ACCEPTED_IMAGE_TYPES = { 'image/jpeg': ['.jpeg', '.jpg'], 'image/png': ['.png'], 'image/webp': ['.webp'] };

    const [imageForCropperDataUrl, setImageForCropperDataUrl] = useState(null); // Data URL for the image in cropper
    const [crop, setCrop] = useState(null); // Stores PercentCrop
    const [completedCrop, setCompletedCrop] = useState(null); // Stores PixelCrop
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false); // For "Confirm Crop" action
    const [isReadingFile, setIsReadingFile] = useState(false); // For FileReader

    const imgRef = useRef(null); // Ref for the image inside ReactCrop
    const fileInputRef = useRef(null);

    const animationProps = prefersReducedMotion ? {} : {
        initial: { opacity: 0, scale: 0.90 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.90 },
        transition: { duration: 0.25, ease: "circOut" },
    };

    // Effect to clear cropper if initialSrc is removed by parent,
    // but only if we are not actively cropping a new image.
    useEffect(() => {
        if (!initialSrc && !imageForCropperDataUrl) {
            // If initialSrc becomes null (e.g., parent removed it) and we're not cropping,
            // ensure any lingering crop states are cleared.
            setCrop(null);
            setCompletedCrop(null);
        }
    }, [initialSrc, imageForCropperDataUrl]);


    const onFileDrop = useCallback((acceptedFiles, fileRejections) => {
        setError('');
        setCrop(null); // Reset crop for new image
        setCompletedCrop(null);
        setIsReadingFile(true);
        setImageForCropperDataUrl(null); // Clear previous cropper image if any

        if (fileRejections.length > 0) {
            const firstRejection = fileRejections[0].errors[0];
            if (firstRejection.code === 'file-too-large') {
                setError(`Photo is too large. Max ${maxFileSizeMB}MB.`);
            } else if (firstRejection.code === 'file-invalid-type') {
                setError("Invalid file type. Please use JPG, PNG, or WEBP.");
            } else {
                setError("Couldn't accept this file. Please try another.");
            }
            setIsReadingFile(false);
            if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
            return;
        }

        const file = acceptedFiles[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImageForCropperDataUrl(reader.result?.toString() || '');
                setIsReadingFile(false);
            };
            reader.onerror = () => {
                setError("Error reading file. Please try again.");
                setIsReadingFile(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
            };
            reader.readAsDataURL(file);
        } else {
            setIsReadingFile(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }, [maxFileSizeMB]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: onFileDrop,
        accept: ACCEPTED_IMAGE_TYPES,
        maxSize: MAX_FILE_SIZE_BYTES,
        noClick: true, // We'll trigger click manually
        noKeyboard: true,
        multiple: false,
    });

    const triggerFileInput = useCallback(() => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    }, []);


    const onImageLoadInCropper = useCallback((e) => {
        const img = e.currentTarget;
        const { naturalWidth, naturalHeight } = img;

        if (naturalWidth === 0 || naturalHeight === 0) {
            setError("Image data is invalid or image could not be loaded. Try a different one.");
            setImageForCropperDataUrl(null); // Clear bad image
            setCrop(null);
            setCompletedCrop(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        const initialPercentCrop = makeAspectCrop(
            { unit: '%', width: 90 },
            PLATE_ASPECT_RATIO,
            naturalWidth,
            naturalHeight
        );
        const centeredPercentCrop = centerCrop(initialPercentCrop, naturalWidth, naturalHeight);
        setCrop(centeredPercentCrop);
    }, []);

    const handleConfirmCrop = useCallback(async () => {
        if (!completedCrop || !imgRef.current || completedCrop.width === 0 || completedCrop.height === 0) {
            setError("Could not save crop. Please select a valid crop area or wait for image to load.");
            return;
        }
        setIsProcessing(true);
        setError('');

        try {
            const croppedImageFile = await getCroppedImg(
                imgRef.current,
                completedCrop,
                outputImageSize,
                true // circularCrop
            );

            if (croppedImageFile) {
                onImageUpload(croppedImageFile); // Send File to parent
                setImageForCropperDataUrl(null); // Exit cropping mode
                setCrop(null);
                setCompletedCrop(null);
                if (fileInputRef.current) fileInputRef.current.value = ""; // Reset to allow re-upload of same file later
            } else {
                setError("Failed to process image. Please try again.");
            }
        } catch (err) {
            console.error("Error cropping image:", err);
            setError(`An error occurred while saving: ${err.message || "Please try again."}`);
        } finally {
            setIsProcessing(false);
        }
    }, [completedCrop, onImageUpload, outputImageSize]);

    const handleCancelCrop = useCallback(() => {
        setImageForCropperDataUrl(null);
        setCrop(null);
        setCompletedCrop(null);
        setError('');
        if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
    }, []);

    const handleRemoveFinalImage = useCallback(() => {
        onImageUpload(null); // Notify parent to remove image
        // initialSrc will become null via prop update from parent
        // No need to setImageForCropperDataUrl(null) as it's already null in this state
        setError('');
        if (fileInputRef.current) fileInputRef.current.value = "";
    }, [onImageUpload]);


    const commonButtonClasses = "px-4 py-2 text-sm font-semibold rounded-full transition-all duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none";
    const primaryButtonClasses = `${commonButtonClasses} bg-rose-500 text-white hover:bg-rose-600 focus-visible:ring-rose-500`;
    const secondaryButtonClasses = `${commonButtonClasses} bg-neutral-200 text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-600 focus-visible:ring-neutral-500`;

    // Determine crossOrigin prop for the initialSrc image tag if it's an external URL
    let initialImageCrossOriginVal;
    if (initialSrc && initialSrc.startsWith('http')) {
        try {
            const url = new URL(initialSrc);
            if (url.origin !== window.location.origin) {
                initialImageCrossOriginVal = "anonymous";
            }
        } catch (e) {
            console.warn("Failed to parse initialSrc URL:", e);
            initialImageCrossOriginVal = "anonymous";
        }
    }


    const uploaderContent = () => {
        if (isReadingFile) {
            return (
                <motion.div key="reading" {...animationProps} className="flex flex-col items-center justify-center w-full h-full">
                    <Icon name="progress_activity" className="w-10 h-10 sm:w-12 sm:h-12 text-rose-500 animate-spin mb-2" />
                    <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">Preparing photo...</p>
                </motion.div>
            );
        }

        if (imageForCropperDataUrl) { // Cropping State
            return (
                <motion.div
                    key="cropper"
                    className="w-full h-full flex flex-col items-center justify-center"
                    {...animationProps}
                >
                    <div className="relative w-full max-w-full aspect-square bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden shadow-inner flex items-center justify-center">
                        <ReactCrop
                            crop={crop}
                            onChange={(_, percentCrop) => setCrop(percentCrop)}
                            onComplete={(pixelCrop) => setCompletedCrop(pixelCrop)}
                            aspect={PLATE_ASPECT_RATIO}
                            circularCrop
                            keepSelection
                            minWidth={50}
                            minHeight={50}
                            className="max-h-full max-w-full [&>div>img]:max-h-full [&>div>img]:max-w-full"
                            ariaLabel="Image crop area"
                        >
                            <img
                                ref={imgRef}
                                src={imageForCropperDataUrl} // Always a data URL
                                alt="Image to crop"
                                onLoad={onImageLoadInCropper}
                                className="object-contain"
                                style={{ maxHeight: '100%', maxWidth: '100%' }}
                            />
                        </ReactCrop>
                    </div>
                    <div className="flex absolute -bottom-3 sm:-bottom-15 items-center justify-center gap-2 sm:gap-3 w-full max-w-[15rem] sm:max-w-[16rem] mx-auto">
                        <button
                            type="button"
                            onClick={handleConfirmCrop}
                            disabled={isProcessing || !completedCrop?.width}
                            className={`${primaryButtonClasses} flex-1 flex items-center justify-center`}
                            aria-live="polite"
                        >
                            {isProcessing
                                ? <Icon name="progress_activity" className="w-6 h-6 mr-1.5 animate-spin" />
                                : <Icon name="check_circle" className="w-6 h-6 mr-1.5" />
                            }
                            {isProcessing ? "Saving..." : "Confirm"}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancelCrop}
                            disabled={isProcessing}
                            className={`${secondaryButtonClasses} flex-1 flex items-center justify-center`}
                        >
                            <Icon name="cancel" className="w-6 h-6 mr-1.5" />
                            Cancel
                        </button>
                    </div>
                </motion.div>
            );
        }

        if (initialSrc) { // Final Image Display State
            return (
                <motion.div
                    key="final-image"
                    className="w-full h-full flex flex-col items-center justify-center"
                    {...animationProps}
                >
                    <div className="relative w-full h-full bg-white dark:bg-neutral-800 rounded-full shadow-lg flex items-center justify-center overflow-hidden">
                        <img
                            src={initialSrc} // Can be blob URL or remote URL
                            alt="Product" // Changed alt text
                            crossOrigin={initialImageCrossOriginVal}
                            className="w-full h-full object-cover" // object-cover to fill the circle
                            onError={() => { // Basic error handling for initialSrc
                                setError("Could not load product image.");
                                onImageUpload(null); // Effectively remove broken link
                            }}
                        />
                    </div>
                    <div className="flex absolute -bottom-3 sm:-bottom-15 items-center justify-center gap-2 sm:gap-3 w-full max-w-[15rem] sm:max-w-[16rem] mx-auto">
                        <button
                            type="button"
                            onClick={triggerFileInput} // Opens file dialog for new image
                            className={`${primaryButtonClasses} flex-1 flex items-center justify-center`}
                        >
                            <Icon name="edit" className="w-6 h-6 mr-1.5" />
                            Change
                        </button>
                        <button
                            type="button"
                            onClick={handleRemoveFinalImage}
                            className={`${secondaryButtonClasses} flex-1 flex items-center justify-center`}
                        >
                            <Icon name="delete" className="w-6 h-6 mr-1.5" />
                            Remove
                        </button>
                    </div>
                </motion.div>
            );
        }

        // Dropzone State (Default)
        return (
            <motion.div
                key="dropzone"
                {...getRootProps()}
                onClick={triggerFileInput} // Use dedicated trigger to ensure fileInputRef is used
                className={`relative flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-full cursor-pointer group
                            transition-all duration-200 ease-in-out text-center font-montserrat
                            ${isDragActive
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/40 scale-105'
                        : 'border-neutral-300 dark:border-neutral-600 hover:border-rose-400 dark:hover:border-rose-600 bg-neutral-50/50 dark:bg-neutral-800/30'
                    }`}
                aria-label="Image dropzone: Click or drag and drop an image"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') triggerFileInput(); }}
                {...animationProps}
            >
                {/* input is already part of getRootProps, but we need ref explicitly */}
                {/* <input {...getInputProps({ ref: fileInputRef, id: "plate-image-input" })} /> */}
                {dropzoneIcon}
                <p className="text-sm sm:text-base font-semibold text-neutral-700 dark:text-neutral-200 px-3 group-hover:text-rose-600 dark:group-hover:text-rose-400">
                    {dropzoneMessage}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 px-3">{dropzoneSubMessage}</p>
            </motion.div>
        );
    };

    return (
        <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
            {/* Hidden file input, to be triggered programmatically */}
            <input {...getInputProps({ ref: fileInputRef, id: "plate-image-input", style: { display: 'none' } })} />

            <div className="flex items-center justify-center gap-x-4 sm:gap-x-6 pb-17"> {/* pb-17 for buttons below */}
                <div className="relative flex-shrink-0 w-[13rem] h-[13rem] sm:w-[15rem] sm:h-[15rem] md:w-[17rem] md:h-[17rem]">
                    <div className="absolute inset-0 rounded-full bg-neutral-200 dark:bg-neutral-700 shadow-xl transform scale-105"></div>
                    <div className={`relative w-full h-full bg-white dark:bg-neutral-800 rounded-full shadow-lg flex items-center justify-center`}>
                        <AnimatePresence mode="wait">
                            {uploaderContent()}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        className="w-full max-w-xs text-sm text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/50 p-3 rounded-lg text-center flex items-center justify-center gap-2 shadow"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        role="alert"
                    >
                        <Icon name="error" className="w-6 h-6 flex-shrink-0" />
                        <span>{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

ProductImageUploader.propTypes = {
    onImageUpload: PropTypes.func.isRequired,
    initialSrc: PropTypes.string,
    maxFileSizeMB: PropTypes.number,
    outputImageSize: PropTypes.number,
    dropzoneIcon: PropTypes.node,
    dropzoneMessage: PropTypes.string,
    dropzoneSubMessage: PropTypes.string,
    className: PropTypes.string,
    // svgColorClassName and svgSizeClassName are no longer used directly for dropzoneIcon styling internally
    // but kept for API compatibility if parent was relying on them for other reasons (unlikely).
    // The dropzoneIcon prop should be a fully styled node.
    svgColorClassName: PropTypes.string,
    svgSizeClassName: PropTypes.string,
};

ProductImageUploader.defaultProps = {
    initialSrc: null,
    maxFileSizeMB: 5,
    outputImageSize: 300,
    className: "w-full py-4",
    svgColorClassName: "text-neutral-400 dark:text-neutral-500",
    svgSizeClassName: "w-6 h-6 sm:w-7 sm:h-7",
};

export default memo(ProductImageUploader);