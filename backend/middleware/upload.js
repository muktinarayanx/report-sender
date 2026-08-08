// ============================================
// Multer Upload Middleware — PDF File Handling
// ============================================
// Configures Multer to accept only PDF files up to 10MB.
// Files are stored in memory (as Buffer) since we read them
// immediately and don't need to persist them on disk.

const multer = require("multer");
const path = require("path");

// Use memory storage — file stays in RAM as a Buffer
// This is ideal because:
// 1. We only need the file temporarily to send via email
// 2. No cleanup of temp files needed
// 3. Faster than writing to disk then reading back
const storage = multer.memoryStorage();

// File filter — only allow PDFs
function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();

  if (ext !== ".pdf") {
    // Reject file with a descriptive error
    return cb(
      new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Only PDF files are allowed"),
      false
    );
  }

  if (file.mimetype !== "application/pdf") {
    return cb(
      new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Invalid file MIME type. Expected application/pdf"),
      false
    );
  }

  // Accept the file
  cb(null, true);
}

// Create the Multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB max
    files: 1,                     // Only 1 file at a time
  },
});

module.exports = upload;
