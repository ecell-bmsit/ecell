import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { LampContainer } from '../ui/lamp';

const BuildIdeaCTA = () => (
  <section className="relative bg-black text-white w-full overflow-hidden border-t border-white/10 idea-section-wrapper">
    <LampContainer
      className="min-h-[80vh] md:min-h-screen"
      lampClassName="md:translate-y-48 lg:translate-y-52"
      contentClassName="translate-y-0 pt-16 sm:pt-20 pb-16"
    >
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        <motion.h1
          initial={{ opacity: 0.5, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: 'easeInOut' }}
          className="idea-page-title w-full mb-8 text-center whitespace-nowrap font-normal uppercase tracking-[-0.04em] leading-none"
          style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 7vw, 5rem)', lineHeight: 1 }}
        >
          BUILD YOUR IDEA
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="space-y-3 max-w-3xl"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          <div className="w-full max-w-3xl space-y-0">
            <p className="text-2xl sm:text-3xl md:text-4xl font-medium leading-tight text-white">Got an Idea?</p>
            <div aria-hidden="true" className="h-1 w-full max-w-[600px] mx-auto my-2 bg-neutral-500/80" />
            <p className="text-2xl sm:text-3xl md:text-4xl font-medium leading-tight text-white">but don&apos;t know where to start?</p>
          </div>
          <p className="text-base sm:text-lg md:text-xl font-semibold leading-relaxed text-neutral-300">
            We help you build, refine, and launch it. Your idea stays yours.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 sm:mt-10"
        >
          <Link
            to="/build-your-idea"
            className="inline-flex items-center justify-center gap-2.5 rounded-full bg-[#52525b] px-7 sm:px-9 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#52525b]/20 transition-colors hover:bg-[#71717a]"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            <span>Start your idea</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </LampContainer>
  </section>
);

export default BuildIdeaCTA;