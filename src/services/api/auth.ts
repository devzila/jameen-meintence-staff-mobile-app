import { PORTAL } from '@/constants/config';
import { apiFetch } from '@/services/api/client';
import type { DeviceSession } from '@/types/api';

export async function requestPasswordReset(email: string, companySlug: string) {
  return apiFetch(`/v1/${PORTAL}/auth/passwords`, {
    method: 'POST',
    companySlug,
    skipRefresh: true,
    body: { email },
  });
}

export async function completePasswordReset(input: {
  token: string;
  password: string;
  passwordConfirmation: string;
  companySlug: string;
}) {
  return apiFetch(`/v1/${PORTAL}/auth/passwords/${encodeURIComponent(input.token)}`, {
    method: 'PUT',
    companySlug: input.companySlug,
    skipRefresh: true,
    body: {
      password: input.password,
      password_confirmation: input.passwordConfirmation,
    },
  });
}

export async function changePassword(body: {
  current_password: string;
  new_password: string;
  confirm_password: string;
}) {
  return apiFetch(`/v1/${PORTAL}/passwords`, {
    method: 'PUT',
    body: { profile: body },
  });
}

export async function fetchSessions(): Promise<DeviceSession[]> {
  const res = await apiFetch<{ data?: DeviceSession[] }>(`/v1/${PORTAL}/auth/sessions`);
  return res?.data ?? [];
}

export async function revokeSession(id: string) {
  return apiFetch(`/v1/${PORTAL}/auth/sessions/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
