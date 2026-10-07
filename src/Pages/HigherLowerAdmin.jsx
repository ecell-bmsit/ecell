import React, { useState, useEffect } from "react";

export default function HigherLowerAdmin() {
  const [isStarted, setIsStarted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/game/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setIsStarted(data.isStarted);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (action) => {
    setLoading(true);
    try {
      const res = await fetch("/api/game/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        setIsStarted(data.isStarted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] p-8">
      <div className="max-w-2xl mx-auto border-4 border-[#1a1c1c] p-8 shadow-[8px_8px_0px_#1a1c1c] bg-white">
        <h1
          className="text-3xl font-black uppercase mb-6"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          HigherLower Admin Control
        </h1>
        <div className="mb-6 text-xl">
          Current Game Status:{" "}
          <span
            className={`font-bold ${isStarted ? "text-green-600" : "text-red-600"}`}
          >
            {isStarted ? "STARTED" : "STOPPED"}
          </span>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => handleToggle("start")}
            className="px-6 py-3 bg-[blue] border-4 border-[#1a1c1c] shadow-[4px_4px_0px_#1a1c1c] font-bold uppercase transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:opacity-50"
            disabled={isStarted || loading}
          >
            Start Game
          </button>
          <button
            onClick={() => handleToggle("stop")}
            className="px-6 py-3 bg-[#bb0058] text-white border-4 border-[#1a1c1c] shadow-[4px_4px_0px_#1a1c1c] font-bold uppercase transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:opacity-50"
            disabled={!isStarted || loading}
          >
            Stop Game
          </button>
        </div>
      </div>
    </div>
  );
}
