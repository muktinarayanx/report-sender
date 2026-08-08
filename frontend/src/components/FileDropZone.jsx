// ============================================
// FileDropZone Component — PDF Upload Area
// ============================================
// A drag-and-drop zone that also supports click-to-browse.
// Shows file preview after selection with remove option.

import { useState, useRef } from "react";

/**
 * HOW IT WORKS:
 * 1. User drags a PDF over the zone → zone highlights (active state)
 * 2. User drops the file → validated & stored via onFileSelect callback
 * 3. OR user clicks the zone → native file picker opens
 * 4. Once a file is selected, a preview shows (name + size + remove button)
 *
 * @param {Object}   props
 * @param {File|null} props.file          - Currently selected file
 * @param {Function}  props.onFileSelect  - Called with File when selected
 * @param {Function}  props.onFileRemove  - Called when file is removed
 */
export default function FileDropZone({ file, onFileSelect, onFileRemove }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  // Validate and accept a file
  const handleFile = (selectedFile) => {
    setError("");

    // Check file type
    if (selectedFile.type !== "application/pdf") {
      setError("Only PDF files are accepted. Please select a .pdf file.");
      return;
    }

    // Check file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError(
        `File is too large (${(selectedFile.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 10MB.`
      );
      return;
    }

    onFileSelect(selectedFile);
  };

  // ── Drag Events ──

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  // ── Click to Browse ──

  const handleClick = () => {
    if (!file) {
      inputRef.current?.click();
    }
  };

  const handleInputChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  // ── Remove File ──

  const handleRemove = (e) => {
    e.stopPropagation(); // Don't trigger zone click
    setError("");
    onFileRemove();
  };

  // Format file size to human readable
  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Build CSS classes
  const zoneClasses = [
    "dropzone",
    isDragActive && "dropzone--active",
    file && "dropzone--has-file",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div>
      <div
        className={zoneClasses}
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-label="Upload PDF file"
        id="file-dropzone"
      >
        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleInputChange}
          style={{ display: "none" }}
          id="pdf-file-input"
        />

        {file ? (
          /* ── File Preview ── */
          <div className="file-preview">
            <span className="file-preview__icon">📄</span>
            <div className="file-preview__info">
              <div className="file-preview__name">{file.name}</div>
              <div className="file-preview__size">{formatSize(file.size)}</div>
            </div>
            <button
              className="file-preview__remove"
              onClick={handleRemove}
              aria-label="Remove file"
              id="remove-file-btn"
            >
              Remove
            </button>
          </div>
        ) : (
          /* ── Empty State ── */
          <>
            <span className="dropzone__icon">
              {isDragActive ? "📥" : "📤"}
            </span>
            <div className="dropzone__text">
              {isDragActive ? (
                <strong>Drop your PDF here</strong>
              ) : (
                <>
                  <strong>Drag & drop</strong> your PDF here, or{" "}
                  <strong>click to browse</strong>
                </>
              )}
            </div>
            <div className="dropzone__hint">PDF only • Max 10MB</div>
          </>
        )}
      </div>

      {/* Error message */}
      {error && <div className="email-input-error">{error}</div>}
    </div>
  );
}
