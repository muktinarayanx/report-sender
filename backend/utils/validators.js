// ============================================
// Input Validators — Email & File Validation
// ============================================

/**
 * Validates a single email address format.
 * Uses a robust regex that handles most real-world email formats.
 *
 * @param {string} email - Email address to validate
 * @returns {boolean} true if valid
 */
function isValidEmail(email) {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email.trim());
}

/**
 * Parses and validates a comma-separated list of email addresses.
 * Returns an object with valid emails and any invalid ones found.
 *
 * @param {string} emailString - Comma-separated email addresses
 * @returns {{ valid: string[], invalid: string[] }}
 */
function parseAndValidateEmails(emailString) {
  if (!emailString || typeof emailString !== "string") {
    return { valid: [], invalid: [] };
  }

  const emails = emailString
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.length > 0);

  const valid = [];
  const invalid = [];

  for (const email of emails) {
    if (isValidEmail(email)) {
      // Avoid duplicates
      if (!valid.includes(email)) {
        valid.push(email);
      }
    } else {
      invalid.push(email);
    }
  }

  return { valid, invalid };
}

/**
 * Validates the uploaded file is a PDF.
 *
 * @param {object} file - Multer file object
 * @returns {{ ok: boolean, error?: string }}
 */
function validatePdfFile(file) {
  if (!file) {
    return { ok: false, error: "No file uploaded. Please attach a PDF." };
  }

  const allowedMimes = ["application/pdf"];
  if (!allowedMimes.includes(file.mimetype)) {
    return {
      ok: false,
      error: `Invalid file type: "${file.mimetype}". Only PDF files are accepted.`,
    };
  }

  // 10 MB limit
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      ok: false,
      error: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 10MB.`,
    };
  }

  return { ok: true };
}

/**
 * Sanitizes a text string — removes script tags and trims whitespace.
 *
 * @param {string} text
 * @returns {string}
 */
function sanitizeText(text) {
  if (!text || typeof text !== "string") return "";
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .trim();
}

module.exports = {
  isValidEmail,
  parseAndValidateEmails,
  validatePdfFile,
  sanitizeText,
};
