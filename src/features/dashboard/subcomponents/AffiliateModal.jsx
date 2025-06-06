import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../../../services/api';
import { useToast } from '../../../contexts/ToastContext';
import InputField from '../../../components/common/InputField';
import Button from '../../../components/common/Button';

// A simple toggle switch component
const ToggleSwitch = ({ label, enabled, setEnabled }) => (
    <div className="flex items-center">
        <button
            type="button"
            className={`${enabled ? 'bg-primary-600' : 'bg-neutral-200 dark:bg-neutral-600'}
            relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 focus:ring-primary-500`}
            onClick={() => setEnabled(!enabled)}
        >
            <span className="sr-only">{label}</span>
            <span
                className={`${enabled ? 'translate-x-6' : 'translate-x-1'}
                inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
            />
        </button>
        <span className="ml-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</span>
    </div>
);

const AffiliateModal = ({ isOpen, onClose, affiliateToEdit, queryClient }) => {
    const { addToast } = useToast();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        referral_code: '',
        commission_rate: 10, // UI shows 10 for 10%
        is_active: true,
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen && affiliateToEdit) {
            setFormData({
                name: affiliateToEdit.name || '',
                email: affiliateToEdit.email || '',
                referral_code: affiliateToEdit.referral_code || '',
                commission_rate: parseFloat(affiliateToEdit.commission_rate) * 100, // Convert 0.1 to 10
                is_active: affiliateToEdit.is_active,
            });
            setErrors({});
        } else if (isOpen) {
            // Reset for "Create"
            setFormData({
                name: '', email: '', referral_code: '', commission_rate: 10, is_active: true,
            });
            setErrors({});
        }
    }, [isOpen, affiliateToEdit]);

    const mutation = useMutation({
        mutationFn: (data) => {
            const apiPayload = {
                ...data,
                commission_rate: parseFloat(data.commission_rate) / 100, // Convert 10 to 0.1 for API
            };
            if (affiliateToEdit) {
                return apiService.put(`/affiliates/${affiliateToEdit.id}/`, apiPayload);
            }
            return apiService.post('/affiliates/', apiPayload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['affiliates']);
            addToast(`Affiliate ${affiliateToEdit ? 'updated' : 'created'} successfully!`, 'success');
            onClose();
        },
        onError: (error) => {
            const errorData = error.response?.data;
            if (errorData && typeof errorData === 'object') {
                setErrors(errorData);
                addToast('Please correct the errors below.', 'error');
            } else {
                addToast(error.message || 'An unexpected error occurred.', 'error');
            }
        },
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({}); // Clear old errors
        mutation.mutate(formData);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl w-full max-w-md m-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <form onSubmit={handleSubmit} noValidate>
                            <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
                                <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">
                                    {affiliateToEdit ? 'Edit Affiliate' : 'Create New Affiliate'}
                                </h2>
                            </div>
                            <div className="p-6 space-y-6">
                                <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} error={errors.name} required />
                                <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} required />
                                <InputField label="Referral Code" name="referral_code" value={formData.referral_code} onChange={handleChange} error={errors.referral_code} required />
                                <div>
                                    <InputField label="Commission Rate (%)" name="commission_rate" type="number" value={formData.commission_rate} onChange={handleChange} error={errors.commission_rate} required />
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Enter a value between 0 and 100.</p>
                                </div>
                                <ToggleSwitch label="Active Status" enabled={formData.is_active} setEnabled={(val) => setFormData(p => ({ ...p, is_active: val }))} />
                            </div>
                            <div className="p-6 bg-neutral-50 dark:bg-neutral-700/50 rounded-b-xl flex justify-end space-x-3">
                                <Button type="button" variant="ghost" onClick={onClose} disabled={mutation.isPending}>Cancel</Button>
                                <Button type="submit" variant="solid" color="primary" isLoading={mutation.isPending}>
                                    {affiliateToEdit ? 'Save Changes' : 'Create Affiliate'}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

AffiliateModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    affiliateToEdit: PropTypes.object,
    queryClient: PropTypes.object.isRequired,
};

ToggleSwitch.propTypes = {
    label: PropTypes.string.isRequired,
    enabled: PropTypes.bool.isRequired,
    setEnabled: PropTypes.func.isRequired,
};

export default AffiliateModal;