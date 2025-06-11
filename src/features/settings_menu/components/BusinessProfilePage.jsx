import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useBusinessDetails } from '../hooks/useBusinessDetails';
import { useUpdateBusiness } from '../hooks/useUpdateBusiness';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '../../../contexts/ToastContext';
import apiService from '../../../services/api';
import { getErrorMessage } from '../../../utils/getErrorMessage';

// Reusable Components
import Step1LocationWrapper from '../../register/stages/Step1Location';
import InputField from '../../../components/common/InputField';
import Button from '../../../components/common/Button';
import { ImageUploader } from '../../register/subcomponents';
import Spinner from '../../../components/common/Spinner';

const BusinessProfilePage = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const { data: businessData, isLoading: isLoadingDetails, isError } = useBusinessDetails();
    const updateBusinessMutation = useUpdateBusiness();

    const uploadLogoMutation = useMutation({
        mutationFn: ({ businessId, logoFile }) => apiService.uploadBusinessLogo(businessId, logoFile),
        onSuccess: () => addToast('Logo updated successfully!', 'success'),
        onError: (error) => addToast(getErrorMessage(error, 'Failed to upload logo.'), 'error'),
    });

    const [formData, setFormData] = useState(null);
    const [logoFile, setLogoFile] = useState(null);

    useEffect(() => {
        if (businessData) {
            setFormData({
                name: businessData.name || '',
                phone: businessData.phone || '',
                website: businessData.website || '',
                description: businessData.description || '',
                address: {
                    street: businessData.address_street || '',
                    city: businessData.address_city || '',
                    state: businessData.address_state || '',
                    postalCode: businessData.address_postal_code || '',
                    country: businessData.address_country || '',
                    formattedAddress: businessData.address_formatted || '',
                },
                locationCoords: {
                    lat: businessData.latitude ? parseFloat(businessData.latitude) : null,
                    lng: businessData.longitude ? parseFloat(businessData.longitude) : null,
                }
            });
        }
    }, [businessData]);

    const handleInputChange = useCallback((e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    }, []);

    const updateFormField = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleSaveChanges = () => {
        const payload = {};

        if (formData.name !== businessData.name) payload.name = formData.name;
        if (formData.phone !== (businessData.phone || '')) payload.phone = formData.phone;
        if (formData.website !== (businessData.website || '')) payload.website = formData.website;
        if (formData.description !== (businessData.description || '')) payload.description = formData.description;
        if (formData.address.street !== (businessData.address_street || '')) payload.address_street = formData.address.street;
        if (formData.address.city !== (businessData.address_city || '')) payload.address_city = formData.address.city;
        if (formData.address.state !== (businessData.address_state || '')) payload.address_state = formData.address.state;
        if (formData.address.postalCode !== (businessData.address_postal_code || '')) payload.address_postal_code = formData.address.postalCode;
        if (formData.address.country !== (businessData.address_country || '')) payload.address_country = formData.address.country;
        if (formData.address.formattedAddress !== (businessData.address_formatted || '')) payload.address_formatted = formData.address.formattedAddress;
        if (formData.locationCoords?.lat && parseFloat(formData.locationCoords.lat) !== parseFloat(businessData.latitude)) payload.latitude = formData.locationCoords.lat;
        if (formData.locationCoords?.lng && parseFloat(formData.locationCoords.lng) !== parseFloat(businessData.longitude)) payload.longitude = formData.locationCoords.lng;

        let hasChanges = Object.keys(payload).length > 0;

        if (hasChanges) {
            updateBusinessMutation.mutate({ businessId: user.activeBusinessId, payload });
        }

        if (logoFile) {
            uploadLogoMutation.mutate({ businessId: user.activeBusinessId, logoFile });
            hasChanges = true;
        }

        if (!hasChanges && !logoFile) {
            addToast("No changes to save.", "info");
        }
    };

    if (isLoadingDetails) {
        return <div className="p-8 text-center"><Spinner size="lg" /></div>;
    }

    if (isError || !formData) {
        return <div className="p-8 text-center text-red-500">Failed to load business profile.</div>;
    }

    return (
        <div className="space-y-8">
            <header>
                <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100">Business Profile</h2>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    Manage your business's public information and location settings.
                </p>
            </header>

            <div className="bg-white dark:bg-neutral-800 shadow-sm rounded-xl p-6 md:p-8 space-y-6">
                <InputField id="name" label="Business Name" value={formData.name} onChange={handleInputChange} />
                <InputField id="website" label="Website" value={formData.website} onChange={handleInputChange} placeholder="https://yourbusiness.com" />
                <InputField id="phone" label="Public Phone Number" type="tel" value={formData.phone} onChange={handleInputChange} />
                <InputField id="description" label="Business Description" type="textarea" value={formData.description} onChange={handleInputChange} rows={4} />
            </div>

            <div className="bg-white dark:bg-neutral-800 shadow-sm rounded-xl p-6 md:p-8">
                <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-4">Business Logo</h3>
                <ImageUploader
                    initialSrc={businessData.logo_url}
                    onImageUpload={setLogoFile}
                    circularCrop={false}
                    aspectRatio={16 / 9}
                />
            </div>

            <div className="bg-white dark:bg-neutral-800 shadow-sm rounded-xl p-6 md:p-8">
                <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-4">Location & Address</h3>
                <Step1LocationWrapper
                    formData={formData}
                    updateField={updateFormField}
                />
            </div>

            <div className="flex justify-end pt-4">
                <Button
                    onClick={handleSaveChanges}
                    isLoading={updateBusinessMutation.isPending || uploadLogoMutation.isPending}
                >
                    Save All Changes
                </Button>
            </div>
        </div>
    );
};

export default BusinessProfilePage;