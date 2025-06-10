import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMyBusinesses } from '../hooks/useMyBusinesses';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { useQueryClient } from '@tanstack/react-query';

import Icon from '../../../components/common/Icon';
import Spinner from '../../../components/common/Spinner';

const BusinessSwitcher = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSwitching, setIsSwitching] = useState(false);
    const { user, switchBusiness } = useAuth();
    const { data: businesses, isLoading, isError } = useMyBusinesses();
    const { addToast } = useToast();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const switcherRef = useRef(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (switcherRef.current && !switcherRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSwitch = useCallback(async (businessId) => {
        if (businessId === user.activeBusinessId) {
            setIsOpen(false);
            return;
        }

        setIsSwitching(true);
        try {
            await switchBusiness(businessId);
            // After successful switch, invalidate all queries to refetch data for the new business context.
            await queryClient.invalidateQueries();
            addToast("Switched business successfully!", "success");
            setIsOpen(false);
            // Optionally, navigate to the overview page of the new business context
            navigate('/dashboard/business/overview', { replace: true });
        } catch (error) {
            console.error("Failed to switch business:", error);
            addToast("Could not switch business. Please try again.", "error");
        } finally {
            setIsSwitching(false);
        }
    }, [user.activeBusinessId, switchBusiness, addToast, queryClient, navigate]);

    const dropdownVariants = {
        hidden: { opacity: 0, scale: 0.95, y: -10 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
    };

    return (
        <div className="relative" ref={switcherRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isSwitching}
                className="flex items-center text-left p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 w-full max-w-[250px]"
            >
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-800/50 rounded-md flex items-center justify-center">
                    <Icon name="storefront" className="text-primary-600 dark:text-primary-300" />
                </div>
                <div className="ml-3 flex-grow overflow-hidden">
                    <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 truncate">
                        {isSwitching ? "Switching..." : user?.activeBusinessName || 'Loading...'}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 -mt-0.5">
                        {user?.role || '...'}
                    </p>
                </div>
                {isSwitching ? (
                    <Spinner size="sm" className="ml-2" />
                ) : (
                    <Icon name="unfold_more" className="ml-2 h-5 w-5 text-neutral-500 dark:text-neutral-400 flex-shrink-0" />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="origin-top-left absolute left-0 mt-2 w-64 rounded-xl shadow-2xl bg-white dark:bg-neutral-800 ring-1 ring-black dark:ring-neutral-700 ring-opacity-5 focus:outline-none p-1 z-50"
                    >
                        <div className="px-3 py-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase">Your Businesses</div>
                        {isLoading && <div className="px-3 py-2 text-sm text-neutral-500">Loading businesses...</div>}
                        {isError && <div className="px-3 py-2 text-sm text-red-500">Failed to load.</div>}
                        {businesses && businesses.map((business) => (
                            <button
                                key={business.id}
                                onClick={() => handleSwitch(business.id)}
                                className="w-full text-left flex items-center px-3 py-2 text-sm rounded-md text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50"
                                disabled={isSwitching}
                            >
                                <span className="flex-grow">{business.name}</span>
                                {business.id === user.activeBusinessId && (
                                    <Icon name="check_circle" className="h-5 w-5 text-primary-500" />
                                )}
                            </button>
                        ))}
                        <div className="my-1 border-t border-neutral-200 dark:border-neutral-700" />
                        <Link
                            to="/dashboard/business/create"
                            onClick={() => setIsOpen(false)}
                            className="w-full text-left flex items-center px-3 py-2 text-sm rounded-md text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10"
                        >
                            <Icon name="add_business" className="mr-2 h-5 w-5" />
                            Create New Business
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BusinessSwitcher;