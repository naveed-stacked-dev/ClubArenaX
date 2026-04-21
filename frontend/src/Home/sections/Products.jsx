import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Zap, Trophy, BarChart3, Users, Radio, Shield } from 'lucide-react';

const products = [
  {
    icon: Radio,
    title: 'Live Scoring',
    description: 'Real-time ball-by-ball scoring with instant updates across all devices. Keep fans engaged with live commentary.',
    gradient: 'from-[#00f3ff] to-[#0066ff]',
  },
  {
    icon: Trophy,
    title: 'Tournament Management',
    description: 'Create and manage tournaments with automated fixtures, standings, and bracket generation.',
    gradient: 'from-[#bc13fe] to-[#7b2fdb]',
  },
  {
    icon: BarChart3,
    title: 'Deep Analytics',
    description: 'AI-powered player performance insights, team statistics, and match predictions at your fingertips.',
    gradient: 'from-[#00f3ff] to-[#bc13fe]',
  },
  {
    icon: Users,
    title: 'Team Management',
    description: 'Organize squads, manage player profiles, track availability, and coordinate practice sessions.',
    gradient: 'from-[#0066ff] to-[#00f3ff]',
  },
  {
    icon: Zap,
    title: 'Instant Notifications',
    description: 'Push notifications for scores, wickets, milestones, and match events in real-time.',
    gradient: 'from-[#7b2fdb] to-[#bc13fe]',
  },
  {
    icon: Shield,
    title: 'Secure Platform',
    description: 'Enterprise-grade security with role-based access control and encrypted data storage.',
    gradient: 'from-[#bc13fe] to-[#00f3ff]',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
};

export default function Products() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="products" className="py-24 relative z-20">
      <div className="max-w-7xl mx-auto px-6" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-[#00f3ff] font-medium tracking-widest uppercase text-sm mb-3">Features</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-[#00f3ff] to-[#bc13fe] bg-clip-text text-transparent">
              Dominate
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Powerful tools designed for cricket clubs, academies, and leagues of all sizes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, i) => (
            <motion.div
              key={product.title}
              custom={i}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              variants={cardVariants}
              className="group relative bg-white/[0.03] backdrop-blur-md border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 cursor-pointer"
            >
              {/* Hover glow */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${product.gradient} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-300`} />

              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${product.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                <product.icon className="w-6 h-6 text-white" />
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">{product.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{product.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
