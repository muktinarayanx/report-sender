// ============================================
// API Client — Report Sending
// ============================================
// Handles the HTTP request to the backend.
// Uses native fetch (no extra dependencies).

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

/**
 * Sends a report (PDF) to multiple recipients.
 *
 * HOW IT WORKS:
 * 1. Creates a FormData object (required for file uploads)
 * 2. Appends the PDF file, email list, subject, and message
 * 3. Sends a POST request to the backend
 * 4. Returns the parsed JSON response
 *
 * @param {Object} params
 * @param {File}     params.file     - The PDF file to attach
 * @param {string[]} params.emails   - Array of recipient email addresses
 * @param {string}   params.subject  - Email subject line
 * @param {string}   params.message  - Email body message
 * @returns {Promise<Object>} Backend response
 */
export async function sendReport({ file, emails, subject, message }) {
  // Build FormData — this is what allows us to send files via HTTP
  const formData = new FormData();
  formData.append("pdf", file);                    // The PDF file
  formData.append("emails", emails.join(","));     // Comma-separated emails
  formData.append("subject", subject);
  formData.append("message", message);

  // Send to backend
  // NOTE: Don't set Content-Type header — browser sets it automatically
  // with the correct multipart boundary when using FormData
  const response = await fetch(`${API_BASE}/send-report`, {
    method: "POST",
    body: formData,
  });

  // Parse response
  const data = await response.json();

  // If HTTP error, throw with server's error message
  if (!response.ok) {
    throw new Error(data.error || `Server error: ${response.status}`);
  }

  return data;
}
