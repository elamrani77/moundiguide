import { Component } from "react";
import logger from "../utils/logger.js";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("MoundiGuide Error:", error, info);
    logger.error("crash", error.message, {
      stack: error.stack?.slice(0, 500),
      component: info.componentStack?.slice(0, 300),
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          background: "#121414",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Outfit', sans-serif",
          padding: "24px",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚽</div>
          <h1 style={{ color: "#C41E3A", fontSize: 24, fontWeight: 700, margin: "0 0 8px" }}>
            Oops !
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 16, margin: "0 0 24px", maxWidth: 400 }}>
            Une erreur inattendue s'est produite. Veuillez recharger la page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "#C41E3A",
              color: "white",
              border: "none",
              borderRadius: "12px",
              padding: "12px 28px",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            🔄 Recharger la page
          </button>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <pre style={{
              marginTop: 24,
              padding: 16,
              background: "rgba(255,255,255,0.05)",
              borderRadius: 8,
              color: "#E24B4A",
              fontSize: 11,
              textAlign: "left",
              maxWidth: "100%",
              overflow: "auto",
            }}>
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
