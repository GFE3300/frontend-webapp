import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { AnimatePresence, motion } from 'framer-motion';

// Hooks
import { useAuth } from '../../../contexts/AuthContext';
import { useResendInvitation } from '../hooks/useResendInvitation';
import { useRevokeInvitation } from '../hooks/useRevokeInvitation';

// Common Components
import Icon from '../../../components/common/Icon';
import Button from '../../../components/common/Button';
import ConfirmationModal from '../../../components/common/ConfirmationModal';

// i18n
import { scriptLines_dashboard as sl } from '../../dashboard/utils/script_lines';
import { interpolate } from '../../../i18n';

// --- Utility Function ---

const getExpiryInfo = (expiresAt) => {
    const now = new Date();
    const expiryDate = new Date(expiresAt);
    const diffTime = expiryDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return { text: sl.teamManagement.expired || 'Expired', color: 'text-red-500', isActionable: false };
    }
    if (diffDays === 0) {
        return { text: sl.teamManagement.expiresToday || 'Expires today', color: 'text-amber-500', isActionable: true };
    }
    return {
        text: interpolate(sl.teamManagement.expiresInDays, { count: diffDays }),
        color: 'text-neutral-500 dark:text-neutral-400',
        isActionable: true
    };
};

// --- Main Card Component ---

const PendingInvitationsCard = ({ invitations }) => {
    const { user } = useAuth();
    const [invitationToRevoke, setInvitationToRevoke] = useState(null);
    const [actioningInviteId, setActioningInviteId] = useState(null);

    const { mutate: resend, isPending: isResending } = useResendInvitation({
        onSuccess: () => setActioningInviteId(null),
        onError: () => setActioningInviteId(null),
    });

    const { mutate: revoke, isPending: isRevoking } = useRevokeInvitation({
        onSuccess: () => setInvitationToRevoke(null)
    });

    const handleResend = (invitationId) => {
        setActioningInviteId(invitationId);
        resend({ businessId: user.activeBusinessId, invitationId });
    };

    const handleRevokeConfirm = () => {
        if (invitationToRevoke) {
            revoke({ businessId: user.activeBusinessId, invitationId: invitationToRevoke.id });
        }
    };

    const sortedInvitations = useMemo(() =>
        [...invitations].sort((a, b) => new Date(a.expires_at) - new Date(b.expires_at)),
        [invitations]
    );

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                className="bg-gradient-to-br from-white/10 to-white/0 dark:bg-neutral-800/50 backdrop-blur-xl border border-white/20 dark:border-neutral-700 shadow-lg rounded-4xl font-montserrat"
            >
                <header className="p-6 md:p-8 border-b border-white/10 dark:border-neutral-700">
                    <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">
                        {sl.teamManagement.invitationsCardTitle || "Pending Invitations"}
                    </h3>
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                        {sl.teamManagement.invitationsCardSubtitle || "These invitations have been sent and are awaiting a response."}
                    </p>
                </header>

                <div className="p-2 md:p-4">
                    {sortedInvitations.length === 0 ? (
                        <div className="text-center py-10">
                            <Icon name="mail_outline" className="mx-auto h-12 w-12 text-neutral-400 dark:text-neutral-500" />
                            <p className="mt-4 text-sm font-medium text-neutral-600 dark:text-neutral-300">
                                {sl.teamManagement.noPendingInvites || "No pending invitations."}
                            </p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {sortedInvitations.map(invite => {
                                const expiry = getExpiryInfo(invite.expires_at);
                                const isActionInProgress = actioningInviteId === invite.id;
                                return (
                                    <motion.div
                                        key={invite.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 gap-4"
                                    >
                                        <div>
                                            <p className="font-semibold text-neutral-800 dark:text-neutral-100">{invite.email}</p>
                                            <p className={`text-xs mt-0.5 font-medium ${expiry.color}`}>
                                                {expiry.text}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {expiry.isActionable && (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleResend(invite.id)}
                                                        isLoading={isResending && isActionInProgress}
                                                        disabled={isResending || isRevoking}
                                                    >
                                                        {sl.teamManagement.resendButton || "Resend"}
                                                    </Button>
                                                    <Button
                                                        variant="danger_outline"
                                                        size="sm"
                                                        onClick={() => setInvitationToRevoke(invite)}
                                                        disabled={isResending || isRevoking}
                                                    >
                                                        {sl.teamManagement.revokeButton || "Revoke"}
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    )}
                </div>
            </motion.div>

            <ConfirmationModal
                isOpen={!!invitationToRevoke}
                onClose={() => setInvitationToRevoke(null)}
                onConfirm={handleRevokeConfirm}
                title={sl.teamManagement.revokeInviteModalTitle || "Revoke Invitation?"}
                confirmText={sl.teamManagement.revokeInviteConfirmButton || "Yes, Revoke"}
                isDestructive
                isLoading={isRevoking}
            >
                {invitationToRevoke && (
                    <p>
                        {interpolate(sl.teamManagement.revokeInviteModalMessage, { email: invitationToRevoke.email })}
                    </p>
                )}
            </ConfirmationModal>
        </>
    );
};

PendingInvitationsCard.propTypes = {
    invitations: PropTypes.array.isRequired,
};

export default PendingInvitationsCard;