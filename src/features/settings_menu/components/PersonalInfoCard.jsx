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
import ProfileImageUploader from './ProfileImageUploader';

const PersonalInfoCard = ({ user }) => {
    // --- State Management ---
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        language: 'en'
    });
    const [profileImageFile, setProfileImageFile] = useState(null);

    // THE FIX: Add a state flag to track if the initial data sync has occurred.
    const [isDataSynced, setIsDataSynced] = useState(false);

    // --- Hooks ---
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
        onError: (error) => addToast(getErrorMessage(error, 'Failed to upload profile picture.'), 'error')
    });

    // --- Data Synchronization ---
    // This effect now reliably populates the state and then flags that it's safe to render the inputs.
    useEffect(() => {
        if (user && !isDataSynced) { // Only run the sync logic once when user data arrives.
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                phone: user.phone || '',
                language: user.language || 'en'
            });
            setIsDataSynced(true); // Mark data as synced.
        }
    }, [user, isDataSynced]); // Depend on user and the sync flag.

    // --- Derived State for UI Logic ---
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
    const handleInputChange = useCallback((e) => setFormData(prev => ({ ...prev, [e.target.id]: e.target.value })), []);
    const handleLanguageChange = useCallback((value) => setFormData(prev => ({ ...prev, language: value })), []);

    const handleSaveChanges = () => {
        const payload = {};
        if (hasDataChanges) {
            if (formData.first_name !== (user.first_name || '')) payload.first_name = formData.first_name;
            if (formData.last_name !== (user.last_name || '')) payload.last_name = formData.last_name;
            if (formData.phone !== (user.phone || '')) payload.phone = formData.phone;
            if (formData.language !== (user.language || 'en')) payload.language = formData.language;
        }
        if (Object.keys(payload).length > 0) updateProfileMutation.mutate(payload);
        if (profileImageFile) uploadImageMutation.mutate(profileImageFile);
        if (Object.keys(payload).length === 0 && !profileImageFile) addToast("No changes to save.", "info");
    };

    const languageOptions = [{ value: 'en', label: 'English' }, { value: 'es', label: 'Español (Spanish)' }, { value: 'pt', label: 'Português (Portuguese)' }];

    return (
        <div className="bg-white/10 dark:bg-neutral-800/50 backdrop-blur-xl border border-white/20 dark:border-neutral-700 shadow-lg rounded-xl">
            <div className="p-6 md:p-8 border-b border-white/10 dark:border-neutral-700">
                <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">Personal Information</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Update your photo and personal details here.</p>
            </div>
            <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 flex flex-col items-center">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 w-full text-center">Your Photo</label>
                    <ProfileImageUploader initialSrc={user?.profile_image_url} onImageUpload={setProfileImageFile} />
                </div>
                {/* THE FIX: Conditionally render the form inputs only after data is synced. */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-6">
                    {isDataSynced ? (
                        <>
                            <InputField id="first_name" label="First Name" value={formData.first_name} onChange={handleInputChange} />
                            <InputField id="last_name" label="Last Name" value={formData.last_name} onChange={handleInputChange} />
                            <div className="sm:col-span-2">
                                <InputField id="email" label="Email Address" value={user?.email || ''} disabled={true} helptext="Your email address cannot be changed." />
                            </div>
                            <InputField id="phone" label="Phone Number" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="e.g., +1 555-123-4567" />
                            <Dropdown label="Language" value={formData.language} onChange={handleLanguageChange} options={languageOptions} />
                        </>
                    ) : (
                        // Optional: Show a lightweight skeleton loader while waiting for the sync.
                        <div className="sm:col-span-2 space-y-6 animate-pulse">
                            <div className="h-9 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
                            <div className="h-9 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
                        </div>
                    )}
                </div>
            </div>
            <div className="p-6 md:px-8 bg-black/5 dark:bg-neutral-900/40 rounded-b-xl flex justify-end">
                <Button onClick={handleSaveChanges} disabled={isSaveDisabled || isSaveLoading} isLoading={isSaveLoading}>Save Changes</Button>
            </div>
        </div>
    );
};

PersonalInfoCard.propTypes = {
    user: PropTypes.object,
};

PersonalInfoCard.defaultProps = {
    user: null,
};

export default PersonalInfoCard;