// ============================================
// Toast Component — Notification Popups
// ============================================
// Shows success/error messages that auto-dismiss
// after 5 seconds with a progress bar animation.

import { useState, useEffect } from "react";

/**
 * Toast notification component.
 *
 * @param {Object}   props
 * @param {string}   props.type     - "success" or "error"
 * @param {string}   props.title    - Bold title text
 * @param {string}   props.message  - Description text
 * @param {Function} props.onClose  - Called when toast is dismissed
 */
export default function Toast({ type, title, message, onClose }) {
  const [exiting, setExiting] = useState(false);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      // Wait for exit animation to complete before removing
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  // Manual close with animation
  const handleClose = () => {
    setExiting(true);
    setTimeout(onClose, 300);
  };

  const icon = type === "success" ? "✅" : "❌";

  return (
    <div className={`toast toast--${type} ${exiting ? "toast--exiting" : ""}`}>
      <span className="toast__icon">{icon}</span>
      <div className="toast__content">
        <div className="toast__title">{title}</div>
        {message && <div className="toast__message">{message}</div>}
      </div>
      <button className="toast__close" onClick={handleClose} aria-label="Close notification">
        ✕
      </button>
      <div className="toast__progress" />
    </div>
  );
}
