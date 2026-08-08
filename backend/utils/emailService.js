// ============================================
// Email Service — SendGrid Wrapper
// ============================================
// Handles all email sending logic via SendGrid API.
// Supports sending PDF attachments to multiple recipients.

const sgMail = require("@sendgrid/mail");
const fs = require("fs");
const path = require("path");

// Initialize SendGrid with API key from environment
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Sends an email with a PDF attachment to multiple recipients.
 *
 * HOW IT WORKS:
 * 1. Converts the PDF buffer to base64 (SendGrid requires base64 for attachments)
 * 2. Builds the email message object with attachment
 * 3. Uses sgMail.send() with `isMultiple: true` to send individual emails to each recipient
 *    (so recipients don't see each other's addresses — privacy preserved)
 *
 * @param {string[]} recipients   - Array of email addresses to send to
 * @param {string}   subject      - Email subject line
 * @param {string}   messageBody  - Email body (plain text)
 * @param {Buffer}   pdfBuffer    - The PDF file as a Node.js Buffer
 * @param {string}   fileName     - Original filename of the PDF
 * @returns {Promise<{ success: boolean, sent: number, failed: number, errors: string[] }>}
 */
async function sendReportEmail(
  recipients,
  subject,
  messageBody,
  pdfBuffer,
  fileName
) {
  const senderEmail = process.env.SENDER_EMAIL;
  const senderName = process.env.SENDER_NAME || "Report Sender";

  if (!senderEmail) {
    throw new Error(
      "SENDER_EMAIL is not configured in .env. Please set a verified sender email."
    );
  }

  if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY === "your_sendgrid_api_key_here") {
    throw new Error(
      "SENDGRID_API_KEY is not configured. Please add your SendGrid API key to .env"
    );
  }

  // Convert PDF buffer to base64 string for SendGrid attachment
  const pdfBase64 = pdfBuffer.toString("base64");

  // Read logo for inline attachment
  const logoPath = path.join(__dirname, "../../tirupati balaji logo.jpeg");
  let logoBase64 = "";
  if (fs.existsSync(logoPath)) {
    logoBase64 = fs.readFileSync(logoPath).toString("base64");
  }

  // Build individual messages for each recipient (for privacy)
  const messages = recipients.map((email) => {
    const attachments = [
      {
        content: pdfBase64,
        filename: fileName,
        type: "application/pdf",
        disposition: "attachment",
      },
    ];

    if (logoBase64) {
      attachments.push({
        content: logoBase64,
        filename: "logo.jpeg",
        type: "image/jpeg",
        disposition: "inline",
        content_id: "company_logo"
      });
    }

    return {
      to: email,
      from: {
        email: senderEmail,
        name: senderName,
      },
      subject: subject,
      text: messageBody,
      html: buildHtmlBody(messageBody, fileName),
      attachments: attachments,
    };
  });

  // Track results
  const results = { success: true, sent: 0, failed: 0, errors: [] };

  // Send emails one-by-one to handle individual failures gracefully
  for (const msg of messages) {
    try {
      await sgMail.send(msg);
      results.sent++;
      console.log(`✅ Email sent to: ${msg.to}`);
    } catch (error) {
      results.failed++;
      const errMsg = error.response?.body?.errors?.[0]?.message || error.message;
      results.errors.push(`Failed to send to ${msg.to}: ${errMsg}`);
      console.error(`❌ Failed to send to ${msg.to}:`, errMsg);
    }
  }

  // Mark as failure if ALL emails failed
  if (results.sent === 0) {
    results.success = false;
  }

  return results;
}

/**
 * Builds a clean HTML email body.
 * Wraps the plain text message in a styled HTML template.
 *
 * @param {string} message  - Plain text message from user
 * @param {string} fileName - Name of the attached PDF
 * @returns {string} HTML string
 */
function buildHtmlBody(message, fileName) {
  // Convert newlines to <br> for HTML display
  const htmlMessage = message.replace(/\n/g, "<br>");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0; padding:0; background-color:#f4f4f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px 40px; text-align: center;">
                  <!-- Company Logo -->
                  <img src="cid:company_logo" alt="Tirupati Balaji Construction Logo" style="max-height: 120px; margin-bottom: 16px; border-radius: 4px;">
                  <h1 style="margin:0; color:#ffffff; font-size:22px; font-weight:600;">Report Delivery</h1>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding: 32px 40px;">
                  <p style="margin:0 0 20px; color:#374151; font-size:15px; line-height:1.6;">
                    ${htmlMessage}
                  </p>
                  <!-- Attachment badge -->
                  <div style="background-color:#f8f7ff; border:1px solid #e0e7ff; border-radius:8px; padding:16px; display:flex; align-items:center;">
                    <span style="font-size:24px; margin-right:12px;">📎</span>
                    <div>
                      <p style="margin:0; color:#4338ca; font-size:14px; font-weight:600;">${fileName}</p>
                      <p style="margin:4px 0 0; color:#6b7280; font-size:12px;">PDF Attachment — see attached file</p>
                    </div>
                  </div>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding: 20px 40px; background-color:#f9fafb; border-top:1px solid #e5e7eb;">
                  <p style="margin:0; color:#9ca3af; font-size:12px; text-align:center;">
                    Sent via Report Sender • Auto-generated email
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

module.exports = { sendReportEmail };
