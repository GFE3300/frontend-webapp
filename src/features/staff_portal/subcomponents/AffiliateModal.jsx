import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../../../services/api';
import { useToast } from '../../../contexts/ToastContext';

// Common UI Components
import InputField from '../../../components/common/InputField';
import Button from '../../../components/common/Button';
import Icon from '../../../components/common/Icon';

/**
 * A simple, reusable toggle switch component for the modal form.
 */
const ToggleSwitch = ({ label, enabled, setEnabled, disabled = false }) => (
    <div className="flex items-center">
        <button
            type="button"
            className={`${enabled ? 'bg-primary-600' : 'bg-neutral-200 dark:bg-neutral-600'}
            relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed`}
            onClick={() => setEnabled(!enabled)}
            disabled={disabled}
        >
            <span className="sr-only">{label}</span>
            <span
                className={`${enabled ? 'translate-x-6' : 'translate-x-1'}
                inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
            />
        </button>
        <label className="ml-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</label>
    </div>
);

ToggleSwitch.propTypes = {
    label: PropTypes.string.isRequired,
    enabled: PropTypes.bool.isRequired,
    setEnabled: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
};


/**
 * A modal for creating a new affiliate or editing an existing one.
 * Handles form state, validation, and API interaction.
 */
const AffiliateModal = ({ isOpen, onClose, affiliateToEdit, queryClient }) => {
    const { addToast } = useToast();
    const [formData, setFormData] = useState({ email: '', commission_rate: 10, is_active: true });
    const [errors, setErrors] = useState({});
    const [generatedPassword, setGeneratedPassword] = useState(null);
    const [isCopied, setIsCopied] = useState(false);

    // Effect to reset and populate the form when the modal opens or the affiliate to edit changes.
    useEffect(() => {
        if (isOpen) {
            setGeneratedPassword(null);
            setIsCopied(false);
            setErrors({});
            if (affiliateToEdit) {
                setFormData({
                    // Email is not directly editable but needed for context.
                    email: affiliateToEdit.user_email || '',
                    // Commission rate is stored as a decimal (0.1) but displayed as a percentage (10).
                    commission_rate: affiliateToEdit.commission_rate ? (parseFloat(affiliateToEdit.commission_rate) * 100).toFixed(1) : 10,
                    is_active: affiliateToEdit.is_active,
                });
            } else {
                // Reset to default for creation.
                setFormData({ email: '', commission_rate: 10, is_active: true });
            }
        }
    }, [isOpen, affiliateToEdit]);

    const handleClose = () => {
        // Reset state before closing for a clean next open.
        setGeneratedPassword(null);
        setIsCopied(false);
        onClose();
    };

    const mutation = useMutation({
        mutationFn: (data) => {
            // Convert commission rate from percentage to decimal for the backend.
            const apiPayload = { ...data, commission_rate: parseFloat(data.commission_rate) / 100 };
            
            if (affiliateToEdit) {
                // Update requires sending only editable fields.
                const { email, ...updatePayload } = apiPayload;
                return apiService.patch(`/affiliates/${affiliateToEdit.id}/`, updatePayload);
            }
            return apiService.post('/affiliates/', apiPayload);
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['staff_affiliates'] });

            // Special success state for creation to show the password.
            if (!affiliateToEdit && response.data?.password) {
                addToast('Affiliate created successfully!', 'success');
                setGeneratedPassword(response.data.password);
            } else {
                addToast(`Affiliate ${affiliateToEdit ? 'updated' : 'created'} successfully!`, 'success');
                handleClose(); // Close modal on update or if create doesn't return a password.
            }
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
        setErrors({});
        mutation.mutate(formData);
    };

    const handleCopyPassword = () => {
        if (!generatedPassword) return;
        navigator.clipboard.writeText(generatedPassword).then(() => {
            setIsCopied(true);
            addToast("Password copied to clipboard!", "success");
            setTimeout(() => setIsCopied(false), 2000);
        }).catch(err => {
            addToast("Failed to copy password.", "error");
        });
    };

    // Sub-component for the success view after creation
    const SuccessDisplay = () => (
        <>
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-700 text-center">
                <Icon name="check_circle" className="w-16 h-16 text-green-500 mx-auto mb-3" />
                <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">Affiliate Created</h2>
                <p className="text-sm text-neutral-500 mt-1">A new staff account has been created.</p>
            </div>
            <div className="p-6 space-y-4">
                <InputField label="Affiliate Email" name="email" value={formData.email} readOnly />
                <div>
                    <InputField
                        label="Temporary Password"
                        name="generatedPassword"
                        value={generatedPassword}
                        readOnly
                        adornment={
                            <Button size="sm" variant="ghost" onClick={handleCopyPassword} className="w-24" disabled={isCopied}>
                                <Icon name={isCopied ? "done" : "content_copy"} className="mr-1.5 h-4 w-4" />
                                {isCopied ? "Copied!" : "Copy"}
                            </Button>
                        }
                    />
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Please share this password securely with the affiliate.</p>
                </div>
            </div>
            <div className="p-6 bg-neutral-50 dark:bg-neutral-700/50 rounded-b-xl flex justify-end">
                <Button variant="solid" color="primary" onClick={handleClose}>Done</Button>
            </div>
        </>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl w-full max-w-md m-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {generatedPassword ? (
                            <SuccessDisplay />
                        ) : (
                            <form onSubmit={handleSubmit} noValidate>
                                <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
                                    <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">
                                        {affiliateToEdit ? 'Edit Affiliate' : 'Create New Affiliate'}
                                    </h2>
                                </div>
                                <div className="p-6 pt-12 space-y-12">
                                    <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} required disabled={!!affiliateToEdit} placeholder="new.affiliate@example.com" />
                                    {!!affiliateToEdit && <p className="text-xs -mt-5 ml-1 text-neutral-500">Email cannot be changed after creation.</p>}
                                    <div>
                                        <InputField label="Commission Rate (%)" name="commission_rate" type="number" value={formData.commission_rate} onChange={handleChange} error={errors.commission_rate} required />
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Enter a value between 0 and 100.</p>
                                    </div>
                                    <ToggleSwitch label="Active Status" enabled={formData.is_active} setEnabled={(val) => setFormData(p => ({ ...p, is_active: val }))} disabled={mutation.isPending} />
                                </div>
                                <div className="p-6 bg-neutral-50 dark:bg-neutral-700/50 rounded-b-xl flex justify-end space-x-3">
                                    <Button type="button" variant="ghost" onClick={handleClose} disabled={mutation.isPending}>Cancel</Button>
                                    <Button type="submit" variant="solid" color="primary" isLoading={mutation.isPending}>
                                        {affiliateToEdit ? 'Save Changes' : 'Create Affiliate'}
                                    </Button>
                                </div>
                            </form>
                        )}
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

export default AffiliateModal;