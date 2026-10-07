import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Import GIFs for login page
import chungusGif from "./assets/67/6 7 Big Chungus GIF.gif";
import kirkGif from "./assets/67/Charlie Kirk GIF.gif";

// API is served from the same origin via Vercel serverless functions

const QUESTIONS = [
  { question: "Who has more IPL runs?", left: "Rohit Sharma", right: "Suresh Raina", answer: "Rohit Sharma" },
  { question: "Who has more IPL wickets?", left: "Ravichandran Ashwin", right: "Ravindra Jadeja", answer: "Ravichandran Ashwin" },
  { question: "Who has more IPL sixes?", left: "Kieron Pollard", right: "MS Dhoni", answer: "MS Dhoni" },
  { question: "Who has more IPL matches?", left: "Virat Kohli", right: "Rohit Sharma", answer: "Rohit Sharma" },
  { question: "Who has more IPL centuries?", left: "KL Rahul", right: "Shubman Gill", answer: "KL Rahul" },
  { question: "Who has more IPL fifties?", left: "David Warner", right: "Virat Kohli", answer: "Virat Kohli" },
  { question: "Who has more IPL wickets?", left: "Bhuvneshwar Kumar", right: "Mohammed Shami", answer: "Bhuvneshwar Kumar" },
  { question: "Who has better IPL strike rate?", left: "AB de Villiers", right: "David Warner", answer: "AB de Villiers" },
  { question: "Who has more IPL catches?", left: "Virat Kohli", right: "Rohit Sharma", answer: "Virat Kohli" },
  { question: "Who has more IPL titles?", left: "Chennai Super Kings", right: "Kolkata Knight Riders", answer: "Chennai Super Kings" },
  { question: "Who has more IPL wickets?", left: "Lasith Malinga", right: "Dwayne Bravo", answer: "Dwayne Bravo" },
  { question: "Which has higher valuation?", left: "Lenskart", right: "Meesho", answer: "Lenskart" },
  { question: "Which has higher valuation?", left: "Pine Labs", right: "BharatPe", answer: "Pine Labs" },
  { question: "Which has higher valuation?", left: "Groww", right: "Upstox", answer: "Groww" },
  { question: "Which has higher valuation?", left: "Cars24", right: "Spinny", answer: "Cars24" },
  { question: "Which has higher valuation?", left: "Unacademy", right: "Vedantu", answer: "Unacademy" },
  { question: "Which has higher valuation?", left: "Zerodha", right: "Upstox", answer: "Zerodha" },
  { question: "Which has higher valuation?", left: "OYO", right: "Cars24", answer: "OYO" },
  { question: "Which has higher valuation?", left: "Dream11", right: "MPL", answer: "Dream11" },
  { question: "Which has higher valuation?", left: "PhonePe", right: "Razorpay", answer: "PhonePe" },
  { question: "Which has higher valuation?", left: "Swiggy", right: "Zomato", answer: "Zomato" },
  { question: "Which has higher valuation?", left: "Paytm", right: "PhonePe", answer: "PhonePe" },
  { question: "Which has higher valuation?", left: "CRED", right: "BharatPe", answer: "CRED" },
  { question: "Which has higher valuation?", left: "Nykaa", right: "Mamaearth", answer: "Nykaa" },
  { question: "Which has higher valuation?", left: "boAt", right: "Noise", answer: "boAt" },
  { question: "Which has higher valuation?", left: "Ola Electric", right: "Ather Energy", answer: "Ather Energy" },
  { question: "Which has higher valuation?", left: "Unacademy", right: "BYJU'S", answer: "Unacademy" },
  { question: "Which has higher valuation?", left: "Zepto", right: "Dunzo", answer: "Zepto" },
  { question: "Which has higher valuation?", left: "Policybazaar", right: "Acko", answer: "Policybazaar" },
  { question: "Which has higher valuation?", left: "Flipkart", right: "Snapdeal", answer: "Flipkart" }
];

const shuffleArray = (items) => [...items].sort(() => Math.random() - 0.5);

const resetQuestions = () => shuffleArray(QUESTIONS);

const drawNextQuestion = (remainingQuestions) => {
  const remaining = [...remainingQuestions];
  if (remaining.length === 0) {
    return { question: null, remaining: [] };
  }
  const nextQ = remaining.shift();

  const isSwapped = Math.random() > 0.5;
  const leftOptionName = isSwapped ? nextQ.right : nextQ.left;
  const rightOptionName = isSwapped ? nextQ.left : nextQ.right;

  const leftVal = nextQ.answer === leftOptionName ? 1 : 0;
  const rightVal = nextQ.answer === rightOptionName ? 1 : 0;

  return {
    question: {
      category: nextQ.question,
      left: { name: leftOptionName, val: leftVal },
      right: { name: rightOptionName, val: rightVal }
    },
    remaining
  };
};

const PixelDivider = ({ topColor = "#1a1c1c", bgColor = "#f9f9f9" }) => {
  const fillColor = encodeURIComponent(topColor);
  const svg = `data:image/svg+xml,%3Csvg width='80' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,0 h80 v10 h-80 Z M0,10 h10 v10 h-10 Z M20,10 h20 v10 h-20 Z M50,10 h10 v10 h-10 Z M70,10 h10 v10 h-10 Z M10,20 h10 v10 h-10 Z M40,20 h10 v10 h-10 Z M60,20 h10 v10 h-10 Z M20,30 h10 v10 h-10 Z M70,30 h10 v10 h-10 Z' fill='${fillColor}'/%3E%3C/svg%3E`;

  return (
    <div
      style={{
        width: "100%",
        height: "54px",
        backgroundColor: bgColor,
        backgroundImage: `url("${svg}")`,
        backgroundRepeat: "repeat-x",
        backgroundSize: "108px 54px",
      }}
    />
  );
};

export default function HigherLowerGame() {
  const [teamName, setTeamName] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [teamData, setTeamData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [remainingDecks, setRemainingDecks] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [wrongStreak, setWrongStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(10);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [showRulesTimer, setShowRulesTimer] = useState(false);
  const [rulesTimeLeft, setRulesTimeLeft] = useState(10);

  useEffect(() => {
    // Only check game status if user is logged in
    if (!loggedIn) {
      return;
    }

    // Check if game has started
    const checkStatus = async () => {
      try {
        const res = await fetch("/api/game/status");
        const data = await res.json();
        if (data.success && data.isStarted && !isGameStarted) {
          setIsGameStarted(data.isStarted);
          setShowRulesTimer(true);
          setRulesTimeLeft(10);
        }
      } catch (err) {
        console.error("Failed to fetch game status", err);
      }
    };
    checkStatus();

    // Set up a polling interval for game status when wait
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [loggedIn, isGameStarted]);

  useEffect(() => {
    if (showRulesTimer && rulesTimeLeft > 0) {
      const timerObj = setInterval(() => {
        setRulesTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timerObj);
    } else if (showRulesTimer && rulesTimeLeft === 0) {
      setShowRulesTimer(false);
    }
  }, [showRulesTimer, rulesTimeLeft]);

  useEffect(() => {
    if (
      !loggedIn ||
      !isGameStarted ||
      showRulesTimer ||
      gameOver ||
      !currentQuestion ||
      message.startsWith("CORRECT") ||
      message.startsWith("Wrong") ||
      message.startsWith("Time's up")
    ) {
      return;
    }

    if (timeLeft <= 0) {
      const deduction = 1 + wrongStreak;
      const newScore = score - deduction;
      setScore(newScore);
      setStreak(0);
      setWrongStreak(wrongStreak + 1);
      setMessage(`Time's up! No answer selected. (-${deduction})`);
      saveScore(newScore);

      const { question: nextQuestion, remaining: nextDecks } =
        drawNextQuestion(remainingDecks);

      if (nextQuestion) {
        setTimeout(() => {
          setMessage("");
          setCurrentQuestion(nextQuestion);
          setRemainingDecks(nextDecks);
          setTimeLeft(10);
        }, 1500);
      } else {
        setGameOver(true);
        setMessage("GAME OVER!");
      }
      return;
    }

    const timerObj = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerObj);
  }, [
    loggedIn,
    gameOver,
    currentQuestion,
    message,
    timeLeft,
    score,
    showRulesTimer,
  ]);

  const initializeRun = () => {
    const decks = resetQuestions();
    const { question, remaining: nextDecks } = drawNextQuestion(decks);
    setRemainingDecks(nextDecks);
    setCurrentQuestion(question);
    setScore(0);
    setStreak(0);
    setWrongStreak(0);
    setGameOver(false);
    setMessage("");
    setTimeLeft(10);
  };

  const saveScore = async (finalScore, teamIdOverride = null) => {
    const tId = teamIdOverride || teamData?._id;
    if (!tId) {
      return;
    }

    try {
      const res = await fetch(`/api/game/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: tId, score: finalScore }),
      });
      const data = await res.json();
      if (data.success && data.team) {
        setTeamData(data.team);
      }
    } catch (err) {
      console.error("Failed to save score", err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/game/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamName, password }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Login failed");
        return;
      }

      setTeamData(data.team);
      setLoggedIn(true);
      initializeRun();
      saveScore(0, data.team._id);
    } catch (err) {
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChoice = (chosenIndex) => {
    if (
      !isGameStarted ||
      gameOver ||
      !currentQuestion ||
      message.startsWith("CORRECT") ||
      message.startsWith("Wrong") ||
      !currentQuestion.left ||
      !currentQuestion.right
    ) {
      return;
    }

    const chosen =
      chosenIndex === 0 ? currentQuestion.left : currentQuestion.right;
    const other =
      chosenIndex === 0 ? currentQuestion.right : currentQuestion.left;

    if (chosen.val >= other.val) {
      const points = 4 + streak;
      const newScore = score + points;
      setScore(newScore);
      setStreak(streak + 1);
      setWrongStreak(0);
      setMessage(`CORRECT: ${chosen.name} is the right answer! (+${points})`);
      saveScore(newScore);

      const { question: nextQuestion, remaining: nextDecks } =
        drawNextQuestion(remainingDecks);

      if (nextQuestion) {
        setTimeout(() => {
          setMessage("");
          setCurrentQuestion(nextQuestion);
          setRemainingDecks(nextDecks);
          setTimeLeft(10);
        }, 700);
      } else {
        setGameOver(true);
        setMessage("Perfect run. Game Over!");
      }
    } else {
      const deduction = 1 + wrongStreak;
      const newScore = score - deduction;
      setScore(newScore);
      setStreak(0);
      setWrongStreak(wrongStreak + 1);
      setMessage(
        `Wrong: ${other.name} is the correct answer. (-${deduction})`,
      );
      saveScore(newScore);

      const { question: nextQuestion, remaining: nextDecks } =
        drawNextQuestion(remainingDecks);

      if (nextQuestion) {
        setTimeout(() => {
          setMessage("");
          setCurrentQuestion(nextQuestion);
          setRemainingDecks(nextDecks);
          setTimeLeft(10);
        }, 1500); // Give a bit more time to read the values for wrong answers
      } else {
        setGameOver(true);
        setMessage("Run ended. No more questions left.");
      }
    }
  };

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] px-4 pt-24 pb-12 hl-grid-bg">
        <style>{`
          .hl-grid-bg {
            background-image: radial-gradient(#1a1c1c 1px, transparent 1px);
            background-size: 28px 28px;
          }
          .hl-card {
            border: 4px solid #1a1c1c;
            box-shadow: 8px 8px 0px #1a1c1c;
          }
          .hl-tilt:hover {
            transform: translate(4px, 4px);
            box-shadow: 0px 0px 0px #1a1c1c;
          }
          .hl-title-stack {
            font-family: var(--font-heading);
            font-weight: 900;
            letter-spacing: -0.03em;
            line-height: 1;
            text-transform: uppercase;
            font-style: italic;
          }
        `}</style>

        <div className="max-w-4xl mx-auto relative">
          {/* Left Side GIF (Hidden on Mobile) */}
          <div
            className="hidden lg:block fixed left-10 top-1/2 -translate-y-1/2 z-0 pointer-events-none"
            style={{
              maxHeight: "350px",
              width: "auto"
            }}
          >
            <img
              src={chungusGif}
              alt="chungus"
              className="w-48 xl:w-64 h-auto border-4 border-[#1a1c1c] shadow-[10px_10px_0px_#1a1c1c]"
            />
          </div>

          {/* Right Side GIF (Hidden on Mobile) */}
          <div
            className="hidden lg:block fixed right-10 top-1/2 -translate-y-1/2 z-0 pointer-events-none"
            style={{
              maxHeight: "350px",
              width: "auto"
            }}
          >
            <img
              src={kirkGif}
              alt="kirk"
              className="w-48 xl:w-64 h-auto border-4 border-[#1a1c1c] shadow-[10px_10px_0px_#1a1c1c]"
            />
          </div>
          <div className="text-center mb-7">
            <span
              className="inline-block px-4 py-2"
              style={{
                backgroundColor: "#0046fa",
                color: "#fff",
                border: "4px solid #1a1c1c",
                boxShadow: "6px 6px 0px #1a1c1c",
                fontFamily: "var(--font-heading)",
                fontWeight: 900,
                textTransform: "uppercase",
              }}
            >
              SPL 3.0 EVENT ROUND
            </span>
          </div>

          <h1 className="hl-title-stack text-center mb-8">
            <span
              className="inline-block px-4 py-2"
              style={{
                backgroundColor: "#d4f000",
                border: "4px solid #1a1c1c",
                boxShadow: "8px 8px 0px #bb0058",
                fontSize: "clamp(1.8rem, 6vw, 3.8rem)",
              }}
            >
              6-7 GAME
            </span>
            <br />
          </h1>

          <div className="hl-card bg-white p-7 md:p-9 max-w-2xl mx-auto">
            <h2
              className="text-2xl md:text-3xl mb-6"
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 900,
                textTransform: "uppercase",
              }}
            >
              Team Sign In
            </h2>

            {error && (
              <div
                className="mb-4 p-3"
                style={{
                  backgroundColor: "#bb0058",
                  color: "#fff",
                  border: "3px solid #1a1c1c",
                  fontWeight: 700,
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <div>
                <label
                  className="block mb-2"
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 800,
                    textTransform: "uppercase",
                  }}
                >
                  Team Name
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="TEAM NAME"
                  required
                  className="w-full px-4 py-3"
                  style={{
                    border: "3px solid #1a1c1c",
                    fontFamily: "var(--font-body)",
                    fontWeight: 600,
                    fontSize: "1.1rem",
                  }}
                />
              </div>

              <div>
                <label
                  className="block mb-2"
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 800,
                    textTransform: "uppercase",
                  }}
                >
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="TEAM LEAD'S PHONE NUMBER(91....)"
                  required
                  className="w-full px-4 py-3"
                  style={{
                    border: "3px solid #1a1c1c",
                    fontFamily: "var(--font-body)",
                    fontWeight: 600,
                    fontSize: "1.1rem",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="hl-tilt mt-2 px-6 py-4"
                style={{
                  backgroundColor: "#0046fa",
                  color: "#fff",
                  border: "4px solid #1a1c1c",
                  boxShadow: "8px 8px 0px #1a1c1c",
                  transition: "all 0.1s ease",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 900,
                  fontSize: "1.25rem",
                  textTransform: "uppercase",
                }}
              >
                {loading ? "Checking..." : "Enter Match"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] pt-24 hl-grid-bg">
      <style>{`
        .hl-grid-bg {
          background-image: radial-gradient(#1a1c1c 1px, transparent 1px);
          background-size: 28px 28px;
        }
        .hl-card {
          border: 4px solid #1a1c1c;
          box-shadow: 8px 8px 0px #1a1c1c;
        }
        .hl-choice {
          transition: transform 0.12s ease, box-shadow 0.12s ease;
        }
        .hl-choice:hover:not(:disabled) {
          transform: translate(4px, 4px);
          box-shadow: 0px 0px 0px #1a1c1c;
        }
        .hl-choice:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }
        .hl-ticker {
          animation: hl-ticker-scroll 16s linear infinite;
          white-space: nowrap;
        }
        @keyframes hl-ticker-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <span
            className="inline-block px-4 py-2"
            style={{
              backgroundColor: "#0046fa",
              color: "#fff",
              border: "4px solid #1a1c1c",
              boxShadow: "6px 6px 0px #1a1c1c",
              fontFamily: "var(--font-heading)",
              fontWeight: 900,
              textTransform: "uppercase",
            }}
          >
            Team: {teamData?.teamName}
          </span>

          <div className="flex flex-wrap items-center gap-3">
            <div
              className="px-4 py-2"
              style={{
                backgroundColor:
                  !gameOver && timeLeft <= 3 ? "#bb0058" : "#fff",
                color: !gameOver && timeLeft <= 3 ? "#fff" : "#1a1c1c",
                border: "4px solid #1a1c1c",
                boxShadow: "6px 6px 0px #1a1c1c",
                fontFamily: "var(--font-heading)",
                fontWeight: 900,
                textTransform: "uppercase",
                fontSize: "1rem",
                transition: "background-color 0.3s ease, color 0.3s ease",
              }}
            >
              Time: {gameOver ? "-" : `${timeLeft}s`}
            </div>



            <div
              className="px-4 py-2"
              style={{
                backgroundColor: "#d4f000",
                border: "4px solid #1a1c1c",
                boxShadow: "6px 6px 0px #bb0058",
                fontFamily: "var(--font-heading)",
                fontWeight: 900,
                textTransform: "uppercase",
                fontSize: "1.1rem",
              }}
            >
              Score: {score}
            </div>
          </div>
        </div>

        <h1
          className="mt-8 text-center"
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 900,
            textTransform: "uppercase",
            fontStyle: "italic",
            lineHeight: 1,
            fontSize: "clamp(2.2rem, 6vw, 4.5rem)",
          }}
        >
          {currentQuestion && isGameStarted && !showRulesTimer ? currentQuestion.category : "6-7 GAME"}
        </h1>

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-auto mt-6 max-w-4xl px-4 py-3"
              style={{
                backgroundColor: message.startsWith("CORRECT")
                  ? "#d4f000"
                  : "#bb0058",
                color: message.startsWith("CORRECT") ? "#1a1c1c" : "#fff",
                border: "4px solid #1a1c1c",
                boxShadow: "8px 8px 0px #1a1c1c",
                fontFamily: "var(--font-heading)",
                fontWeight: 900,
                textTransform: "uppercase",
                textAlign: "center",
              }}
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        {!isGameStarted ? (
          <div className="mt-8 text-center bg-[#0046fa] text-white p-12 border-4 border-[#1a1c1c] shadow-[8px_8px_0px_#1a1c1c] max-w-3xl mx-auto">
            <h2
              className="text-4xl font-black uppercase mb-8"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Game Rules
            </h2>
            <div
              className="text-lg mb-12 space-y-4"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <p className="font-bold">
                👉 Answer the question by clicking the correct option
              </p>
              <p className="font-bold">
                👉 Correct answers: +4 for first, then +5, +6, +7... (increases
                by 1 each streak)
              </p>
              <p className="font-bold">
                👉 Wrong answers: -1 for first, then -2, -3, -4... (deduction increases by 1 each streak)
              </p>
              <p className="font-bold">👉 You have 10 seconds per question</p>
            </div>
            <p className="text-xl font-bold">
              Waiting for admin to start the game...
            </p>
          </div>
        ) : showRulesTimer ? (
          <div className="mt-8 text-center bg-[#0046fa] text-white p-12 border-4 border-[#1a1c1c] shadow-[8px_8px_0px_#1a1c1c] max-w-3xl mx-auto">
            <h2
              className="text-4xl font-black uppercase mb-8"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Game Rules
            </h2>
            <div
              className="text-lg mb-12 space-y-4"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <p className="font-bold">
                👉 Answer the question by clicking the correct option
              </p>
              <p className="font-bold">
                👉 Correct answers: +4 for first, then +5, +6, +7... (increases
                by 1 each streak)
              </p>
              <p className="font-bold">
                👉 Wrong answers: -1 for first, then -2, -3, -4... (deduction increases by 1 each streak)
              </p>
              <p className="font-bold">👉 You have 10 seconds per question</p>
            </div>
            <div
              className="inline-block px-8 py-6"
              style={{
                backgroundColor: "#d4f000",
                color: "#1a1c1c",
                border: "4px solid #1a1c1c",
                boxShadow: "8px 8px 0px #1a1c1c",
                fontFamily: "var(--font-heading)",
                fontWeight: 900,
                fontSize: "3rem",
              }}
            >
              {rulesTimeLeft}s
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mt-8">
            <section className="xl:col-span-9">
              <div className="hl-card bg-white p-4 md:p-6">
                <div className="relative flex flex-col md:flex-row gap-4 md:gap-6 items-stretch">
                  <button
                    onClick={() => handleChoice(0)}
                    disabled={gameOver}
                    className="hl-choice flex-1 h-[46vh] md:h-[50vh] p-6 md:p-10"
                    style={{
                      backgroundColor: "#0046fa",
                      color: "#fff",
                      border: "4px solid #1a1c1c",
                      boxShadow: "8px 8px 0px #1a1c1c",
                    }}
                  >
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <h2
                        style={{
                          fontFamily: "var(--font-heading)",
                          fontWeight: 900,
                          textTransform: "uppercase",
                          lineHeight: 1.05,
                          fontSize: "clamp(1.5rem, 5vw, 3.5rem)",
                          wordBreak: "break-word",
                          overflowWrap: "anywhere",
                          width: "100%",
                        }}
                      >
                        {currentQuestion?.left?.name || "-"}
                      </h2>

                    </div>
                  </button>

                  <div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 md:w-24 md:h-24 rounded-full hidden md:flex items-center justify-center"
                    style={{
                      backgroundColor: "#f9f9f9",
                      border: "4px solid #1a1c1c",
                      boxShadow: "6px 6px 0px #1a1c1c",
                      fontFamily: "var(--font-heading)",
                      fontWeight: 900,
                      fontSize: "2rem",
                    }}
                  >
                    OR
                  </div>

                  <button
                    onClick={() => handleChoice(1)}
                    disabled={gameOver}
                    className="hl-choice flex-1 h-[46vh] md:h-[50vh] p-6 md:p-10"
                    style={{
                      backgroundColor: "#d4f000",
                      color: "#1a1c1c",
                      border: "4px solid #1a1c1c",
                      boxShadow: "8px 8px 0px #bb0058",
                    }}
                  >
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <h2
                        style={{
                          fontFamily: "var(--font-heading)",
                          fontWeight: 900,
                          textTransform: "uppercase",
                          lineHeight: 1.05,
                          fontSize: "clamp(1.5rem, 5vw, 3.5rem)",
                          wordBreak: "break-word",
                          overflowWrap: "anywhere",
                          width: "100%",
                        }}
                      >
                        {currentQuestion?.right?.name || "-"}
                      </h2>

                    </div>
                  </button>
                </div>
              </div>

              {gameOver && (
                <div
                  className="hl-card mt-6 p-5"
                  style={{
                    backgroundColor: "#1a1c1c",
                    color: "#fff",
                    fontFamily: "var(--font-heading)",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    fontSize: "1.1rem",
                  }}
                >
                  Run ended. Final score: {score}.
                </div>
              )}
            </section>

            <aside className="xl:col-span-3 xl:-mt-4">
              <div className="hl-card bg-white p-5">
                <h4
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    fontSize: "1.2rem",
                  }}
                >
                  Rule Snapshot
                </h4>
                <p
                  className="mt-2"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 600,
                    color: "#434659",
                    lineHeight: 1.6,
                  }}
                >
                  Read the question and select the correct option! Questions are never repeated in a run. Correct answers give +4 points (+1 on every streak). Wrong answers deduct 1 point.
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>

      <PixelDivider topColor="#1a1c1c" bgColor="#f9f9f9" />
      <div
        className="overflow-hidden"
        style={{ backgroundColor: "#1a1c1c", padding: "0.7rem 0" }}
      >
        <div
          className="hl-ticker"
          style={{ display: "inline-flex", gap: "2.5rem" }}
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <React.Fragment key={i}>
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 900,
                  color: "#d4f000",
                  textTransform: "uppercase",
                  fontSize: "1.1rem",
                  letterSpacing: "0.08em",
                }}
              >
                Value. Judge. Survive.
              </span>
              <span style={{ color: "#bb0058", fontWeight: 900 }}>●</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
