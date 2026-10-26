import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@/i18n';
import { useLocale } from '@/store/locale';

describe('locale store and i18n', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    useLocale.setState({ locale: 'en', hydrated: true });
    await i18n.changeLanguage('en');
  });

  it('defaults to English', () => {
    expect(useLocale.getState().locale).toBe('en');
    expect(i18n.t('tabs.home')).toBe('Home');
  });

  it('setLocale persists Hindi and updates translations', async () => {
    useLocale.getState().setLocale('hi');
    await i18n.changeLanguage('hi');

    expect(useLocale.getState().locale).toBe('hi');
    expect(i18n.t('tabs.home')).toBe('होम');

    await new Promise((resolve) => setTimeout(resolve, 0));
    const raw = await AsyncStorage.getItem('jameen.maintenance.locale');
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw as string).state.locale).toBe('hi');
  });

  it('setLocale switches to Tamil', async () => {
    useLocale.getState().setLocale('ta');
    await i18n.changeLanguage('ta');

    expect(useLocale.getState().locale).toBe('ta');
    expect(i18n.t('tabs.home')).toBe('முகப்பு');
  });
});
