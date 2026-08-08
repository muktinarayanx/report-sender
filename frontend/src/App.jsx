// ============================================
// App Component — Root Layout
// ============================================
// Renders the header, main form, and footer.
// This is the top-level component rendered by main.jsx.

import ReportSender from "./components/ReportSender";

export default function App() {
  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="header">
        <div className="header__badge">
          <span className="header__badge-dot" />
          Secure & Fast Delivery
        </div>
        <h1 className="header__title">Report Sender</h1>
        <p className="header__subtitle">
          Upload your PDF report and deliver it to multiple recipients instantly
        </p>
      </header>

      {/* ── Main Form ── */}
      <main>
        <ReportSender />
      </main>

      {/* ── Footer ── */}
      <footer className="footer">
        <p>
          Built with React & SendGrid • Emails are sent securely via encrypted API
        </p>
      </footer>
    </div>
  );
}
