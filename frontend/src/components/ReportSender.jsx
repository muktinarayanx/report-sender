// ============================================
// ReportSender Component — Main Form
// ============================================
// The primary form that ties together:
//   - FileDropZone (PDF upload)
//   - EmailTagInput (recipient list)
//   - Subject & Message inputs
//   - Send button with loading state
//
// STATE FLOW:
//   file       → selected PDF (File object or null)
//   emails     → array of validated email strings
//   subject    → email subject text
//   message    → email body text
//   status     → "idle" | "sending" | "success" | "error"

import { useState, useCallback } from "react";
import FileDropZone from "./FileDropZone";
import EmailTagInput from "./EmailTagInput";
import Toast from "./Toast";
import { sendReport } from "../api/reportApi";

export default function ReportSender() {
  // ── Form State ──
  const [file, setFile] = useState(null);
  const [emails, setEmails] = useState([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // ── UI State ──
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [toast, setToast] = useState(null);      // { type, title, message }

  // ── Email Handlers ──
  const handleAddEmail = useCallback((email) => {
    setEmails((prev) => [...prev, email]);
  }, []);

  const handleRemoveEmail = useCallback((index) => {
    setEmails((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // ── Form Validation ──
  const isFormValid = file && emails.length > 0 && subject.trim().length > 0;

  // ── Submit Handler ──
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid || status === "sending") return;

    setStatus("sending");
    setToast(null);

    try {
      // Call the API
      const result = await sendReport({
        file,
        emails,
        subject: subject.trim(),
        message: message.trim() || "Please find the attached report.",
      });

      // Play "pop" sound
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } catch (e) {
        console.error("Audio error", e);
      }

      // Success! Show toast and reset form
      setStatus("success");
      setToast({
        type: "success",
        title: "Report Sent Successfully! 🎉",
        message: result.message || `Sent to ${result.sent} recipient(s).`,
      });

      // Reset form for next send
      setFile(null);
      setEmails([]);
      setSubject("");
      setMessage("");
    } catch (error) {
      // Error — show toast with server message
      setStatus("error");
      setToast({
        type: "error",
        title: "Failed to Send Report",
        message: error.message || "Something went wrong. Please try again.",
      });
    }

    // Reset status after a delay
    setTimeout(() => setStatus("idle"), 2000);
  };

  return (
    <>
      {/* Toast Notifications */}
      {toast && (
        <div className="toast-container">
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      <form className="main-card" onSubmit={handleSubmit} id="report-form">
        {/* ── Section 1: PDF Upload ── */}
        <div className="form-section">
          <label className="form-label">
            <span className="form-label__icon">📎</span>
            Attach Report
            <span className="form-label__required">*</span>
          </label>
          <FileDropZone
            file={file}
            onFileSelect={setFile}
            onFileRemove={() => setFile(null)}
          />
        </div>

        {/* ── Section 2: Recipients ── */}
        <div className="form-section">
          <label className="form-label">
            <span className="form-label__icon">👥</span>
            Recipients
            <span className="form-label__required">*</span>
          </label>
          <EmailTagInput
            emails={emails}
            onAdd={handleAddEmail}
            onRemove={handleRemoveEmail}
          />
        </div>

        {/* ── Section 3: Subject ── */}
        <div className="form-section">
          <label className="form-label" htmlFor="subject-input">
            <span className="form-label__icon">✉️</span>
            Subject
            <span className="form-label__required">*</span>
          </label>
          <input
            className="input"
            type="text"
            id="subject-input"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g., Monthly Sales Report — August 2026"
            maxLength={200}
          />
        </div>

        {/* ── Section 4: Message ── */}
        <div className="form-section">
          <label className="form-label" htmlFor="message-input">
            <span className="form-label__icon">💬</span>
            Message
            <span style={{ color: "var(--text-muted)", fontWeight: 400, fontSize: "var(--font-xs)" }}>
              (optional)
            </span>
          </label>
          <textarea
            className="textarea"
            id="message-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Hi team, please find the attached report for your review..."
            maxLength={2000}
            rows={4}
          />
        </div>

        {/* ── Send Button ── */}
        <button
          className="send-btn"
          type="submit"
          disabled={!isFormValid || status === "sending"}
          id="send-report-btn"
        >
          {status === "sending" ? (
            <>
              <span className="send-btn__spinner" />
              Sending Report...
            </>
          ) : (
            <>
              🚀 Send Report
              {emails.length > 0 && (
                <span style={{ opacity: 0.7, fontWeight: 400 }}>
                  to {emails.length} recipient{emails.length !== 1 ? "s" : ""}
                </span>
              )}
            </>
          )}
        </button>
      </form>
    </>
  );
}
