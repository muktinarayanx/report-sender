// ============================================
// Report Route — POST /api/send-report
// ============================================
// Handles the complete flow:
//   1. Accept PDF upload via Multer
//   2. Validate inputs (emails, file, subject)
//   3. Send email via SendGrid
//   4. Return results

const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { parseAndValidateEmails, validatePdfFile, sanitizeText } = require("../utils/validators");
const { sendReportEmail } = require("../utils/emailService");

/**
 * POST /api/send-report
 *
 * Body (multipart/form-data):
 *   - pdf      : PDF file (required)
 *   - emails   : Comma-separated email addresses (required)
 *   - subject  : Email subject line (required)
 *   - message  : Email body text (optional)
 *
 * Response:
 *   - 200: { success: true, sent, failed, message }
 *   - 400: { success: false, error, details }
 *   - 500: { success: false, error }
 */
router.post("/send-report", upload.single("pdf"), async (req, res) => {
  try {
    // ── Step 1: Validate the uploaded PDF ──
    const fileCheck = validatePdfFile(req.file);
    if (!fileCheck.ok) {
      return res.status(400).json({
        success: false,
        error: fileCheck.error,
      });
    }

    // ── Step 2: Validate and parse email addresses ──
    const { emails, subject, message } = req.body;

    if (!emails) {
      return res.status(400).json({
        success: false,
        error: "No recipient emails provided. Please add at least one email address.",
      });
    }

    const { valid: validEmails, invalid: invalidEmails } = parseAndValidateEmails(emails);

    if (validEmails.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No valid email addresses found.",
        details: { invalidEmails },
      });
    }

    // Cap recipients to prevent abuse
    const MAX_RECIPIENTS = 20;
    if (validEmails.length > MAX_RECIPIENTS) {
      return res.status(400).json({
        success: false,
        error: `Too many recipients. Maximum is ${MAX_RECIPIENTS} per request. You provided ${validEmails.length}.`,
      });
    }

    // ── Step 3: Validate subject ──
    if (!subject || subject.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Email subject is required.",
      });
    }

    // ── Step 4: Sanitize inputs ──
    const cleanSubject = sanitizeText(subject);
    const cleanMessage = sanitizeText(message || "Please find the attached report.");

    // ── Step 5: Send the report via SendGrid ──
    console.log(`\n📨 Sending report "${req.file.originalname}" to ${validEmails.length} recipient(s)...`);

    const result = await sendReportEmail(
      validEmails,
      cleanSubject,
      cleanMessage,
      req.file.buffer,       // PDF as Buffer (from memory storage)
      req.file.originalname   // Original filename
    );

    // ── Step 6: Return results ──
    if (result.success) {
      const response = {
        success: true,
        sent: result.sent,
        failed: result.failed,
        message: `Report sent successfully to ${result.sent} recipient(s).`,
      };

      // Include warnings for partial failures or invalid emails
      if (result.failed > 0) {
        response.warnings = result.errors;
      }
      if (invalidEmails.length > 0) {
        response.skippedEmails = invalidEmails;
      }

      console.log(`✅ Done! Sent: ${result.sent}, Failed: ${result.failed}\n`);
      return res.status(200).json(response);
    } else {
      return res.status(500).json({
        success: false,
        error: "Failed to send report to any recipient.",
        details: result.errors,
      });
    }
  } catch (error) {
    console.error("❌ Unexpected error in /send-report:", error);
    return res.status(500).json({
      success: false,
      error: "An unexpected error occurred while sending the report.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
