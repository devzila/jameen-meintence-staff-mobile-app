import { useEffect } from 'react';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  NotoSansDevanagari_400Regular,
  NotoSansDevanagari_500Medium,
  NotoSansDevanagari_600SemiBold,
  NotoSansDevanagari_700Bold,
  NotoSansDevanagari_800ExtraBold,
} from '@expo-google-fonts/noto-sans-devanagari';
import {
  NotoSansBengali_400Regular,
  NotoSansBengali_500Medium,
  NotoSansBengali_600SemiBold,
  NotoSansBengali_700Bold,
  NotoSansBengali_800ExtraBold,
} from '@expo-google-fonts/noto-sans-bengali';
import {
  NotoSansGurmukhi_400Regular,
  NotoSansGurmukhi_500Medium,
  NotoSansGurmukhi_600SemiBold,
  NotoSansGurmukhi_700Bold,
  NotoSansGurmukhi_800ExtraBold,
} from '@expo-google-fonts/noto-sans-gurmukhi';
import {
  NotoSansTelugu_400Regular,
  NotoSansTelugu_500Medium,
  NotoSansTelugu_600SemiBold,
  NotoSansTelugu_700Bold,
  NotoSansTelugu_800ExtraBold,
} from '@expo-google-fonts/noto-sans-telugu';
import {
  NotoSansKannada_400Regular,
  NotoSansKannada_500Medium,
  NotoSansKannada_600SemiBold,
  NotoSansKannada_700Bold,
  NotoSansKannada_800ExtraBold,
} from '@expo-google-fonts/noto-sans-kannada';
import {
  NotoSansTamil_400Regular,
  NotoSansTamil_500Medium,
  NotoSansTamil_600SemiBold,
  NotoSansTamil_700Bold,
  NotoSansTamil_800ExtraBold,
} from '@expo-google-fonts/noto-sans-tamil';
import {
  NotoSansMalayalam_400Regular,
  NotoSansMalayalam_500Medium,
  NotoSansMalayalam_600SemiBold,
  NotoSansMalayalam_700Bold,
  NotoSansMalayalam_800ExtraBold,
} from '@expo-google-fonts/noto-sans-malayalam';
import * as Sentry from '@sentry/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryProvider } from '@/components/QueryProvider';
import { NetworkBootstrap } from '@/components/NetworkBootstrap';
import { AppSplash } from '@/components/AppSplash';
import { sentryDsn } from '@/constants/config';
import { useAuth } from '@/store/auth';
import { useOrg } from '@/store/org';
import { useOnboarding } from '@/store/onboarding';
import { useLocale } from '@/store/locale';
import i18n from '@/i18n';

const LATIN_FONT_MAP = {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
};

function scriptFontMap(locale: string) {
  if (locale === 'hi' || locale === 'mr') {
    return {
      NotoSansDevanagari_400Regular,
      NotoSansDevanagari_500Medium,
      NotoSansDevanagari_600SemiBold,
      NotoSansDevanagari_700Bold,
      NotoSansDevanagari_800ExtraBold,
    };
  }
  if (locale === 'bn') {
    return {
      NotoSansBengali_400Regular,
      NotoSansBengali_500Medium,
      NotoSansBengali_600SemiBold,
      NotoSansBengali_700Bold,
      NotoSansBengali_800ExtraBold,
    };
  }
  if (locale === 'pa') {
    return {
      NotoSansGurmukhi_400Regular,
      NotoSansGurmukhi_500Medium,
      NotoSansGurmukhi_600SemiBold,
      NotoSansGurmukhi_700Bold,
      NotoSansGurmukhi_800ExtraBold,
    };
  }
  if (locale === 'te') {
    return {
      NotoSansTelugu_400Regular,
      NotoSansTelugu_500Medium,
      NotoSansTelugu_600SemiBold,
      NotoSansTelugu_700Bold,
      NotoSansTelugu_800ExtraBold,
    };
  }
  if (locale === 'kn') {
    return {
      NotoSansKannada_400Regular,
      NotoSansKannada_500Medium,
      NotoSansKannada_600SemiBold,
      NotoSansKannada_700Bold,
      NotoSansKannada_800ExtraBold,
    };
  }
  if (locale === 'ta') {
    return {
      NotoSansTamil_400Regular,
      NotoSansTamil_500Medium,
      NotoSansTamil_600SemiBold,
      NotoSansTamil_700Bold,
      NotoSansTamil_800ExtraBold,
    };
  }
  if (locale === 'ml') {
    return {
      NotoSansMalayalam_400Regular,
      NotoSansMalayalam_500Medium,
      NotoSansMalayalam_600SemiBold,
      NotoSansMalayalam_700Bold,
      NotoSansMalayalam_800ExtraBold,
    };
  }
  return LATIN_FONT_MAP;
}

SplashScreen.preventAutoHideAsync().catch(() => {
  /* Expo Go may already have shown its own splash */
});

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    tracesSampleRate: 0.2,
    enabled: !__DEV__,
  });
}

function languageMatches(locale: string) {
  const current = i18n.resolvedLanguage || i18n.language;
  return current === locale || current.startsWith(`${locale}-`);
}

function LocaleSync() {
  const locale = useLocale((s) => s.locale);
  const hydrated = useLocale((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    if (!languageMatches(locale)) {
      void i18n.changeLanguage(locale);
    }
  }, [hydrated, locale]);

  return null;
}

function ScriptFonts() {
  const locale = useLocale((s) => s.locale);
  useFonts(scriptFontMap(locale));
  return null;
}

export default function RootLayout() {
  const hydrateAuth = useAuth((s) => s.hydrate);
  const [latinLoaded] = useFonts(LATIN_FONT_MAP);

  useEffect(() => {
    void hydrateAuth();
    const timeout = setTimeout(() => {
      if (!useOrg.getState().hydrated) useOrg.setState({ hydrated: true });
      if (!useOnboarding.getState().hydrated) useOnboarding.setState({ hydrated: true });
      if (!useAuth.getState().hydrated) useAuth.setState({ hydrated: true });
      if (!useLocale.getState().hydrated) useLocale.setState({ hydrated: true });
    }, 1500);
    return () => clearTimeout(timeout);
  }, [hydrateAuth]);

  useEffect(() => {
    void SplashScreen.hideAsync().catch(() => {
      /* Expo Go often has already dismissed its own splash */
    });
  }, []);

  if (!latinLoaded) {
    return (
      <SafeAreaProvider>
        <AppSplash />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <QueryProvider>
        <NetworkBootstrap />
        <ScriptFonts />
        <LocaleSync />
        <StatusBar style="dark" />
        <Slot />
      </QueryProvider>
    </SafeAreaProvider>
  );
}
