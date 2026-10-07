import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Instagram, Linkedin, MessageCircle } from "lucide-react";

import newsFlashImg from "../Pages/assets/recap/news-flash.png";
import flowerImg from "../Pages/assets/recap/farewell-flower.png";
import filmImg from "../Pages/assets/recap/moments-film.png";

const RecapMenu = ({ isOpen, onClose }) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const containerVars = {
    initial: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
    animate: { transition: { delayChildren: 0.3, staggerChildren: 0.08, staggerDirection: 1 } },
    exit: { transition: { staggerChildren: 0.05, staggerDirection: -1 } }
  };

  const lineVarsX = {
    initial: { scaleX: 0 },
    animate: { scaleX: 1, transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } },
    exit: { scaleX: 0, transition: { duration: 0.4 } }
  };

  const lineVarsY = {
    initial: { scaleY: 0 },
    animate: { scaleY: 1, transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } },
    exit: { scaleY: 0, transition: { duration: 0.4 } }
  };

  const contentVars = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, y: 10, transition: { duration: 0.3 } }
  };

  const scrollToSection = (id) => {
    onClose();
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 300);
  };

  const BORDER = "border-[#2d2b27]/40";
  const LINE_BG = "bg-[#2d2b27]/40";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`fixed inset-0 z-[120] flex text-[#2d2b27] font-serif overflow-hidden select-none border ${BORDER}`}
          style={{
            backgroundColor: "#e8ddd0",
            backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')",
            backgroundBlendMode: "overlay",
          }}
          initial={{ opacity: 0, clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" }}
          animate={{ opacity: 1, clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
          exit={{ opacity: 0, clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-[130] p-3 border-none outline-none focus:outline-none hover:bg-black/5 rounded-full transition-colors cursor-pointer flex items-center justify-center"
            style={{ background: 'transparent' }}
          >
            <X size={32} strokeWidth={3} color="#2d2b27" />
          </button>

          <motion.div
            variants={containerVars}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex w-full h-full"
          >
            {/* ── LEFT SIDEBAR ── */}
            <div className={`hidden lg:flex flex-col justify-between w-64 xl:w-72 px-8 py-10 h-full shrink-0 relative border-r ${BORDER}`}>
              <motion.div variants={lineVarsY} className={`absolute right-[-1px] top-0 w-[1px] ${LINE_BG} origin-top h-full`} />

              <motion.div variants={contentVars}>
                <div className="text-[10px] tracking-[0.25em] mb-6 font-sans font-medium text-[#2d2b27]/50 uppercase">EST. 2022</div>
                <h1 className="text-5xl font-black leading-[0.88] tracking-tight uppercase text-[#2d2b27]">
                  E-CELL<br />BMSIT<br />TIMES
                </h1>
                <div className="w-8 h-[2px] bg-[#2d2b27] my-7" />
                <div className="text-[10px] tracking-widest font-sans font-medium leading-relaxed text-[#2d2b27]/50 uppercase">
                  E-CELL BMSIT<br />ANNUAL RECAP<br />2025–26
                </div>
              </motion.div>

              <motion.div variants={contentVars} className="text-[9px] uppercase tracking-widest font-sans font-semibold text-[#2d2b27]/40">
                VOL. IV • NO. 42<br />THE AUTUMN CURATOR
              </motion.div>
            </div>

            {/* ── MAIN BENTO GRID ── */}
            <div className="flex flex-col flex-1 h-full overflow-hidden">

              {/* ROW 1: News Flash + Events  (top ~45% height) */}
              <div className={`flex flex-row h-[45%] border-b ${BORDER} relative`}>
                <motion.div variants={lineVarsX} className={`absolute bottom-[-1px] left-0 h-[1px] ${LINE_BG} origin-left w-full z-10`} />

                {/* ── 01 NEWS FLASH ── */}
                <div 
                  onClick={() => scrollToSection('news-flash-section')}
                  className={`w-[35%] relative border-r ${BORDER} flex flex-col items-start p-6 xl:p-8 overflow-hidden cursor-pointer hover:bg-black/5 transition-colors`}
                >
                  <motion.div variants={lineVarsY} className={`absolute right-[-1px] top-0 w-[1px] ${LINE_BG} origin-top h-full`} />

                  {/* Number — top left, stacked: "01" then short dash below */}
                  <motion.div variants={contentVars} className="mb-5 self-start">
                    <span className="text-xl font-light font-serif block leading-tight">01</span>
                    <div className="h-[1px] w-7 bg-[#2d2b27]/70 mt-2" />
                  </motion.div>

                  {/* Newspaper image — fixed width, left-aligned */}
                  <motion.div
                    variants={contentVars}
                    className="mb-auto"
                    style={{ width: "min(160px, 55%)" }}
                    whileHover={{ scale: 1.05, rotate: -2 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <img src={newsFlashImg} alt="Newspaper" className="w-full drop-shadow-lg" />
                  </motion.div>

                  {/* Heading — bottom left, left-aligned */}
                  <motion.div variants={contentVars} className="mt-4">
                    <motion.h2 
                      className="text-3xl xl:text-4xl font-black uppercase tracking-tight leading-[0.88] mb-3 text-[#2d2b27] text-left origin-left"
                      whileHover={{ fontStyle: "italic", x: 10, fontFamily: "var(--font-subheading)" }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      NEWS<br />FLASH
                    </motion.h2>
                    <div className="w-6 h-[1px] bg-[#2d2b27]/50 mb-3" />
                    <p className="font-serif italic text-sm xl:text-base text-[#2d2b27]/65 leading-snug text-left" style={{ maxWidth: "80%" }}>
                      Latest updates and achievements from the year.
                    </p>
                  </motion.div>
                </div>

                {/* ── 02 EVENTS ── */}
                <div 
                  onClick={() => scrollToSection('events-section')}
                  className="flex-1 relative flex flex-col items-start p-6 xl:p-8 overflow-hidden cursor-pointer hover:bg-black/5 transition-colors"
                >
                  {/* Number — stacked: "02" then short dash below, top left */}
                  <motion.div variants={contentVars} className="mb-auto z-10">
                    <span className="text-xl font-light font-serif block leading-tight">02</span>
                    <div className="h-[1px] w-7 bg-[#2d2b27]/70 mt-2" />
                  </motion.div>

                  {/* Watermark EV — top right, very faint */}
                  <motion.div
                    variants={contentVars}
                    className="absolute top-0 right-0 font-black leading-none text-[#2d2b27]/[0.04] select-none pointer-events-none"
                    style={{ fontSize: "clamp(8rem, 25vw, 22rem)" }}
                  >
                    EV
                  </motion.div>

                  {/* Giant EVENTS — left-aligned, vertically centered */}
                  <motion.div variants={contentVars} className="z-10 flex-1 flex items-center">
                    <motion.h2
                      className="font-black uppercase tracking-tight text-[#2d2b27] leading-none text-left origin-left"
                      style={{ fontSize: "clamp(3rem, 10vw, 9rem)" }}
                      whileHover={{ fontStyle: "italic", x: 10, fontFamily: "var(--font-subheading)" }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      Events
                    </motion.h2>
                  </motion.div>

                  {/* Description — bottom left under line */}
                  <motion.div variants={contentVars} className="z-10">
                    <div className="w-8 h-[1px] bg-[#2d2b27]/70 mb-3" />
                    <p className="font-serif italic text-sm xl:text-base text-[#2d2b27]/65 max-w-[220px] leading-snug text-left">
                      A highlight of all the events that brought us together.
                    </p>
                  </motion.div>
                </div>
              </div>

              {/* ROW 2: Moments + Farewell (left 75%) / Socials (right 25%) */}
              <div className={`flex flex-row flex-1 min-h-0 relative`}>

                {/* ── LEFT COLUMN: 03 Moments + 04 Farewell ── */}
                <div className={`flex flex-col w-[75%] border-r ${BORDER} relative`}>
                  <motion.div variants={lineVarsY} className={`absolute right-[-1px] top-0 w-[1px] ${LINE_BG} origin-top h-full`} />

                  {/* ── 03 MOMENTS ── */}
                  <div 
                    onClick={() => scrollToSection('gallery-section')}
                    className={`flex-1 border-b ${BORDER} relative flex flex-col items-start p-6 xl:p-8 overflow-hidden cursor-pointer hover:bg-black/5 transition-colors`}
                  >
                    <motion.div variants={lineVarsX} className={`absolute bottom-[-1px] left-0 h-[1px] ${LINE_BG} origin-left w-full z-10`} />

                    {/* Number — stacked: "03" then short dash below */}
                    <motion.div variants={contentVars} className="mb-4 z-10">
                      <span className="text-xl font-light font-serif block leading-tight">03</span>
                      <div className="h-[1px] w-7 bg-[#2d2b27]/70 mt-2" />
                    </motion.div>

                    {/* Content row: heading left, film strip right */}
                    <div className="flex items-center justify-between flex-1 min-h-0 z-10">
                      <motion.div variants={contentVars}>
                        <motion.h2
                          className="font-black uppercase tracking-tight text-[#2d2b27] leading-none mb-3 text-left origin-left"
                          style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)" }}
                          whileHover={{ fontStyle: "italic", x: 10, fontFamily: "var(--font-subheading)" }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                          Moments
                        </motion.h2>
                        <div className="w-8 h-[1px] bg-[#2d2b27]/50 mb-3" />
                        <p className="font-serif italic text-sm xl:text-base text-[#2d2b27]/65 max-w-[200px] leading-snug text-left">
                          Snapshots of memories that made the year unforgettable.
                        </p>
                      </motion.div>

                      {/* Film strip — right side */}
                      <motion.div
                        variants={contentVars}
                        className="shrink-0 w-[32%] mr-2 flex items-center justify-center -translate-y-2"
                        whileHover={{ rotate: 2, scale: 1.03 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                      >
                        <img src={filmImg} alt="Film strip" className="w-full mix-blend-multiply opacity-90 drop-shadow-md" />
                      </motion.div>
                    </div>
                  </div>

                  {/* ── 04 FAREWELL ── */}
                  <div 
                    onClick={() => scrollToSection('farewell-section')}
                    className="flex-1 relative flex flex-col items-start p-6 xl:p-8 cursor-pointer hover:bg-black/5 transition-colors"
                  >
                    {/* Number — stacked: "04" then short dash below */}
                    <motion.div variants={contentVars} className="mb-4 z-10">
                      <span className="text-xl font-light font-serif block leading-tight">04</span>
                      <div className="h-[1px] w-7 bg-[#2d2b27]/70 mt-2" />
                    </motion.div>

                    {/* Heading + description — left-aligned */}
                    <motion.div variants={contentVars} className="z-10">
                      <motion.h2
                        className="font-black uppercase tracking-tight text-[#2d2b27] leading-none mb-3 text-left origin-left"
                        style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)" }}
                        whileHover={{ fontStyle: "italic", x: 10, fontFamily: "var(--font-subheading)" }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        Farewell
                      </motion.h2>
                      <div className="w-8 h-[1px] bg-[#2d2b27]/50 mb-3" />
                      <p className="font-serif italic text-sm xl:text-base text-[#2d2b27]/65 max-w-[220px] leading-snug text-left">
                        Honouring goodbyes, celebrating new beginnings.
                      </p>
                    </motion.div>

                    {/* Flower — absolute right, bleeds across border into Socials */}
                    <motion.div
                      variants={contentVars}
                      className="absolute bottom-[-5px] right-[-60px] w-[75%] max-w-[500px] pointer-events-none z-20"
                      style={{ mixBlendMode: "multiply", opacity: 0.85 }}
                    >
                      <img src={flowerImg} alt="Floral decoration" className="w-full" />
                    </motion.div>
                  </div>
                </div>

                {/* ── 05 SOCIALS ── */}
                <div 
                  onClick={() => scrollToSection('network-section')}
                  className="w-[25%] relative flex flex-col items-start p-6 xl:p-8 overflow-hidden cursor-pointer hover:bg-black/5 transition-colors"
                >

                  {/* Number — stacked: "05" then short dash below */}
                  <motion.div variants={contentVars} className="mb-6 z-10">
                    <span className="text-xl font-light font-serif block leading-tight">05</span>
                    <div className="h-[1px] w-7 bg-[#2d2b27]/70 mt-2" />
                  </motion.div>

                  {/* Socials heading + links */}
                  <motion.div variants={contentVars} className="z-10">
                    <motion.h2 
                      className="text-2xl xl:text-3xl font-black uppercase tracking-tight text-[#2d2b27] leading-none mb-6 xl:mb-8 text-left origin-left"
                      whileHover={{ fontStyle: "italic", x: 10, fontFamily: "var(--font-subheading)" }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      Socials
                    </motion.h2>
                    <ul className="space-y-4 xl:space-y-5">
                      <li className="flex items-center gap-3 text-sm xl:text-base font-serif italic text-[#2d2b27] cursor-pointer hover:opacity-70 transition-opacity">
                        <div className="p-[6px] border border-[#2d2b27]/50 rounded-full shrink-0">
                          <Instagram size={16} strokeWidth={1} />
                        </div>
                        Instagram
                      </li>
                      <li className="flex items-center gap-3 text-sm xl:text-base font-serif italic text-[#2d2b27] cursor-pointer hover:opacity-70 transition-opacity">
                        <div className="p-[6px] border border-[#2d2b27]/50 rounded-full shrink-0">
                          <Linkedin size={16} strokeWidth={1} />
                        </div>
                        LinkedIn
                      </li>
                      <li className="flex items-center gap-3 text-sm xl:text-base font-serif italic text-[#2d2b27] cursor-pointer hover:opacity-70 transition-opacity">
                        <div className="p-[6px] border border-[#2d2b27]/50 rounded-full shrink-0">
                          <MessageCircle size={16} strokeWidth={1} />
                        </div>
                        WhatsApp
                      </li>
                    </ul>
                  </motion.div>

                  {/* Postmark stamp — bottom right decorative */}
                  <motion.div
                    variants={contentVars}
                    className="absolute -bottom-10 -right-10 w-32 h-32 xl:w-44 xl:h-44 border border-[#2d2b27]/15 rounded-full flex items-center justify-center pointer-events-none"
                  >
                    <div className="w-24 h-24 xl:w-36 xl:h-36 border border-dashed border-[#2d2b27]/10 rounded-full" />
                    <div className="absolute right-6 xl:right-10 top-1/2 -translate-y-1/2 flex flex-col gap-[5px]">
                      <div className="w-10 xl:w-16 h-[1px] bg-[#2d2b27]/10" />
                      <div className="w-10 xl:w-16 h-[1px] bg-[#2d2b27]/10" />
                      <div className="w-10 xl:w-16 h-[1px] bg-[#2d2b27]/10" />
                    </div>
                  </motion.div>
                </div>

              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RecapMenu;
