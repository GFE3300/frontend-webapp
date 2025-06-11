import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { queryKeys } from '../services/queryKeys';
import apiService from '../services/api';

/**
 * A centralized hook to manage all frontend permission logic.
 * It synthesizes the user's role, subscription plan, and real-time usage data
 * from the backend to provide a clear, memoized set of boolean flags and limits.
 *
 * @returns {{
 *   permissions: {
 *     // --- Role-Based Permissions ---
 *     canInviteMembers: boolean,          // True if user is ADMIN or MANAGER.
 *     canEditBusinessDetails: boolean,    // True if user is ADMIN or MANAGER.
 *
 *     // --- Subscription-Based Feature Flags ---
 *     canAccessAnalytics: boolean,        // True if plan is not 'starter_essentials'.
 *     canCreateNewBusiness: boolean,      // True if the user is below their plan's business limit.
 *
 *     // --- Usage & Limits ---
 *     teamMemberLimit: number,            // The max number of team members for the current plan.
 *     hasReachedTeamLimit: boolean,       // True if current members >= teamMemberLimit.
 *     hasReachedBusinessLimit: boolean,   // True if current businesses >= businessLimit.
 *
 *     // --- Contextual Information ---
 *     currentRole: 'ADMIN' | 'MANAGER' | 'STAFF' | null,
 *     subscriptionPlan: 'starter_essentials' | 'growth_accelerator' | 'premium_pro_suite' | null,
 *   },
 *   isLoading: boolean, // True while subscription or context permissions are loading.
 *   error: Error | null // The error object from React Query if the context fetch fails.
 * }} An object containing the permissions, loading state, and any errors.
 */
export const usePermissions = () => {
    const { user, isAuthenticated } = useAuth();
    const { subscription, isLoading: isSubscriptionLoading } = useSubscription();

    // Fetch dynamic permissions and limits from the backend.
    // This query should only run when the user is authenticated.
    const {
        data: contextData,
        isLoading: isContextLoading,
        error: contextError
    } = useQuery({
        queryKey: queryKeys.contextPermissions,
        queryFn: apiService.getContextPermissions,
        enabled: !!isAuthenticated,
        staleTime: 1000 * 60 * 5, // 5 minutes, permissions don't change often
        refetchOnWindowFocus: false,
    });

    // The main loading state depends on both subscription and context data.
    const isLoading = isSubscriptionLoading || isContextLoading;

    // Use useMemo to compute the final permissions object only when dependencies change.
    const permissions = useMemo(() => {
        // Default permissions for a non-authenticated or loading state.
        const defaultPermissions = {
            canInviteMembers: false,
            canEditBusinessDetails: false,
            canAccessAnalytics: false,
            canCreateNewBusiness: false,
            teamMemberLimit: 0,
            hasReachedTeamLimit: true,
            hasReachedBusinessLimit: true,
            currentRole: null,
            subscriptionPlan: null,
        };

        if (isLoading || !isAuthenticated || !contextData || !subscription) {
            return defaultPermissions;
        }

        const backendPermissions = contextData.data.permissions;
        const limits = contextData.data.limits;
        const usage = contextData.data.usage;

        return {
            canInviteMembers: backendPermissions.can_invite_members,
            canEditBusinessDetails: backendPermissions.can_edit_business_details,
            canAccessAnalytics: backendPermissions.can_access_advanced_analytics,
            canCreateNewBusiness: usage.current_business_count < limits.business_count_limit,
            teamMemberLimit: limits.team_member_limit,
            hasReachedTeamLimit: usage.current_team_member_count >= limits.team_member_limit,
            hasReachedBusinessLimit: usage.current_business_count >= limits.business_count_limit,
            currentRole: user?.role || null,
            subscriptionPlan: subscription?.plan_name || null,
        };
    }, [isLoading, isAuthenticated, contextData, subscription, user]);

    return {
        permissions,
        isLoading,
        error: contextError,
    };
};