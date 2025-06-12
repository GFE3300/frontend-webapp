// src/features/settings_menu/components/ProfileImageUploader.jsx

import React, { useState, useCallback, useRef, useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../components/common/Icon';

const scriptLines = {
    changeButton: "Change",
    clearButton: "Clear",
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

const ProfileImageUploader = memo(({ initialSrc, onImageUpload }) => {
    const [view, setView] = useState('preview');
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState(null);
    const [completedCrop, setCompletedCrop] = useState(null);
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const imgRef = useRef(null);
    const [croppedPreview, setCroppedPreview] = useState(null);

    const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
    const ACCEPTED_IMAGE_TYPES = { 'image/jpeg': [], 'image/png': [], 'image/webp': [] };
    const OUTPUT_IMAGE_SIZE = 256;

    const viewAnimation = {
        initial: { opacity: 0, scale: 0.98 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.98 },
        transition: { duration: 0.25, ease: 'easeInOut' }
    };

    const clearLocalState = useCallback(() => {
        if (croppedPreview) {
            URL.revokeObjectURL(croppedPreview);
        }
        setCroppedPreview(null);
        setImageSrc(null);
        setCrop(null);
        setCompletedCrop(null);
        setError('');
        setIsProcessing(false);
        setView('preview');
        onImageUpload(null);
    }, [croppedPreview, onImageUpload]);

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
        // --- KEY CHANGE: Removed `noClick: true` ---
        // This allows the dropzone to be clickable. The default is `false`.
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
            setError(scriptLines.errors.save); return;
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
            setError(scriptLines.errors.canvas); setIsProcessing(false); return;
        }
        ctx.drawImage(image, completedCrop.x * scaleX, completedCrop.y * scaleY, completedCrop.width * scaleX, completedCrop.height * scaleY, 0, 0, OUTPUT_IMAGE_SIZE, OUTPUT_IMAGE_SIZE);
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 0.95));
        if (blob) {
            const file = new File([blob], `profile_image_${Date.now()}.png`, { type: 'image/png' });
            onImageUpload(file);
            if (croppedPreview) {
                URL.revokeObjectURL(croppedPreview);
            }
            setCroppedPreview(URL.createObjectURL(blob));
            setImageSrc(null); setCrop(null); setCompletedCrop(null); setIsProcessing(false); setView('preview');
        } else {
            setError(scriptLines.errors.save); setIsProcessing(false);
        }
    }, [completedCrop, onImageUpload, croppedPreview]);

    useEffect(() => {
        return () => {
            if (croppedPreview) {
                URL.revokeObjectURL(croppedPreview);
            }
        };
    }, [croppedPreview]);

    const renderPreview = () => (
        <motion.div key="preview" {...viewAnimation} className="relative w-32 h-32">
            <img
                src={croppedPreview || initialSrc || `https://ui-avatars.com/api/?name=?&background=random&size=128`}
                alt="Profile preview"
                className="w-full h-full object-cover rounded-full shadow-md"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
                <button type="button" onClick={() => setView('dropzone')} className="p-2 text-white hover:bg-white/20 rounded-full" aria-label="Change profile picture">
                    <Icon name="edit" className="w-7 h-7" />
                </button>
                {croppedPreview && (
                    <button type="button" onClick={clearLocalState} className="p-2 text-white hover:bg-white/20 rounded-full" aria-label="Clear new profile picture">
                        <Icon name="close" className="w-7 h-7" />
                    </button>
                )}
            </div>
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
            <button type="button" onClick={() => setView('preview')} className="mt-4 text-sm text-neutral-600 hover:underline">
                {scriptLines.cropper.buttons.cancel}
            </button>
        </motion.div>
    );

    const renderCropper = () => (
        <motion.div key="cropper" {...viewAnimation} className="w-full space-y-4">
            <p className="text-center font-medium text-neutral-700 dark:text-neutral-200">{scriptLines.cropper.title}</p>
            <div className="bg-neutral-200 dark:bg-neutral-900 rounded-lg p-2 max-w-sm mx-auto">
                <ReactCrop crop={crop} onChange={(_, percentCrop) => setCrop(percentCrop)} onComplete={(c) => setCompletedCrop(c)} aspect={1} circularCrop minWidth={50}>
                    <img ref={imgRef} src={imageSrc} alt="Image to crop" onLoad={onImageLoad} className="max-h-80" />
                </ReactCrop>
            </div>
            <div className="flex justify-center gap-4">
                <button type="button" onClick={() => setView('dropzone')} className="px-4 py-2 text-sm font-medium rounded-md bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600">
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
ProfileImageUploader.propTypes = { initialSrc: PropTypes.string, onImageUpload: PropTypes.func.isRequired };
export default ProfileImageUploader;