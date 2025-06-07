import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiService from '../../../../services/api';
import Spinner from '../../../../components/common/Spinner';
import Icon from '../../../../components/common/Icon';
import Button from '../../../../components/common/Button';
import AffiliatesTable from '../../subcomponents/AffiliatesTable';
import AffiliateModal from '../../subcomponents/AffiliateModal';

const AffiliatesPage = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAffiliate, setEditingAffiliate] = useState(null);

    const { data: affiliatesData, isLoading, isError, error } = useQuery({
        queryKey: ['staff_affiliates'], // This key correctly scopes the data.
        queryFn: () => apiService.get('/staff/affiliates/'),
    });

    const handleCreateClick = () => {
        setEditingAffiliate(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (affiliate) => {
        setEditingAffiliate(affiliate);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingAffiliate(null);
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <Spinner size="lg" />
                    <p className="ml-3 text-neutral-600 dark:text-neutral-300">Loading affiliates...</p>
                </div>
            );
        }

        if (isError) {
            return (
                <div className="p-6 text-center bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
                    <Icon name="error_outline" className="mx-auto text-red-500 h-12 w-12 mb-3" />
                    <p className="text-red-700 dark:text-red-300 font-semibold mb-1">Failed to load affiliates.</p>
                    <p className="text-sm text-red-600 dark:text-red-400">{error.response?.data?.detail || error.message || "An unexpected error occurred."}</p>
                </div>
            );
        }

        return (
            <AffiliatesTable
                affiliates={affiliatesData?.data || []}
                onEdit={handleEditClick}
            />
        );
    };

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">Affiliate Management</h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        Create, view, and manage your affiliate partners.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <Button
                        variant="solid"
                        color="primary"
                        onClick={handleCreateClick}
                    >
                        <Icon name="add_circle" className="mr-2 h-5 w-5" />
                        Create Affiliate
                    </Button>
                </div>
            </header>

            <section className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg">
                <h2 className="sr-only">Affiliates List</h2>
                {renderContent()}
            </section>

            <AffiliateModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                affiliateToEdit={editingAffiliate}
                queryClient={queryClient}
            />
        </div>
    );
};

export default AffiliatesPage;