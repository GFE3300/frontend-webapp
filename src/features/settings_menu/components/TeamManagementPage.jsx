import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { usePermissions } from '../../../hooks/usePermissions';

// Data Hooks
import { useBusinessMembers } from '../hooks/useBusinessMembers';
import { usePendingInvitations } from '../hooks/usePendingInvitations';

// UI Components & Skeletons
import CurrentMembersCard from './CurrentMembersCard';
import PendingInvitationsCard from './PendingInvitationsCard';
import InviteMemberModal from './InviteMemberModal';
import TeamMembersCardSkeleton from './skeletons/TeamMembersCardSkeleton';
import PendingInvitationsCardSkeleton from './skeletons/PendingInvitationsCardSkeleton';

// i18n
import { scriptLines_dashboard as sl } from '../../dashboard/utils/script_lines';

const TeamManagementPage = () => {
    const { user } = useAuth();
    const { permissions, isLoading: isPermissionsLoading } = usePermissions();
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);

    const activeBusinessId = user?.activeBusinessId;

    const { data: members, isLoading: isMembersLoading } = useBusinessMembers(activeBusinessId);
    const { data: invitations, isLoading: isInvitesLoading } = usePendingInvitations(activeBusinessId);

    const isLoading = isPermissionsLoading || isMembersLoading || isInvitesLoading;

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="space-y-8"
            >
                <header>
                    <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
                        {sl.teamManagement.pageTitle || "Team Management"}
                    </h2>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        {sl.teamManagement.pageSubtitle || "View members, manage roles, and invite new people to your business."}
                    </p>
                </header>

                {isLoading ? (
                    <>
                        <TeamMembersCardSkeleton />
                        <PendingInvitationsCardSkeleton />
                    </>
                ) : (
                    <>
                        <CurrentMembersCard
                            members={members || []}
                            permissions={permissions}
                            onInviteClick={() => setInviteModalOpen(true)}
                        />

                        {permissions.canInviteMembers && (
                            <PendingInvitationsCard
                                invitations={invitations || []}
                            />
                        )}
                    </>
                )}
            </motion.div>

            {/* The modal is controlled here but triggered from a child component */}
            <InviteMemberModal
                isOpen={isInviteModalOpen}
                onClose={() => setInviteModalOpen(false)}
            />
        </>
    );
};

export default TeamManagementPage;