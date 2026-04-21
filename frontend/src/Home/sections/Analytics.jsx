import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView, useMotionValue, animate } from 'framer-motion';

const stats = [
  { value: 125000, label: 'Matches Tracked', suffix: '+', icon: '🏏' },
  { value: 48000, label: 'Active Players', suffix: '+', icon: '🧑‍🤝‍🧑' },
  { value: 8500000, label: 'Runs Scored', suffix: '+', icon: '🏃' },
  { value: 2400, label: 'Tournaments', suffix: '+', icon: '🏆' },
];

function CountUpNumber({ target, suffix = '', inView }) {
  const count = useMotionValue(0);
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (!inView) return;
    const controls = animate(count, target, {
      duration: 2.5,
      ease: 'easeOut',
      onUpdate: (v) => {
        if (target >= 1000000) {
          setDisplay((v / 1000000).toFixed(1) + 'M');
        } else if (target >= 1000) {
          setDisplay(Math.floor(v / 1000) + 'K');
        } else {
          setDisplay(Math.floor(v).toString());
        }
      },
    });
    return controls.stop;
  }, [inView, target, count]);

  return (
    <span className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[#00f3ff] to-[#bc13fe] bg-clip-text text-transparent">
      {display}{suffix}
    </span>
  );
}

export default function Analytics() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="analytics" className="py-24 relative z-20">
      {/* Background glow */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00f3ff]/5 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-[#00f3ff] font-medium tracking-widest uppercase text-sm mb-3">Analytics</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            The Numbers Speak{' '}
            <span className="bg-gradient-to-r from-[#00f3ff] to-[#bc13fe] bg-clip-text text-transparent">
              For Themselves
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="bg-white/[0.03] backdrop-blur-md border border-white/[0.06] rounded-2xl p-8 text-center hover:bg-white/[0.06] transition-all duration-300"
            >
              <div className="text-3xl mb-4">{stat.icon}</div>
              <CountUpNumber target={stat.value} suffix={stat.suffix} inView={isInView} />
              <p className="text-gray-400 text-sm mt-3">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
