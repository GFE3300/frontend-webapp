import React, { useState, useCallback, useRef, useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../components/common/Icon'; // Assuming a common Icon component exists

// --- Component-Specific Localization (Placeholder) ---
// In a real app, these would come from a central i18n instance.
const scriptLines = {
    changeButton: "Change",
    dropzone: {
        ctaActive: "Drop image to upload",
        ctaDefault: "Drop image here, or click to select",
        fileTypes: "PNG, JPG, or WEBP up to 5MB"
    },
    cropper: {
        title: "Adjust your new photo",
        buttons: {
            save: "Save Photo",
            processing: "Saving...",
            cancel: "Cancel"
        }
    },
    errors: {
        fileTooLarge: "File is too large. Max size: {maxSize}MB.",
        invalidFileType: "Invalid file type. Please upload a PNG, JPG, or WEBP.",
        generic: "File could not be accepted. Please try another.",
        reading: "Error reading the selected file.",
        canvas: "Could not process image.",
        save: "Failed to save cropped image."
    }
};

/**
 * A bespoke image uploader and cropper for user profiles. It handles
 * previewing an existing image, dropping a new one, and cropping it
 * before passing the result to a parent component.
 *
 * @component ProfileImageUploader
 * @param {object} props
 * @param {string|null} props.initialSrc - The URL of the current profile image.
 * @param {function(File|null): void} props.onImageUpload - Callback with the new cropped File object.
 */
const ProfileImageUploader = memo(({ initialSrc, onImageUpload }) => {
    // --- State Management ---
    const [view, setView] = useState('preview'); // 'preview', 'dropzone', 'cropping'
    const [imageSrc, setImageSrc] = useState(null); // For the cropper
    const [crop, setCrop] = useState(null);
    const [completedCrop, setCompletedCrop] = useState(null);
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const imgRef = useRef(null);

    // --- Configuration ---
    const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
    const ACCEPTED_IMAGE_TYPES = { 'image/jpeg': [], 'image/png': [], 'image/webp': [] };
    const OUTPUT_IMAGE_SIZE = 256; // Output a 256x256px image

    const viewAnimation = {
        initial: { opacity: 0, scale: 0.98 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.98 },
        transition: { duration: 0.25, ease: 'easeInOut' }
    };

    // --- Handlers & Callbacks ---
    const resetState = useCallback(() => {
        setImageSrc(null);
        setCrop(null);
        setCompletedCrop(null);
        setError('');
        setIsProcessing(false);
        setView('preview');
    }, []);

    const onFileDrop = useCallback((acceptedFiles, fileRejections) => {
        setError('');
        if (fileRejections.length > 0) {
            const firstError = fileRejections[0].errors[0];
            if (firstError.code === 'file-too-large') {
                setError(scriptLines.errors.fileTooLarge.replace('{maxSize}', '5'));
            } else if (firstError.code === 'file-invalid-type') {
                setError(scriptLines.errors.invalidFileType);
            } else {
                setError(scriptLines.errors.generic);
            }
            return;
        }

        if (acceptedFiles.length > 0) {
            const reader = new FileReader();
            reader.onload = () => {
                setImageSrc(reader.result?.toString() || '');
                setView('cropping');
            };
            reader.onerror = () => setError(scriptLines.errors.reading);
            reader.readAsDataURL(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: onFileDrop,
        accept: ACCEPTED_IMAGE_TYPES,
        maxSize: MAX_FILE_SIZE_BYTES,
        noClick: true, // We have a dedicated button
        noKeyboard: true,
        multiple: false,
    });

    const onImageLoad = useCallback((e) => {
        const { width, height } = e.currentTarget;
        const initialCrop = centerCrop(
            makeAspectCrop({ unit: '%', width: 90 }, 1, width, height),
            width, height
        );
        setCrop(initialCrop);
    }, []);

    const handleSaveCrop = useCallback(async () => {
        if (!completedCrop || !imgRef.current) {
            setError(scriptLines.errors.save);
            return;
        }
        setIsProcessing(true);

        const image = imgRef.current;
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = OUTPUT_IMAGE_SIZE;
        canvas.height = OUTPUT_IMAGE_SIZE;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            setError(scriptLines.errors.canvas);
            setIsProcessing(false);
            return;
        }

        ctx.drawImage(
            image,
            completedCrop.x * scaleX, completedCrop.y * scaleY,
            completedCrop.width * scaleX, completedCrop.height * scaleY,
            0, 0, OUTPUT_IMAGE_SIZE, OUTPUT_IMAGE_SIZE
        );

        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 0.95));
        if (blob) {
            const file = new File([blob], `profile_image_${Date.now()}.png`, { type: 'image/png' });
            onImageUpload(file);
            resetState();
        } else {
            setError(scriptLines.errors.save);
            setIsProcessing(false);
        }
    }, [completedCrop, onImageUpload, resetState]);

    const renderPreview = () => (
        <motion.div key="preview" {...viewAnimation} className="relative group w-32 h-32">
            <img
                src={initialSrc || `https://ui-avatars.com/api/?name=?&background=random&size=128`}
                alt="Current profile"
                className="w-full h-full object-cover rounded-full shadow-md"
            />
            <button
                type="button"
                onClick={() => setView('dropzone')}
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:opacity-100 focus:outline-none"
                aria-label="Change profile picture"
            >
                <Icon name="edit" className="w-8 h-8 text-white" style={{ fontSize: '2rem' }} />
            </button>
        </motion.div>
    );

    const renderDropzone = () => (
        <motion.div key="dropzone" {...viewAnimation}>
            <div
                {...getRootProps()}
                className={`w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center p-4 cursor-pointer transition-colors duration-200
                ${isDragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-neutral-300 dark:border-neutral-600 hover:border-primary-400'}`}
            >
                <input {...getInputProps()} />
                <Icon name={isDragActive ? "cloud_upload" : "add_photo_alternate"} className="w-10 h-10 mb-2 text-neutral-400" />
                <p className="font-semibold text-neutral-700 dark:text-neutral-200">
                    {isDragActive ? scriptLines.dropzone.ctaActive : scriptLines.dropzone.ctaDefault}
                </p>
                <p className="text-xs text-neutral-500 mt-1">{scriptLines.dropzone.fileTypes}</p>
            </div>
            <button type="button" onClick={resetState} className="mt-4 text-sm text-neutral-600 hover:underline">
                {scriptLines.cropper.buttons.cancel}
            </button>
        </motion.div>
    );

    const renderCropper = () => (
        <motion.div key="cropper" {...viewAnimation} className="w-full space-y-4">
            <p className="text-center font-medium text-neutral-700 dark:text-neutral-200">{scriptLines.cropper.title}</p>
            <div className="bg-neutral-200 dark:bg-neutral-900 rounded-lg p-2 max-w-sm mx-auto">
                <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={1}
                    circularCrop
                    minWidth={50}
                >
                    <img ref={imgRef} src={imageSrc} alt="Image to crop" onLoad={onImageLoad} className="max-h-80" />
                </ReactCrop>
            </div>
            <div className="flex justify-center gap-4">
                <button type="button" onClick={resetState} className="px-4 py-2 text-sm font-medium rounded-md bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600">
                    {scriptLines.cropper.buttons.cancel}
                </button>
                <button type="button" onClick={handleSaveCrop} disabled={isProcessing} className="px-4 py-2 text-sm font-medium text-white rounded-md bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 flex items-center gap-2">
                    {isProcessing && <Icon name="progress_activity" className="animate-spin w-4 h-4" />}
                    {isProcessing ? scriptLines.cropper.buttons.processing : scriptLines.cropper.buttons.save}
                </button>
            </div>
        </motion.div>
    );

    return (
        <div className="flex flex-col font-montserrat items-center justify-center space-y-2">
            <AnimatePresence mode="wait">
                {view === 'preview' && renderPreview()}
                {view === 'dropzone' && renderDropzone()}
                {view === 'cropping' && renderCropper()}
            </AnimatePresence>
            {error && <p className="text-xs text-red-500 text-center mt-2">{error}</p>}
        </div>
    );
});

ProfileImageUploader.displayName = 'ProfileImageUploader';

ProfileImageUploader.propTypes = {
    initialSrc: PropTypes.string,
    onImageUpload: PropTypes.func.isRequired,
};

export default ProfileImageUploader;