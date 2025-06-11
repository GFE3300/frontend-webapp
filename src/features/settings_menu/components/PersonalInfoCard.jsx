// File: src/features/settings_menu/components/PersonalInfoCard.jsx

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { useUpdateProfile } from '../hooks/useUpdateProfile';
import apiService from '../../../services/api';
import { getErrorMessage } from '../../../utils/getErrorMessage';

// UI Component Imports
import InputField from '../../../components/common/InputField';
import Dropdown from '../../../components/common/Dropdown';
import Button from '../../../components/common/Button';
import { ImageUploader } from '../../register/subcomponents';

const PersonalInfoCard = ({ user }) => {
    const [formData, setFormData] = useState({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        language: user.language || 'en'
    });
    const [profileImageFile, setProfileImageFile] = useState(null);

    const { addToast } = useToast();
    const { updateUser } = useAuth();
    const updateProfileMutation = useUpdateProfile();

    const uploadImageMutation = useMutation({
        mutationFn: (imageFile) => apiService.uploadUserProfileImage(imageFile),
        onSuccess: (response) => {
            updateUser(response.data);
            setProfileImageFile(null);
            addToast("Profile picture updated!", "success");
        },
        onError: (error) => {
            const errorMessage = getErrorMessage(error, 'Failed to upload profile picture.');
            addToast(errorMessage, 'error');
        }
    });

    const hasDataChanges =
        formData.first_name !== user.first_name ||
        formData.last_name !== user.last_name ||
        formData.phone !== (user.phone || '') ||
        formData.language !== user.language;

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleLanguageChange = (selectedValue) => {
        setFormData(prev => ({ ...prev, language: selectedValue }));
    };

    const handleSaveChanges = () => {
        const payload = {};

        if (hasDataChanges) {
            if (formData.first_name !== user.first_name) payload.first_name = formData.first_name;
            if (formData.last_name !== user.last_name) payload.last_name = formData.last_name;
            if (formData.phone !== (user.phone || '')) payload.phone = formData.phone;
            if (formData.language !== user.language) payload.language = formData.language;

            if (Object.keys(payload).length > 0) {
                updateProfileMutation.mutate(payload);
            }
        }

        if (profileImageFile) {
            uploadImageMutation.mutate(profileImageFile);
        }

        if (!hasDataChanges && !profileImageFile) {
            addToast("No changes to save.", "info");
        }
    };

    const languageOptions = [
        { value: 'en', label: 'English' },
        { value: 'es', label: 'Español (Spanish)' },
        { value: 'pt', label: 'Português (Portuguese)' },
    ];

    return (
        <div className="bg-white dark:bg-neutral-800 shadow-sm rounded-xl">
            <div className="p-6 md:p-8 border-b border-neutral-200 dark:border-neutral-700">
                <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
                    Personal Information
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    Update your photo and personal details here.
                </p>
            </div>
            <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Your Photo</label>
                    <ImageUploader
                        initialSrc={user.profile_image_url}
                        onImageUpload={setProfileImageFile}
                        circularCrop={true}
                    />
                </div>
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <InputField
                        id="first_name"
                        label="First Name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                    />
                    <InputField
                        id="last_name"
                        label="Last Name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                    />
                    <div className="sm:col-span-2">
                        <InputField
                            id="email"
                            label="Email Address"
                            value={user.email}
                            disabled={true}
                            helptext="Your email address cannot be changed."
                        />
                    </div>
                    <InputField
                        id="phone"
                        label="Phone Number"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="e.g., +1 555-123-4567"
                    />
                    <Dropdown
                        label="Language"
                        options={languageOptions}
                        value={formData.language}
                        onChange={handleLanguageChange}
                    />
                </div>
            </div>
            <div className="p-6 md:px-8 bg-neutral-50 dark:bg-neutral-800/50 rounded-b-xl flex justify-end">
                <Button
                    onClick={handleSaveChanges}
                    disabled={!hasDataChanges && !profileImageFile}
                    isLoading={updateProfileMutation.isPending || uploadImageMutation.isPending}
                >
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