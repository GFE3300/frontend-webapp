import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Hooks
import { useAuth } from '../../../contexts/AuthContext';
import { useInviteMember } from '../hooks/useInviteMember';

// Common Components
import GlassModal from './GlassModal'; // MODIFIED: Using the new GlassModal
import InputField from '../../../components/common/InputField';
import Button from '../../../components/common/Button';
import { Dropdown } from '../../register/subcomponents';

// i18n
import { scriptLines_dashboard as sl } from '../../dashboard/utils/script_lines';

const InviteMemberModal = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('STAFF');
    const [clientError, setClientError] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setEmail('');
            setRole('STAFF');
            setClientError('');
        }
    }, [isOpen]);

    const { mutate: inviteMember, isPending } = useInviteMember({
        onSuccess: () => {
            onClose();
        },
    });

    const handleInvite = () => {
        setClientError('');
        if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
            setClientError('Please enter a valid email address.');
            return;
        }
        inviteMember({
            businessId: user.activeBusinessId,
            email,
            role,
        });
    };

    const roleOptions = [
        { value: 'STAFF', label: sl.teamManagement.roleStaff || 'Staff' },
        { value: 'MANAGER', label: sl.teamManagement.roleManager || 'Manager' },
    ];

    return (
        // MODIFIED: Replaced generic Modal with the new GlassModal
        <GlassModal isOpen={isOpen} onClose={onClose}>
            <div className="p-8 pt-10 font-montserrat">
                <h3 className="text-xl font-semibold text-neutral-200 dark:text-neutral-100" id="modal-title">
                    {sl.teamManagement.inviteModalTitle || "Invite New Member"}
                </h3>
                <p className="mt-1 text-sm text-neutral-300 dark:text-neutral-400">
                    {sl.teamManagement.inviteModalSubtitle || "Enter their email and select a role to grant them access."}
                </p>

                <div className="mt-8 pt-6 space-y-12">
                    <InputField
                        id="invite-email"
                        label={sl.teamManagement.emailFieldLabel || "Email Address"}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="new.member@example.com"
                        disabled={isPending}
                        error={clientError}
                    />
                    <Dropdown
                        label={sl.teamManagement.roleFieldLabel || "Role"}
                        value={role}
                        onChange={setRole}
                        options={roleOptions}
                        disabled={isPending}
                    />
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} disabled={isPending}>
                        {sl.teamManagement.cancelButton || "Cancel"}
                    </Button>
                    <Button
                        onClick={handleInvite}
                        isLoading={isPending}
                        disabled={isPending || !email.trim()}
                    >
                        {isPending
                            ? (sl.teamManagement.sendingInviteButton || "Sending...")
                            : (sl.teamManagement.sendInviteButton || "Send Invitation")
                        }
                    </Button>
                </div>
            </div>
        </GlassModal>
    );
};

InviteMemberModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default InviteMemberModal;