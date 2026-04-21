import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const clients = [
  { name: 'Delhi Premier League', initials: 'DPL' },
  { name: 'Mumbai Cricket Academy', initials: 'MCA' },
  { name: 'Chennai Super Stars', initials: 'CSS' },
  { name: 'Bangalore United CC', initials: 'BUC' },
  { name: 'Hyderabad Chargers', initials: 'HC' },
  { name: 'Kolkata Knights', initials: 'KK' },
  { name: 'Punjab Warriors', initials: 'PW' },
  { name: 'Rajasthan Royale', initials: 'RR' },
];

export default function Clients() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="clients" className="py-24 relative z-20">
      <div className="max-w-7xl mx-auto px-6" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-[#00f3ff] font-medium tracking-widest uppercase text-sm mb-3">Partners</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Powering Cricket{' '}
            <span className="bg-gradient-to-r from-[#00f3ff] to-[#bc13fe] bg-clip-text text-transparent">
              Worldwide
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {clients.map((client, i) => (
            <motion.div
              key={client.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="group relative bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:bg-white/[0.05] hover:border-[#00f3ff]/20 transition-all duration-300 cursor-pointer"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#00f3ff]/0 to-[#bc13fe]/0 group-hover:from-[#00f3ff]/5 group-hover:to-[#bc13fe]/5 transition-all duration-300" />

              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/[0.08] flex items-center justify-center group-hover:border-[#00f3ff]/20 transition-all duration-300">
                <span className="text-xl font-bold text-gray-400 group-hover:text-[#00f3ff] transition-colors duration-300">
                  {client.initials}
                </span>
              </div>

              <p className="text-gray-500 text-sm text-center group-hover:text-gray-300 transition-colors duration-300">
                {client.name}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
