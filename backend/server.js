// ============================================
// Server Entry Point — Express Application
// ============================================
// Sets up Express with CORS, routes, and error handling.
// Run with: npm start  or  npm run dev (with --watch)

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const reportRoutes = require("./routes/report");

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────

// CORS — allow frontend to call this API
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"], // Vite & CRA defaults
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// Parse JSON bodies (for non-file routes if needed later)
app.use(express.json());

// ── Routes ─────────────────────────────────────

// Health check — useful for monitoring
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Report Sender API",
    timestamp: new Date().toISOString(),
  });
});

// Report sending routes
app.use("/api", reportRoutes);

// ── Error Handling ─────────────────────────────

// Handle Multer-specific errors (file too large, wrong type, etc.)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const messages = {
      LIMIT_FILE_SIZE: "File is too large. Maximum size is 10MB.",
      LIMIT_FILE_COUNT: "Too many files. Please upload only one PDF.",
      LIMIT_UNEXPECTED_FILE: err.message || "Unexpected file type.",
    };

    return res.status(400).json({
      success: false,
      error: messages[err.code] || `Upload error: ${err.message}`,
    });
  }

  // Generic error handler
  console.error("❌ Unhandled error:", err);
  return res.status(500).json({
    success: false,
    error: "Internal server error.",
  });
});

// ── Start Server ───────────────────────────────

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║   📧 Report Sender API is running!      ║
  ║                                          ║
  ║   Local:  http://localhost:${PORT}          ║
  ║   Health: http://localhost:${PORT}/api/health║
  ╚══════════════════════════════════════════╝
  `);

  // Validate environment
  if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY === "your_sendgrid_api_key_here") {
    console.warn("⚠️  WARNING: SENDGRID_API_KEY is not set in .env");
    console.warn("   Emails will NOT be sent until you configure it.\n");
  }
  if (!process.env.SENDER_EMAIL || process.env.SENDER_EMAIL === "your_verified_email@example.com") {
    console.warn("⚠️  WARNING: SENDER_EMAIL is not set in .env");
    console.warn("   Please set a verified SendGrid sender email.\n");
  }
});
