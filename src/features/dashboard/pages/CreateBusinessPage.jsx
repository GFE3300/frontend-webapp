import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../contexts/ToastContext';
import apiService from '../../../services/api';
import { queryKeys } from '../../../services/queryKeys';
import Icon from '../../../components/common/Icon';
import Button from '../../../components/common/Button';
import InputField from '../../../components/common/InputField';

const CreateBusinessPage = () => {
    const [businessName, setBusinessName] = useState('');
    const [businessEmail, setBusinessEmail] = useState('');
    const [businessPhone, setBusinessPhone] = useState('');

    const navigate = useNavigate();
    const { addToast } = useToast();
    const queryClient = useQueryClient();

    const createBusinessMutation = useMutation({
        mutationFn: (newBusinessData) => apiService.createBusiness(newBusinessData),
        onSuccess: (data) => {
            addToast(`Business "${data.data.name}" created successfully!`, 'success');
            // Invalidate the query for the user's list of businesses
            // so the BusinessSwitcher will show the new one.
            queryClient.invalidateQueries({ queryKey: queryKeys.myBusinesses });
            // Navigate back to the main dashboard
            navigate('/dashboard/business/overview');
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.error || 'Failed to create business. Please try again.';
            addToast(errorMessage, 'error');
            console.error("Create business error:", error);
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!businessName.trim()) {
            addToast('Business name is required.', 'warning');
            return;
        }
        createBusinessMutation.mutate({
            name: businessName,
            email: businessEmail,
            phone: businessPhone,
        });
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                    Create a New Business
                </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    Add another business to your account. This will count towards your subscription's business limit.
                </p>
            </header>

            <div className="bg-white dark:bg-neutral-800 shadow-lg rounded-xl p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <InputField
                        label="Business Name"
                        id="businessName"
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g., The Artisan Cafe"
                        required
                        maxLength={255}
                    />
                    <InputField
                        label="Business Email (Optional)"
                        id="businessEmail"
                        type="email"
                        value={businessEmail}
                        onChange={(e) => setBusinessEmail(e.target.value)}
                        placeholder="contact@yourbusiness.com"
                    />
                    <InputField
                        label="Business Phone (Optional)"
                        id="businessPhone"
                        type="tel"
                        value={businessPhone}
                        onChange={(e) => setBusinessPhone(e.target.value)}
                        placeholder="+1 (555) 123-4567"
                    />

                    <div className="pt-6 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/dashboard/business/overview')}
                            disabled={createBusinessMutation.isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="solid"
                            color="primary"
                            isLoading={createBusinessMutation.isLoading}
                        >
                            <Icon name="add_business" className="mr-2 h-5 w-5" />
                            Create Business
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateBusinessPage;