'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';

import { cn } from '@/lib/utils';

/** Opacity-only — transforms are paint-safe for CLS, but fade-only is enough. */
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

type MotionSectionProps = HTMLMotionProps<'section'> & {
  readonly delay?: number;
};

/** Subtle fade/slide-in for dashboard sections. */
export function MotionSection({ className, delay = 0, children, ...props }: MotionSectionProps) {
  return (
    <motion.section
      className={cn(className)}
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      transition={{ duration: 0.35, ease: 'easeOut', delay }}
      {...props}
    >
      {children}
    </motion.section>
  );
}

type MotionItemProps = HTMLMotionProps<'div'> & {
  readonly index?: number;
};

/** Staggered card entrance for KPI grids. */
export function MotionItem({ className, index = 0, children, ...props }: MotionItemProps) {
  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut', delay: 0.05 * index }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
