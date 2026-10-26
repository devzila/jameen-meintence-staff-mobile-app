export const colors = {
  brand50: '#FDF1E7',
  brand100: '#F8D4B4',
  brand500: '#E2711D',
  brand600: '#C75E12',
  brand700: '#9F4A0E',
  ink50: '#F5F5F6',
  ink100: '#F0F0F2',
  ink200: '#E4E4E7',
  ink400: '#9A9AA6',
  ink500: '#6B6B76',
  ink600: '#4B4B56',
  ink700: '#2A2A32',
  ink800: '#1A1A1C',
  ink900: '#111114',
  accentViolet: '#7C5CFF',
  surface: '#FFFFFF',
  surfaceMuted: '#F5F5F6',
  danger: '#B91C1C',
  dangerBg: '#FDE8E8',
  dangerBorder: '#F5B5B5',
  success: '#15803D',
  successBg: '#E6F6ED',
  warning: '#C2410C',
  warningBg: '#FFF4E0',
  info: '#1D4ED8',
  infoBg: '#E8F0FE',
  white: '#FFFFFF',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radii = {
  sm: 8,
  md: 10,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 999,
} as const;

export const fonts = {
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemibold: 'Inter_600SemiBold',
  sansBold: 'Inter_700Bold',
  display: 'PlusJakartaSans_700Bold',
  displayExtra: 'PlusJakartaSans_800ExtraBold',
} as const;

/** Shared fade for custom Pressables (stats, rows, header icons). */
export const press = {
  opacity: 0.72,
} as const;

export const shadows = {
  e1: {
    shadowColor: '#111114',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  e2: {
    shadowColor: '#111114',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  e3: {
    shadowColor: '#111114',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 4,
  },
} as const;
