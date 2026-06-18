import { Component, type ErrorInfo, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null; errorInfo: ErrorInfo | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
    this.setState({ errorInfo });
    if (typeof window !== "undefined" && (window as any).gtag) {
      try {
        (window as any).gtag("event", "exception", {
          description: error.message,
          fatal: true,
        });
      } catch {}
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((k) => {
        if (k.startsWith("quran-")) localStorage.removeItem(k);
      });
    } catch (e) {
      console.error("Failed to clear localStorage", e);
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "2rem",
            fontFamily: "system-ui",
            textAlign: "center",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
          }}
          role="alert"
        >
          <h1 style={{ fontSize: "1.5rem", color: "#dc2626" }}>
            ⚠️ Terjadi Kesalahan
          </h1>
          <p style={{ color: "#64748b", maxWidth: "500px" }}>
            Aplikasi mengalami error. Silakan refresh halaman atau reset data aplikasi.
          </p>
          <details
            style={{
              marginTop: "1rem",
              padding: "1rem",
              background: "#f1f5f9",
              borderRadius: "0.5rem",
              maxWidth: "600px",
              textAlign: "left",
              fontSize: "0.85rem",
            }}
          >
            <summary style={{ cursor: "pointer", fontWeight: 600 }}>
              Detail Error
            </summary>
            <pre
              style={{
                marginTop: "0.5rem",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {this.state.error?.toString()}
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
            <button onClick={this.handleReload} style={{ padding: "0.5rem 1.5rem", background: "#047857", color: "white", border: "none", borderRadius: "9999px", cursor: "pointer", fontWeight: 600 }}>
              Refresh Halaman
            </button>
            <button onClick={this.handleReset} style={{ padding: "0.5rem 1.5rem", background: "transparent", color: "#dc2626", border: "1px solid #dc2626", borderRadius: "9999px", cursor: "pointer", fontWeight: 600 }}>
              Reset & Refresh
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);