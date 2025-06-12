// src/features/settings_menu/components/BusinessProfilePage.jsx

import React from 'react';
import { motion } from 'framer-motion';

// Import the hooks that will drive the page
import { useBusinessDetails } from '../hooks/useBusinessDetails';
import { useBusinessProfileForm } from '../hooks/useBusinessProfileForm';

// Import the new card components
import BusinessIdentityCard from './BusinessIdentityCard';
import BusinessLocationCard from './BusinessLocationCard';

// Import UI Primitives for loading/error states
import Spinner from '../../../components/common/Spinner';
import { scriptLines_dashboard as sl } from '../../dashboard/utils/script_lines';

/**
 * The main page component for the business profile settings.
 * It orchestrates data fetching and state management for its child cards.
 */
const BusinessProfilePage = () => {
    // 1. Fetch the initial data for the business.
    const { data: businessData, isLoading: isLoadingDetails, isError } = useBusinessDetails();

    // 2. Initialize the form management hook. It will be populated once businessData is loaded.
    // This single hook instance manages the state for both cards.
    const form = useBusinessProfileForm(businessData);

    // 3. Handle loading and error states.
    if (isLoadingDetails) {
        return (
            <div className="flex h-96 w-full items-center justify-center rounded-4xl bg-white/10 p-8 text-center backdrop-blur-xl">
                <Spinner size="lg" />
            </div>
        );
    }

    if (isError || !form.formData) {
        return (
            <div className="flex h-96 w-full items-center justify-center rounded-4xl bg-red-500/10 p-8 text-center text-red-500 backdrop-blur-xl">
                <p>{sl.businessProfileCard.toastError || 'Failed to load business profile.'}</p>
            </div>
        );
    }

    // 4. Render the two new cards with staggered animations.
    // Pass the entire `form` object and any other needed props.
    return (
        <div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <BusinessIdentityCard
                    {...form} // Pass all form handlers and state
                    initialLogoUrl={businessData?.logo_url}
                />
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            >
                <BusinessLocationCard {...form} />
            </motion.div>
        </div>
    );
};

export default BusinessProfilePage;