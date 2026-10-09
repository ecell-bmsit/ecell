"use client";
import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export default function LampDemo() {
  return (
    <LampContainer>
      <motion.h1
        initial={{ opacity: 0.5, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="mt-8 bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl"
      >
        Build lamps <br /> the right way
      </motion.h1>
    </LampContainer>
  );
}

export const LampContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "relative flex md:min-h-screen flex-col items-center justify-center overflow-hidden bg-black w-full z-0 pt-32 pb-16 md:py-0",
        className
      )}
    >
      <div className="hidden md:flex relative w-full flex-1 scale-y-125 items-center justify-center isolate z-0">
        <div className="hidden md:flex absolute inset-0 w-full h-full items-center justify-center">
          {/* Left conic beam */}
          <motion.div
            initial={{ opacity: 0.5, width: "min(15rem, 40vw)" }}
            whileInView={{ opacity: 1, width: "min(30rem, 80vw)" }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              ease: "easeInOut",
            }}
            style={{
              backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
              width: undefined,
            }}
            className="absolute inset-auto right-1/2 h-56 overflow-visible bg-gradient-conic from-white via-transparent to-transparent text-white [--conic-position:from_70deg_at_center_top] lamp-light-from"
          >
            <div className="absolute w-[100%] left-0 bg-black h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
            <div className="absolute w-40 h-[100%] left-0 bg-black bottom-0 z-20 [mask-image:linear-gradient(to_right,white,transparent)]" />
          </motion.div>

          {/* Right conic beam */}
          <motion.div
            initial={{ opacity: 0.5, width: "min(15rem, 40vw)" }}
            whileInView={{ opacity: 1, width: "min(30rem, 80vw)" }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              ease: "easeInOut",
            }}
            style={{
              backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
              width: undefined,
            }}
            className="absolute inset-auto left-1/2 h-56 bg-gradient-conic from-transparent via-transparent to-white text-white [--conic-position:from_290deg_at_center_top] lamp-light-to"
          >
            <div className="absolute w-40 h-[100%] right-0 bg-black bottom-0 z-20 [mask-image:linear-gradient(to_left,white,transparent)]" />
            <div className="absolute w-[100%] right-0 bg-black h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
          </motion.div>

          <div className="absolute top-1/2 h-48 w-full translate-y-12 scale-x-150 bg-black blur-2xl"></div>
          <div className="absolute top-1/2 z-50 h-48 w-full bg-transparent opacity-10 backdrop-blur-md"></div>
          <div className="absolute inset-auto z-50 h-36 w-[min(28rem,90vw)] -translate-y-1/2 rounded-full bg-white opacity-20 blur-3xl lamp-light-glow"></div>
          <motion.div
            initial={{ width: "min(8rem, 20vw)" }}
            whileInView={{ width: "min(16rem, 45vw)" }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="absolute inset-auto z-30 h-36 -translate-y-[6rem] rounded-full bg-white opacity-40 blur-2xl lamp-light-glow"
          ></motion.div>

          {/* Horizontal lamp line */}
          <motion.div
            initial={{ width: "min(15rem, 40vw)" }}
            whileInView={{ width: "min(30rem, 80vw)" }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="absolute inset-auto z-50 h-0.5 -translate-y-[7rem] bg-white lamp-stick"
          ></motion.div>

          {/* Black mask above line */}
          <div className="absolute inset-auto z-40 h-44 w-full -translate-y-[12.5rem] bg-black"></div>
        </div>
      </div>

      <div className="relative z-50 flex w-full min-w-0 translate-y-0 md:-translate-y-80 flex-col items-center px-5">
        {children}
      </div>
    </div>
  );
};
