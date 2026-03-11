import { safeStorage } from '@/lib/storage';

export type ThemeMode = 'dark' | 'light' | 'purple' | 'rainbow';

export const themeMap: Record<ThemeMode, string> = {
  dark: 'theme-dark',
  light: 'theme-light',
  purple: 'theme-purple',
  rainbow: 'theme-rainbow',
};

export const initTheme = (): ThemeMode => {
  const stored = safeStorage.get('theme') as ThemeMode | null;
  return stored && stored in themeMap ? stored : 'dark';
};
