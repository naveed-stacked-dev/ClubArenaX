import React, { useRef, Suspense } from 'react';
import { motion, useInView } from 'framer-motion';
import { Send } from 'lucide-react';
import StadiumScene from '../three/StadiumScene';

export default function Contact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="contact" className="py-24 relative z-20 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 z-0">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#bc13fe]/5 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-[#00f3ff] font-medium tracking-widest uppercase text-sm mb-3">Get in Touch</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to{' '}
            <span className="bg-gradient-to-r from-[#00f3ff] to-[#bc13fe] bg-clip-text text-transparent">
              Level Up?
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* 3D Stadium */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="h-[350px] sm:h-[400px] rounded-2xl overflow-hidden border border-white/[0.06]"
          >
            <Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center bg-white/[0.02]">
                  <div className="w-8 h-8 border-2 border-[#00f3ff] border-t-transparent rounded-full animate-spin" />
                </div>
              }
            >
              <StadiumScene />
            </Suspense>
          </motion.div>

          {/* Contact Form */}
          <motion.form
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="bg-white/[0.03] backdrop-blur-md border border-white/[0.06] rounded-2xl p-8 space-y-6"
            onSubmit={(e) => e.preventDefault()}
          >
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Name</label>
              <input
                type="text"
                placeholder="Your name"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#00f3ff]/40 transition-colors"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Email</label>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#00f3ff]/40 transition-colors"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Message</label>
              <textarea
                rows={4}
                placeholder="Tell us about your needs..."
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#00f3ff]/40 transition-colors resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#00f3ff] to-[#bc13fe] text-black font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_25px_rgba(0,243,255,0.3)] transition-all hover:scale-[1.02]"
            >
              <Send className="w-4 h-4" />
              Send Message
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
