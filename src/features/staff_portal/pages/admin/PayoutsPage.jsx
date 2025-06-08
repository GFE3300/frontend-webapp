import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../../contexts/ToastContext';
import apiService from '../../../../services/api';

// Common Components
import Button from '../../../../components/common/Button';
import Icon from '../../../../components/common/Icon';
import Spinner from '../../../../components/common/Spinner';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

// Helper to format currency consistently
const formatCurrency = (amount) => {
    if (typeof amount !== 'number' && typeof amount !== 'string') {
        amount = 0;
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(amount));
};

const PayoutsPage = () => {
    const { addToast } = useToast();
    const queryClient = useQueryClient();

    const [selectedCommissionIds, setSelectedCommissionIds] = useState(new Set());
    const [selectedAffiliate, setSelectedAffiliate] = useState(null); // Tracks the affiliate for the current selection
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch only commissions that are ready for payout to keep the view focused and efficient.
    const { data: commissions, isLoading, isError, error } = useQuery({
        queryKey: ['staffCommissions_ready_for_payout'],
        queryFn: () => apiService.get('/staff/commissions/', { status: 'ready_for_payout' }),
        select: (response) => response.data?.results || response.data || [], // Handle paginated or direct array response
    });

    // Memoize the total selected amount for performance.
    const totalSelectedAmount = useMemo(() => {
        if (!commissions || selectedCommissionIds.size === 0) return 0;
        return Array.from(selectedCommissionIds).reduce((total, id) => {
            const commission = commissions.find(c => c.id === id);
            return total + (commission ? parseFloat(commission.amount) : 0);
        }, 0);
    }, [selectedCommissionIds, commissions]);

    const handleSelectCommission = (commission) => {
        const isSelected = selectedCommissionIds.has(commission.id);
        const newSelectedIds = new Set(selectedCommissionIds);

        if (isSelected) {
            newSelectedIds.delete(commission.id);
        } else {
            // Enforce that all selected commissions belong to the same affiliate.
            if (selectedAffiliate && selectedAffiliate.id !== commission.affiliate) {
                addToast("You can only select commissions for one affiliate at a time.", "error");
                return;
            }
            newSelectedIds.add(commission.id);
        }

        setSelectedCommissionIds(newSelectedIds);

        // Update or clear the selected affiliate based on the selection.
        if (newSelectedIds.size === 0) {
            setSelectedAffiliate(null);
        } else if (!isSelected && !selectedAffiliate) {
            setSelectedAffiliate({ id: commission.affiliate, email: commission.affiliate_email });
        }
    };

    const payoutMutation = useMutation({
        mutationFn: (payoutData) => apiService.post('/staff/payouts/', payoutData),
        onSuccess: () => {
            addToast("Payout batch created successfully!", "success");
            queryClient.invalidateQueries({ queryKey: ['staffCommissions_ready_for_payout'] });
            setSelectedCommissionIds(new Set());
            setSelectedAffiliate(null);
            setIsModalOpen(false);
        },
        onError: (err) => {
            const errorMessage = err.response?.data?.detail || err.response?.data?.error || "Failed to create payout batch.";
            addToast(errorMessage, "error");
            setIsModalOpen(false);
        },
    });

    const handleCreatePayout = () => {
        if (!selectedAffiliate || selectedCommissionIds.size === 0) return;
        payoutMutation.mutate({
            affiliate_id: selectedAffiliate.id,
            commission_record_ids: Array.from(selectedCommissionIds),
        });
    };

    const renderContent = () => {
        if (isLoading) return <div className="text-center py-10"><Spinner size="lg" /></div>;
        if (isError) return <div className="p-6 text-center bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg"><Icon name="error_outline" className="mx-auto text-red-500 h-12 w-12 mb-3" /><p className="text-red-700 dark:text-red-300 font-semibold">{error.message}</p></div>;
        if (!commissions || commissions.length === 0) {
            return <div className="text-center py-16 text-neutral-500 dark:text-neutral-400"><Icon name="task_alt" className="mx-auto h-12 w-12 text-green-500 mb-4" /><h3 className="text-lg font-medium">All Caught Up!</h3><p className="text-sm">There are no commissions ready for payout.</p></div>;
        }

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                    <thead className="bg-neutral-50 dark:bg-neutral-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Select</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Affiliate</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Referred Business</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Amount</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Date</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                        {commissions.map((commission) => (
                            <tr key={commission.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                                <td className="px-6 py-4">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={selectedAffiliate && selectedAffiliate.id !== commission.affiliate}
                                        checked={selectedCommissionIds.has(commission.id)}
                                        onChange={() => handleSelectCommission(commission)}
                                        aria-label={`Select commission ${commission.id}`}
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800 dark:text-neutral-200">{commission.affiliate_email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-300">{commission.business_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-green-600 dark:text-green-400">{formatCurrency(commission.amount)}</td>
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
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Select commissions to create a new payout batch.</p>
                </div>
                <div className="flex-shrink-0">
                    <Button
                        variant="solid"
                        color="primary"
                        onClick={() => setIsModalOpen(true)}
                        disabled={selectedCommissionIds.size === 0 || payoutMutation.isPending}
                    >
                        <Icon name="payments" className="mr-2 h-5 w-5" />
                        Create Payout Batch ({selectedCommissionIds.size})
                    </Button>
                </div>
            </header>

            <section className="bg-white dark:bg-neutral-800 p-0 sm:p-6 rounded-xl shadow-lg">
                <h2 className="sr-only">Commissions Ready for Payout</h2>
                {renderContent()}
            </section>

            {isModalOpen && selectedAffiliate && (
                <ConfirmationModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={handleCreatePayout}
                    title="Confirm Payout Batch Creation"
                    confirmText="Create Payout"
                    isConfirming={payoutMutation.isPending}
                >
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">
                        You are about to create a payout for affiliate <strong className="font-semibold text-neutral-800 dark:text-neutral-100">{selectedAffiliate.email}</strong>.
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