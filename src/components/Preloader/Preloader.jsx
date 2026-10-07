import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const scrambleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ£$€¥₪¤₹₽";

const ScrambleText = ({ targetText, isReady }) => {
  const [text, setText] = useState(
    targetText.split("").map(() => scrambleChars[Math.floor(Math.random() * scrambleChars.length)]).join("")
  );

  useEffect(() => {
    let interval;
    if (isReady) {
      let start = Date.now();
      const scrambleDuration = 400;

      interval = setInterval(() => {
        let now = Date.now();
        let progress = (now - start) / scrambleDuration;

        if (progress >= 1) {
          setText(targetText);
          clearInterval(interval);
        } else {
          let scrambled = targetText.split("").map((c, i) => {
            if (progress > (i / targetText.length)) return c;
            return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
          }).join("");
          setText(scrambled);
        }
      }, 30);
    } else {
      interval = setInterval(() => {
        setText(targetText.split("").map(() => scrambleChars[Math.floor(Math.random() * scrambleChars.length)]).join(""));
      }, 50);
    }
    return () => clearInterval(interval);
  }, [targetText, isReady]);

  return <span>{text}</span>;
}

const Preloader = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t0 = setTimeout(() => setStep(1), 300);  // Scramble locks
    const t1 = setTimeout(() => setStep(2), 800); // Reveal words horizontally
    const t2 = setTimeout(() => setStep(3), 1400); // Slide words BELOW (stack vertically)

    const t3 = setTimeout(() => setStep(4), 2200); // Fade out entire preloader
    const t4 = setTimeout(() => {
      setStep(5);
      if (onComplete) onComplete();
    }, 2800); // Unmount and transition

    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onComplete]);

  if (step === 5) return null;

  const rows = [
    { id: 1, w1: "E-CELL", w2: "INNOVATE" },
    { id: 2, w1: "E-CELL", w2: "IDEATE" },
    { id: 3, w1: "E-CELL", w2: "INSPIRE" },
  ];

  const tickerString = "INNOVATE \u00A0 \u2022 \u00A0 IDEATE \u00A0 \u2022 \u00A0 INSPIRE \u00A0 \u2022 \u00A0 ENTREPRENEURSHIP \u00A0 \u2022 \u00A0 STARTUPS \u00A0 \u2022 \u00A0 LEADERSHIP \u00A0 \u2022 \u00A0 ";

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-[#000000] flex items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: step === 4 ? 0 : 1 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >

      {/* MAIN CONTENT */}
      <div className="relative z-10 flex items-center justify-center w-full px-10 sm:px-24 h-screen">

        <AnimatePresence>
          {step < 4 && (
            <motion.div
              className="flex flex-col items-center gap-6 sm:gap-10 md:gap-14 justify-center absolute w-full h-full"
              exit={{ opacity: 0, scale: 1.1, filter: "blur(5px)" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {rows.map((row) => (
                <motion.div
                  layout
                  key={row.id}
                  className={`flex ${step >= 3 ? 'flex-col space-y-0 sm:-space-y-2 md:-space-y-4 lg:-space-y-3' : 'flex-row gap-0'} items-center justify-center tracking-tight sm:tracking-tighter text-white font-bold sm:font-semibold text-[35px] leading-[0.95] sm:text-5xl md:text-6xl lg:text-[80px] sm:leading-none text-center px-4`}
                  style={{ fontFamily: "var(--font-heading)" }}
                >

                  {/* Word 1: GLOBAL */}
                  <motion.div
                    layout
                    layoutId={row.id === 2 ? "global-text" : undefined}
                    className="whitespace-nowrap text-[#B8C0C2]"
                  >
                    <ScrambleText targetText={row.w1} isReady={step >= 1} />
                  </motion.div>

                  {/* Word 2: PAYMENTS / MONEY / TRANSFERS */}
                  <motion.div
                    layout
                    className="whitespace-nowrap overflow-hidden flex items-center justify-center"
                    initial={{ width: 0, opacity: 0 }}
                    animate={step >= 2 ? { width: "auto", opacity: 1 } : { width: 0, opacity: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <motion.div
                      layout
                      layoutId={row.id === 2 ? "money-text" : undefined}
                      className={step >= 3 ? "pl-0  " : "pl-3 sm:pl-5"}
                    >
                      {row.w2}
                    </motion.div>
                  </motion.div>

                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.div>
  );
};

export default Preloader;