"use client";
import React from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowRight, Quote } from "lucide-react";
import { LampContainer } from "@/components/ui/lamp";

export function IdeaSectionHeader() {
  return (
    <div className="w-full bg-black relative z-10 text-white font-sans idea-section-wrapper">
      <LampContainer>
        <motion.h1
          style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1rem, 4.4vw, 4.5rem)" }}
          className="mt-8 w-full min-w-0 px-1 sm:px-4 bg-gradient-to-br from-white to-neutral-400 py-4 bg-clip-text text-center tracking-normal text-transparent opacity-100 translate-y-0 build-idea-text"
        >
          <span className="whitespace-nowrap">BUILD YOUR</span>
          <span className="hidden md:inline"> </span>
          <br className="md:hidden" />
          IDEA
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="block text-center text-neutral-400 max-w-xl mt-4 text-sm sm:text-base md:text-xl px-4 mx-auto w-full"
        >
          Turn your idea into reality with the right guidance and support.
        </motion.p>
      </LampContainer>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 mt-8 md:-mt-48 lg:-mt-64 relative z-20">
        <div className="flex flex-col lg:flex-row gap-16">
          <div className="hidden lg:block lg:basis-2/5 w-full">
            <div className="idea-quote-box bg-[#080808] border border-neutral-800 p-12 lg:sticky lg:top-8 rounded-2xl">
              <div className="relative">
                <Quote className="absolute -top-6 -left-6 w-16 h-16 text-orange-400 idea-quote-icon" />
                <blockquote
                  style={{ fontFamily: "var(--font-heading)" }}
                  className="text-3xl leading-relaxed mb-8 text-white font-bold"
                >
                  People who are crazy enough to think they can change the world are the ones who do.
                  <footer className="text-lg text-neutral-400 mt-4 font-normal">— Steve Jobs</footer>
                </blockquote>
                <hr className="border-neutral-800 mb-6" />
                <div style={{ fontFamily: "var(--font-heading)" }} className="space-y-5 text-neutral-300 text-lg leading-relaxed">

                  <div className="text-2xl text-white font-medium pt-6">
                    We help you build, refine, and launch it. Your idea stays yours.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:basis-3/5 w-full flex flex-col justify-center">
            <div className="lg:hidden text-center mb-8 px-2">
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Got an idea?</h2>
              <p className="text-neutral-400 text-sm">We help you build, refine, and launch it.</p>
            </div>
            <div className="lg:bg-black lg:border lg:border-neutral-800 lg:p-12 p-2 text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">Got an idea but don&apos;t know where to start?</h2>
              <p className="mt-3 text-neutral-400 text-sm sm:text-base">Sign in and share your idea with us.</p>
              <Link
                to="/build-your-idea"
                className="mt-8 inline-flex items-center justify-center gap-3 bg-neutral-600 px-8 py-4 font-bold uppercase tracking-widest text-white transition-colors hover:bg-neutral-500"
              >
                <span>Start your idea</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}