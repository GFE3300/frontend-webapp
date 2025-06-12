import { useState, useEffect, useMemo, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../contexts/ToastContext';
import { useUpdateBusiness } from './useUpdateBusiness';
import apiService from '../../../services/api';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { scriptLines_dashboard as sl } from '../../dashboard/utils/script_lines';

// A simple deep equality check for nested objects (address, location)
// This is more reliable than JSON.stringify for comparing objects with different key orders.
const deepEqual = (obj1, obj2) => {
    if (obj1 === obj2) return true;
    if (obj1 === null || obj1 === undefined || obj2 === null || obj2 === undefined) return obj1 === obj2;
    if (obj1.constructor !== obj2.constructor) return false;

    if (obj1 instanceof Object && obj2 instanceof Object) {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        if (keys1.length !== keys2.length) return false;
        for (const key of keys1) {
            if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
                return false;
            }
        }
        return true;
    }
    return false;
};

/**
 * Manages the state and submission logic for the Business Profile form.
 * @param {object | null} initialData - The initial business data from the API.
 * @returns {object} The state and handlers for the form.
 */
export const useBusinessProfileForm = (initialData) => {
    const { addToast } = useToast();
    const queryClient = useQueryClient();

    // --- State ---
    const [formData, setFormData] = useState(null);
    const [logoFile, setLogoFile] = useState(null);

    // --- Mutations ---
    const updateBusinessMutation = useUpdateBusiness();
    const uploadLogoMutation = useMutation({
        mutationFn: ({ businessId, logoFile }) => apiService.uploadBusinessLogo(businessId, logoFile),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['businessDetails', variables.businessId] });
            // The success toast is now localizable.
            addToast(sl.businessProfileCard.toastLogoSuccess || 'Logo updated successfully!', 'success');
        },
        onError: (error) => {
            addToast(getErrorMessage(error, sl.businessProfileCard.toastLogoError || 'Failed to upload logo.'), 'error');
        },
    });

    // --- Effects ---
    // Initialize form data when initialData is loaded
    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                phone: initialData.phone || '',
                website: initialData.website || '',
                description: initialData.description || '',
                address: {
                    street: initialData.address_street || '',
                    city: initialData.address_city || '',
                    state: initialData.address_state || '',
                    postalCode: initialData.address_postal_code || '',
                    country: initialData.address_country || '',
                    formattedAddress: initialData.address_formatted || '',
                },
                locationCoords: {
                    lat: initialData.latitude ? parseFloat(initialData.latitude) : null,
                    lng: initialData.longitude ? parseFloat(initialData.longitude) : null,
                },
            });
            // Reset the logo file when initial data changes to prevent accidental re-uploads
            setLogoFile(null);
        }
    }, [initialData]);

    // --- Memoized Derived State ---
    const isDirty = useMemo(() => {
        if (!initialData || !formData) return false;
        if (logoFile) return true; // A new logo file always marks the form as dirty

        const initialFormState = {
            name: initialData.name || '',
            phone: initialData.phone || '',
            website: initialData.website || '',
            description: initialData.description || '',
            address: {
                street: initialData.address_street || '',
                city: initialData.address_city || '',
                state: initialData.address_state || '',
                postalCode: initialData.address_postal_code || '',
                country: initialData.address_country || '',
                formattedAddress: initialData.address_formatted || '',
            },
            locationCoords: {
                lat: initialData.latitude ? parseFloat(initialData.latitude) : null,
                lng: initialData.longitude ? parseFloat(initialData.longitude) : null,
            },
        };

        return !deepEqual(formData, initialFormState);
    }, [formData, initialData, logoFile]);

    const isLoading = updateBusinessMutation.isPending || uploadLogoMutation.isPending;

    // --- Handlers ---
    const updateField = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleSaveChanges = useCallback(() => {
        if (!isDirty) {
            addToast(sl.businessProfileCard.toastNoChanges || "No changes to save.", "info");
            return;
        }

        const payload = {};
        if (formData.name !== (initialData.name || '')) payload.name = formData.name;
        if (formData.phone !== (initialData.phone || '')) payload.phone = formData.phone;
        if (formData.website !== (initialData.website || '')) payload.website = formData.website;
        if (formData.description !== (initialData.description || '')) payload.description = formData.description;
        if (formData.address.street !== (initialData.address_street || '')) payload.address_street = formData.address.street;
        if (formData.address.city !== (initialData.address_city || '')) payload.address_city = formData.address.city;
        if (formData.address.state !== (initialData.address_state || '')) payload.address_state = formData.address.state;
        if (formData.address.postalCode !== (initialData.address_postal_code || '')) payload.address_postal_code = formData.address.postalCode;
        if (formData.address.country !== (initialData.address_country || '')) payload.address_country = formData.address.country;
        if (formData.address.formattedAddress !== (initialData.address_formatted || '')) payload.address_formatted = formData.address.formattedAddress;

        // Ensure we handle float comparison carefully and only send if changed
        const newLat = formData.locationCoords?.lat ? parseFloat(formData.locationCoords.lat.toFixed(6)) : null;
        const oldLat = initialData.latitude ? parseFloat(parseFloat(initialData.latitude).toFixed(6)) : null;
        if (newLat !== oldLat) payload.latitude = newLat;

        const newLng = formData.locationCoords?.lng ? parseFloat(formData.locationCoords.lng.toFixed(6)) : null;
        const oldLng = initialData.longitude ? parseFloat(parseFloat(initialData.longitude).toFixed(6)) : null;
        if (newLng !== oldLng) payload.longitude = newLng;


        if (Object.keys(payload).length > 0) {
            updateBusinessMutation.mutate({ businessId: initialData.id, payload });
        }

        if (logoFile) {
            uploadLogoMutation.mutate({ businessId: initialData.id, logoFile });
        }
    }, [isDirty, formData, initialData, logoFile, addToast, updateBusinessMutation, uploadLogoMutation]);


    return {
        formData,
        setFormData, // For complex state changes like in the map component
        updateField, // For simple input fields
        logoFile,
        setLogoFile, // For the ImageUploader
        isDirty,
        isLoading,
        handleSaveChanges,
    };
};