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

          {/* ── SECTION 1: Animated referee SVG ── */}
          <svg viewBox="0 0 200 280" width="200" height="280" style={{ overflow: "visible" }}>
            <style>{`
              @keyframes cardWave {
                0%   { transform: rotate(-5deg); }
                25%  { transform: rotate(8deg); }
                50%  { transform: rotate(-5deg); }
                75%  { transform: rotate(8deg); }
                100% { transform: rotate(-5deg); }
              }
              #arm-right {
                transform-origin: 120px 75px;
                animation: cardWave 1.2s ease-in-out infinite;
              }
              @keyframes cardPulse {
                0%   { opacity: 1; filter: drop-shadow(0 0 4px #F5A623); }
                50%  { opacity: 0.7; filter: drop-shadow(0 0 12px #F5A623); }
                100% { opacity: 1; filter: drop-shadow(0 0 4px #F5A623); }
              }
              #yellow-card {
                animation: cardPulse 1s ease-in-out infinite;
              }
              @keyframes bodyBounce {
                0%   { transform: translateY(0); }
                50%  { transform: translateY(-4px); }
                100% { transform: translateY(0); }
              }
              .referee-svg {
                animation: bodyBounce 1.5s ease-in-out infinite;
              }
            `}</style>

            <g className="referee-svg">
              {/* Head */}
              <circle cx="100" cy="40" r="20" fill="none" stroke="white" strokeWidth="2.5"/>
              {/* Eyes */}
              <circle cx="93" cy="36" r="2" fill="white"/>
              <circle cx="107" cy="36" r="2" fill="white"/>
              {/* Smile */}
              <path d="M94 45 Q100 50 106 45" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>

              {/* Body spine */}
              <line x1="100" y1="60" x2="100" y2="150" stroke="white" strokeWidth="2.5"/>

              {/* Referee shirt */}
              <rect x="80" y="65" width="40" height="55" rx="4"
                fill="#1a1a1a" stroke="#F5A623" strokeWidth="2"/>
              {/* Shirt stripes */}
              <line x1="88" y1="65" x2="88" y2="120" stroke="#F5A623" strokeWidth="1.5" opacity="0.5"/>
              <line x1="112" y1="65" x2="112" y2="120" stroke="#F5A623" strokeWidth="1.5" opacity="0.5"/>

              {/* Left arm — down at side */}
              <line x1="80" y1="75" x2="55" y2="115" stroke="white" strokeWidth="2.5"/>
              <line x1="55" y1="115" x2="50" y2="130" stroke="white" strokeWidth="2.5"/>

              {/* Right arm — raised, holding card */}
              <g id="arm-right">
                <line x1="120" y1="75" x2="155" y2="45" stroke="white" strokeWidth="2.5"/>
                {/* Fist */}
                <circle cx="157" cy="43" r="6" fill="white"/>
                {/* Yellow card */}
                <rect id="yellow-card" x="152" y="10" width="22" height="30" rx="3"
                  fill="#F5A623" stroke="#E09000" strokeWidth="1.5"/>
              </g>

              {/* Left leg */}
              <line x1="95" y1="150" x2="75" y2="210" stroke="white" strokeWidth="2.5"/>
              <line x1="75" y1="210" x2="65" y2="240" stroke="white" strokeWidth="2.5"/>
              {/* Left shoe */}
              <ellipse cx="60" cy="242" rx="12" ry="5" fill="#333"/>

              {/* Right leg */}
              <line x1="105" y1="150" x2="130" y2="205" stroke="white" strokeWidth="2.5"/>
              <line x1="130" y1="205" x2="140" y2="238" stroke="white" strokeWidth="2.5"/>
              {/* Right shoe */}
              <ellipse cx="145" cy="240" rx="12" ry="5" fill="#333"/>

              {/* Whistle cord */}
              <path d="M100 55 Q90 62 88 72" fill="none" stroke="rgba(255,255,255,0.4)"
                strokeWidth="1.2" strokeLinecap="round"/>
            </g>
          </svg>

          {/* ── SECTION 2: Yellow card badge ── */}
          <div style={{
            background: "#F5A623",
            color: "#121414",
            borderRadius: 8,
            padding: "6px 20px",
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 16,
            boxShadow: "0 4px 16px rgba(245,166,35,0.5)",
          }}>
            CARTON JAUNE
          </div>

          {/* ── SECTION 3: Commentary box ── */}
          <div style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(245,166,35,0.3)",
            borderRadius: 16,
            padding: "20px 28px",
            maxWidth: 420,
            textAlign: "center",
            margin: "0 16px",
          }}>
            <div style={{
              color: "rgba(245,166,35,0.8)",
              fontSize: 11,
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 8,
            }}>
              🎙️ Commentaire
            </div>

            <div style={{
              background: "rgba(255,255,255,0.06)",
              borderRadius: 8,
              padding: "8px 12px",
              marginBottom: 16,
            }}>
              <span style={{
                color: "white",
                fontSize: 15,
                fontWeight: 500,
                fontFamily: "monospace",
              }}>
                {this.state.error?.message || "Erreur inconnue"}
              </span>
            </div>

            <p style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 13,
              lineHeight: 1.6,
              margin: 0,
            }}>
              L'arbitre a sifflé une faute technique. Rechargez pour reprendre le jeu.
            </p>
          </div>

          {/* ── SECTION 4: Reload button ── */}
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "linear-gradient(135deg, #F5A623, #E09000)",
              color: "#121414",
              border: "none",
              borderRadius: 12,
              padding: "13px 32px",
              fontSize: 15,
              fontWeight: 800,
              cursor: "pointer",
              marginTop: 24,
              boxShadow: "0 4px 20px rgba(245,166,35,0.4)",
            }}
          >
            🔄 Reprendre le jeu
          </button>

          {/* Dev-only stack trace */}
          {process.env.NODE_ENV === "development" && this.state.error?.stack && (
            <pre style={{
              marginTop: 16,
              fontSize: 10,
              color: "rgba(255,255,255,0.25)",
              fontFamily: "monospace",
              textAlign: "left",
              maxWidth: 420,
              overflowX: "auto",
            }}>
              {this.state.error.stack.slice(0, 400)}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
