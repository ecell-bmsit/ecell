import React from "react";
import rightSvg from "./assets/spl2/right.svg";
import leftSvg from "./assets/spl2/left.svg";
import helmetSvg from "./assets/spl2/helmet.svg";

import moneyPng from "./assets/spl2/money.png";
import stocksPng from "./assets/spl2/stocks.png";
import uniSvg from "./assets/spl2/uni.svg";

const PixelDivider = ({ topColor, bgColor, style, className }) => {
  // SVG with falling squares, fill matches the upper section (topColor)
  const fillColor = encodeURIComponent(topColor || "#1a1c1c");
  const svg = `data:image/svg+xml,%3Csvg width='80' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,0 h80 v10 h-80 Z M0,10 h10 v10 h-10 Z M20,10 h20 v10 h-20 Z M50,10 h10 v10 h-10 Z M70,10 h10 v10 h-10 Z M10,20 h10 v10 h-10 Z M40,20 h10 v10 h-10 Z M60,20 h10 v10 h-10 Z M20,30 h10 v10 h-10 Z M70,30 h10 v10 h-10 Z' fill='${fillColor}'/%3E%3C/svg%3E`;

  return (
    <div
      className={`spl-pixel-divider ${className || ""}`.trim()}
      style={{
        width: "100%",
        height: "80px", // 2x height
        backgroundColor: bgColor,
        backgroundImage: `url("${svg}")`,
        backgroundRepeat: "repeat-x",
        backgroundPosition: "top left",
        backgroundSize: "160px 80px", // 2x scale = HUGE pixels
        ...style,
      }}
    />
  );
};

const Spl2 = () => {
  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        .spl-brutalist-stroke {
          -webkit-text-stroke: 2px #1a1c1c;
        }
        .spl-text-shadow-brutal {
          text-shadow: 6px 6px 0px #1a1c1c;
        }
        .spl-text-shadow-pink {
          text-shadow: 4px 4px 0px #bb0058;
        }
        .spl-bg-grid-pattern {
          background-image: radial-gradient(#1a1c1c 1px, transparent 1px);
          background-size: 32px 32px;
        }
        .spl-ticker {
          animation: spl-ticker-scroll 18s linear infinite;
          white-space: nowrap;
        }
        @keyframes spl-ticker-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .material-symbols-outlined.filled {
          font-variation-settings: 'FILL' 1;
        }
        details > summary {
          list-style: none;
        }
        details > summary::-webkit-details-marker {
          display: none;
        }
      `}</style>

      <style>{`
        @media (max-width: 767px) {
          .spl2-root img[src$=".svg"]:not(.spl-keep-mobile) {
            display: none !important;
          }

          .spl2-root .spl2-cta-group {
            flex-direction: row;
            gap: 0.5rem;
            width: 100%;
          }

          .spl2-root .spl2-cta-button {
            width: auto !important;
            height: 3rem !important;
            min-width: 0;
            flex: 1 1 0;
            font-size: 0.72rem !important;
          }

          .spl2-root .spl2-cta-button > span {
            gap: 0.35rem !important;
          }

          .spl2-root .spl2-cta-button .material-symbols-outlined {
            font-size: 1rem !important;
          }

          .spl2-root .spl2-footer-links {
            width: 100%;
            justify-content: flex-start !important;
            flex-wrap: nowrap !important;
            gap: 1rem !important;
          }

          .spl2-root .spl2-footer-faq {
            margin-left: auto;
          }

          .spl2-root .spl2-footer-title {
            width: 100%;
            text-align: center;
          }

          .spl2-root .spl2-footer-divider {
            margin-top: -4px !important;
            box-shadow: 0 -2px 0 #0046fa;
          }
        }
      `}</style>

      <div
        className="overflow-x-hidden spl2-root"
        style={{
          fontFamily: "var(--font-body)",
          backgroundColor: "#f9f9f9",
          color: "#1a1c1c",
        }}
      >
        {/* ─── HERO ─────────────────────────────────────────────────────────── */}
        <main
          className="relative min-h-screen flex flex-col items-center justify-center spl-bg-grid-pattern px-6 overflow-hidden pb-16"
          style={{ paddingTop: "5rem" }}
        >
          {/* Floating Images substituting SVGs */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none overflow-hidden z-0"
          >
            {/* Stumps — bottom-left, peeking in from the edge */}
            <img
              src={leftSvg}
              alt="Stumps"
              style={{
                position: "absolute",
                bottom: "2%",
                left: "-2%",
                width: "32rem",
                transform: "rotate(4deg)",
                filter: "drop-shadow(8px 8px 0px #1a1c1c)",
              }}
            />

            {/* People — bottom-right, large to fill the right gap */}
            <img
              src={rightSvg}
              alt="People cheering"
              style={{
                position: "absolute",
                bottom: "0%",
                right: "-3%",
                width: "32rem",
                transform: "rotate(-4deg)",
                filter: "drop-shadow(10px 10px 0px #bb0058)",
              }}
            />

            {/* Helmet — adjust position/rotation/size freely below */}
          </div>

          {/* Helmet — above all text, adjust freely */}
          <img
            src={helmetSvg}
            alt="Cricket Helmet"
            style={{
              position: "absolute",
              top: "12%" /* ← move up/down */,
              right: "28%" /* ← move left/right */,
              width: "12rem" /* ← resize */,
              transform: "rotate(40deg)" /* ← rotate */,
              filter: "none",
              zIndex: 50,
              pointerEvents: "none",
              transition: "transform 0.3s ease",
            }}
          />

          {/* Central Content */}
          <div className="relative z-10 flex flex-col items-center text-center max-w-6xl w-full">
            {/* "by E-cell BMSIT&M" badge */}
            <div className="mb-8" style={{ transform: "rotate(-2deg)" }}>
              <span
                style={{
                  backgroundColor: "#0046fa",
                  color: "#ffffff",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 900,
                  fontSize: "1.25rem",
                  padding: "0.5rem 1.5rem",
                  border: "4px solid #1a1c1c",
                  boxShadow: "4px 4px 0px 0px rgba(26,28,28,1)",
                  textTransform: "uppercase",
                  letterSpacing: "-0.05em",
                  fontStyle: "italic",
                  display: "inline-block",
                }}
              >
                E-CELL X BMSIT&amp;M PRESENTS
              </span>
            </div>

            {/* Main Title Block */}
            <div
              className="flex flex-col items-center gap-1 md:gap-3"
              style={{ marginBottom: "1rem", marginTop: "1.5rem" }}
            >
              <h1
                className="flex flex-col items-center"
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  fontStyle: "italic",
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}
              >
                <span
                  className="inline-block"
                  style={{
                    backgroundColor: "#0046fa",
                    color: "#ffffff",
                    padding: "0.5rem 1.5rem",
                    border: "4px solid #1a1c1c",
                    boxShadow: "8px 8px 0px 0px #1a1c1c",
                    transform: "rotate(-2deg)",
                    fontSize: "clamp(3rem, 8vw, 6rem)",
                    marginBottom: "0.5rem",
                    zIndex: 2,
                  }}
                >
                  STARTUP
                </span>
                <span
                  className="inline-block"
                  style={{
                    backgroundColor: "#d4f000",
                    color: "#1a1c1c",
                    padding: "0.5rem 2rem",
                    border: "4px solid #1a1c1c",
                    boxShadow: "8px 8px 0px 0px #bb0058",
                    transform: "rotate(1deg)",
                    fontSize: "clamp(3.5rem, 9vw, 7rem)",
                    marginBottom: "0.5rem",
                    zIndex: 3,
                  }}
                >
                  PREMIER
                </span>
                <span
                  className="inline-block relative"
                  style={{
                    backgroundColor: "#f9f9f9",
                    color: "#1a1c1c",
                    padding: "0.5rem 1.5rem",
                    border: "4px solid #1a1c1c",
                    boxShadow: "8px 8px 0px 0px #0046fa",
                    transform: "rotate(-1deg)",
                    fontSize: "clamp(2.5rem, 7vw, 5rem)",
                    zIndex: 1,
                  }}
                >
                  LEAGUE 3.0
                </span>
              </h1>
            </div>

            {/* Spacer between title and buttons */}
            <div style={{ marginTop: "1rem", marginBottom: "1rem" }} />

            {/* CTA Buttons */}
            <div className="spl2-cta-group flex flex-col md:flex-row gap-8 w-full md:w-auto items-center justify-center">
              {/* Register */}
              <a
                href="https://unstop.com/o/6m9z0Fj?lb=8XwWIxhy&utm_medium=Share&utm_source=competitions&utm_campaign=Ecell-bmsitm"
                target="_blank"
                rel="noopener noreferrer"
                className="spl2-cta-button"
                style={{
                  position: "relative",
                  width: "18rem",
                  height: "5rem",
                  backgroundColor: "#0046fa",
                  color: "#ffffff",
                  border: "4px solid #1a1c1c",
                  boxShadow: "8px 8px 0px 0px rgba(26,28,28,1)",
                  cursor: "pointer",
                  transition: "all 0.1s ease",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 900,
                  fontSize: "1.5rem",
                  textTransform: "uppercase",
                  fontStyle: "italic",
                  letterSpacing: "-0.04em",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translate(4px, 4px)";
                  e.currentTarget.style.boxShadow = "none";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow =
                    "8px 8px 0px 0px rgba(26,28,28,1)";
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.75rem",
                    cursor: "pointer",
                  }}
                >
                  REGISTER NOW
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: "1.75rem",
                      fontVariationSettings: "'FILL' 1",
                    }}
                  >
                    send
                  </span>
                </span>
              </a>

              {/* View Rules */}
              <button
                className="spl2-cta-button"
                style={{
                  position: "relative",
                  width: "18rem",
                  height: "5rem",
                  backgroundColor: "#f9f9f9",
                  color: "#1a1c1c",
                  border: "4px solid #1a1c1c",
                  boxShadow: "8px 8px 0px 0px rgba(187,0,88,1)",
                  cursor: "pointer",
                  transition: "all 0.1s ease",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 900,
                  fontSize: "1.5rem",
                  textTransform: "uppercase",
                  fontStyle: "italic",
                  letterSpacing: "-0.04em",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translate(4px, 4px)";
                  e.currentTarget.style.boxShadow = "none";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow =
                    "8px 8px 0px 0px rgba(187,0,88,1)";
                }}
                onClick={() => {
                  document
                    .getElementById("spl-rules")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.75rem",
                  }}
                >
                  VIEW RULES
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "1.75rem" }}
                  >
                    description
                  </span>
                </span>
              </button>
            </div>
          </div>

          {/* Ticker Bar */}
          <div
            className="absolute bottom-0 left-0 w-full overflow-hidden"
            style={{
              backgroundColor: "#1a1c1c",
              paddingTop: "0.75rem",
              paddingBottom: "0.75rem",
            }}
          >
            <div
              className="spl-ticker flex gap-12"
              style={{ display: "inline-flex" }}
            >
              {Array(10)
                .fill(null)
                .map((_, i) => (
                  <React.Fragment key={i}>
                    <span
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontWeight: 900,
                        color: "#d4f000",
                        textTransform: "uppercase",
                        fontSize: "1.5rem",
                        fontStyle: "italic",
                        letterSpacing: "0.1em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      QUIZ. AUCTION. STRATEGIZE.
                    </span>
                    <span style={{ color: "#bb0058", fontSize: "1.5rem" }}>
                      ●
                    </span>
                  </React.Fragment>
                ))}
            </div>
          </div>
        </main>

        {/* ─── PIXEL TRANSITION ─────────────────────────────────────────────── */}
        <PixelDivider
          topColor="#1a1c1c"
          bgColor="#f9f9f9"
          style={{ marginTop: "-2px", marginBottom: "-2px" }}
        />

        {/* ─── BENTO SECTION ────────────────────────────────────────────────── */}
        <section
          id="spl-rules"
          style={{
            backgroundColor: "#f9f9f9",
            padding: "5rem 1.5rem 6rem",
            position: "relative",
            overflow: "hidden",
            scrollMarginTop: "2rem",
          }}
        >


          <div className="max-w-7xl mx-auto flex flex-col gap-10" style={{ position: "relative", zIndex: 1 }}>

            {/* Header / About Text */}
            <div className="mb-14 text-center max-w-4xl mx-auto">
              <span
                style={{
                  backgroundColor: "#1a1c1c",
                  color: "white",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 900,
                  padding: "0.25rem 1rem",
                  textTransform: "uppercase",
                  fontSize: "4rem",
                  marginBottom: "1rem",
                  display: "inline-block",
                }}
              >
                About SPL
              </span>
              <h2
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 900,
                  fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                  color: "#1a1c1c",
                  textTransform: "uppercase",
                  fontStyle: "italic",
                  lineHeight: 1,
                  marginBottom: "1.5rem",
                }}
              >

              </h2>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "1.125rem",
                  color: "#434659",
                  textAlign: "center",
                  margin: "0 auto",
                }}
              >
                Startup Premier League is a pan-India intercollegiate competition designed on the principles of a premier league. A one-day, high-energy competition blending innovation, strategy, and execution into one unforgettable league. SPL is where competition and ideas evolve through multiple dynamic rounds.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1.5rem' }}>
                {["Competitive", "Practical", "Fun & Engaging", "Learning-focused"].map((tag) => (
                  <span key={tag} style={{ backgroundColor: "#ffffff", border: "3px solid #1a1c1c", boxShadow: "4px 4px 0px 0px rgba(26,28,28,1)", padding: "0.4rem 1.25rem", color: "#1a1c1c", fontSize: "1rem", fontWeight: 700, textTransform: "uppercase", fontFamily: "var(--font-heading)" }}>{tag}</span>
                ))}
              </div>
            </div>

            {/* 4 Box Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Box 1: Event Details */}
              <div style={{ backgroundColor: "#ffffff", border: "4px solid #1a1c1c", padding: "2.5rem", boxShadow: "8px 8px 0px 0px rgba(26,28,28,1)", display: "flex", flexDirection: "column" }}>
                <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: "2rem", textTransform: "uppercase", marginBottom: "1.5rem", color: "#1a1c1c", borderBottom: "4px solid #1a1c1c", paddingBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "2rem" }}>event</span> Event Details
                </h3>
                <ul className="space-y-4" style={{ fontFamily: "var(--font-body)", fontSize: "1.2rem", color: "#1a1c1c", fontWeight: 600 }}>
                  <li className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span style={{ color: "#434659", fontWeight: 800, textTransform: "uppercase", fontSize: "0.9rem" }}>Mode</span>
                    <span>Offline</span>
                  </li>
                  <li className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span style={{ color: "#434659", fontWeight: 800, textTransform: "uppercase", fontSize: "0.9rem" }}>Venue</span>
                    <span>BMSIT&M</span>
                  </li>
                  <li className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span style={{ color: "#434659", fontWeight: 800, textTransform: "uppercase", fontSize: "0.9rem" }}>Date</span>
                    <span>25th April</span>
                  </li>
                  <li className="flex justify-between items-center pt-2">
                    <span style={{ color: "#434659", fontWeight: 800, textTransform: "uppercase", fontSize: "0.9rem" }}>Registration</span>
                    <span>₹150 / Team</span>
                  </li>
                </ul>
              </div>

              {/* Box 2: Prize Pool */}
              <div style={{ backgroundColor: "#d4f000", border: "4px solid #1a1c1c", padding: "2.5rem", boxShadow: "8px 8px 0px 0px rgba(26,28,28,1)", display: "flex", flexDirection: "column" }}>
                <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: "2rem", textTransform: "uppercase", marginBottom: "1.5rem", color: "#1a1c1c", borderBottom: "4px solid #1a1c1c", paddingBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "2rem" }}>payments</span> Prize Pool
                </h3>
                <ul className="space-y-4" style={{ fontFamily: "var(--font-body)", fontSize: "1.2rem", color: "#1a1c1c", fontWeight: 700 }}>
                  <li className="flex justify-between items-center border-b border-gray-900/10 pb-2">
                    <span style={{ color: "#1a1c1c", fontWeight: 800, textTransform: "uppercase", fontSize: "0.9rem" }}>Winner</span>
                    <span style={{ fontSize: "1.5rem", fontWeight: 900 }}>₹7,000</span>
                  </li>
                  <li className="flex justify-between items-center border-b border-gray-900/10 pb-2">
                    <span style={{ color: "#1a1c1c", fontWeight: 800, textTransform: "uppercase", fontSize: "0.9rem" }}>Runner-up</span>
                    <span style={{ fontSize: "1.3rem", fontWeight: 900 }}>₹5,000</span>
                  </li>
                  <li className="flex justify-between items-center border-b border-gray-900/10 pb-2">
                    <span style={{ color: "#1a1c1c", fontWeight: 800, textTransform: "uppercase", fontSize: "0.9rem" }}>2nd Runner-up</span>
                    <span style={{ fontSize: "1.1rem", fontWeight: 900 }}>₹3,000</span>
                  </li>
                  <li className="pt-2 text-[0.95rem] font-semibold text-center mt-auto" style={{ fontFamily: "var(--font-heading)", color: "#6c7900", fontWeight: 800, textTransform: "uppercase" }}>
                    Certificates provided to all participants
                  </li>
                </ul>
              </div>

              {/* Box 3: Team Rules */}
              <div style={{ backgroundColor: "#0046fa", border: "4px solid #1a1c1c", padding: "2.5rem", boxShadow: "8px 8px 0px 0px rgba(26,28,28,1)", display: "flex", flexDirection: "column", color: "#ffffff" }}>
                <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: "2rem", textTransform: "uppercase", marginBottom: "1.5rem", color: "#ffffff", borderBottom: "4px solid #ffffff", paddingBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "2rem" }}>group</span> Team Rules
                </h3>
                <ul className="space-y-4" style={{ fontFamily: "var(--font-body)", fontSize: "1.125rem", fontWeight: 600 }}>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined" style={{ fontWeight: 300, fontSize: "1.5rem", color: "#d4f000" }}>groups</span>
                    <span>Team size: 2–4 members</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined" style={{ fontWeight: 300, fontSize: "1.5rem", color: "#d4f000" }}>check_circle</span>
                    <span>Cross-college teams allowed</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined" style={{ fontWeight: 300, fontSize: "1.5rem", color: "#d4f000" }}>check_circle</span>
                    <span>Cross-branch teams allowed</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined" style={{ fontWeight: 300, fontSize: "1.5rem", color: "#bb0058" }}>cancel</span>
                    <span>Individual participation not allowed</span>
                  </li>
                </ul>
              </div>

              {/* Box 4: General Rules */}
              <div style={{ backgroundColor: "#bb0058", border: "4px solid #1a1c1c", padding: "2.5rem", boxShadow: "8px 8px 0px 0px rgba(26,28,28,1)", display: "flex", flexDirection: "column", color: "#ffffff" }}>
                <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: "2rem", textTransform: "uppercase", marginBottom: "1.5rem", color: "#ffffff", borderBottom: "4px solid #ffffff", paddingBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "2rem" }}>gavel</span> General Rules
                </h3>
                <ul className="space-y-4" style={{ fontFamily: "var(--font-body)", fontSize: "1.125rem", fontWeight: 600 }}>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined mt-1" style={{ fontWeight: 300, color: "#ffd9e0" }}>badge</span>
                    <span>All participants must carry a valid college ID card.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined mt-1" style={{ fontWeight: 300, color: "#ffd9e0" }}>laptop_mac</span>
                    <span>Each team must bring at least one laptop.</span>
                  </li>
                  <li className="flex items-start gap-3 text-left">
                    <span className="material-symbols-outlined mt-1" style={{ fontWeight: 300, color: "#ffd9e0" }}>balance</span>
                    <span style={{ textAlign: "left" }}>Teams must maintain fair play - plagiarism leads to disqualification.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined mt-1" style={{ fontWeight: 300, color: "#ffd9e0" }}>admin_panel_settings</span>
                    <span>Decisions by organizers/judges will be final.</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </section>

        {/* ─── RULES & DETAILS ────────────────────────────────────────────── */}
        <PixelDivider
          topColor="#f9f9f9"
          bgColor="#e2e2e2"
          style={{ marginTop: "-2px", marginBottom: "-2px" }}
        />
        <section
          id="how-it-works"
          style={{
            backgroundColor: "#e2e2e2",
            padding: "5rem 1.5rem 6rem",
            scrollMarginTop: "6rem",
          }}
        >
          <div className="max-w-7xl mx-auto">
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 900,
                fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                color: "#1a1c1c",
                textTransform: "uppercase",
                fontStyle: "italic",
                lineHeight: 1,
                marginBottom: "4rem",
                textAlign: "center",
              }}
            >
              EVENT STRUCTURE.
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                {
                  step: "01",
                  title: "League Stage (Non-Eliminatory)",
                  desc: "Round 1 & 2: All teams participate in the initial rounds designed to test creativity and problem-solving, introduce startup thinking, and warm up the competition.",
                },
                {
                  step: "02",
                  title: "Knockout Stage (Eliminatory)",
                  desc: "Round 3: Top teams move forward to build stronger startup concepts, compete under pressure, and present and defend ideas.",
                },
                {
                  step: "03",
                  title: "The Grand Pitch",
                  desc: "Final Round: The best teams battle it out in the final stage and competes for the title.",
                },
              ].map((rule, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: "#ffffff",
                    border: "4px solid #1a1c1c",
                    padding: "2.5rem",
                    boxShadow: "8px 8px 0px 0px rgba(26,28,28,1)",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "-1.5rem",
                      left: "1.5rem",
                      backgroundColor: "#d4f000",
                      border: "4px solid #1a1c1c",
                      padding: "0.25rem 1rem",
                      fontFamily: "var(--font-heading)",
                      fontWeight: 900,
                      fontSize: "1.5rem",
                      color: "#1a1c1c",
                    }}
                  >
                    {rule.step}
                  </div>
                  <h3
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 900,
                      fontSize: "2rem",
                      textTransform: "uppercase",
                      marginBottom: "1rem",
                      marginTop: "1rem",
                      color: "#1a1c1c",
                      lineHeight: 1.1,
                    }}
                  >
                    {rule.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "1.125rem",
                      color: "#434659",
                    }}
                  >
                    {rule.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* ─── FAQS ──────────────────────────────────────────────────────── */}
        <PixelDivider
          topColor="#e2e2e2"
          bgColor="#0046fa"
          style={{ marginTop: "-2px", marginBottom: "-2px" }}
        />
        <section
          id="burning-questions"
          style={{
            backgroundColor: "#0046fa",
            padding: "5rem 1.5rem 6rem",
            scrollMarginTop: "6rem",
          }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="relative mb-12 text-center inline-block w-full">
              <h2
                className="spl-text-shadow-brutal"
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 900,
                  fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                  color: "#f9f9f9",
                  textTransform: "uppercase",
                  fontStyle: "italic",
                  lineHeight: 1,
                  position: "relative",
                  zIndex: 10,
                }}
              >
                BURNING QUESTIONS.
              </h2>
            </div>

            <div className="flex flex-col gap-6">
              {[
                {
                  q: "Do I need prior experience?",
                  a: "No. SPL is beginner-friendly and open to all.",
                },
                {
                  q: "Can I change my team members?",
                  a: "Yes, changes are allowed before the event.",
                },
                {
                  q: "What should I bring?",
                  a: "A valid ID card and at least one laptop per team.",
                },
                {
                  q: "Is accommodation provided?",
                  a: "No, this is a one-day event and accommodation is not included.",
                },
                {
                  q: "Is this only for tech students?",
                  a: "No. Students from all branches can participate.",
                },
              ].map((faq, idx) => (
                <details
                  key={idx}
                  style={{
                    backgroundColor: "#ffffff",
                    border: "4px solid #1a1c1c",
                    boxShadow: "8px 8px 0px 0px rgba(26,28,28,1)",
                    cursor: "pointer",
                  }}
                  className="group"
                >
                  <summary
                    style={{
                      padding: "1.5rem",
                      fontFamily: "var(--font-heading)",
                      fontWeight: 900,
                      fontSize: "1.5rem",
                      textTransform: "uppercase",
                      color: "#1a1c1c",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    {faq.q}
                    <span
                      className="material-symbols-outlined group-open:rotate-180 transition-transform text-3xl font-bold"
                      style={{ color: "#bb0058" }}
                    >
                      expand_more
                    </span>
                  </summary>
                  <div
                    style={{
                      padding: "0 1.5rem 1.5rem 1.5rem",
                      fontFamily: "var(--font-body)",
                      fontSize: "1.125rem",
                      color: "#434659",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "2px",
                        backgroundColor: "#e8e8e8",
                        marginBottom: "1.5rem",
                      }}
                    />
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FOOTER ───────────────────────────────────────────────────────── */}
        <PixelDivider
          className="spl2-footer-divider"
          topColor="#0046fa"
          bgColor="#d4f000"
          style={{ marginTop: "-2px", marginBottom: "-2px" }}
        />
        <footer
          style={{
            width: "100%",
            backgroundColor: "#d4f000",
            padding: "5rem 1.5rem 3rem",
            position: "relative",
            zIndex: 10,
          }}
        >
          <div className="max-w-7xl mx-auto flex flex-col gap-12">
            {/* Top section: CTA & Socials */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
              <div>
                <h2
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 900,
                    fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                    color: "#1a1c1c",
                    textTransform: "uppercase",
                    lineHeight: 1,
                    marginBottom: "1rem",
                  }}
                >
                  IDEATE. INNOVATE. <br /> INSPIRE.
                </h2>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "1.25rem",
                    color: "#1a1c1c",
                    fontWeight: 600,
                  }}
                >
                  Follow E-Cell BMSIT&M for updates and announcements.
                </p>
              </div>

              {/* Social Links */}
              <div className="flex gap-4 flex-wrap w-full md:w-auto md:flex-nowrap">
                {[

                  {
                    name: "Instagram",
                    url: "https://instagram.com/ecell.bmsit",
                    className:
                      "flex-1 md:w-auto md:flex-none text-center block",
                  },
                  {
                    name: "LinkedIn",
                    url: "https://www.linkedin.com/company/ecellbmsit/",
                    className:
                      "flex-1 md:w-auto md:flex-none text-center block",
                  },
                ].map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={social.className}
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 800,
                      fontSize: "1rem",
                      textTransform: "uppercase",
                      color: "#ffffff",
                      backgroundColor: "#1a1c1c",
                      padding: "0.75rem 1.5rem",
                      border: "3px solid #1a1c1c",
                      boxShadow: "6px 6px 0px 0px #0046fa",
                      textDecoration: "none",
                      transition: "transform 0.15s, box-shadow 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translate(4px, 4px)";
                      e.currentTarget.style.boxShadow =
                        "2px 2px 0px 0px #0046fa";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translate(0px, 0px)";
                      e.currentTarget.style.boxShadow =
                        "6px 6px 0px 0px #0046fa";
                    }}
                  >
                    {social.name}
                  </a>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div
              style={{
                width: "100%",
                height: "4px",
                backgroundColor: "#1a1c1c",
              }}
            />

            {/* Bottom section: Links & Copyright */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
              <div
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 900,
                  fontSize: "1.25rem",
                  color: "#1a1c1c",
                  textTransform: "uppercase",
                  fontStyle: "italic",
                }}
              >
                STARTUP PREMIER LEAGUE 3.0
              </div>

              <div className="flex gap-6 flex-wrap justify-center">
                {[
                  { label: "Register", href: "https://unstop.com/o/6m9z0Fj?lb=8XwWIxhy&utm_medium=Share&utm_source=competitions&utm_campaign=Ecell-bmsitm" },
                  { label: "Rules", href: "#spl-rules" },
                  { label: "FAQ's", href: "#burning-questions" },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.target || "_self"}
                    rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      fontSize: "1rem",
                      letterSpacing: "0.05em",
                      color: "#1a1c1c",
                      textDecoration: "none",
                      paddingBottom: "2px",
                      backgroundImage:
                        "linear-gradient(to right, #1a1c1c 100%, #1a1c1c 100%)",
                      backgroundSize: "0% 3px",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "left bottom",
                      transition: "background-size 0.3s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundSize = "100% 3px")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundSize = "0% 3px")
                    }
                  >
                    {item.label}
                  </a>
                ))}
              </div>

              <div
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  fontSize: "0.875rem",
                  letterSpacing: "0.05em",
                  color: "#1a1c1c",
                }}
              >
                © 2026 E-CELL BMSIT&M. ALL RIGHTS RESERVED.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Spl2;
