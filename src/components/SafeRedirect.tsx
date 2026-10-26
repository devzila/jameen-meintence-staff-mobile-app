import { useEffect } from 'react';
import { usePathname, useRouter, type Href } from 'expo-router';
import { sameRoute } from '@/lib/routes';

export { sameRoute };

/** expo-router <Redirect> re-fires replace whenever it re-renders, which loops the root navigator. */
export function SafeRedirect({ href }: { href: Href }) {
  const pathname = usePathname();
  const router = useRouter();
  const target = String(href);

  useEffect(() => {
    if (sameRoute(pathname, target)) return;
    router.replace(href);
  }, [href, pathname, router, target]);

  return null;
}
