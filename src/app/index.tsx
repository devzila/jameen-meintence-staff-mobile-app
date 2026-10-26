import { useEffect, useState } from 'react';
import { AppSplash, SPLASH_HOLD_MS } from '@/components/AppSplash';
import { SafeRedirect } from '@/components/SafeRedirect';
import { pickNextRoute } from '@/store/auth';
import { useStoresHydrated } from '@/store/hydration';

export default function IndexScreen() {
  const hydrated = useStoresHydrated();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), SPLASH_HOLD_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!hydrated || !ready) {
    return <AppSplash />;
  }

  return <SafeRedirect href={pickNextRoute()} />;
}
