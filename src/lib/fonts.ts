import { fonts as latinFonts } from '@/constants/theme';
import { useLocale, type AppLocale } from '@/store/locale';

export type AppFonts = {
  sans: string;
  sansMedium: string;
  sansSemibold: string;
  sansBold: string;
  display: string;
  displayExtra: string;
};

function noto(family: string): AppFonts {
  return {
    sans: `${family}_400Regular`,
    sansMedium: `${family}_500Medium`,
    sansSemibold: `${family}_600SemiBold`,
    sansBold: `${family}_700Bold`,
    display: `${family}_700Bold`,
    displayExtra: `${family}_800ExtraBold`,
  };
}

const SCRIPT_FONTS: Partial<Record<AppLocale, AppFonts>> = {
  hi: noto('NotoSansDevanagari'),
  mr: noto('NotoSansDevanagari'),
  bn: noto('NotoSansBengali'),
  pa: noto('NotoSansGurmukhi'),
  te: noto('NotoSansTelugu'),
  kn: noto('NotoSansKannada'),
  ta: noto('NotoSansTamil'),
  ml: noto('NotoSansMalayalam'),
};

export function fontsForLocale(locale: AppLocale): AppFonts {
  return SCRIPT_FONTS[locale] ?? latinFonts;
}

export function useAppFonts() {
  const locale = useLocale((s) => s.locale);
  return fontsForLocale(locale);
}
