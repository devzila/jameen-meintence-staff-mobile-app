import { PORTAL } from '@/constants/config';
import { apiFetch } from '@/services/api/client';
import type { Staff } from '@/types/api';

/** `GET /profile` renders the staff at the root; `PUT /profile` wraps it in `data`. */
export function unwrapStaff(payload: unknown): Staff | null {
  if (!payload || typeof payload !== 'object') return null;
  const record = payload as Record<string, unknown>;
  const candidate =
    record.data && typeof record.data === 'object'
      ? (record.data as Record<string, unknown>)
      : record;
  return typeof candidate.id === 'number' ? (candidate as unknown as Staff) : null;
}

export async function fetchProfile(): Promise<Staff> {
  const payload = await apiFetch<unknown>(`/v1/${PORTAL}/profile`);
  const staff = unwrapStaff(payload);
  if (!staff) throw new Error('Profile response was invalid');
  return staff;
}

export type ProfileUpdate = {
  name: string;
  mobileNumber: string;
  avatar?: { uri: string; name: string; type: string } | null;
};

export async function updateProfile(input: ProfileUpdate): Promise<Staff | null> {
  const form = new FormData();
  form.append('member[name]', input.name.trim());
  form.append('member[mobile_number]', input.mobileNumber.trim());
  if (input.avatar) {
    // React Native's FormData accepts `{ uri, name, type }` file descriptors.
    form.append('member[avatar]', input.avatar as unknown as Blob);
  }
  const payload = await apiFetch<unknown>(`/v1/${PORTAL}/profile`, { method: 'PUT', body: form });
  return unwrapStaff(payload);
}
