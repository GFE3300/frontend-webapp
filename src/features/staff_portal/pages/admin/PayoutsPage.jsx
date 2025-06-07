import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../../contexts/ToastContext';
import apiService from '../../../../services/api';
import Button from '../../../../components/common/Button';
import Icon from '../../../../components/common/Icon';
import Spinner from '../../../../components/common/Spinner';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

// Helper to format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
};

const PayoutsPage = () => {
    const { addToast } = useToast();
    const queryClient = useQueryClient();

    // State management for selection
    const [selectedCommissionIds, setSelectedCommissionIds] = useState(new Set());
    const [selectedAffiliate, setSelectedAffiliate] = useState(null); // { id: '...', email: '...' }
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Data fetching for all commission records
    const { data: commissions, isLoading, isError, error } = useQuery({
        queryKey: ['staffCommissions'],
        queryFn: () => apiService.get('/staff/commissions/'),
        // Assuming the response is { data: [...] }
        select: (response) => response.data,
    });

    // Derived state for the total amount of selected commissions
    const totalSelectedAmount = useMemo(() => {
        if (!commissions || selectedCommissionIds.size === 0) return 0;
        return Array.from(selectedCommissionIds).reduce((total, id) => {
            const commission = commissions.find(c => c.id === id);
            return total + (commission ? parseFloat(commission.amount) : 0);
        }, 0);
    }, [selectedCommissionIds, commissions]);

    // --- Handlers ---
    const handleSelectCommission = (commission) => {
        const isSelected = selectedCommissionIds.has(commission.id);
        const newSelectedIds = new Set(selectedCommissionIds);

        if (isSelected) {
            newSelectedIds.delete(commission.id);
        } else {
            // Logic to ensure only one affiliate's commissions are selected at a time
            if (selectedAffiliate && selectedAffiliate.id !== commission.affiliate) {
                addToast("You can only select commissions for one affiliate at a time.", "error");
                return; // Prevent selection
            }
            newSelectedIds.add(commission.id);
        }

        setSelectedCommissionIds(newSelectedIds);

        // Update the selected affiliate based on the new selection set
        if (newSelectedIds.size === 0) {
            setSelectedAffiliate(null);
        } else if (!isSelected) { // Only set on first add
            if (!selectedAffiliate) {
                setSelectedAffiliate({ id: commission.affiliate, email: commission.affiliate_email });
            }
        }
    };

    const handleCreatePayout = () => {
        // This will be the handler for the modal confirmation
        payoutMutation.mutate({
            affiliate_id: selectedAffiliate.id,
            commission_record_ids: Array.from(selectedCommissionIds),
        });
    };

    // Mutation for creating the payout batch
    const payoutMutation = useMutation({
        mutationFn: (payoutData) => apiService.post('/staff/payouts/', payoutData),
        onSuccess: () => {
            addToast("Payout batch created successfully!", "success");
            queryClient.invalidateQueries({ queryKey: ['staffCommissions'] });
            setSelectedCommissionIds(new Set());
            setSelectedAffiliate(null);
            setIsModalOpen(false);
        },
        onError: (err) => {
            const errorMessage = err.response?.data?.detail || "Failed to create payout batch.";
            addToast(errorMessage, "error");
            setIsModalOpen(false);
        },
    });


    // --- Render Logic ---
    const renderContent = () => {
        if (isLoading) return <div className="text-center py-10"><Spinner size="lg" /></div>;
        if (isError) return <div className="text-center py-10 text-red-500">Error: {error.message}</div>;
        if (!commissions || commissions.length === 0) {
            return <div className="text-center py-10 text-neutral-500">No commission records found.</div>;
        }

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                    <thead className="bg-neutral-50 dark:bg-neutral-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase">Select</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase">Affiliate</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase">Referred Business</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase">Amount</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase">Date</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                        {commissions.map((commission) => (
                            <tr key={commission.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                                <td className="px-6 py-4">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50"
                                        disabled={commission.status !== 'ready_for_payout'}
                                        checked={selectedCommissionIds.has(commission.id)}
                                        onChange={() => handleSelectCommission(commission)}
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800 dark:text-neutral-200">{commission.affiliate_email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-300">{commission.business_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-green-600 dark:text-green-400">{formatCurrency(commission.amount)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-300">{commission.status}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">{new Date(commission.created_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">Payouts Management</h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        Select commissions to create a new payout batch.
                    </p>
                </div>
                <div className="flex-shrink-0">
                    <Button
                        variant="solid"
                        color="primary"
                        onClick={() => setIsModalOpen(true)}
                        disabled={selectedCommissionIds.size === 0}
                    >
                        <Icon name="payments" className="mr-2 h-5 w-5" />
                        Create Payout Batch ({selectedCommissionIds.size})
                    </Button>
                </div>
            </header>

            <section className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg">
                <h2 className="sr-only">Commissions List</h2>
                {renderContent()}
            </section>

            {isModalOpen && (
                <ConfirmationModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={handleCreatePayout}
                    title="Confirm Payout Batch Creation"
                    confirmText="Create Payout"
                    isConfirming={payoutMutation.isPending}
                >
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">
                        You are about to create a payout for affiliate <strong className="font-semibold text-neutral-800 dark:text-neutral-100">{selectedAffiliate?.email}</strong>.
                    </p>
                    <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                        This batch will contain <strong className="font-semibold">{selectedCommissionIds.size}</strong> commission record(s), totaling <strong className="font-semibold">{formatCurrency(totalSelectedAmount)}</strong>.
                    </p>
                    <p className="mt-4 text-xs text-neutral-500">
                        This action will mark these commissions as "Included in Payout" and generate a new pending payout record. Are you sure you want to proceed?
                    </p>
                </ConfirmationModal>
            )}
        </div>
    );
};

export default PayoutsPage;