import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/i18n/locales/en.json';
import hi from '@/i18n/locales/hi.json';
import bn from '@/i18n/locales/bn.json';
import mr from '@/i18n/locales/mr.json';
import pa from '@/i18n/locales/pa.json';
import te from '@/i18n/locales/te.json';
import kn from '@/i18n/locales/kn.json';
import ta from '@/i18n/locales/ta.json';
import ml from '@/i18n/locales/ml.json';

const i18nWithReact = i18n as typeof i18n & { use: (plugin: unknown) => typeof i18n };
void i18nWithReact.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    bn: { translation: bn },
    mr: { translation: mr },
    pa: { translation: pa },
    te: { translation: te },
    kn: { translation: kn },
    ta: { translation: ta },
    ml: { translation: ml },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
