import { useTheme, type ThemeMode } from '@/lib/theme';

const expressions: Record<ThemeMode, [string, string]> = {
  'mature-white': ['M7 12q2 2 4 0m6 0q2 2 4 0', 'M12 17q2 2 4 0'],
  'onyx-black': ['M6 12q2-2 5-1m6 1q3-1 5-3', 'M10 17q5 5 9-1'],
  rainbow: ['M6.5 13q2-4 4.5 0m6 0q2-4 4.5 0', 'M10 16q4 6 8 0'],
};
export function X1Mark({ size = 'md', mode }: {size?: 'sm'|'md'|'lg';mode?: ThemeMode}) {
  const [theme] = useTheme();
  const [eyes,mouth] = expressions[mode ?? theme];
  return <span className={'x1-mark universe-mark mark-'+size} aria-label="X1 brand mark" data-expression={mode ?? theme}>
    <span className="mark-word">X1</span>
    <svg className="mark-face" viewBox="0 0 28 28" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path className="mark-eyes" d={eyes}/><path d={mouth}/></svg>
  </span>;
}
