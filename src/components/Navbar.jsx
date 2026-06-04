import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TRANSLATIONS, BR, F } from "../constants.js";
import MoundiLogo from "./MoundiLogo.jsx";
import { getLiveMatches, getTeamIsoFromName } from "../services/wc2026Api.js";

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

  // Poll WC 2026 live scores every 60 s
  useEffect(() => {
    async function fetchLive() {
      try {
        const matches = await getLiveMatches();
        if (matches.length > 0) {
          const m = matches[0];
          setLiveMatch({
            home:         m.teams?.home?.name,
            away:         m.teams?.away?.name,
            homeScore:    m.goals?.home ?? 0,
            awayScore:    m.goals?.away ?? 0,
            minute:       m.fixture?.status?.elapsed || "?",
            homeFlagIso:  getTeamIsoFromName(m.teams?.home?.name),
            awayFlagIso:  getTeamIsoFromName(m.teams?.away?.name),
          });
        } else {
          setLiveMatch(null);
        }
      } catch {
        setLiveMatch(null);
      }
    }
    fetchLive();
    const interval = setInterval(fetchLive, 60000);
    return () => clearInterval(interval);
  }, []);


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
        <div onClick={() => setPage("home")} style={{ cursor: "pointer", flexShrink: 0 }}>
          <MoundiLogo
            size={isDesk ? 52 : 32}
            textColor={BR.red}
            showSubtitle={isDesk}
            textSize={isDesk ? 18 : 15}
          />
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

      {/* ── WC 2026 live score strip ────────────────────────────────────── */}
      {liveMatch && (
        <div style={{
          background: "rgba(196,30,58,0.92)", backdropFilter: "blur(8px)",
          padding: "4px 24px",
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 10, fontSize: 12, fontFamily: F, color: "white",
          direction: "ltr",
        }}>
          <span style={{
            background: "rgba(255,255,255,0.2)", borderRadius: 4,
            padding: "1px 6px", fontSize: 9, fontWeight: 800, letterSpacing: 1.5,
          }}>🔴 LIVE</span>
          <img
            src={`https://flagcdn.com/16x12/${liveMatch.homeFlagIso}.png`}
            alt={liveMatch.home}
            style={{ height: 10, borderRadius: 2 }}
            onError={e => { e.target.style.display = "none"; }}
          />
          <span style={{ fontWeight: 600 }}>{liveMatch.home}</span>
          <span style={{ fontWeight: 800, fontSize: 14, margin: "0 2px" }}>
            {liveMatch.homeScore}&nbsp;–&nbsp;{liveMatch.awayScore}
          </span>
          <img
            src={`https://flagcdn.com/16x12/${liveMatch.awayFlagIso}.png`}
            alt={liveMatch.away}
            style={{ height: 10, borderRadius: 2 }}
            onError={e => { e.target.style.display = "none"; }}
          />
          <span style={{ fontWeight: 600 }}>{liveMatch.away}</span>
          <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 10 }}>{liveMatch.minute}'</span>
        </div>
      )}

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
            { id: "teamsheet",icon: "📋", label: T.teamSheet || "Fiche Équipe", teamsheet: true },
            { id: "schedule", icon: "📅", label: T.mobileSch  },
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
