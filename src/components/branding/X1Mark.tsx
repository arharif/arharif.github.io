import { motion } from 'framer-motion';

export function X1Mark({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const cls = size === 'sm' ? 'h-7 w-7 text-xs' : size === 'lg' ? 'h-14 w-14 text-base' : 'h-10 w-10 text-sm';
  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: [0, -2, 0], rotate: [0, 1.2, -1.2, 0], scale: [1, 1.02, 1] }}
      transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
      whileHover={{ scale: 1.08, rotate: 3.5 }}
      className={`x1-mark inline-grid place-items-center overflow-hidden rounded-xl ${cls}`}
      aria-label="X1 brand mark"
    >
      <span className="x1-mark__shine" />
      <span className="x1-mark__spark" />
      <span className="relative z-10 font-semibold tracking-wide">X1</span>
    </motion.div>
  );
}
