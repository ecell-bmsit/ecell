import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

import { IdeaSectionHeader } from '../components/lamp-demo';
import Footer from '../components/Footer/Footer';

const BuildYourIdeaPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="home-page min-h-screen relative" style={{ backgroundColor: '#000000' }}>
      {/* Keep the idea page backgrounds inside this section so they don't cover the footer. */}
      <div className="relative isolate overflow-hidden">
        {/* Background Grid matching Hero section */}
        <motion.div
          className="absolute inset-0 opacity-[0.25] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(231, 231, 231, 0.8) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 251, 251, 0.8) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px'
          }}
        />

        {/* Enhanced moving gradient accent matching Hero section */}
        <motion.div
          className="absolute inset-0 opacity-[0.4] pointer-events-none"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 60%)',
              'radial-gradient(circle at 80% 90%, rgba(255,255,255,0.15) 0%, transparent 60%)',
              'radial-gradient(circle at 40% 70%, rgba(255,255,255,0.12) 0%, transparent 60%)',
              'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 60%)'
            ]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <div className="relative z-10">
          <IdeaSectionHeader />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BuildYourIdeaPage;
