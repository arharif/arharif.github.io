import { useTheme, type ThemeMode } from '@/lib/theme';

const expressions: Record<ThemeMode, [string,string]> = {
  'editorial-ivory': ['M7 12q2 2 4 0m6 0q2 2 4 0','M12 17q2 2 4 0'],
  'obsidian-sage': ['M6 12q3 3 6 0m4 0q3 3 6 0','M11 17q3 3 6 0'],
  'midnight-slate': ['M7 11l4 1m6 0 4-1','M12 17h4'],
  sandstone: ['M8 12h.6m10.5 0h.6','M11 16q3 3 6 0'],
  'pearl-teal': ['M6.5 13q2-4 4.5 0m6 0q2-4 4.5 0','M10 16q4 6 8 0'],
  aubergine: ['M6 13q2-4 5-1m6 0q3 3 5-1','M9 17q3 4 6 0t5 0'],
  'crimson-red': ['M6 10l5 3-2 1m13-4-5 3 2 1','M12 18q2-2 4-1'],
  'onyx-black': ['M6 12q2-2 5-1m6 1q3-1 5-3','M10 17q5 5 9-1'],
  'imperial-gold': ['M6 10l5 2m6 0 5-2','M11 17q4 3 8-1'],
};
export function X1Mark({ size = 'md', mode }: {size?: 'sm'|'md'|'lg';mode?: ThemeMode}) {
  const [theme] = useTheme();
  const [eyes,mouth] = expressions[mode ?? theme];
  return <span className={'x1-mark universe-mark mark-'+size} aria-label="X1 brand mark" data-expression={mode ?? theme}>
    <span className="mark-word">X1</span>
    <svg className="mark-face" viewBox="0 0 28 28" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path className="mark-eyes" d={eyes}/><path d={mouth}/></svg>
  </span>;
}
