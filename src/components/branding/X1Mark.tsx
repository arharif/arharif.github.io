import { motion } from 'framer-motion';

export function X1Mark({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const cls = size === 'sm' ? 'h-7 w-7 text-xs' : size === 'lg' ? 'h-14 w-14 text-base' : 'h-10 w-10 text-sm';
  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: [0, -3, 0], rotate: [0, 1.5, -1.5, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      whileHover={{ scale: 1.08, rotate: 4 }}
      className={`inline-grid place-items-center rounded-xl bg-gradient-to-br from-cyan-400/45 via-violet-500/45 to-fuchsia-500/45 shadow-[0_0_26px_rgba(139,92,246,.5)] ${cls}`}
      aria-label="X1 brand mark"
    >
      <span className="font-semibold tracking-wide">X1</span>
    </motion.div>
  );
}
