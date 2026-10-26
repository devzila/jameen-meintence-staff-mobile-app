import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@/i18n';

export const APP_LOCALES = ['en', 'hi', 'bn', 'mr', 'pa', 'te', 'kn', 'ta', 'ml'] as const;
export type AppLocale = (typeof APP_LOCALES)[number];

export const LOCALE_OPTIONS: { code: AppLocale; nativeName: string }[] = [
  { code: 'en', nativeName: 'English' },
  { code: 'hi', nativeName: 'हिन्दी' },
  { code: 'bn', nativeName: 'বাংলা' },
  { code: 'mr', nativeName: 'मराठी' },
  { code: 'pa', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'te', nativeName: 'తెలుగు' },
  { code: 'kn', nativeName: 'ಕನ್ನಡ' },
  { code: 'ta', nativeName: 'தமிழ்' },
  { code: 'ml', nativeName: 'മലയാളം' },
];

export function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === 'string' && APP_LOCALES.includes(value as AppLocale);
}

export function localeNativeName(locale: AppLocale) {
  return LOCALE_OPTIONS.find((row) => row.code === locale)?.nativeName ?? 'English';
}

type LocaleState = {
  locale: AppLocale;
  hydrated: boolean;
  setLocale: (locale: AppLocale) => void;
};

export const useLocale = create<LocaleState>()(
  persist(
    (set) => ({
      locale: 'en',
      hydrated: false,
      setLocale: (locale) => {
        set({ locale });
        void i18n.changeLanguage(locale);
      },
    }),
    {
      name: 'jameen.maintenance.locale',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ locale: state.locale }),
      onRehydrateStorage: () => (state) => {
        const locale = isAppLocale(state?.locale) ? state.locale : 'en';
        const current = useLocale.getState();
        if (!current.hydrated || current.locale !== locale) {
          useLocale.setState({ hydrated: true, locale });
        }
        if (i18n.language !== locale && i18n.resolvedLanguage !== locale) {
          void i18n.changeLanguage(locale);
        }
      },
    },
  ),
);
