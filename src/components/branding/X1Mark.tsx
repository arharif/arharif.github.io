import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ThemeMode } from '@/lib/theme';

export function X1Mark({ size = 'md', mode }: { size?: 'sm' | 'md' | 'lg'; mode?: ThemeMode }) {
  const cls = size === 'sm' ? 'h-7 w-7 text-xs' : size === 'lg' ? 'h-14 w-14 text-base' : 'h-10 w-10 text-sm';
  const [liveMode, setLiveMode] = useState<ThemeMode>('dark');

  useEffect(() => {
    if (mode) {
      setLiveMode(mode);
      return;
    }
    const read = () => {
      const root = document.documentElement.classList;
      if (root.contains('theme-light')) setLiveMode('light');
      else if (root.contains('theme-purple')) setLiveMode('purple');
      else if (root.contains('theme-rainbow')) setLiveMode('rainbow');
      else setLiveMode('dark');
    };
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, [mode]);

  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: liveMode === 'dark' ? [0, -1, 0] : [0, -2, 0], rotate: [0, 1, -1, 0], scale: [1, 1.02, 1] }}
      transition={{ duration: liveMode === 'dark' ? 5.4 : 4.4, repeat: Infinity, ease: 'easeInOut' }}
      whileHover={{ scale: 1.08, rotate: liveMode === 'purple' ? -3 : 2 }}
      className={`x1-mark x1-mark--${liveMode} inline-grid place-items-center overflow-hidden rounded-xl ${cls}`}
      aria-label="X1 brand mark"
    >
      <span className="x1-mark__shine" />
      <span className="x1-mark__spark" />
      <span className="x1-mark__label relative z-10 font-semibold tracking-wide">X1</span>
      <span className="x1-mark__face" aria-hidden="true">
        <span className="x1-mark__eye x1-mark__eye--left" />
        <span className="x1-mark__eye x1-mark__eye--right" />
        <span className="x1-mark__mouth" />
        <span className="x1-mark__cheek x1-mark__cheek--left" />
        <span className="x1-mark__cheek x1-mark__cheek--right" />
      </span>
    </motion.div>
  );
}
