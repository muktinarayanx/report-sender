// ============================================
// EmailTagInput Component — Multi-Email Input
// ============================================
// Type an email → press Enter or comma → it becomes a tag chip.
// Click × on a chip to remove it. Validates format on add.

import { useState, useRef } from "react";

/**
 * HOW IT WORKS:
 * 1. User types an email address in the input field
 * 2. Presses Enter, comma, Tab, or Space → email is validated
 * 3. If valid → added as a styled tag chip; input clears
 * 4. If invalid → error message shown below the input
 * 5. Each chip has an × button to remove it
 * 6. Clicking anywhere in the container focuses the input
 *
 * @param {Object}   props
 * @param {string[]} props.emails     - Current list of emails
 * @param {Function} props.onAdd      - Called with email string to add
 * @param {Function} props.onRemove   - Called with index to remove
 */
export default function EmailTagInput({ emails, onAdd, onRemove }) {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  // Email validation regex
  const isValidEmail = (email) => {
    return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(
      email
    );
  };

  // Try to add the current input value as an email
  const addEmail = (value) => {
    const email = value.trim().toLowerCase();
    setError("");

    if (!email) return;

    // Check for valid format
    if (!isValidEmail(email)) {
      setError(`"${email}" is not a valid email address`);
      return;
    }

    // Check for duplicates
    if (emails.includes(email)) {
      setError(`"${email}" is already added`);
      return;
    }

    // Check max limit
    if (emails.length >= 20) {
      setError("Maximum 20 recipients allowed");
      return;
    }

    onAdd(email);
    setInputValue("");
  };

  // Handle key presses in the input
  const handleKeyDown = (e) => {
    // Enter, comma, or Tab → add the email
    if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
      e.preventDefault();
      addEmail(inputValue);
    }

    // Backspace on empty input → remove last email
    if (e.key === "Backspace" && inputValue === "" && emails.length > 0) {
      onRemove(emails.length - 1);
    }
  };

  // Handle input changes — also check for commas pasted inline
  const handleChange = (e) => {
    const val = e.target.value;

    // If user types/pastes a comma, split and add
    if (val.includes(",")) {
      const parts = val.split(",");
      // Add all complete parts (before last comma)
      parts.slice(0, -1).forEach((part) => addEmail(part));
      // Keep the last part as current input
      setInputValue(parts[parts.length - 1]);
    } else {
      setInputValue(val);
      setError("");
    }
  };

  // Handle paste — support pasting multiple emails
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");

    // Split by commas, semicolons, newlines, or spaces
    const pastedEmails = pasted
      .split(/[,;\n\s]+/)
      .filter((s) => s.trim().length > 0);

    if (pastedEmails.length > 1) {
      // Multiple emails pasted — add all valid ones
      pastedEmails.forEach((email) => addEmail(email));
    } else {
      // Single value pasted — put it in the input
      setInputValue(pasted.trim());
    }
  };

  // Click container → focus input
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div>
      <div
        className="email-input-container"
        onClick={handleContainerClick}
        id="email-tag-container"
      >
        {/* Rendered email tags */}
        {emails.map((email, index) => (
          <span className="email-tag" key={email}>
            {email}
            <button
              className="email-tag__remove"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(index);
              }}
              aria-label={`Remove ${email}`}
            >
              ✕
            </button>
          </span>
        ))}

        {/* Input field */}
        <input
          ref={inputRef}
          className="email-input-field"
          type="email"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={() => {
            // Add email when user clicks away (if there's text)
            if (inputValue.trim()) {
              addEmail(inputValue);
            }
          }}
          placeholder={
            emails.length === 0
              ? "Type email and press Enter..."
              : "Add another..."
          }
          id="email-input-field"
        />
      </div>

      {/* Hint or Error */}
      {error ? (
        <div className="email-input-error">{error}</div>
      ) : (
        <div className="email-input-hint">
          Press Enter, comma, or Tab to add • Paste multiple emails at once
        </div>
      )}
    </div>
  );
}
