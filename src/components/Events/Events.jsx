import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Events.css";

import codeRedImg from "../../assets/code-red-grid-1.webp";
import splImg from "../../assets/spl.webp";
import empireXImg from "../../assets/EmpireX.webp";
import nextCompassImg from "../../assets/next-compass.webp";

const ECellEventsScroll = () => {
  const [filter, setFilter] = useState("ALL");
  const navigate = useNavigate();

  // Sync scroll on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const events = [
    {
      name: "Code Red 3.0",
      displayName: "Code Red 3.0",
      description: "Code Red 3.0 is E-Cell's flagship 24-hour national-level hackathon, bringing together participants from across the country. Teams build innovative solutions...",
      shortDescription: "24-hour national-level hackathon with real-world problem solving.",
      image: codeRedImg,
      isFlagship: true,
      slug: "codered25",
      dateRange: "13 - 14 DEC",
      eventType: "IN-PERSON"
    },
    {
      name: "SPL 3.0",
      displayName: "SPL 3.0",
      description: "Startup Premier League (SPL) is an inter-college business strategy event featuring startup quizzes, IPL-style auctions, business simulations, and strategy pitching.",
      shortDescription: "Business strategy event with quizzes, auctions, and simulations.",
      image: splImg,
      isFlagship: true,
      slug: "spl3",
      dateRange: "25 APR",
      eventType: "IN-PERSON"
    },
    {
      name: "PANEL DISCUSSION",
      displayName: "Panel Discussion",
      description: "\"Next Compass: Navigating the New Universe\" was a fun and interactive panel discussion where seniors shared insights on academics, careers, networking, and college life.",
      shortDescription: "Seniors sharing insights on academics, careers, and college life.",
      image: nextCompassImg,
      isFlagship: false,
      slug: "paneldiscussion",
      dateRange: "17 OCT",
      eventType: "IN-PERSON"
    },
    {
      name: "EMPIRE X",
      displayName: "Empire X",
      description: "EmpireX was a Monopoly-style business simulation event where participants built corporate empires through trading, negotiations, and market-based challenges.",
      shortDescription: "Monopoly-style business simulation with trading and market challenges.",
      image: empireXImg,
      isFlagship: false,
      slug: "empirex",
      dateRange: "13 MAR",
      eventType: "IN-PERSON"
    },
  ];

  const filteredEvents = events.filter((e) => {
    if (filter === "ALL") return true;
    if (filter === "FLAGSHIPS") return e.isFlagship;
    return true;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
    },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  };

  const leftColVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } 
    }
  };

  return (
    <>
      <div
        className="preserve-color min-h-screen w-full pb-20 pt-12 md:pt-36 px-5 md:px-12 xl:px-20 transition-colors duration-300"
        style={{ fontFamily: "var(--font-body)" }}
        id="events"
      >
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-12 lg:gap-20">
        
        {/* Left Column - Sticky Content */}
        <motion.div 
          variants={leftColVariants}
          initial="hidden"
          animate="visible"
          className="w-full lg:w-[450px] flex-shrink-0 lg:sticky lg:top-36 self-start flex flex-col items-start text-left gap-5 md:gap-6"
        >
          <h1 
            className="event-primary-text font-bold tracking-tighter max-w-[420px]"
            style={{ fontSize: "clamp(32px, 4vw, 64px)", lineHeight: "1.15", wordSpacing: "0.3em" }}
          >
            Where Ideas <br /> Came Alive
          </h1>
          <p 
            className="event-subtext text-[15px] md:text-[17px] leading-[1.6] max-w-[420px] font-normal mt-2 text-justify"
            style={{ fontFamily: "var(--font-body)" }}
          >
            From startup mixers and founder workshops to pitch days and hackathons. Whether you're looking to build, network, or just explore the world of entrepreneurship, there's something here for you.
          </p>

          <div className="event-card-border flex items-center mt-6 border rounded-[4px] w-fit p-[6px] bg-transparent">
            {["ALL", "FLAGSHIPS"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 md:px-6 py-[6px] text-[11px] md:text-[12px] font-semibold tracking-wide transition-colors rounded-[3px] ${
                  filter === f
                    ? "event-btn-active"
                    : "event-btn-inactive bg-transparent"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Right Column - Event Cards */}
        <div className="flex-1 w-full">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10"
          >
            <AnimatePresence mode="popLayout">
              {filteredEvents.map((event) => (
                <motion.div
                  layout
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  key={event.slug}
                  onClick={() => navigate(`/events/${event.slug}`)}
                  className="event-card group flex flex-col rounded-t-[16px] overflow-hidden cursor-pointer transition-transform duration-300 hover:-translate-y-1"
                >
                  {/* Image Area */}
                  <div className="event-image-bg w-full h-[240px] md:h-[280px] relative overflow-hidden">
                    <div className="absolute top-4 right-4 z-10 flex gap-2">
                      <span className="event-badge px-[8px] md:px-[10px] py-[4px] text-[11px] md:text-[12px] font-bold tracking-[0.1em] uppercase rounded-[2px]" style={{ fontFamily: "var(--font-heading)" }}>
                        {event.dateRange}
                      </span>
                    </div>
                    <img
                      src={event.image}
                      alt={event.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>

                  {/* Content Area */}
                  <div className="event-content-bg relative z-20 -mt-5 rounded-t-[20px] p-6 md:p-8 flex-1 flex flex-col justify-between text-left">
                    <div>
                      <h3 className="event-primary-text text-[24px] md:text-[26px] font-bold leading-tight mb-3 tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
                        {event.displayName}
                      </h3>
                      <p className="event-subtext text-[16px] line-clamp-3 leading-[1.6]" style={{ fontFamily: "var(--font-body)" }}>
                        {event.description}
                      </p>
                    </div>
                  </div>

                  {/* Footer Bar */}
                  <div className="event-card-border border-t flex items-stretch justify-between transition-colors">
                    <div className="flex items-center">
                      <span className="event-primary-text text-[13px] md:text-[14px] font-bold tracking-[0.2em] uppercase px-6 md:px-8" style={{ fontFamily: "var(--font-heading)" }}>
                        VIEW EVENT
                      </span>
                    </div>
                    <div className="event-card-border border-l p-3 md:p-4 flex items-center justify-center">
                      <div className="event-footer-btn w-5 h-5 flex items-center justify-center rounded-[1px]">
                        <Plus size={14} strokeWidth={3} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Display message if no events found for a filter */}
            {filteredEvents.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="col-span-1 md:col-span-2 py-12 event-subtext text-lg font-medium border border-dashed event-card-border rounded-lg flex items-center justify-center"
              >
                No events found for this category.
              </motion.div>
            )}
          </motion.div>


        </div>
        
        </div>
      </div>
      
    </>
  );
};

export default ECellEventsScroll;
