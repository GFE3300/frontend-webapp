import React, { useState, useRef, useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';

// Hooks
import { useAuth } from '../../../contexts/AuthContext';
import { useRemoveMember } from '../hooks/useRemoveMember';
import { useUpdateMemberRole } from '../hooks/useUpdateMemberRole';

// Common Components
import Icon from '../../../components/common/Icon';
import Button from '../../../components/common/Button';
import UserAvatar from '../../dashboard/header/UserAvatar';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import Spinner from '../../../components/common/Spinner';

// i18n
import { scriptLines_dashboard as sl } from '../../dashboard/utils/script_lines';
import { interpolate } from '../../../i18n';

// --- Sub-components defined in the same file for encapsulation ---

const RoleBadge = memo(({ role }) => {
    const roleStyles = {
        ADMIN: 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 ring-1 ring-inset ring-amber-500/30',
        MANAGER: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 ring-1 ring-inset ring-blue-500/20',
        STAFF: 'bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 ring-1 ring-inset ring-neutral-500/10'
    };
    const roleDisplayNames = {
        ADMIN: sl.teamManagement.roleAdmin,
        MANAGER: sl.teamManagement.roleManager,
        STAFF: sl.teamManagement.roleStaff
    };
    return (
        <span className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${roleStyles[role] || roleStyles.STAFF}`}>
            {roleDisplayNames[role] || role}
        </span>
    );
});
RoleBadge.displayName = 'RoleBadge';
RoleBadge.propTypes = { role: PropTypes.string.isRequired };


const MemberActionsMenu = memo(({ member, onRemoveClick, onRoleChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    const { isPending: isRoleUpdating, mutate: updateRole } = useUpdateMemberRole();
    const availableRoles = [
        { key: 'MANAGER', label: sl.teamManagement.roleManager },
        { key: 'STAFF', label: sl.teamManagement.roleStaff },
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleRoleUpdate = (newRole) => {
        onRoleChange({ membershipId: member.id, role: newRole });
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-neutral-500 dark:text-neutral-400">
                <Icon name="more_vert" />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute right-0 mt-1 w-48 origin-top-right bg-neutral-900/80 backdrop-blur-lg border border-white/10 rounded-lg shadow-2xl p-2 z-10"
                    >
                        {availableRoles.map(role => (
                            <button
                                key={role.key}
                                onClick={() => handleRoleUpdate(role.key)}
                                disabled={isRoleUpdating || member.role === role.key}
                                className="w-full text-left flex items-center justify-between px-3 py-2 text-sm rounded-md text-neutral-200 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span>{role.label}</span>
                                {member.role === role.key && <Icon name="check" className="text-primary-400" />}
                            </button>
                        ))}
                        <div className="my-1 border-t border-white/10" />
                        <button
                            onClick={() => { onRemoveClick(member); setIsOpen(false); }}
                            className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm rounded-md text-red-400 hover:bg-red-500/20"
                        >
                            <Icon name="person_remove" />
                            <span>{sl.teamManagement.removeMemberAction}</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});
MemberActionsMenu.displayName = 'MemberActionsMenu';
MemberActionsMenu.propTypes = {
    member: PropTypes.object.isRequired,
    onRemoveClick: PropTypes.func.isRequired,
    onRoleChange: PropTypes.func.isRequired,
};


// --- Main Card Component ---

const CurrentMembersCard = ({ members, permissions, onInviteClick }) => {
    const { user: currentUser } = useAuth();
    const [memberToRemove, setMemberToRemove] = useState(null);
    const { mutate: removeMember, isPending: isRemoving } = useRemoveMember({
        onSuccess: () => setMemberToRemove(null)
    });
    const { mutate: updateRole, isPending: isUpdatingRole } = useUpdateMemberRole();

    const handleRemoveConfirm = () => {
        if (memberToRemove) {
            removeMember({ businessId: currentUser.activeBusinessId, membershipId: memberToRemove.id });
        }
    };

    return (
        <>
            <div className="bg-gradient-to-br from-white/10 to-white/0 dark:bg-neutral-800/50 backdrop-blur-xl border border-white/20 dark:border-neutral-700 shadow-lg rounded-4xl font-montserrat">
                <header className="p-6 md:p-8 border-b border-white/10 dark:border-neutral-700 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">
                            {sl.teamManagement.membersCardTitle || "Team Members"}
                        </h3>
                        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                            {sl.teamManagement.membersCardSubtitle || "Current members with access to this business."}
                        </p>
                    </div>
                    {permissions.canInviteMembers && (
                        <Button onClick={onInviteClick}>
                            <Icon name="person_add" className="mr-2" />
                            {sl.teamManagement.inviteMemberButton || "Invite Member"}
                        </Button>
                    )}
                </header>
                <div className="p-2 md:p-4">
                    {members.map(member => (
                        <div key={member.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5">
                            <div className="flex items-center gap-4">
                                <UserAvatar user={{ firstName: member.first_name, email: member.email, profile_image_url: null }} onClick={() => { }} />
                                <div>
                                    <p className="font-semibold text-neutral-800 dark:text-neutral-100">{member.first_name} {member.last_name}</p>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{member.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <RoleBadge role={member.role} />
                                <div className="w-12 text-center">
                                    {(isUpdatingRole || isRemoving) && <Spinner size="sm" />}
                                    {currentUser.id !== member.user_id && member.role !== 'ADMIN' && (
                                        <MemberActionsMenu
                                            member={member}
                                            onRemoveClick={setMemberToRemove}
                                            onRoleChange={updateRole}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <ConfirmationModal
                isOpen={!!memberToRemove}
                onClose={() => setMemberToRemove(null)}
                onConfirm={handleRemoveConfirm}
                title={sl.teamManagement.removeMemberModalTitle || "Remove Member?"}
                confirmText={sl.teamManagement.removeMemberConfirmButton || "Yes, Remove Member"}
                isDestructive
                isLoading={isRemoving}
            >
                {memberToRemove && (
                    <p>
                        {interpolate(sl.teamManagement.removeMemberModalMessage, { name: `${memberToRemove.first_name} ${memberToRemove.last_name}` })}
                    </p>
                )}
            </ConfirmationModal>
        </>
    );
};

CurrentMembersCard.propTypes = {
    members: PropTypes.array.isRequired,
    permissions: PropTypes.object.isRequired,
    onInviteClick: PropTypes.func.isRequired,
};

export default CurrentMembersCard;