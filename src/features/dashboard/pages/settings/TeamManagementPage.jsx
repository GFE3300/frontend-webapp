import React, { useState } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { useBusinessMembers } from '../../hooks/useBusinessMembers';
import { usePendingInvitations } from '../../hooks/usePendingInvitations';
import { useUpdateMemberRole } from '../../hooks/useUpdateMemberRole';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../../contexts/ToastContext';
import apiService from '../../../../services/api';
import { queryKeys } from '../../../../services/queryKeys';

import Icon from '../../../../components/common/Icon';
import Button from '../../../../components/common/Button';
import Spinner from '../../../../components/common/Spinner';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';
import Modal from '../../../../components/animated_alerts/Modal';
import InputField from '../../../../components/common/InputField';
import SegmentedControl from '../../../../components/common/SegmentedControl';

// --- Sub-components ---

const TeamListSkeleton = () => (
    <div className="space-y-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 -mx-3 border-b border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center">
                    <div className="w-10 h-10 bg-neutral-300 dark:bg-neutral-600 rounded-full"></div>
                    <div className="ml-4">
                        <div className="h-4 w-24 bg-neutral-300 dark:bg-neutral-600 rounded"></div>
                        <div className="h-3 w-32 bg-neutral-200 dark:bg-neutral-700 rounded mt-1"></div>
                    </div>
                </div>
                <div className="h-6 w-20 bg-neutral-300 dark:bg-neutral-600 rounded-full"></div>
            </div>
        ))}
    </div>
);

const RoleSelector = ({ member, businessId }) => {
    const { user: currentUser } = useAuth();
    const updateRoleMutation = useUpdateMemberRole();
    const [currentRole, setCurrentRole] = useState(member.role);

    const handleRoleChange = (e) => {
        const newRole = e.target.value;
        setCurrentRole(newRole);
        updateRoleMutation.mutate({ businessId, membershipId: member.id, role: newRole });
    };

    if (currentUser.role !== 'ADMIN' || member.role === 'ADMIN' || member.user_id === currentUser.id) {
        return (
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-neutral-100 dark:bg-neutral-900/50 text-neutral-600 dark:text-neutral-300">
                {member.role}
            </span>
        );
    }

    return (
        <select
            value={currentRole}
            onChange={handleRoleChange}
            disabled={updateRoleMutation.isLoading}
            className="block w-full rounded-md border-neutral-300 dark:border-neutral-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 disabled:opacity-70"
        >
            <option value="STAFF">Staff</option>
            <option value="MANAGER">Manager</option>
        </select>
    );
};

// --- Main Page Component ---

const TeamManagementPage = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('members');

    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isConfirmRemoveModalOpen, setIsConfirmRemoveModalOpen] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState(null);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('STAFF');

    const { data: members, isLoading: isLoadingMembers } = useBusinessMembers(user?.activeBusinessId);
    const { data: invitations, isLoading: isLoadingInvitations } = usePendingInvitations(user?.activeBusinessId);

    // --- Mutations ---
    const inviteMutation = useMutation({
        mutationFn: (inviteData) => apiService.inviteMember(user.activeBusinessId, inviteData),
        onSuccess: () => {
            addToast('Invitation sent successfully!', 'success');
            queryClient.invalidateQueries({ queryKey: queryKeys.pendingInvitations(user.activeBusinessId) });
            setIsInviteModalOpen(false);
            setInviteEmail('');
            setInviteRole('STAFF');
        },
        onError: (err) => addToast(err.response?.data?.error || 'Failed to send invitation.', 'error'),
    });

    const removeMutation = useMutation({
        mutationFn: (membershipId) => apiService.removeMember(user.activeBusinessId, membershipId),
        onSuccess: () => {
            addToast('Team member removed.', 'success');
            queryClient.invalidateQueries({ queryKey: queryKeys.businessMembers(user.activeBusinessId) });
            setIsConfirmRemoveModalOpen(false);
            setMemberToRemove(null);
        },
        onError: (err) => addToast(err.response?.data?.error || 'Failed to remove member.', 'error'),
    });

    const resendMutation = useMutation({
        mutationFn: (invitationId) => apiService.resendInvitation(user.activeBusinessId, invitationId),
        onSuccess: () => {
            addToast('Invitation resent.', 'success');
            queryClient.invalidateQueries({ queryKey: queryKeys.pendingInvitations(user.activeBusinessId) });
        },
        onError: () => addToast('Failed to resend invitation.', 'error'),
    });

    const revokeMutation = useMutation({
        mutationFn: (invitationId) => apiService.revokeInvitation(user.activeBusinessId, invitationId),
        onSuccess: () => {
            addToast('Invitation revoked.', 'info');
            queryClient.invalidateQueries({ queryKey: queryKeys.pendingInvitations(user.activeBusinessId) });
        },
        onError: () => addToast('Failed to revoke invitation.', 'error'),
    });

    const handleInviteSubmit = (e) => {
        e.preventDefault();
        inviteMutation.mutate({ email: inviteEmail, role: inviteRole });
    };

    const openRemoveConfirmation = (member) => {
        setMemberToRemove(member);
        setIsConfirmRemoveModalOpen(true);
    };

    const handleRemoveConfirm = () => {
        if (memberToRemove) removeMutation.mutate(memberToRemove.id);
    };

    const canManageTeam = user?.role === 'ADMIN';

    return (
        <div className="bg-white dark:bg-neutral-800 shadow-sm rounded-xl p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100">Team Management</h2>
                    <p className="text-neutral-600 dark:text-neutral-400 mt-1">Invite and manage members of your business.</p>
                </div>
                {canManageTeam && (
                    <Button variant="solid" color="primary" onClick={() => setIsInviteModalOpen(true)} className="mt-4 sm:mt-0">
                        <Icon name="person_add" className="mr-2 h-5 w-5" /> Invite Member
                    </Button>
                )}
            </div>

            <SegmentedControl
                options={[{ label: 'Members', value: 'members' }, { label: 'Invitations', value: 'invitations' }]}
                value={activeTab}
                onChange={setActiveTab}
                name="team-tabs"
            />

            <div className="border-t border-neutral-200 dark:border-neutral-700 mt-6 pt-6">
                {activeTab === 'members' && (
                    <>
                        {isLoadingMembers && <TeamListSkeleton />}
                        {members && (
                            <ul className="space-y-3">
                                {members.map((member) => (
                                    <li key={member.id} className="flex items-center justify-between p-3 -mx-3 rounded-lg">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center font-bold text-neutral-500">
                                                {member.first_name?.[0]?.toUpperCase() || member.email[0].toUpperCase()}
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">{member.first_name} {member.last_name}</p>
                                                <p className="text-xs text-neutral-500 dark:text-neutral-400">{member.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-28"><RoleSelector member={member} businessId={user.activeBusinessId} /></div>
                                            {canManageTeam && user.id !== member.user_id && (
                                                <Button variant="ghost" color="danger" size="sm" onClick={() => openRemoveConfirmation(member)} className="!p-2" aria-label={`Remove ${member.email}`}>
                                                    <Icon name="delete_outline" />
                                                </Button>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </>
                )}
                {activeTab === 'invitations' && (
                    <>
                        {isLoadingInvitations && <TeamListSkeleton />}
                        {invitations && invitations.length > 0 && (
                            <ul className="space-y-3">
                                {invitations.map((invite) => (
                                    <li key={invite.id} className="flex items-center justify-between p-3 -mx-3 rounded-lg">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center">
                                                <Icon name="mail_outline" className="text-neutral-500" />
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">{invite.email}</p>
                                                <p className="text-xs text-neutral-500 dark:text-neutral-400">Expires: {new Date(invite.expires_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-neutral-100 dark:bg-neutral-900/50 text-neutral-600 dark:text-neutral-300">{invite.role}</span>
                                            <Button variant="outline" size="sm" onClick={() => resendMutation.mutate(invite.id)} isLoading={resendMutation.isLoading && resendMutation.variables === invite.id}>Resend</Button>
                                            <Button variant="ghost" color="danger" size="sm" onClick={() => revokeMutation.mutate(invite.id)} isLoading={revokeMutation.isLoading && revokeMutation.variables === invite.id} className="!p-2"><Icon name="close" /></Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {invitations && invitations.length === 0 && (
                            <div className="text-center py-10 text-neutral-500 dark:text-neutral-400">
                                <Icon name="drafts" className="mx-auto h-10 w-10 mb-2" />
                                <p>No pending invitations.</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modals */}
            <Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)}>
                <form onSubmit={handleInviteSubmit} className="p-1">
                    <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">Invite New Team Member</h3>
                    <div className="space-y-4 mt-4">
                        <InputField label="Email Address" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required />
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Role</label>
                            <select id="role" value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="block w-full rounded-md border-neutral-300 dark:border-neutral-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100">
                                <option value="STAFF">Staff</option>
                                <option value="MANAGER">Manager</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => setIsInviteModalOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="solid" color="primary" isLoading={inviteMutation.isLoading}>Send Invite</Button>
                    </div>
                </form>
            </Modal>

            {memberToRemove && (
                <ConfirmationModal
                    isOpen={isConfirmRemoveModalOpen}
                    onClose={() => setIsConfirmRemoveModalOpen(false)}
                    onConfirm={handleRemoveConfirm}
                    title="Remove Team Member"
                    message={`Are you sure you want to remove ${memberToRemove.email} from the team? This action cannot be undone.`}
                    confirmText="Remove"
                    isDestructive={true}
                    isLoading={removeMutation.isLoading}
                />
            )}
        </div>
    );
};

export default TeamManagementPage;