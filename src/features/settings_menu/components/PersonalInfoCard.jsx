// FILE: src/features/settings_menu/components/PersonalInfoCard.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@tanstack/react-query';

import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { useUpdateProfile } from '../hooks/useUpdateProfile';
import apiService from '../../../services/api';
import { getErrorMessage } from '../../../utils/getErrorMessage';

// UI Component Imports
import InputField from '../../../components/common/InputField';
import Button from '../../../components/common/Button';
import { Dropdown } from '../../register/subcomponents';
import ProfileImageUploader from './ProfileImageUploader'; // The new, bespoke uploader

/**
 * A self-contained card for managing a user's personal information.
 * It is controlled by the `user` prop but manages its own internal form
 * state, validation, and API mutations for updates, ensuring a robust
 * and encapsulated user experience.
 */
const PersonalInfoCard = ({ user }) => {
    // --- State Management ---
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        language: 'en'
    });
    const [profileImageFile, setProfileImageFile] = useState(null);

    // --- Hooks ---
    const { addToast } = useToast();
    const { updateUser } = useAuth(); // To update the context after ANY profile change.
    const updateProfileMutation = useUpdateProfile(); // For text field updates.

    // --- Critical Fix: Data Synchronization ---
    // This effect syncs the local form state with the user object received
    // from the parent. It runs whenever the `user` prop changes, solving
    // the "empty fields" bug by populating the form after data loads.
    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                phone: user.phone || '',
                language: user.language || 'en'
            });
        }
    }, [user]);

    // --- API Mutations ---
    // A separate mutation for handling only the image upload.
    const uploadImageMutation = useMutation({
        mutationFn: (imageFile) => apiService.uploadUserProfileImage(imageFile),
        onSuccess: (response) => {
            // CRUCIAL: Update the AuthContext with the new user data (containing the new URL).
            // This ensures the avatar in the header and this component updates instantly.
            updateUser(response.data);
            setProfileImageFile(null); // Clear the file state after successful upload.
            addToast("Profile picture updated!", "success");
        },
        onError: (error) => {
            const errorMessage = getErrorMessage(error, 'Failed to upload profile picture.');
            addToast(errorMessage, 'error');
        }
    });

    // --- Derived State for UI Logic ---
    // Memoized check to see if any form data has changed from the original.
    const hasDataChanges = useMemo(() => {
        if (!user) return false;
        return (
            formData.first_name !== (user.first_name || '') ||
            formData.last_name !== (user.last_name || '') ||
            formData.phone !== (user.phone || '') ||
            formData.language !== (user.language || 'en')
        );
    }, [formData, user]);

    const isSaveDisabled = !hasDataChanges && !profileImageFile;
    const isSaveLoading = updateProfileMutation.isPending || uploadImageMutation.isPending;

    // --- Handlers ---
    const handleInputChange = useCallback((e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    }, []);

    const handleLanguageChange = useCallback((selectedValue) => {
        setFormData(prev => ({ ...prev, language: selectedValue }));
    }, []);

    // Intelligent save handler that only sends changed data.
    const handleSaveChanges = () => {
        const payload = {};

        // 1. Build a payload of only the fields that have changed.
        if (hasDataChanges) {
            if (formData.first_name !== (user.first_name || '')) payload.first_name = formData.first_name;
            if (formData.last_name !== (user.last_name || '')) payload.last_name = formData.last_name;
            if (formData.phone !== (user.phone || '')) payload.phone = formData.phone;
            if (formData.language !== (user.language || 'en')) payload.language = formData.language;
        }

        // 2. Conditionally trigger mutations.
        if (Object.keys(payload).length > 0) {
            updateProfileMutation.mutate(payload);
        }
        if (profileImageFile) {
            uploadImageMutation.mutate(profileImageFile);
        }

        // 3. Provide feedback if there's nothing to save.
        if (Object.keys(payload).length === 0 && !profileImageFile) {
            addToast("No changes to save.", "info");
        }
    };

    const languageOptions = [
        { value: 'en', label: 'English' },
        { value: 'es', label: 'Español (Spanish)' },
        { value: 'pt', label: 'Português (Portuguese)' },
    ];

    return (
        <div className="bg-white/10 dark:bg-neutral-800/50 backdrop-blur-xl border border-white/20 dark:border-neutral-700 shadow-lg rounded-xl">
            {/* Header Section */}
            <div className="p-6 md:p-8 border-b border-white/10 dark:border-neutral-700">
                <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
                    Personal Information
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    Update your photo and personal details here.
                </p>
            </div>

            {/* Content Section */}
            <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 flex flex-col items-center">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 w-full text-center">Your Photo</label>
                    <ProfileImageUploader
                        initialSrc={user?.profile_image_url}
                        onImageUpload={setProfileImageFile}
                    />
                </div>
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-6">
                    <InputField id="first_name" label="First Name" value={formData.first_name} onChange={handleInputChange} />
                    <InputField id="last_name" label="Last Name" value={formData.last_name} onChange={handleInputChange} />
                    <div className="sm:col-span-2">
                        <InputField id="email" label="Email Address" value={user?.email || ''} disabled={true} helptext="Your email address cannot be changed." />
                    </div>
                    <InputField id="phone" label="Phone Number" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="e.g., +1 555-123-4567" />
                    <Dropdown
                        label="Language"
                        value={formData.language}
                        onChange={handleLanguageChange}
                        options={languageOptions}
                    />
                </div>
            </div>

            {/* Footer Section */}
            <div className="p-6 md:px-8 bg-black/5 dark:bg-neutral-900/40 rounded-b-xl flex justify-end">
                <Button onClick={handleSaveChanges} disabled={isSaveDisabled || isSaveLoading} isLoading={isSaveLoading}>
                    Save Changes
                </Button>
            </div>
        </div>
    );
};

PersonalInfoCard.propTypes = {
    user: PropTypes.object.isRequired,
};

export default PersonalInfoCard;