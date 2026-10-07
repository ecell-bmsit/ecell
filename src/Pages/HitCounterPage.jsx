import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const HitCounterPage = () => {
  const [hits, setHits] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hits")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setHits(data.count);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch hits", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#0f1111] text-white flex flex-col items-center justify-center p-4">
      <style>{`
        .brutalist-card {
          border: 4px solid #fff;
          box-shadow: 12px 12px 0px #FD7722;
          background: #1a1c1c;
        }
        .hit-digit {
          font-variant-numeric: tabular-nums;
          font-family: var(--font-heading);
        }
      `}</style>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="brutalist-card p-10 md:p-16 max-w-2xl w-full text-center"
      >
        <h1 className="text-4xl md:text-6xl font-black mb-8 uppercase tracking-tighter">
          Website Traffic
        </h1>
        
        <div className="bg-black border-2 border-white/20 p-8 mb-8">
          {loading ? (
            <div className="text-2xl animate-pulse uppercase font-light">Retrieving stats...</div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-sm uppercase tracking-widest text-gray-400 mb-2">Total Hits Recorded</span>
              <div className="text-7xl md:text-9xl font-black text-[#FD7722] hit-digit">
                {hits?.toLocaleString() || "0"}
              </div>
            </div>
          )}
        </div>
        
        <p className="text-gray-400 font-medium uppercase tracking-wide">
          Tracking the evolution of our ecosystem
        </p>
      </motion.div>
      
      <div className="mt-12 text-gray-600 text-xs uppercase tracking-[0.3em]">
        E-Cell BMSIT &copy; {new Date().getFullYear()}
      </div>
    </div>
  );
};

export default HitCounterPage;
