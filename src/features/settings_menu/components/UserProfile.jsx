import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import PersonalInfoCard from './PersonalInfoCard';
import PasswordSecurityCard from './PasswordSecurityCard';
import Spinner from '../../../components/common/Spinner';

const UserProfile = () => {
    const { user, isLoading } = useAuth();

    if (isLoading || !user) {
        return (
            <div className="flex items-center justify-center p-10 h-full">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <PersonalInfoCard key={user.id} user={user} />
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            >
                <PasswordSecurityCard />
            </motion.div>
        </div>
    );
};

export default UserProfile;