import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchProfile, updateProfile, type ProfileUpdate } from '@/services/api/profile';
import { fetchSessions, revokeSession } from '@/services/api/auth';
import { useAuth } from '@/store/auth';

export const profileKeys = {
  profile: ['profile'] as const,
  sessions: ['profile', 'sessions'] as const,
};

export function useProfile() {
  const setStaff = useAuth((s) => s.setStaff);
  return useQuery({
    queryKey: profileKeys.profile,
    queryFn: async () => {
      const staff = await fetchProfile();
      setStaff(staff);
      return staff;
    },
    placeholderData: () => useAuth.getState().staff ?? undefined,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setStaff = useAuth((s) => s.setStaff);
  return useMutation({
    mutationFn: (input: ProfileUpdate) => updateProfile(input),
    onSuccess: (staff) => {
      if (staff) {
        setStaff(staff);
        queryClient.setQueryData(profileKeys.profile, staff);
      }
      void queryClient.invalidateQueries({ queryKey: profileKeys.profile });
    },
  });
}

export function useSessions() {
  return useQuery({ queryKey: profileKeys.sessions, queryFn: fetchSessions });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => revokeSession(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: profileKeys.sessions }),
  });
}
