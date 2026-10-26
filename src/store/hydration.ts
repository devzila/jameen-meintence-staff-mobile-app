import { useAuth } from '@/store/auth';
import { useOrg } from '@/store/org';
import { useOnboarding } from '@/store/onboarding';
import { useLocale } from '@/store/locale';

export function useStoresHydrated() {
  const auth = useAuth((s) => s.hydrated);
  const org = useOrg((s) => s.hydrated);
  const onboarding = useOnboarding((s) => s.hydrated);
  const locale = useLocale((s) => s.hydrated);
  return auth && org && onboarding && locale;
}
