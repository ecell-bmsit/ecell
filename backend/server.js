const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const { body, validationResult } = require("express-validator");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const Word = require("./models/Word");
const GameTeam = require("./models/GameTeam");
const GameState = require("./models/GameState");
const HitCounter = require("./models/HitCounter");
const CrosswordEntry = require("./models/CrosswordEntry");
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
const PORT = process.env.PORT || 3001;
const GAME_DEMO_ADMIN_ID = process.env.GAME_DEMO_ADMIN_ID || "demo-admin";
const GAME_DEMO_ADMIN_PASSWORD =
  process.env.GAME_DEMO_ADMIN_PASSWORD || "demo-admin-123";

const ensureDemoAdminTeam = async () => {
  await GameTeam.findOneAndUpdate(
    { teamName: GAME_DEMO_ADMIN_ID },
    {
      $set: {
        password: GAME_DEMO_ADMIN_PASSWORD,
        isDemoAdmin: true,
        hasPlayed: false,
        playedAt: null,
      },
      $setOnInsert: {
        score: 0,
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );
};

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://ecell-bmsitm.vercel.app"
    ],
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// MongoDB connection
if (!process.env.MONGODB_URI) {
  console.error("❌ MONGODB_URI environment variable is missing!");
} else {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(async () => {
      console.log("✅ Connected to MongoDB");
      await ensureDemoAdminTeam();
      console.log(`🧪 Demo admin ready: ${GAME_DEMO_ADMIN_ID}`);
    })
    .catch((err) => console.error("❌ MongoDB connection error:", err));
}

// Rate limiting - 5 submissions per hour per IP
const submissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    error: "Too many story submissions from this IP, please try again later.",
    retryAfter: 3600,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Email transporter configuration
const createTransporter = () => {
  // Gmail configuration (you can change this for other providers)
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Use App Password for Gmail
    },
  });
};

// Alternative configuration for other email providers
const createCustomTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Validation middleware
const validateStorySubmission = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),

  body("story")
    .trim()
    .isLength({ min: 50, max: 5000 })
    .withMessage("Story must be between 50 and 5000 characters"),
];

// Idea validation middleware
const validateIdeaSubmission = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),

  body("idea")
    .trim()
    .isLength({ min: 50, max: 5000 })
    .withMessage("Idea must be between 50 and 5000 characters"),
];

// Sanitize HTML content
const sanitizeContent = (content) => {
  return content
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

// Format email content
const formatEmailContent = (data) => {
  const sanitizedData = {
    name: sanitizeContent(data.name),
    email: sanitizeContent(data.email),
    story: sanitizeContent(data.story),
  };

  return {
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Failure Story Submission</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background-color: #FD7722; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; max-width: 800px; margin: 0 auto; }
          .field { margin-bottom: 20px; }
          .label { font-weight: bold; color: #FD7722; }
          .story-content { background-color: #f9f9f9; padding: 15px; border-left: 4px solid #FD7722; white-space: pre-wrap; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>New Failure Story Submission</h1>
        </div>
        <div class="content">
          <div class="field">
            <div class="label">Name:</div>
            <div>${sanitizedData.name}</div>
          </div>
          
          <div class="field">
            <div class="label">Email:</div>
            <div>${sanitizedData.email}</div>
          </div>
          
          <div class="field">
            <div class="label">Story:</div>
            <div class="story-content">${sanitizedData.story}</div>
          </div>
          
          <div class="field">
            <div class="label">Submitted At:</div>
            <div>${new Date().toLocaleString()}</div>
          </div>
        </div>
        <div class="footer">
          This email was sent from the E-Cell BMSIT Failure Story submission form.
        </div>
      </body>
      </html>
    `,
    text: `
New Failure Story Submission

Name: ${sanitizedData.name}
Email: ${sanitizedData.email}
Submitted At: ${new Date().toLocaleString()}

Story:
${sanitizedData.story}

---
This email was sent from the E-Cell BMSIT Failure Story submission form.
    `,
  };
};

// Routes
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "Failure Story Backend",
  });
});

// AI Counsel feedback (server-side Groq request; no MongoDB dependency)
app.post("/api/auth/request-otp", requestOtpHandler);
app.post("/api/auth/verify-otp", verifyOtpHandler);
app.get("/api/auth/session", sessionHandler);
app.post("/api/auth/logout", logoutHandler);
app.post("/api/counsel/feedback", requireCollegeAuth, counselFeedbackHandler);
app.post("/api/submit-idea", submitIdeaHandler);
app.all("/api/internal/retry-sheet-exports", retryExportsHandler);

// Submit failure story
app.post(
  "/api/submit-story",
  submissionLimiter,
  validateStorySubmission,
  async (req, res) => {
    try {
      // Check validation results
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const { name, email, story } = req.body;

      // Create email content
      const emailContent = formatEmailContent({ name, email, story });

      // Create transporter (using Gmail by default)
      const transporter = process.env.SMTP_HOST
        ? createCustomTransporter()
        : createTransporter();

      // Email options
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: "ecell@bmsit.in",
        subject: `New Failure Story from ${name}`,
        text: emailContent.text,
        html: emailContent.html,
        replyTo: email,
      };

      // Send confirmation email to submitter
      const confirmationOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Thank you for sharing your story!",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Thank You</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .header { background-color: #FD7722; color: white; padding: 20px; text-align: center; }
              .content { padding: 30px; max-width: 600px; margin: 0 auto; }
              .footer { text-align: center; padding: 20px; color: #666; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Thank You, ${sanitizeContent(name)}!</h1>
            </div>
            <div class="content">
              <p>Thank you for sharing your failure story with E-Cell BMSIT. Your courage to share your journey will inspire countless entrepreneurs who face similar challenges.</p>
              
              <p>Every failure is a stepping stone to success, and by sharing your experience, you're helping build a community where entrepreneurs can learn from each other's setbacks and comebacks.</p>
              
              <p>We truly appreciate your contribution to our entrepreneurial community.</p>
              
              <p>Best regards,<br>
              <strong>E-Cell BMSIT Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </body>
          </html>
        `,
      };

      // Send both emails
      await Promise.all([
        transporter.sendMail(mailOptions),
        transporter.sendMail(confirmationOptions),
      ]);

      res.json({
        success: true,
        message:
          "Story submitted successfully! Thank you for sharing your experience.",
      });
    } catch (error) {
      console.error("Error submitting story:", error);

      // Don't expose internal errors to client
      res.status(500).json({
        success: false,
        error: "Failed to submit story. Please try again later.",
      });
    }
  },
);

// ===== WORD OF THE DAY CRUD ROUTES =====

// GET all words (sorted by date descending)
app.get("/api/words", async (req, res) => {
  try {
    const words = await Word.find().sort({ date: -1 });
    res.json(words);
  } catch (error) {
    console.error("Error fetching words:", error);
    res.status(500).json({ success: false, error: "Failed to fetch words" });
  }
});

// GET single word by ID
app.get("/api/words/:id", async (req, res) => {
  try {
    const word = await Word.findById(req.params.id);
    if (!word) {
      return res.status(404).json({ success: false, error: "Word not found" });
    }
    res.json(word);
  } catch (error) {
    console.error("Error fetching word:", error);
    res.status(500).json({ success: false, error: "Failed to fetch word" });
  }
});

// POST create new word
app.post("/api/words", async (req, res) => {
  try {
    const word = new Word(req.body);
    const saved = await word.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Error creating word:", error);
    res.status(500).json({ success: false, error: "Failed to create word" });
  }
});

// PUT update word
app.put("/api/words/:id", async (req, res) => {
  try {
    const word = await Word.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!word) {
      return res.status(404).json({ success: false, error: "Word not found" });
    }
    res.json(word);
  } catch (error) {
    console.error("Error updating word:", error);
    res.status(500).json({ success: false, error: "Failed to update word" });
  }
});

// DELETE word
app.delete("/api/words/:id", async (req, res) => {
  try {
    const word = await Word.findByIdAndDelete(req.params.id);
    if (!word) {
      return res.status(404).json({ success: false, error: "Word not found" });
    }
    res.json({ success: true, message: "Word deleted" });
  } catch (error) {
    console.error("Error deleting word:", error);
    res.status(500).json({ success: false, error: "Failed to delete word" });
  }
});

// ===== EVENT HIGHER OR LOWER GAME ROUTES =====

// Check game status
app.get("/api/game/status", async (req, res) => {
  try {
    let state = await GameState.findOne({ gameId: "higher-lower" });
    if (!state) {
      state = await GameState.create({
        gameId: "higher-lower",
        isStarted: false,
      });
    }
    res.json({ success: true, isStarted: state.isStarted });
  } catch (error) {
    console.error("Error fetching game status:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch game status" });
  }
});

// Update game status
app.post("/api/game/status", async (req, res) => {
  try {
    const { action } = req.body;
    const isStarted = action === "start";

    const state = await GameState.findOneAndUpdate(
      { gameId: "higher-lower" },
      { isStarted },
      { new: true, upsert: true },
    );

    res.json({ success: true, isStarted: state.isStarted });
  } catch (error) {
    console.error("Error updating game status:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update game status" });
  }
});

// Check team login
app.post("/api/game/login", async (req, res) => {
  try {
    const { teamName, password } = req.body;

    if (
      teamName === GAME_DEMO_ADMIN_ID &&
      password === GAME_DEMO_ADMIN_PASSWORD
    ) {
      const demoAdminTeam = await GameTeam.findOneAndUpdate(
        { teamName: GAME_DEMO_ADMIN_ID },
        {
          $set: {
            password: GAME_DEMO_ADMIN_PASSWORD,
            isDemoAdmin: true,
            hasPlayed: false,
            playedAt: null,
          },
          $setOnInsert: {
            score: 0,
          },
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        },
      );

      return res.json({
        success: true,
        team: demoAdminTeam,
      });
    }

    const team = await GameTeam.findOne({ teamName, password });

    if (!team) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid team name or password" });
    }

    if (team.hasPlayed && !team.isDemoAdmin) {
      return res.status(403).json({
        success: false,
        error: "This team has already played and cannot attempt again.",
      });
    }

    res.json({ success: true, team });
  } catch (error) {
    console.error("Error logging in team:", error);
    res.status(500).json({ success: false, error: "Failed to login" });
  }
});

// Update score
app.post("/api/game/score", async (req, res) => {
  try {
    const { teamId, score } = req.body;

    const team = await GameTeam.findById(teamId);

    if (!team) {
      return res.status(404).json({ success: false, error: "Team not found" });
    }

    team.score = score;

    if (team.isDemoAdmin) {
      team.hasPlayed = false;
      team.playedAt = null;
    } else {
      team.hasPlayed = true;
      team.playedAt = new Date();
    }
    await team.save();

    res.json({ success: true, team });
  } catch (error) {
    console.error("Error updating score:", error);
    res.status(500).json({ success: false, error: "Failed to update score" });
  }
});

// Get leaderboard
app.get("/api/game/leaderboard", async (req, res) => {
  try {
    const teams = await GameTeam.find().sort({ score: -1 }).select("-password");
    res.json({ success: true, leaderboard: teams });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch leaderboard" });
  }
});

// ===== HIT COUNTER ROUTES =====

// Get hit count
app.get("/api/hits", async (req, res) => {
  try {
    let counter = await HitCounter.findOne();
    if (!counter) {
      counter = await HitCounter.create({ count: 0 });
    }
    res.json({ success: true, count: counter.count });
  } catch (error) {
    console.error("Error fetching hits:", error);
    res.status(500).json({ success: false, error: "Failed to fetch hits" });
  }
});

// Increment hit count
app.post("/api/hits/increment", async (req, res) => {
  try {
    let counter = await HitCounter.findOneAndUpdate(
      {},
      { $inc: { count: 1 }, lastHit: new Date() },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    res.json({ success: true, count: counter.count });
  } catch (error) {
    console.error("Error incrementing hits:", error);
    res.status(500).json({ success: false, error: "Failed to increment hits" });
  }
});

// ===== CROSSWORD GAME ROUTES =====

// Get crossword game status
app.get("/api/crossword/status", async (req, res) => {
  try {
    let state = await GameState.findOne({ gameId: "crossword" });
    if (!state) {
      state = await GameState.create({ gameId: "crossword", isStarted: false });
    }
    res.json({ success: true, isStarted: state.isStarted });
  } catch (error) {
    console.error("Error fetching crossword status:", error);
    res.status(500).json({ success: false, error: "Failed to fetch status" });
  }
});

// Update crossword game status (admin)
app.post("/api/crossword/status", async (req, res) => {
  try {
    const { action } = req.body;
    const isStarted = action === "start";
    const state = await GameState.findOneAndUpdate(
      { gameId: "crossword" },
      { isStarted },
      { new: true, upsert: true }
    );
    res.json({ success: true, isStarted: state.isStarted });
  } catch (error) {
    console.error("Error updating crossword status:", error);
    res.status(500).json({ success: false, error: "Failed to update status" });
  }
});

// Register team for crossword puzzle
app.post("/api/crossword/register", async (req, res) => {
  try {
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
      // Demo admin team: reset their stats and allow them to play again
      entry = await CrosswordEntry.findOneAndUpdate(
        { teamName: trimmedName },
        { phone, completedAt: null, timeTaken: null, accuracy: null, registeredAt: Date.now() },
        { new: true, upsert: true }
      );
    } else {
      // Normal team: Check if team already exists and phone matches
      const existingEntry = await CrosswordEntry.findOne({ teamName: trimmedName, phone: phone });
      if (!existingEntry) {
        return res.status(403).json({ success: false, error: "Team not found or phone number is incorrect. Only pre-registered teams can play." });
      }
      if (existingEntry.completedAt !== null) {
        return res.status(403).json({ success: false, error: "Your team has already completed the crossword!" });
      }
      entry = existingEntry;
    }

    res.status(201).json({ success: true, entryId: entry._id });
  } catch (error) {
    console.error("Error registering crossword team:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to register team.",
      details: error.message,
      stack: error.stack 
    });
  }
});

// Save crossword completion stats
app.post("/api/crossword/complete", async (req, res) => {
  try {
    const { entryId, timeTaken, accuracy, solvedWordsCount } = req.body;

    const entry = await CrosswordEntry.findByIdAndUpdate(
      entryId,
      { completedAt: new Date(), timeTaken, accuracy, solvedWordsCount },
      { new: true }
    );

    if (!entry) {
      return res.status(404).json({ success: false, error: "Entry not found." });
    }

    res.json({ success: true, entry });
  } catch (error) {
    console.error("Error saving crossword completion:", error);
    res.status(500).json({ success: false, error: "Failed to save completion." });
  }
});

// Get all crossword entries (admin)
app.get("/api/crossword/entries", async (req, res) => {
  try {
    const entries = await CrosswordEntry.find().sort({ registeredAt: -1 });
    res.json({ success: true, entries });
  } catch (error) {
    console.error("Error fetching crossword entries:", error);
    res.status(500).json({ success: false, error: "Failed to fetch entries." });
  }
});

// Public leaderboard — completed teams sorted by time ascending
app.get("/api/crossword/leaderboard", async (req, res) => {
  try {
    const entries = await CrosswordEntry.find(
      { completedAt: { $ne: null }, timeTaken: { $ne: null }, teamName: { $not: /^team nucleus$/i } },
      { teamName: 1, timeTaken: 1, completedAt: 1, solvedWordsCount: 1 }
    ).sort({ solvedWordsCount: -1, timeTaken: 1 });
    res.json({ success: true, entries });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ success: false, error: "Failed to fetch leaderboard." });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
  });
});

// Start server only if run directly (not imported as a serverless function)
if (process.env.NODE_ENV !== 'production' && require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Failure Story Backend running on port ${PORT}`);
    console.log(
      `📧 Email service: ${process.env.SMTP_HOST ? "Custom SMTP" : "Gmail"}`,
    );
    console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

module.exports = app;
