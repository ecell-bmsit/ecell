import React from "react";
import { Link } from "react-router-dom";

const HARDCODED_TEAMS = [
  "Scoobydoo",
  "Flying Mallyas",
  "Innings Innovators",
  "Paracetamol",
  "Profitics",
  "Silly Point",
  "Titans",
  "Diamonds",
  "Kawaiiii Squad",
  "imperium"
];

export default function HigherLowerLeaderboard() {
  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] pt-24 px-4 pb-16 lb-grid-bg">
      <style>{`
        .lb-grid-bg {
          background-image: radial-gradient(#1a1c1c 1px, transparent 1px);
          background-size: 28px 28px;
        }
        .lb-card {
          border: 4px solid #1a1c1c;
          box-shadow: 8px 8px 0px #1a1c1c;
        }
      `}</style>

      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap gap-3 justify-between items-center mb-8">
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 900,
              textTransform: "uppercase",
              fontStyle: "italic",
              lineHeight: 1,
              fontSize: "clamp(2rem, 6vw, 4rem)",
            }}
          >
            Event Leaderboard
          </h1>

          <div className="flex items-center gap-3">
            <Link
              to="/event-higher-lower"
              className="px-4 py-2"
              style={{
                backgroundColor: "#d4f000",
                color: "#1a1c1c",
                border: "4px solid #1a1c1c",
                boxShadow: "6px 6px 0px #bb0058",
                fontFamily: "var(--font-heading)",
                fontWeight: 900,
                textTransform: "uppercase",
                textDecoration: "none",
              }}
            >
              Back to Game
            </Link>
          </div>
        </div>

        <div className="lb-card bg-white p-5 md:p-7">
          <div className="space-y-3">
            {HARDCODED_TEAMS.map((teamName, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-4 py-3"
                style={{
                  border: "3px solid #1a1c1c",
                  backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#eef3ff",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 800,
                  textTransform: "uppercase",
                }}
              >
                <span>
                  {index + 1}. {teamName}
                </span>
                {/* Score removed as requested */}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
