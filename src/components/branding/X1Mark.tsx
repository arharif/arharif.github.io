import type { ThemeMode } from '@/lib/theme';

export function X1Mark({ size = 'md' }: { size?: 'sm' | 'md' | 'lg'; mode?: ThemeMode }) {
  return <span className={`x1-mark universe-mark mark-${size}`} aria-label="X1 brand mark">X1</span>;
}
