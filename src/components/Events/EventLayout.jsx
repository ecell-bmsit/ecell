import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Footer from '../Footer/Footer';

const EventLayout = ({
  title,
  description,
  stats = [],
  highlights = [],
  galleryImages = [],
  themeColor = 'orange',
  backgroundGradient = 'from-slate-900 via-gray-900 to-black',
}) => {
  const getThemeClasses = (color) => {
    const themes = {
      orange: {
        text: 'text-orange-400',
        bg: 'bg-orange-500',
        border: 'border-orange-500',
        hoverText: 'hover:text-orange-300',
        gradientText: 'from-orange-400 to-red-500',
        highlightBg: 'from-orange-500/10 to-red-500/10',
        highlightBorder: 'border-orange-500/20',
        pillText: 'text-orange-300',
        pillBg: 'bg-orange-500/10',
        pillBorder: 'border-orange-500/30',
        statIcon: 'text-orange-400',
        dot: 'bg-orange-400',
        accentGroup: 'group-hover:text-orange-400',
        hoverBorder: 'group-hover:border-orange-400/20',
        hoverBg: 'group-hover:bg-orange-400/5',
        line: 'bg-orange-400',
        glow: 'rgba(249, 115, 22, 0.15)',
        ring: 'ring-orange-500/30',
      },
      purple: {
        text: 'text-purple-400',
        bg: 'bg-purple-500',
        border: 'border-purple-500',
        hoverText: 'hover:text-purple-300',
        gradientText: 'from-purple-400 to-pink-400',
        highlightBg: 'from-purple-500/10 to-pink-500/10',
        highlightBorder: 'border-purple-500/20',
        pillText: 'text-purple-300',
        pillBg: 'bg-purple-500/10',
        pillBorder: 'border-purple-500/30',
        statIcon: 'text-purple-400',
        dot: 'bg-purple-400',
        accentGroup: 'group-hover:text-purple-400',
        hoverBorder: 'group-hover:border-purple-400/20',
        hoverBg: 'group-hover:bg-purple-400/5',
        line: 'bg-purple-400',
        glow: 'rgba(168, 85, 247, 0.15)',
        ring: 'ring-purple-500/30',
      },
      blue: {
        text: 'text-blue-400',
        bg: 'bg-blue-500',
        border: 'border-blue-500',
        hoverText: 'hover:text-blue-300',
        gradientText: 'from-blue-400 to-cyan-400',
        highlightBg: 'from-blue-500/10 to-cyan-500/10',
        highlightBorder: 'border-blue-500/20',
        pillText: 'text-blue-300',
        pillBg: 'bg-blue-500/10',
        pillBorder: 'border-blue-500/30',
        statIcon: 'text-blue-400',
        dot: 'bg-blue-400',
        accentGroup: 'group-hover:text-blue-400',
        hoverBorder: 'group-hover:border-blue-400/20',
        hoverBg: 'group-hover:bg-blue-400/5',
        line: 'bg-blue-400',
        glow: 'rgba(59, 130, 246, 0.15)',
        ring: 'ring-blue-500/30',
      },
      amber: {
        text: 'text-amber-400',
        bg: 'bg-amber-500',
        border: 'border-amber-500',
        hoverText: 'hover:text-amber-300',
        gradientText: 'from-amber-400 to-yellow-400',
        highlightBg: 'from-amber-500/10 to-yellow-500/10',
        highlightBorder: 'border-amber-500/20',
        pillText: 'text-amber-300',
        pillBg: 'bg-amber-500/10',
        pillBorder: 'border-amber-500/30',
        statIcon: 'text-amber-400',
        dot: 'bg-amber-400',
        accentGroup: 'group-hover:text-amber-400',
        hoverBorder: 'group-hover:border-amber-400/20',
        hoverBg: 'group-hover:bg-amber-400/5',
        line: 'bg-amber-400',
        glow: 'rgba(245, 158, 11, 0.15)',
        ring: 'ring-amber-500/30',
      },
      green: {
        text: 'text-green-400',
        bg: 'bg-green-500',
        border: 'border-green-500',
        hoverText: 'hover:text-green-300',
        gradientText: 'from-green-400 to-emerald-400',
        highlightBg: 'from-green-500/10 to-emerald-500/10',
        highlightBorder: 'border-green-500/20',
        pillText: 'text-green-300',
        pillBg: 'bg-green-500/10',
        pillBorder: 'border-green-500/30',
        statIcon: 'text-green-400',
        dot: 'bg-green-400',
        accentGroup: 'group-hover:text-green-400',
        hoverBorder: 'group-hover:border-green-400/20',
        hoverBg: 'group-hover:bg-green-400/5',
        line: 'bg-green-400',
        glow: 'rgba(34, 197, 94, 0.15)',
        ring: 'ring-green-500/30',
      },
      teal: {
        text: 'text-teal-400',
        bg: 'bg-teal-500',
        border: 'border-teal-500',
        hoverText: 'hover:text-teal-300',
        gradientText: 'from-teal-400 to-cyan-400',
        highlightBg: 'from-teal-500/10 to-cyan-500/10',
        highlightBorder: 'border-teal-500/20',
        pillText: 'text-teal-300',
        pillBg: 'bg-teal-500/10',
        pillBorder: 'border-teal-500/30',
        statIcon: 'text-teal-400',
        dot: 'bg-teal-400',
        accentGroup: 'group-hover:text-teal-400',
        hoverBorder: 'group-hover:border-teal-400/20',
        hoverBg: 'group-hover:bg-teal-400/5',
        line: 'bg-teal-400',
        glow: 'rgba(20, 184, 166, 0.15)',
        ring: 'ring-teal-500/30',
      },
      red: {
        text: 'text-red-400',
        bg: 'bg-red-500',
        border: 'border-red-500',
        hoverText: 'hover:text-red-300',
        gradientText: 'from-red-400 to-rose-500',
        highlightBg: 'from-red-500/10 to-rose-500/10',
        highlightBorder: 'border-red-500/20',
        pillText: 'text-red-300',
        pillBg: 'bg-red-500/10',
        pillBorder: 'border-red-500/30',
        statIcon: 'text-red-400',
        dot: 'bg-red-400',
        accentGroup: 'group-hover:text-red-400',
        hoverBorder: 'group-hover:border-red-400/20',
        hoverBg: 'group-hover:bg-red-400/5',
        line: 'bg-red-400',
        glow: 'rgba(239, 68, 68, 0.15)',
        ring: 'ring-red-500/30',
      },
    };
    return themes[color] || themes.orange;
  };

  const theme = getThemeClasses(themeColor);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: (i = 0) => ({
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: i * 0.1 },
    }),
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${backgroundGradient} text-white relative overflow-hidden`}
      style={{ fontFamily: 'var(--font-heading)' }}
    >
      {/* Background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '120px 120px',
        }}
      />
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{
          background: `radial-gradient(ellipse 80% 50% at 50% -20%, ${theme.glow}, transparent 60%)`,
        }}
      />

      <div className="relative z-10">
        {/* Hero */}
        <motion.section
          className="pt-32 pb-20 px-4 sm:px-6 lg:px-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.span
              variants={itemVariants}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${theme.pillBg} ${theme.pillBorder} ${theme.pillText} text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] mb-8`}
            >
              Event Recap
            </motion.span>
            <motion.h1
              variants={itemVariants}
              className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r ${theme.gradientText} bg-clip-text text-transparent mb-6 leading-tight tracking-tight`}
              style={{ fontFamily: 'var(--font-subheading)' }}
            >
              {title}
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl md:text-2xl text-gray-400 leading-relaxed max-w-2xl mx-auto font-light"
            >
              {description}
            </motion.p>
          </div>
        </motion.section>

        {/* Stats */}
        {stats.length > 0 && (
          <section className="px-4 sm:px-6 lg:px-8 pb-16">
            <div className="max-w-5xl mx-auto">
              <motion.div
                className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                variants={containerVariants}
              >
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className="group relative rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-6 sm:p-8 text-center transition-all duration-300 hover:bg-white/[0.08] hover:border-white/20"
                    >
                      <div
                        className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${theme.bg}/20 ${theme.statIcon} mb-4 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className="w-6 h-6" strokeWidth={2} />
                      </div>
                      <p className="text-2xl sm:text-3xl font-bold text-white tabular-nums mb-1">
                        {stat.value}
                      </p>
                      <p className="text-gray-500 text-sm font-medium">
                        {stat.label}
                      </p>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </section>
        )}

        {/* Highlights */}
        {highlights.length > 0 && (
          <section className="px-4 sm:px-6 lg:px-8 pb-20">
            <div className="max-w-4xl mx-auto">
              <motion.div
                className="flex items-center gap-4 mb-10"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className={`h-0.5 w-16 rounded-full ${theme.bg}`} />
                <h2
                  className="text-2xl sm:text-3xl font-bold text-white"
                  style={{ fontFamily: 'var(--font-subheading)' }}
                >
                  Event Highlights
                </h2>
              </motion.div>
              <motion.div
                className={`rounded-2xl border ${theme.highlightBorder} bg-gradient-to-br ${theme.highlightBg} p-6 sm:p-8 md:p-10`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <ul className="space-y-5 sm:space-y-6">
                  {highlights.map((highlight, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start gap-4"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.06 }}
                    >
                      <span
                        className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded-full ${theme.bg} flex items-center justify-center`}
                      >
                        <Check className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                      </span>
                      <span className="text-gray-300 text-base sm:text-lg leading-relaxed">
                        {highlight}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </section>
        )}

        {/* Gallery */}
        {galleryImages.length > 0 && (
          <section className="px-4 sm:px-6 lg:px-8 pb-28">
            <div className="max-w-6xl mx-auto">
              <motion.div
                className="flex items-center gap-4 mb-10"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className={`h-0.5 w-16 rounded-full ${theme.bg}`} />
                <h2
                  className="text-2xl sm:text-3xl font-bold text-white"
                  style={{ fontFamily: 'var(--font-subheading)' }}
                >
                  Captured Moments
                </h2>
              </motion.div>

              {galleryImages.length === 1 ? (
                <motion.div
                  className="relative overflow-hidden rounded-2xl aspect-video bg-gray-800/50 shadow-2xl"
                  initial={{ opacity: 0, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                >
                  <img
                    src={galleryImages[0]}
                    alt="Event moment"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ) : (
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                  variants={containerVariants}
                >
                  {galleryImages.map((src, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className="group relative overflow-hidden rounded-2xl bg-gray-800/50 aspect-[4/3] sm:aspect-video shadow-xl ring-1 ring-white/5"
                    >
                      <img
                        src={src}
                        alt={`Event moment ${index + 1}`}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div
                        className={`absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300 ${theme.bg}`}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </section>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default EventLayout;
