import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMyBusinesses } from '../hooks/useMyBusinesses';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { useQueryClient } from '@tanstack/react-query';
import { usePermissions } from '../../../hooks/usePermissions';

import Icon from '../../../components/common/Icon';
import Spinner from '../../../components/common/Spinner';
import { scriptLines_dashboard as sl } from '../utils/script_lines';

const BusinessSwitcher = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSwitching, setIsSwitching] = useState(false);
    const { user, switchBusiness } = useAuth();
    const { permissions } = usePermissions();
    const { data: businesses, isLoading, isError } = useMyBusinesses();
    const { addToast } = useToast();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const switcherRef = useRef(null);

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
            await queryClient.invalidateQueries();
            addToast(sl.businessSwitcher.switchSuccessToast || "Switched business successfully!", "success");
            setIsOpen(false);
            navigate('/dashboard/business/overview', { replace: true });
        } catch (error) {
            addToast(sl.businessSwitcher.switchErrorToast || "Could not switch business.", "error");
        } finally {
            setIsSwitching(false);
        }
    }, [user.activeBusinessId, switchBusiness, addToast, queryClient, navigate]);

    const getMenuAccentColor = (plan) => {
        switch (plan) {
            case 'growth_accelerator': return 'border-t-blue-400';
            case 'premium_pro_suite': return 'border-t-amber-400';
            default: return 'border-t-neutral-500';
        }
    };

    const dropdownVariants = {
        hidden: { opacity: 0, scale: 0.95, y: -10 },
        visible: {
            opacity: 1, scale: 1, y: 0,
            transition: {
                type: 'spring', stiffness: 400, damping: 25,
                staggerChildren: 0.05,
            }
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -15 },
        visible: { opacity: 1, x: 0 },
    };

    return (
        <div className="relative font-montserrat" ref={switcherRef}>
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isSwitching}
                className="flex items-center text-left p-2 pl-4 rounded-full bg-black/20 dark:bg-neutral-900/40 backdrop-blur-md border border-white/10 shadow-lg hover:bg-white/10 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
            >
                <div className="flex-shrink-0 w-8 h-8 bg-primary-500/80 rounded-full flex items-center justify-center">
                    <Icon name="storefront" className="text-white" />
                </div>
                <div className="ml-3 mr-2 flex-grow overflow-hidden">
                    <p className="text-sm font-semibold text-neutral-50 truncate">
                        {isSwitching ? (sl.businessSwitcher.switching || "Switching...") : user?.activeBusinessName || '...'}
                    </p>
                </div>
                {isSwitching ? (
                    <Spinner size="sm" className="ml-2" />
                ) : (
                    <Icon name="unfold_more" className="h-5 w-5 text-neutral-400 flex-shrink-0" style={{ fontSize: '1.25rem' }} />
                )}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className={`absolute left-0 mt-3 w-64 origin-top-left bg-black/50 dark:bg-neutral-900/70 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-2 z-50 border-t-2 ${getMenuAccentColor(permissions.subscriptionPlan)}`}
                    >
                        <motion.div variants={itemVariants} className="px-2 pb-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">{sl.businessSwitcher.yourBusinesses || 'Your Businesses'}</motion.div>

                        {isLoading && <motion.div variants={itemVariants} className="px-2 py-2 text-sm text-neutral-400">{sl.businessSwitcher.loading || 'Loading...'}</motion.div>}
                        {isError && <motion.div variants={itemVariants} className="px-2 py-2 text-sm text-red-400">{sl.businessSwitcher.failedToLoad || 'Failed to load.'}</motion.div>}

                        {businesses && businesses.map((business) => (
                            <motion.button
                                key={business.id}
                                variants={itemVariants}
                                onClick={() => handleSwitch(business.id)}
                                className="w-full text-left flex items-center px-2 py-2 text-sm rounded-lg text-neutral-200 hover:bg-white/10 disabled:opacity-50"
                                disabled={isSwitching}
                            >
                                <span className="flex-grow">{business.name}</span>
                                {business.id === user.activeBusinessId && (
                                    <Icon name="check_circle" className="h-5 w-5 text-primary-400" style={{ fontSize: '1.25rem' }} />
                                )}
                            </motion.button>
                        ))}

                        <motion.div variants={itemVariants} className="my-1 border-t border-white/10" />

                        <motion.div variants={itemVariants} className="relative group">
                            <Link
                                to="/dashboard/business/create"
                                onClick={() => setIsOpen(false)}
                                className={`w-full text-left flex items-center px-2 py-2 text-sm rounded-lg transition-colors
                                    ${permissions.canCreateNewBusiness
                                        ? 'text-primary-400 hover:bg-primary-500/20'
                                        : 'text-neutral-500 cursor-not-allowed'
                                    }`}
                                aria-disabled={!permissions.canCreateNewBusiness}
                                onClickCapture={(e) => !permissions.canCreateNewBusiness && e.preventDefault()}
                            >
                                <Icon name="add_business" className="mr-2 h-5 w-5" style={{ fontSize: '1.25rem' }} />
                                {sl.businessSwitcher.createNewBusiness || 'Create New Business'}
                            </Link>
                            {!permissions.canCreateNewBusiness && (
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max px-3 py-1.5 text-xs font-medium text-white bg-neutral-900/80 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    {sl.businessSwitcher.upgradePlanTooltip || 'Upgrade your plan to add more businesses.'}
                                </div>
                            )}
                        </motion.div>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BusinessSwitcher;