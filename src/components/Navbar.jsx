import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TRANSLATIONS, BR, F } from "../constants.js";
import { getLiveMatches, getNextMatch, getTeamIsoFromName } from "../services/wc2026Api.js";

function Navbar({
  page, setPage, scrolled, C, lang, setLang,
  curLang, showLang, setShowLang,
  isDesk, selectedTeam, onPickTeam, setShowTeamProfile, user, userAvatar,
}){
  const [menuOpen,     setMenuOpen    ] = useState(false);
  const [notifGranted, setNotifGranted] = useState(
    typeof Notification !== "undefined" && Notification.permission === "granted"
  );
  const [liveMatch,    setLiveMatch   ] = useState(null);
  const [nextMatch,    setNextMatch   ] = useState(null);
  const [countdown,    setCountdown   ] = useState("");

  // Poll WC 2026 live scores every 60 s; fall back to next match countdown
  useEffect(() => {
    // Clear stale data immediately so the pill doesn't flash the old team
    setNextMatch(null);
    setCountdown("");

    async function fetchLive() {
      try {
        const matches = await getLiveMatches();
        if (matches.length > 0) {
          const m = matches[0];
          setLiveMatch({
            home:        m.teams?.home?.name,
            away:        m.teams?.away?.name,
            homeScore:   m.goals?.home ?? 0,
            awayScore:   m.goals?.away ?? 0,
            minute:      m.fixture?.status?.elapsed || "?",
            homeFlagIso: getTeamIsoFromName(m.teams?.home?.name),
            awayFlagIso: getTeamIsoFromName(m.teams?.away?.name),
          });
          setNextMatch(null);
        } else {
          setLiveMatch(null);
          const teamName = selectedTeam?.t;
          const next = await getNextMatch(teamName);
          setNextMatch(next);
        }
      } catch {
        setLiveMatch(null);
      }
    }
    fetchLive();
    const interval = setInterval(fetchLive, 60000);
    return () => clearInterval(interval);
  }, [selectedTeam?.t]);

  // Tick countdown every second when a next match is known
  useEffect(() => {
    if (!nextMatch?.fixture?.date) return;
    function updateCountdown() {
      const diff = new Date(nextMatch.fixture.date) - new Date();
      if (diff <= 0) { setCountdown("EN COURS"); return; }
      const days    = Math.floor(diff / 86400000);
      const hours   = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000)  / 60000);
      const seconds = Math.floor((diff % 60000)    / 1000);
      if (days > 0)        setCountdown(`${days}j ${hours}h ${minutes}m`);
      else if (hours > 0)  setCountdown(`${hours}h ${minutes}m ${seconds}s`);
      else                 setCountdown(`${minutes}m ${seconds}s`);
    }
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [nextMatch]);


  async function handleNotifBell() {
    if (notifGranted) return;
    if (!("Notification" in window)) return;
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      setNotifGranted(true);
      localStorage.setItem("moundiNotif", "true");
      new Notification("MoundiGuide 🏆", {
        body: "Notifications activées ! Vous recevrez des alertes avant les matchs.",
        icon: "/logo.png", badge: "/logo.png",
      });
    }
  }

  const T = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const linkColor = "#374151";

  // ── Desktop NavLink ──────────────────────────────────────────────────────
  const NavLink = ({ id, label }) => {
    const active = page === id;
    return (
      <button
        onClick={() => { setPage(id); setMenuOpen(false); }}
        style={{
          background: "none", border: "none", cursor: "pointer",
          fontFamily: F, fontSize: 14, fontWeight: active ? 600 : 500,
          color: active ? "#C41E3A" : "#121414",
          padding: "8px 16px", position: "relative", transition: "color .2s",
        }}
      >
        {label}
        {active && (
          <div style={{
            position: "absolute", bottom: 0, left: 8, right: 8,
            height: 2, background: "#C41E3A", borderRadius: 2,
          }}/>
        )}
      </button>
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <motion.nav
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        background: "rgba(255,255,255,0.98)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        padding: "0 24px",
      }}
    >
      <div style={{
        maxWidth: 1280, margin: "0 auto",
        height: isDesk ? 64 : 52,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "relative",
      }}>

        {/* ── LEFT: Logo ─────────────────────────────────────────────────── */}
        <div onClick={() => setPage("home")} style={{ cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", gap: 10 }}>
          <img
            src="/logo.webp"
            alt="MoundiGuide"
            style={{ height: isDesk ? 52 : 32, width: isDesk ? 52 : 32, objectFit: "contain", flexShrink: 0 }}
            onError={e => { e.target.style.display = "none"; }}
          />
          <div style={{ lineHeight: 1 }}>
            <div style={{ fontFamily: F, fontWeight: 700, fontSize: isDesk ? 18 : 15, color: BR.red, letterSpacing: 0.3 }}>
              Moundi Guide
            </div>
            {isDesk && (
              <div style={{ fontFamily: F, fontSize: 8, color: "rgba(120,120,120,0.9)", letterSpacing: 2, textTransform: "uppercase", marginTop: 2, whiteSpace: "nowrap" }}>
                Unity · Community · Innovation
              </div>
            )}
          </div>
        </div>

        {/* ── CENTER: Nav links — absolutely centered (desktop only) ──────── */}
        {isDesk && (
          <div style={{
            position: "absolute", left: "50%", transform: "translateX(-50%)",
            display: "flex", alignItems: "center", gap: 4,
          }}>
            <NavLink id="home"     label={T.navHome}/>
            <NavLink id="ticket"   label={T.navTicket}/>
            <NavLink id="schedule" label={T.navSchedule}/>
            {/* Actualités */}
            <button
              onClick={() => { setPage("news"); setMenuOpen(false); }}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: F, fontSize: 14, fontWeight: page === "news" ? 600 : 500,
                color: page === "news" ? "#C41E3A" : "#121414",
                padding: "8px 16px", position: "relative", transition: "color .2s",
                display: "flex", alignItems: "center", gap: 5,
              }}
            >
              {T.navNews || "Actualités"}
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "#C41E3A",
                animation: "blink 1.4s ease-in-out infinite",
                flexShrink: 0,
              }}/>
              {page === "news" && (
                <div style={{
                  position: "absolute", bottom: 0, left: 8, right: 8,
                  height: 2, background: "#C41E3A", borderRadius: 2,
                }}/>
              )}
            </button>
            {/* Fiche Équipe */}
            <button
              onClick={() => selectedTeam ? setShowTeamProfile(true) : setPage("profile")}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: F, fontSize: 14, fontWeight: 500,
                color: "#121414",
                padding: "8px 16px", transition: "color .2s",
              }}
            >
              {T.teamSheet || "Fiche Équipe"}
            </button>
          </div>
        )}

        {/* ── RIGHT (desktop) or mobile controls ─────────────────────────── */}
        {isDesk ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>

            <style>{`
              @keyframes livePulse {
                0%,100%{ opacity:1; box-shadow:0 0 0 0 rgba(196,30,58,0.4); }
                50%    { opacity:0.7; box-shadow:0 0 0 4px rgba(196,30,58,0); }
              }
            `}</style>

            {/* ── Live match pill ── */}
            {liveMatch && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "linear-gradient(135deg,rgba(196,30,58,0.12),rgba(139,0,0,0.08))",
                border: "1px solid rgba(196,30,58,0.3)",
                borderRadius: 24, padding: "6px 14px",
                backdropFilter: "blur(8px)",
                boxShadow: "0 2px 12px rgba(196,30,58,0.15)",
                flexShrink: 0,
              }}>
                <div style={{
                  background: "#C41E3A", color: "white",
                  fontSize: 9, fontWeight: 800, letterSpacing: 1.2,
                  padding: "2px 7px", borderRadius: 20,
                  textTransform: "uppercase",
                  animation: "livePulse 1.5s ease-in-out infinite",
                  flexShrink: 0,
                }}>LIVE</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <img src={`https://flagcdn.com/24x18/${liveMatch.homeFlagIso}.png`}
                    alt={liveMatch.home || ""}
                    style={{ width: 20, height: 15, objectFit: "cover", borderRadius: 3 }}
                    onError={e => { e.target.style.display = "none"; }}/>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#121414", fontFamily: F,
                    maxWidth: 60, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {liveMatch.home?.split(" ").slice(-1)[0]}
                  </span>
                </div>
                <div style={{
                  background: "#121414", color: "white",
                  fontSize: 13, fontWeight: 800, fontFamily: F,
                  padding: "2px 10px", borderRadius: 10,
                  letterSpacing: 1, minWidth: 44, textAlign: "center",
                }}>
                  {liveMatch.homeScore} - {liveMatch.awayScore}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#121414", fontFamily: F,
                    maxWidth: 60, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {liveMatch.away?.split(" ").slice(-1)[0]}
                  </span>
                  <img src={`https://flagcdn.com/24x18/${liveMatch.awayFlagIso}.png`}
                    alt={liveMatch.away || ""}
                    style={{ width: 20, height: 15, objectFit: "cover", borderRadius: 3 }}
                    onError={e => { e.target.style.display = "none"; }}/>
                </div>
                <span style={{ fontSize: 11, color: "rgba(196,30,58,0.8)", fontWeight: 700, fontFamily: F }}>
                  {liveMatch.minute}'
                </span>
              </div>
            )}

            {/* ── Next match countdown pill ── */}
            {nextMatch && countdown && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "rgba(0,0,0,0.04)",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 24, padding: "6px 14px",
                backdropFilter: "blur(8px)",
                flexShrink: 0,
              }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <img
                    src={`https://flagcdn.com/48x36/${getTeamIsoFromName(nextMatch.teams?.home?.name)}.png`}
                    alt={nextMatch.teams?.home?.name || ""}
                    style={{ width: 24, height: 18, objectFit: "cover", borderRadius: 3,
                      boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}
                    onError={e => { e.target.style.display = "none"; }}
                  />
                  <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(0,0,0,0.5)", fontFamily: F,
                    maxWidth: 36, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {nextMatch.teams?.home?.name?.split(" ").slice(-1)[0]}
                  </span>
                </div>
                <span style={{ fontSize: 10, fontWeight: 800, color: "rgba(0,0,0,0.25)", fontFamily: F }}>
                  vs
                </span>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <img
                    src={`https://flagcdn.com/48x36/${getTeamIsoFromName(nextMatch.teams?.away?.name)}.png`}
                    alt={nextMatch.teams?.away?.name || ""}
                    style={{ width: 24, height: 18, objectFit: "cover", borderRadius: 3,
                      boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}
                    onError={e => { e.target.style.display = "none"; }}
                  />
                  <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(0,0,0,0.5)", fontFamily: F,
                    maxWidth: 36, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {nextMatch.teams?.away?.name?.split(" ").slice(-1)[0]}
                  </span>
                </div>
                <div style={{ width: 1, height: 28, background: "rgba(0,0,0,0.08)" }}/>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#C41E3A", fontFamily: F,
                    letterSpacing: 0.5, minWidth: 64, textAlign: "center" }}>
                    ⏱ {countdown}
                  </span>
                  <span style={{ fontSize: 8, color: "rgba(0,0,0,0.35)", fontFamily: F, letterSpacing: 0.5 }}>
                    PROCHAIN
                  </span>
                </div>
              </div>
            )}

            {/* Profile avatar */}
            <button
              onClick={() => setPage(user ? "profile" : "login")}
              aria-label={user ? "Mon profil" : "Se connecter"}
              style={{
                width: 40, height: 40, borderRadius: "50%",
                background: userAvatar ? "transparent" : user ? "#C41E3A" : "rgba(0,0,0,0.07)",
                border: userAvatar ? "none" : user ? "none" : "1.5px solid #E5E7EB",
                cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center",
                color: user ? "#FFF" : linkColor,
                fontSize: user ? 14 : 18, fontWeight: 700,
                flexShrink: 0, transition: "all .2s",
                overflow: "hidden", padding: 0,
              }}
            >
              {userAvatar ? (
                <img
                  src={`${userAvatar}?t=${Date.now()}`}
                  alt="avatar"
                  style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", display: "block" }}
                  onError={e => { e.target.style.display = "none"; }}
                />
              ) : (
                user ? (user.email?.[0]?.toUpperCase() || "U") : "👤"
              )}
            </button>
          </div>

        ) : (

          /* Mobile right controls — logo + hamburger only */
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(p => !p)}
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              style={{
                background: "none",
                border: "1px solid #E5E7EB",
                borderRadius: 8, width: 36, height: 36, cursor: "pointer",
                color: linkColor, fontSize: 18,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        )}
      </div>

      {/* ── Mobile dropdown menu ─────────────────────────────────────────── */}
      {!isDesk && menuOpen && (
        <div style={{
          background: "rgba(255,255,255,0.99)",
          borderTop: "1px solid #E5E7EB",
          padding: "12px 16px 20px",
          animation: "slideDown .2s ease",
        }}>

          {/* ── Profile row (top) ── */}
          <button
            onClick={() => { setPage(user ? "profile" : "login"); setMenuOpen(false); }}
            style={{
              display: "flex", alignItems: "center", gap: 12, width: "100%",
              padding: "10px 12px", borderRadius: 10,
              background: "#F9FAFB", border: "1px solid #E5E7EB",
              cursor: "pointer", textAlign: "left", marginBottom: 4,
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
              background: userAvatar ? "transparent" : user ? "#C41E3A" : "rgba(0,0,0,0.07)",
              border: userAvatar ? "none" : user ? "none" : "1.5px solid #E5E7EB",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: user ? "#FFF" : linkColor, fontSize: user ? 15 : 18, fontWeight: 700,
              overflow: "hidden",
            }}>
              {userAvatar ? (
                <img
                  src={`${userAvatar}?t=${Date.now()}`}
                  alt="avatar"
                  style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", display: "block" }}
                  onError={e => { e.target.style.display = "none"; }}
                />
              ) : (
                user ? (user.email?.[0]?.toUpperCase() || "U") : "👤"
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: F, fontSize: 13, fontWeight: 600, color: "#111827",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {user ? user.email : (T.login || "Se connecter")}
              </div>
              {user && (
                <div style={{ fontFamily: F, fontSize: 11, color: "#6B7280" }}>
                  {T.myProfile || "Mon profil"}
                </div>
              )}
            </div>
            <span style={{ color: "#9CA3AF", fontSize: 14, flexShrink: 0 }}>→</span>
          </button>

          {/* Divider */}
          <div style={{ height: 1, background: "#E5E7EB", margin: "10px 0" }}/>

          {/* ── Nav links ── */}
          {[
            { id: "home",     icon: "🏠", label: T.mobileHome },
            { id: "ticket",   icon: "🎟️", label: T.mobileTick },
            { id: "schedule", icon: "📅", label: T.mobileSch  },
            { id: "news",     icon: "📰", label: T.navNews || "Actualités" },
            { id: "teamsheet",icon: "📋", label: T.teamSheet || "Fiche Équipe", teamsheet: true },
          ].map(({ id, icon, label, teamsheet }) => {
            const active = !teamsheet && page === id;
            return (
              <button
                key={id}
                onClick={() => {
                  if (teamsheet) {
                    setMenuOpen(false);
                    if (selectedTeam) setShowTeamProfile(true);
                    else setPage("profile");
                  } else {
                    setPage(id); setMenuOpen(false);
                  }
                }}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  width: "100%", textAlign: "left",
                  background: active ? `${BR.red}11` : "none",
                  border: "none", padding: "12px 14px", borderRadius: 10,
                  cursor: "pointer", fontFamily: F, fontSize: 15,
                  fontWeight: active ? 600 : 400,
                  color: active ? BR.red : linkColor,
                  marginBottom: 2, transition: "all .15s",
                }}
              >
                {teamsheet && <span style={{ fontSize: 16 }}>📋</span>}
                <span>{label}</span>
              </button>
            );
          })}

        </div>
      )}
    </motion.nav>
  );
}

export default React.memo(Navbar);
