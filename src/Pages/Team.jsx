import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import teamData from './teamData.json';
import Footer from '../components/Footer/Footer';

// Group photo for the hero section
const teamImage = '/team-image-main.png';

// Dynamically import all team member images via Vite glob
const imageModules = import.meta.glob('./assets/team/*.{jpg,jpeg,png,JPG,HEIF}', {
  eager: true,
  query: '?url',
  import: 'default',
});

/* ─────────────────────────────────────────
   TEAM MEMBER CARD (UNBOXED BORDERLESS STYLE)
───────────────────────────────────────── */
const TeamMemberCard = ({ member, large = false }) => {
  const imageSrc = imageModules[member.image] || member.image;

  // Best effort to split name onto two lines per the reference image stylistic preference
  const nameParts = member.name.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

  return (
    <div className={`team-member-card flex flex-col group cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[6px] ${large ? 'w-65' : 'w-full'}`}>

      {/* Image box: Flush, borderless, matching 4:5 aspect ratio with red reveal hover */}
      <div className="w-full aspect-[4/5] bg-[#0a0000] overflow-hidden relative mb-4 shadow-sm group-hover:shadow-xl transition-shadow duration-500">

        {/* Base: greyscale image that turns to original color on hover */}
        <img
          src={imageSrc}
          alt={member.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:grayscale group-hover:grayscale-0 group-hover:scale-[1.03]"
        />

        {/* Subdued shadow overlay to slightly darken the image on hover if desired */}
        <div
          className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none"
        />
      </div>

      {/* Unboxed Metadata: Large Name, Tiny Position far below */}
      <div className="flex flex-col w-full text-left mt-2">
        {/* Massive 2-line name using Robit font */}
        <h3
          className="team-member-name text-[#e2e2e2] text-xl sm:text-2xl lg:text-3xl xl:text-4xl tracking-wide leading-[1.1] mb-4 group-hover:text-[rgb(215,2,90)] transition-colors duration-300"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <span className="block">{firstName}</span>
          {lastName && <span className="block">{lastName}</span>}
        </h3>

        {/* Tiny uppercase monospace-style position far down */}
        <p
          className="text-gray-400 font-medium text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.2em] leading-relaxed"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {member.position}
        </p>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   TEAM SECTION GROUP
───────────────────────────────────────── */
const TeamSectionGroup = ({ title, members, isLast, showDivider = true, centered = false }) => {
  if (!members || members.length === 0) return null;
  return (
    <div className={`${isLast ? 'mb-0' : 'mb-20 md:mb-32 lg:mb-34'} w-full ${centered ? 'flex flex-col items-center text-center' : ''}`}>
      {/* Subtle Divider Line */}
      {showDivider && <div className="w-full h-[1px] bg-white/10 mb-12" />}

      <h2
        className={`text-white text-3xl md:text-6xl lg:text-7xl font-bold uppercase mt-16 md:mt-24 mb-16 md:mb-28 tracking-tighter ${centered ? 'text-center' : ''}`}
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {title}
      </h2>
      <div className={`grid gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-16 lg:gap-x-10 lg:gap-y-20 ${centered ? 'grid-cols-1 place-items-center' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full'}`}>
        {members.map((member, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, delay: idx * 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <TeamMemberCard member={member} large={centered} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   MAIN TEAM PAGE
───────────────────────────────────────── */
const TeamPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // The team roster is now explicitly structured in teamData.json

  return (
    <div className="font-sans selection:bg-[#ff3b1f] selection:text-white">

      {/* ════════════ HERO SECTION (original light design) ════════════ */}
      <div className="min-h-screen bg-[#f4f4f4] preserve-color relative overflow-hidden pb-8 md:pb-20">

        <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10 w-full flex flex-col">

          {/* Main hero block */}
          <main className="w-full flex flex-col items-center justify-start mt-32 md:mt-32 lg:mt-40 mb-12 md:mb-24 lg:mb-56 px-4">
            <div className="relative w-full text-center flex flex-col items-center">

              {/* THE TEAM headline — sits behind image */}
              <motion.h1
                initial={{ opacity: 0, y: 200 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                className="relative z-0 w-full select-none tracking-tighter text-center flex justify-center"
              >
                <span
                  className="text-[18.5vw] sm:text-[15vw] md:text-[140px] lg:text-[180px] xl:text-[220px] font-black uppercase text-[#ff3b1f] leading-[0.8] whitespace-nowrap"
                  style={{ fontFamily: "var(--font-heading)", fontWeight: 900 }}
                >
                  THE TEAM
                </span>
              </motion.h1>

              {/* Group photo — absolutely positioned OVER the text */}
              <motion.div
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-10 w-[130%] sm:w-[115%] md:w-[105%] max-w-[1400px] left-[57%] top-[-45px] sm:top-[-70px] md:top-[-90px] lg:top-[-120px] xl:top-[-145px] transform -translate-x-1/2 pointer-events-none"
              >
                <img
                  src={teamImage}
                  alt="E-Cell BMSIT Team"
                  loading="eager"
                  fetchPriority="high"
                  className="team-hero-photo w-full h-auto object-contain filter grayscale brightness-[0.86] contrast-[1.08]"
                  style={{
                    maskImage: 'linear-gradient(to bottom, #000 0%, #000 89%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, #000 89%, transparent 100%)',
                  }}
                />
              </motion.div>
            </div>
          </main>

          {/* New Mobile Content to match reference image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="md:hidden flex flex-col items-start text-left px-4 mt-[35vw] sm:mt-[30vw] mb-0 relative z-10"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <p className="text-xl mb-2 font-medium">
              <span className="text-[#ff3b1f]">Together,</span> <span className="text-gray-700">we design better</span>
            </p>

            <h2
              className="text-4xl font-bold text-black mb-10 tracking-tight uppercase"
              style={{ fontFamily: "var(--font-body)", fontWeight: 700 }}
            >
              MEET OUR TEAM
            </h2>

            <p className="text-gray-600 text-[0.95rem] leading-relaxed mt-[-1.5rem] max-w-[95%] text-left">
              At E-Cell BMSIT, our process is built on collaboration, exploration, and precision. Every project begins with understanding — diving deep into the vision, the site's unique characteristics, and the functional needs of the space.
            </p>
          </motion.div>

        </div>
      </div>

      {/* ════════════ TEAM GRID SECTION (dark, interactive) ════════════ */}
      <div className="bg-black relative overflow-hidden pb-32">
        {/* Smoothed Blending Gradient to prevent banding */}
        <div 
          className="hide-in-light-theme w-full h-24 md:h-32 absolute top-0 left-0 right-0 z-0 pointer-events-none"
          style={{ 
            background: 'linear-gradient(to bottom, #f4f4f4 0%, #dcdcdc 15%, #999999 45%, #333333 75%, #000000 100%)' 
          }}
        ></div>

        <div className="max-w-[1400px] mx-auto px-6 md:px-20 lg:px-40 relative z-10 w-full flex flex-col items-start pt-10 md:pt-16">

          {/* 1. Faculty Coordinator */}
          <TeamSectionGroup title="Faculty Coordinator" members={teamData.faculty_coordinator} showDivider={false} centered={true} />

          {/* 2. Leadership */}
          <TeamSectionGroup title="Leadership" members={teamData.leadership} />

          {/* 3. Tech Team */}
          <TeamSectionGroup title="Tech Team" members={teamData.tech_team} />

          {/* 4. Design Team */}
          <TeamSectionGroup title="Design Team" members={teamData.design_team} />

          {/* 5. Media & Marketing */}
          <TeamSectionGroup title="Media & Marketing" members={teamData.media_marketing} />

          {/* 6. Events & Ops */}
          <TeamSectionGroup title="Events & Ops" members={teamData.events_ops} />

          {/* 7. Corporate Relations */}
          <TeamSectionGroup title="Corporate Relations" members={teamData.corporate_relations} />

          {/* 8. Content Team */}
          <TeamSectionGroup title="Content Team" members={teamData.content_team} isLast />

        </div>
      </div>

      <Footer />

    </div>
  );
};

export default TeamPage;
