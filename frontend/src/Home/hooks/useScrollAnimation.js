import { useScroll } from 'framer-motion';
import { useMemo } from 'react';

/**
 * Custom hook for mapping window scroll progress to animation values.
 * Uses framer-motion's useScroll under the hood.
 * 
 * @param {Object} options - Options for scroll tracking
 * @param {React.RefObject} options.target - Optional target ref for section-scoped scroll
 * @param {Array} options.offset - Scroll offset range, defaults to full page
 * @returns {{ scrollYProgress: MotionValue, scrollY: MotionValue }}
 */
export default function useScrollAnimation(options = {}) {
  const { target, offset } = options;

  const scrollOptions = useMemo(() => {
    const opts = {};
    if (target) {
      opts.target = target;
      opts.offset = offset || ['start end', 'end start'];
    } else {
      opts.offset = offset || ['start start', 'end end'];
    }
    return opts;
  }, [target, offset]);

  const { scrollYProgress, scrollY } = useScroll(scrollOptions);

  return { scrollYProgress, scrollY };
}
