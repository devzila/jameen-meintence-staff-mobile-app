import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiBaseUrl, PORTAL } from '@/constants/config';
import { ApiError } from '@/utils/errors';
import type { CompanyInfo } from '@/types/api';

type OrgState = {
  slug: string | null;
  company: CompanyInfo | null;
  hydrated: boolean;
  setSlug: (slug: string | null) => void;
  setCompany: (company: CompanyInfo | null) => void;
  resolveCompany: (slug: string) => Promise<CompanyInfo>;
  clear: () => void;
};

function pickCompany(payload: Record<string, unknown>): CompanyInfo | null {
  const raw =
    payload && typeof payload === 'object' && 'data' in payload && payload.data
      ? (payload.data as Record<string, unknown>)
      : payload;

  if (!raw || typeof raw !== 'object') return null;
  if (typeof raw.id !== 'number' || typeof raw.slug !== 'string' || typeof raw.name !== 'string') {
    return null;
  }

  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    active: typeof raw.active === 'boolean' ? raw.active : undefined,
    logo_url: typeof raw.logo_url === 'string' ? raw.logo_url : null,
  };
}

export const useOrg = create<OrgState>()(
  persist(
    (set) => ({
      slug: null,
      company: null,
      hydrated: false,
      setSlug: (slug) => set({ slug: slug?.trim().toLowerCase() || null }),
      setCompany: (company) =>
        set({
          company,
          slug: company?.slug ?? null,
        }),
      clear: () => set({ slug: null, company: null }),

      resolveCompany: async (slug) => {
        if (!apiBaseUrl) throw new Error('EXPO_PUBLIC_API_URL is not set');
        const trimmed = slug.trim().toLowerCase();
        if (!trimmed) throw new Error('Company slug is required');

        const res = await fetch(
          `${apiBaseUrl}/v1/${PORTAL}/companies/${encodeURIComponent(trimmed)}`,
          {
            method: 'GET',
            headers: { Accept: 'application/json' },
          },
        );

        const payload = (await res.json().catch(() => ({}))) as Record<string, unknown>;
        if (!res.ok) {
          throw new ApiError(
            (payload?.error as string) || (payload?.message as string) || 'Company not found',
            res.status,
          );
        }

        const company = pickCompany(payload);
        if (!company) throw new Error('Company response was invalid');
        if (company.active === false) throw new Error('This company is inactive');

        set({ company, slug: company.slug });
        return company;
      },
    }),
    {
      name: 'jameen.maintenance.org',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ slug: state.slug, company: state.company }),
      onRehydrateStorage: () => (state) => {
        useOrg.setState({
          hydrated: true,
          slug: state?.slug ?? null,
          company: state?.company ?? null,
        });
      },
    },
  ),
);
