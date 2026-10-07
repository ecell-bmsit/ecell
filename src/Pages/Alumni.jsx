import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

import ali from "./assets/mdAli.jpeg";
import meghana from "./assets/meghana.jpg";
import suhas from "./assets/suhas.jpg";
import shashank from "./assets/shashank.jpeg";
import chandana from "./assets/chandana.jpg";
import syeeda from "./assets/syeeda.jpg";
import adithya from "./assets/adithya.jpg";
import gul from "./assets/gul.jpeg";
import sarvani from "./assets/sarvani.jpg";

import maxsonImg from "./assets/team/maxson.JPG";
import mohitImg from "./assets/team/mohit.webp";
import nishithaImg from "./assets/team/nishitha.webp";
import gaganjithImg from "./assets/team/gaganjith.jpg";
import shriyaImg from "./assets/team/shriya.jpg";
import hiteshImg from "./assets/team/hitesh.jpeg";
import bhanuImg from "./assets/team/bhanu.JPG";
import fardeeImg from "./assets/team/fardeen.jpeg";

import Footer from "../components/Footer/Footer";

// Extracted AlumniCard to prevent heavy mobile re-renders
const AlumniCard = ({ member, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.8,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="w-full relative transition-all duration-500 ease-out rounded-[28px]"
        style={{
          transform: isHovered ? "translate(8px, -8px)" : "translate(0px, 0px)",
          boxShadow: isHovered ? `-16px 16px 0px #dd5500` : "0px 0px 0px transparent",
        }}
      >
        {/* Image Container */}
        <div className="aspect-square relative overflow-hidden rounded-[28px] bg-slate-100">
          <img
            src={member.image}
            alt={member.name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
          {/* Grayscale Overlay - Bypasses Dark Mode Extension Bugs */}
          <div 
            className="absolute inset-0 pointer-events-none transition-opacity duration-700"
            style={{
              backdropFilter: "grayscale(100%)",
              WebkitBackdropFilter: "grayscale(100%)",
              opacity: isHovered ? 0 : 1
            }}
          />
        </div>
      </div>
      
      {/* Content Below Image */}
      <div className="flex flex-col items-start mt-5 px-0 w-full text-left">
        <h3 
          className="text-[22px] md:text-[24px] text-black tracking-wide leading-[1.1]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {member.name}
        </h3>
        <p 
          className="text-slate-500 font-medium text-[0.75rem] md:text-[0.85rem] uppercase tracking-[0.2em] mt-2"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {member.position}
        </p>
      </div>
    </motion.div>
  );
};

const alumniData = {
    members: [
      {
        id: 1,
        name: "Shashank Gowda S",
        position: "President",
        year: "2024/25",
        image: shashank,
        color: "#9e3cec",
      },
      {
        id: 2,
        name: "Shri Adithya",
        position: "Mentor",
        year: "2024/25",
        image: adithya,
        color: "#f97315",
      },
      {
        id: 3,
        name: "Mohammed Ali A",
        position: "Tech Head",
        year: "2024/25",
        image: ali,
        color: "#14c9e1",
      },
      {
        id: 4,
        name: "Syeeda",
        position: "Design Head",
        year: "2024/25",
        image: syeeda,
        color: "#9e3cec",
      },
      {
        id: 5,
        name: "Suhas B S",
        position: "Operations Head",
        year: "2024/25",
        image: suhas,
        color: "#f97315",
      },
      {
        id: 6,
        name: "R Chandana",
        position: "Marketing Head",
        year: "2024/25",
        image: chandana,
        color: "#14c9e1",
      },
      {
        id: 7,
        name: "R Sarvani",
        position: "Marketing Vice Head",
        year: "2024/25",
        image: sarvani,
        color: "#9e3cec",
      },
      {
        id: 8,
        name: "Meghana N M",
        position: "Content Vice Head",
        year: "2024/25",
        image: meghana,
        color: "#f97315",
      },
      {
        id: 9,
        name: "Gul Bhatia",
        position: "Operations Vice Head",
        year: "2024/25",
        image: gul,
        color: "#14c9e1",
      },
      {
        id: 10,
        name: "Maxson Mathew",
        position: "President",
        year: "2025/26",
        image: maxsonImg,
        color: "#9e3cec",
      },
      {
        id: 11,
        name: "Mohit Monnappa T N",
        position: "Mentor",
        year: "2025/26",
        image: mohitImg,
        color: "#f97315",
      },
      {
        id: 12,
        name: "Nishitha Bodipati",
        position: "Vice President",
        year: "2025/26",
        image: nishithaImg,
        color: "#14c9e1",
      },
      {
        id: 13,
        name: "Gaganjith R",
        position: "Events Head",
        year: "2025/26",
        image: gaganjithImg,
        color: "#9e3cec",
      },
      {
        id: 14,
        name: "Shriya Chowdary",
        position: "Content Head",
        year: "2025/26",
        image: shriyaImg,
        color: "#f97315",
      },
      {
        id: 15,
        name: "Hitesh R",
        position: "Media Head",
        year: "2025/26",
        image: hiteshImg,
        color: "#14c9e1",
      },
      {
        id: 16,
        name: "Bhanu Prasad N",
        position: "Media Vice Head",
        year: "2025/26",
        image: bhanuImg,
        color: "#9e3cec",
      },
      {
        id: 17,
        name: "Fardeen Khan K",
        position: "Corporate Relations Head",
        year: "2025/26",
        image: fardeeImg,
        color: "#f97315",
      },
    ],
  };

const EcellAlumniPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const batches = Array.from(new Set(alumniData.members.map(m => m.year))).sort((a, b) => a.localeCompare(b));
  const [activeBatch, setActiveBatch] = useState(batches[batches.length - 1] || "2025/26");
  const filteredMembers = alumniData.members.filter(m => m.year === activeBatch);

  return (
    <div 
      className="bg-white text-black min-h-screen"
      data-darkreader-ignore
      style={{ colorScheme: 'only light' }}
    >
      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mb-12"
          >
            <h2 
              className="text-5xl md:text-7xl lg:text-[90px] font-bold uppercase text-center leading-[0.9] tracking-tighter text-black mb-10 mt-10"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Our Alumni Network
            </h2>
          </motion.div>

          {/* Toggle UI Matching Screenshot */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="flex justify-center mb-16"
          >
            <div 
              data-darkreader-ignore
              className="flex items-center p-1.5 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
              style={{ backgroundColor: '#f1f1f1', colorScheme: 'only light' }}
            >
              {batches.map((batch) => {
                const isActive = activeBatch === batch;
                const batchYear = batch.split('/')[0];
                return (
                  <div
                    key={batch}
                    role="button"
                    tabIndex={0}
                    onClick={() => setActiveBatch(batch)}
                    className="relative px-8 py-3 rounded-full text-[16px] tracking-wide transition-colors duration-300 outline-none cursor-pointer"
                    style={{ 
                      WebkitTapHighlightColor: "transparent",
                      color: isActive ? "#ffffff" : "#2d2b27",
                      fontFamily: "var(--font-heading)"
                    }}
                  >
                    {isActive && (
                      <motion.div
                        data-darkreader-ignore
                        layoutId="active-batch-pill"
                        className="absolute inset-0 rounded-full"
                        style={{ backgroundColor: '#1a1a1a', boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }}
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      />
                    )}
                    <span className="relative z-10">Class of {batchYear}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12">
            {filteredMembers.map((member, index) => (
              <AlumniCard key={member.id} member={member} index={index} />
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default EcellAlumniPage;
