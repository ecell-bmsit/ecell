import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { counselFeedbackHandler } = require("../server/counsel/feedback.cjs");
const {
  logoutHandler,
  requestOtpHandler,
  requireCollegeAuth,
  sessionHandler,
  verifyOtpHandler,
} = require("../server/auth/otp.cjs");
const { submitIdeaHandler } = require("../server/ideas/submit.cjs");
const { retryExportsHandler } = require("../server/ideas/export-retry.cjs");

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://ecell-bmsitm.vercel.app"
  ],
  credentials: true,
}));
app.use(express.json());

// AI Counsel feedback (server-side Groq request; no MongoDB dependency)
app.post("/api/auth/request-otp", requestOtpHandler);
app.post("/api/auth/verify-otp", verifyOtpHandler);
app.get("/api/auth/session", sessionHandler);
app.post("/api/auth/logout", logoutHandler);
app.post("/api/counsel/feedback", requireCollegeAuth, counselFeedbackHandler);
app.post("/api/submit-idea", submitIdeaHandler);
app.all("/api/internal/retry-sheet-exports", retryExportsHandler);

// ── Mongoose Models (inline to avoid require() issues) ───────────────────────

const gameStateSchema = new mongoose.Schema({
  gameId: { type: String, required: true, unique: true },
  isStarted: { type: Boolean, default: false },
});

const crosswordEntrySchema = new mongoose.Schema({
  teamName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, match: /^[0-9]{10}$/ },
  completedAt: { type: Date, default: null },
  timeTaken: { type: Number, default: null },
  accuracy: { type: Number, default: null },
  solvedWordsCount: { type: Number, default: 0 },
  registeredAt: { type: Date, default: Date.now },
  loggedIn: { type: Boolean, default: false },
});

// Prevent model re-registration in serverless warm-starts
const GameState = mongoose.models.GameState || mongoose.model("GameState", gameStateSchema);
const CrosswordEntry = mongoose.models.CrosswordEntry || mongoose.model("CrosswordEntry", crosswordEntrySchema, "Demousers");

// ── DB Connection (cached for serverless) ───────────────────────────────────
let dbConnected = false;
async function connectDB() {
  if (dbConnected) return;
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not set.");
  }
  await mongoose.connect(process.env.MONGODB_URI);
  dbConnected = true;

  // One-time migration: backfill loggedIn:false for documents that predate the field
  await CrosswordEntry.updateMany(
    { loggedIn: { $exists: false } },
    { $set: { loggedIn: false } }
  );
}

// ── Routes ───────────────────────────────────────────────────────────────────

// GET /api/crossword/status
app.get("/api/crossword/status", async (req, res) => {
  try {
    await connectDB();
    const state = await GameState.findOne({ gameId: "crossword" });
    res.json({ success: true, isStarted: state ? state.isStarted : false });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/crossword/status  (admin toggle)
app.post("/api/crossword/status", async (req, res) => {
  try {
    await connectDB();
    const { action } = req.body;
    const isStarted = action === "start";
    const state = await GameState.findOneAndUpdate(
      { gameId: "crossword" },
      { isStarted },
      { upsert: true, new: true }
    );
    res.json({ success: true, isStarted: state.isStarted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/crossword/register
app.post("/api/crossword/register", async (req, res) => {
  try {
    await connectDB();
    const { teamName, phone } = req.body;

    if (!teamName || !teamName.trim()) {
      return res.status(400).json({ success: false, error: "Team name is required." });
    }
    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({ success: false, error: "A valid 10-digit phone number is required." });
    }

    const trimmedName = teamName.trim();
    let entry;

    if (trimmedName.toLowerCase() === "team nucleus") {
      entry = await CrosswordEntry.findOneAndUpdate(
        { teamName: trimmedName },
        { phone, completedAt: null, timeTaken: null, accuracy: null, registeredAt: Date.now() },
        { new: true, upsert: true }
      );
    } else {
      const existingEntry = await CrosswordEntry.findOne({ teamName: trimmedName, phone: phone });
      if (!existingEntry) {
        return res.status(403).json({ success: false, error: "Team not found or phone number is incorrect. Only pre-registered teams can play." });
      }
      if (existingEntry.loggedIn) {
        return res.status(403).json({ success: false, error: "Your team is already logged in on another device. Only one session per team is allowed." });
      }
      await CrosswordEntry.findByIdAndUpdate(existingEntry._id, { loggedIn: true });
      entry = existingEntry;
    }

    res.status(201).json({ success: true, entryId: entry._id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/crossword/complete
app.post("/api/crossword/complete", async (req, res) => {
  try {
    await connectDB();
    const { entryId, timeTaken, accuracy, solvedWordsCount } = req.body;
    await CrosswordEntry.findByIdAndUpdate(entryId, {
      completedAt: new Date(),
      timeTaken,
      accuracy,
      solvedWordsCount,
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/crossword/entries  (admin dashboard)
app.get("/api/crossword/entries", async (req, res) => {
  try {
    await connectDB();
    const entries = await CrosswordEntry.find().sort({ registeredAt: 1 });
    res.json({ success: true, entries });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/crossword/leaderboard  (public leaderboard - completed teams sorted by time)
app.get("/api/crossword/leaderboard", async (req, res) => {
  try {
    await connectDB();
    const entries = await CrosswordEntry.find(
      { completedAt: { $ne: null }, timeTaken: { $ne: null }, teamName: { $not: /^team nucleus$/i } },
      { teamName: 1, timeTaken: 1, completedAt: 1, solvedWordsCount: 1 }  // only return needed fields
    ).sort({ solvedWordsCount: -1, timeTaken: 1 }); // descending by words solved, then fastest first
    res.json({ success: true, entries });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/crossword/admin/reset-sessions  (admin — clears all loggedIn flags)
app.post("/api/crossword/admin/reset-sessions", async (req, res) => {
  try {
    await connectDB();
    const { password } = req.body;
    if (password !== "ansuansu") {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }
    const result = await CrosswordEntry.updateMany({}, { $set: { loggedIn: false } });
    res.json({ success: true, resetCount: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default app;
