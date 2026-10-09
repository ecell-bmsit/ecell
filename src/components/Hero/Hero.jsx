import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import bmsitLogo from '../../assets/bmsit.webp';
import bicepLogo from '../../assets/bicep.webp';
import ecellLogo from '../../assets/ecell1.webp';
import ecellLightLogo from '../../assets/ecell.webp';

const cardConfig = [
  {
    id: 1,
    emoji: "⚡",
    title: "LEAD",
    subtitle: "Change Makers",
    gradient: "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)",
    bgColor: "from-red-500 to-red-600",
    imageUrl: '/hero/img1.webp'
  },
  {
    id: 2,
    emoji: "💡",
    title: "CREATE",
    subtitle: "Solutions Matter",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    bgColor: "from-purple-500 to-purple-600",
    imageUrl: '/hero/img2.webp'
  },
  {
    id: 3,
    emoji: "🚀",
    title: "INNOVATE",
    subtitle: "Future Forward",
    gradient: "linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)",
    bgColor: "from-orange-500 to-orange-600",
    imageUrl: '/hero/img3.webp'
  }
];

const ECellHero = () => {
  const animationStage = 3;
  const [cardAnimation, setCardAnimation] = useState(0);

  useEffect(() => {
    const cardTimer = setInterval(() => {
      setCardAnimation(prev => (prev + 1) % 3);
    }, 2500);
    return () => clearInterval(cardTimer);
  }, []);

  const renderCardContent = (card) => {
    return (
      <div className="w-full h-full overflow-hidden rounded-3xl">
        {card.imageUrl && (
          <img
            src={card.imageUrl}
            alt={card.title}
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority={card.id === 3 ? 'high' : 'auto'}
            decoding="async"
          />
        )}
      </div>
    );
  };


  const renderCard = (cardIndex, isMobile = false) => {
    const card = cardConfig[cardIndex];
    const roundedClass = isMobile ? 'rounded-2xl' : 'rounded-3xl';
    const shadowClass = isMobile ? 'shadow-xl' : 'shadow-2xl';


    const getAnimationClasses = (position) => {
      const translations = isMobile ?
        ['translate-x-4 translate-y-4', 'translate-x-2 translate-y-2', 'translate-x-0 translate-y-0'] :
        ['translate-x-6 translate-y-6', 'translate-x-3 translate-y-3', 'translate-x-0 translate-y-0'];

      const rotations = ['rotate-12', 'rotate-6', 'rotate-0'];
      const scales = ['scale-95', 'scale-98', 'scale-100'];
      const zIndexes = ['z-10', 'z-20', 'z-30'];

      const currentPosition = (cardAnimation + position) % 3;

      return `${rotations[currentPosition]} ${translations[currentPosition]} ${zIndexes[currentPosition]} ${scales[currentPosition]}`;
    };

    return (
      <div
        key={card.id}
        className={`absolute inset-0 ${roundedClass} ${shadowClass} transition-all duration-1000 ease-out ${getAnimationClasses(cardIndex)}`}
        style={{
          background: card.gradient,
          boxShadow: isMobile ? '0 20px 40px -12px rgba(255,255,255,0.15)' : '0 25px 50px -12px rgba(255,255,255,0.15)'
        }}
      >
        {renderCardContent(card, isMobile)}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black relative overflow-x-hidden lg:overflow-hidden hero-section" >


      <motion.div
        className="absolute inset-0 opacity-[0.08] md:opacity-[0.25]"


        style={{
          backgroundImage: `
            linear-gradient(rgba(231, 231, 231, 0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 251, 251, 0.8) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }}
      />

      {/* Enhanced moving gradient accent */}
      <motion.div
        className="absolute inset-0 opacity-[0.4]"
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

      {/* Pulsing Grid Intersections */}


      {/* Logos Section - responsive positioning */}
      <nav className="flex justify-between items-center px-4 md:px-8 pt-3.5 md:pt-4 relative z-50">
        {/* Left: Logo 1 & Logo 2 (and Logo 3 on Mobile) */}
        <div className="flex gap-3 md:gap-6 items-end justify-start -translate-x-2 md:-translate-x-4 -translate-y-1 md:-translate-y-0.5">
          <img src={bmsitLogo} alt="BMSIT Logo" className="h-10 w-10 md:h-14 md:w-14 object-contain md:-translate-y-6" />
          <img src={bicepLogo} alt="BICEP Logo" className="h-10 w-10 md:h-14 md:w-14 object-contain translate-y-3 md:-translate-y-1" />
          
          {/* Mobile-only Third Logo Wrapper */}
          <div className="flex md:hidden items-end">
            <img src={ecellLogo} alt="E-Cell Logo" className="h-8 w-8 object-contain scale-[1.15] -translate-y-0.5 dark-mode-logo" />
            <img src={ecellLightLogo} alt="E-Cell Logo" className="h-8 w-8 object-contain scale-[1.3] translate-y-3 light-mode-logo preserve-color" />
          </div>
        </div>

        {/* Right: Logo 3 (Desktop only) */}
        <div className="hidden md:flex items-end pr-2 md:pr-4 md:translate-x-7">
          <img src={ecellLogo} alt="E-Cell Logo" className="h-10 w-10 object-contain scale-[1.15] -translate-y-1.5 dark-mode-logo" />
          <img src={ecellLightLogo} alt="E-Cell Logo" className="h-10 w-10 object-contain scale-[1.3] translate-y-1 light-mode-logo preserve-color" />
        </div>
      </nav>

      <div className="flex flex-col justify-center min-h-screen relative px-4 pt-4 pb-24 sm:pb-12 md:pb-24 lg:pb-20 z-10">

        {/* Enhanced Initial Animation - "WE ARE ENTREPRENEURSHIP CELL" */}
        <motion.div
          className={`absolute inset-0 flex items-center justify-center transition-all duration-1500 ease-out ${animationStage === 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            } ${animationStage >= 2 ? 'opacity-0 pointer-events-none scale-110' : ''}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: animationStage === 1 ? 1 : 0, y: animationStage === 1 ? 0 : -30 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="text-center max-w-6xl mx-auto">
            {/* Mobile-first responsive text */}
            <motion.h1
              className="font-bold text-white leading-tight"
              style={{ fontFamily: 'var(--font-heading)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.3 }}
            >
              {/* WE ARE - Main text */}
              <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl mb-2 sm:mb-4">
                WE ARE
              </div>

              {/* ENTREPRENEURSHIP - Balanced sizing */}
              <div className="italic font-light text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl mb-2 sm:mb-4 px-2">
                ENTREPRENEURSHIP
              </div>

              {/* CELL */}
              <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl">
                CELL
              </div>
            </motion.h1>
          </div>
        </motion.div>
        {/* Main Layout */}
        <div className={`w-full transition-all duration-2000 ease-out ${animationStage >= 2 ? 'opacity-100' : 'opacity-0'
          } ${animationStage < 2 ? 'pointer-events-none' : ''}`}>

          {/* Desktop Layout */}
          <div className="hidden lg:flex items-center justify-center gap-16 xl:gap-20 2xl:gap-24">

            {/* Left Text */}
            <div className={`text-right transform transition-all duration-2000 ease-out ${animationStage >= 2 ? 'translate-x-0 opacity-100' : 'translate-x-24 opacity-0'
              }`}>
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                WE<br />
                <span className="italic font-light">ARE</span><br />
                <span className="text-4xl lg:text-5xl xl:text-6xl">E-CELL</span>
              </h1>
            </div>

            {/* Center Cards - Balanced Size */}
            <div className={`relative flex-shrink-0 transform transition-all duration-1500 ease-out ${animationStage >= 2 ? 'scale-100 opacity-100 rotate-0' : 'scale-75 opacity-0 rotate-12'
              }`} style={{ transitionDelay: '300ms' }}>
              <div className="relative w-72 h-88 xl:w-80 xl:h-96">
                {cardConfig.map((_, index) => renderCard(index, false))}
              </div>
            </div>

            {/* Right Text */}
            <div className={`text-left transform transition-all duration-2000 ease-out ${animationStage >= 2 ? 'translate-x-0 opacity-100' : '-translate-x-24 opacity-0'
              }`}>
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                <span className="italic font-bold">IDEATE</span><br />
                <span className="italic font-bold">INNOVATE</span><br />
                <span className="italic font-bold">INSPIRE</span>
              </h1>
            </div>

          </div>

          {/* Mobile Layout - Centered */}
          <div className="lg:hidden flex flex-col items-center justify-center text-center space-y-4">

            {/* Mobile Text - Centered */}
            <div className={`transform transition-all duration-2000 ease-out ${animationStage >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
              }`}>
              <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight text-center" style={{ fontFamily: 'var(--font-heading)' }}>
                WE ARE<br />
                <span className="italic font-light">E-CELL</span>
              </h1>
            </div>

            {/* Mobile Cards - Centered */}
            <div className={`relative flex-shrink-0 transform transition-all duration-1500 ease-out ${animationStage >= 2 ? 'scale-100 opacity-100 rotate-0' : 'scale-75 opacity-0 rotate-12'
              }`} style={{ transitionDelay: '400ms' }}>
              <div className="relative w-44 h-56 sm:w-52 sm:h-64 mx-auto">
                {cardConfig.map((_, index) => renderCard(index, true))}
              </div>
            </div>

            {/* Mobile Additional Text - Centered */}


          </div>

          {/* Description Text - Centered */}
          <div className={`mt-6 lg:mt-16 mb-12 sm:mb-0 max-w-4xl mx-auto text-center transition-all duration-1500 ease-out ${animationStage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`} style={{ transitionDelay: '800ms' }}>
            <p className="text-gray-300 text-sm sm:text-base lg:text-xl leading-relaxed px-6 sm:px-4 text-center w-full box-border" style={{ fontFamily: 'var(--font-heading)' }}>
              Empowering the next generation of innovators and entrepreneurs,{' '}
              <br className="hidden sm:inline" />
              fostering creativity, leadership, and entrepreneurial mindset{' '}
              <br className="hidden sm:inline" />
              to build tomorrow's game-changing ventures.
            </p>
          </div>
        </div>
      </div>
      {/* Seamless Transition Gradient explicitly fading the grid out into solid black for the next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 md:h-40 lg:h-48 bg-gradient-to-b from-transparent via-black/60 to-black pointer-events-none z-10" />
    </div>
  );
};

export default ECellHero;
