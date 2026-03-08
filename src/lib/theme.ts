export type ThemeMode = 'dark' | 'light' | 'purple';

export const themeMap: Record<ThemeMode, string> = {
  dark: 'theme-dark',
  light: 'theme-light',
  purple: 'theme-purple',
};

export const initTheme = (): ThemeMode => {
  const stored = localStorage.getItem('theme') as ThemeMode | null;
  return stored && stored in themeMap ? stored : 'dark';
};
