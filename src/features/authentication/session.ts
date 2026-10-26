import { useAuth } from '@/store/auth';
import { fetchProfile } from '@/services/api/profile';

export async function hydrateSessionProfile() {
  const { isAuthenticated, setStaff, staff } = useAuth.getState();
  if (!isAuthenticated || staff) return;
  try {
    setStaff(await fetchProfile());
  } catch {
    /* profile hydrate is best-effort; screens will retry */
  }
}
