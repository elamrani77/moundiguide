import { useState, useEffect } from "react";
import { supabase } from "../supabase.js";
import { TRANSLATIONS, LANGUAGES, TEAM_DATA, TEAM_ISO, PLAYERS_IMG, F } from "../constants.js";
import logger from "../utils/logger.js";
import MoundiLogo from "../components/MoundiLogo.jsx";

const TEAM_ORDER = [
  "Morocco","Brazil","Argentina","France","England","Portugal","Spain",
  "Germany","Netherlands","Belgium","Croatia","Italy","USA","Mexico",
  "Japan","Senegal","Uruguay","Colombia","Switzerland","Iran",
];

function StepDot({ active }) {
  return (
    <div style={{
      width: 10, height: 10, borderRadius: "50%",
      background: active ? "#C41E3A" : "rgba(255,255,255,0.22)",
      transition: "background 0.3s",
    }}/>
  );
}

function getTeamCode(teamName) {
  const iso = TEAM_ISO[teamName];
  if (!iso) return "MA";
  return iso.startsWith("gb-") ? iso.slice(3, 5).toUpperCase() : iso.slice(0, 2).toUpperCase();
}

// Shared back button style
const backBtnStyle = {
  height: 52, borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(255,255,255,0.08)",
  color: "rgba(255,255,255,0.7)",
  fontFamily: F, fontSize: 14,
  cursor: "pointer", padding: "0 20px",
  flexShrink: 0, whiteSpace: "nowrap",
};

export default function SetupPage({ user, lang: initialLang, setLang, setUserTeam, onComplete }) {
  const [step, setStep] = useState(1);
  const [selectedLang, setSelectedLang] = useState(initialLang || "fr");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showRequired, setShowRequired] = useState(false);
  const [teamSearch, setTeamSearch] = useState("");
  const [hoveredTeamRow, setHoveredTeamRow] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const T = TRANSLATIONS[selectedLang] || TRANSLATIONS.fr;
  const isRTL = selectedLang === "ar";

  // Build ordered + filtered team list
  const allTeamNames = Object.keys(TEAM_DATA);
  const orderedTeamNames = [
    ...TEAM_ORDER.filter(n => allTeamNames.includes(n)),
    ...allTeamNames.filter(n => !TEAM_ORDER.includes(n)),
  ];
  const filteredTeams = orderedTeamNames.filter(name =>
    !teamSearch.trim() || name.toLowerCase().includes(teamSearch.trim().toLowerCase())
  );

  // Pre-fill existing profile data + smart step jump
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles")
      .select("first_name,last_name,favorite_team")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (!data) return;
        if (data.first_name) setFirstName(data.first_name);
        if (data.last_name) setLastName(data.last_name);
        if (data.favorite_team) setSelectedTeam(data.favorite_team);
        // If everything is already filled, complete immediately
        if (data.first_name && data.last_name && data.favorite_team) {
          localStorage.setItem("moundiguide_setup_done", "true");
          onComplete();
          return;
        }
        // Skip to team step if name is already filled
        if (data.first_name && data.last_name) setStep(3);
      })
      .catch(() => {}); // ignore errors — user proceeds normally
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-navigate after 3 s on confirmation screen
  useEffect(() => {
    if (!showConfirm) return;
    const t = setTimeout(onComplete, 3000);
    return () => clearTimeout(t);
  }, [showConfirm]); // eslint-disable-line react-hooks/exhaustive-deps

  async function complete() {
    setSaving(true);
    let done = false;

    function finalize() {
      if (done) return;
      done = true;
      if (selectedTeam) {
        const teamObj = { t: selectedTeam, f: TEAM_DATA[selectedTeam]?.flag || "" };
        localStorage.setItem("userTeam", JSON.stringify(teamObj));
        if (setUserTeam) setUserTeam(teamObj);
      }
      setLang(selectedLang);
      localStorage.setItem("lang", selectedLang);
      setSaving(false);
      setShowConfirm(true);
    }

    // 4-second timeout fallback — proceed even if Supabase hangs
    const saveTimeout = setTimeout(finalize, 4000);

    try {
      await supabase.from("profiles").upsert({
        id: user.id,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        favorite_team: selectedTeam || null,
      });
      clearTimeout(saveTimeout);
      logger.info("setup","Setup completed",{lang:selectedLang,team:selectedTeam,hasName:!!(firstName&&lastName)},user?.id);
    } catch (err) {
      clearTimeout(saveTimeout);
      console.error("Setup save error:", err);
    } finally {
      finalize();
    }
  }

  const inpStyle = (hasError) => ({
    width: "100%",
    background: "rgba(255,255,255,0.07)",
    border: `1px solid ${hasError ? "#C41E3A" : "rgba(255,255,255,0.15)"}`,
    borderRadius: 12,
    padding: "14px 16px",
    color: "#FFF",
    fontSize: 16,
    marginBottom: 12,
    fontFamily: "Outfit, sans-serif",
    outline: "none",
    direction: isRTL ? "rtl" : "ltr",
    boxSizing: "border-box",
  });

  // ── CONFIRMATION SCREEN ──
  if (showConfirm) {
    const teamD = TEAM_DATA[selectedTeam] || {};
    const imgSrc = selectedTeam
      ? (PLAYERS_IMG[getTeamCode(selectedTeam)] || "/players-default.png")
      : "/players-default.png";
    return (
      <div dir={isRTL ? "rtl" : "ltr"} style={{
        minHeight: "100vh", background: "#121414",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "32px 20px 48px", fontFamily: F, textAlign: "center",
      }}>
        <style>{`@keyframes setupProgressFill{from{width:0%}to{width:100%}}`}</style>
        <img src={imgSrc} alt={selectedTeam || ""}
          style={{
            width: "100%", maxWidth: 400, height: 220,
            objectFit: "cover", objectPosition: "center 10%",
            borderRadius: 20, marginBottom: 24, display: "block",
          }}
          onError={e => { e.target.onerror = null; e.target.src = "/players-default.png"; }}/>
        <div style={{ fontSize: 48, marginBottom: 12, lineHeight: 1 }}>{teamD.flag || "⚽"}</div>
        <div style={{ fontFamily: F, fontSize: 28, fontWeight: 800, color: "#FFF", marginBottom: 16 }}>
          {selectedTeam || ""}
        </div>
        <div style={{
          fontFamily: F, fontSize: 16, color: "rgba(255,255,255,0.85)",
          padding: "0 24px", marginBottom: 32, lineHeight: 1.6, maxWidth: 420,
        }}>
          {T.setupComplete || "Vous êtes prêt ! Bienvenue dans l'aventure Mondial 2030 🎉"}
        </div>
        <button onClick={()=>{logger.info("setup","Setup skipped",{},user?.id);onComplete();}} style={{
          background: "none", border: "none", cursor: "pointer",
          color: "rgba(255,255,255,0.4)", fontFamily: F, fontSize: 13,
          textDecoration: "underline",
        }}>
          Continuer maintenant →
        </button>
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 4, background: "rgba(255,255,255,0.1)" }}>
          <div style={{ height: "100%", background: "#C41E3A", borderRadius: 2, animation: "setupProgressFill 3s linear forwards" }}/>
        </div>
      </div>
    );
  }

  // ── STEP 1: Language ──
  if (step === 1) return (
    <div dir="ltr" style={{
      minHeight: "100vh", background: "#121414",
      display: "flex", flexDirection: "column",
      alignItems: "center", padding: "32px 20px 110px", fontFamily: F,
    }}>
      <div style={{ marginBottom: 28, marginTop: 8 }}>
        <MoundiLogo size={44} textColor="#FFF" showSubtitle={true} textSize={18}/>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
        <StepDot active={true}/><StepDot active={false}/><StepDot active={false}/>
      </div>
      <div style={{
        width: "100%", maxWidth: 500,
        background: "rgba(255,255,255,0.05)", backdropFilter: "blur(16px)",
        borderRadius: 24, border: "1px solid rgba(255,255,255,0.08)",
        padding: "32px 24px", boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
      }}>
        <div style={{ fontFamily: F, fontSize: 20, fontWeight: 800, color: "#FFF", textAlign: "center", marginBottom: 6 }}>
          Choisissez votre langue
        </div>
        <div style={{ fontFamily: F, fontSize: 13, color: "rgba(255,255,255,0.4)", textAlign: "center", marginBottom: 28 }}>
          Choose your language
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
          {LANGUAGES.map(l => {
            const active = selectedLang === l.code;
            return (
              <button key={l.code} onClick={() => setSelectedLang(l.code)}
                role="radio" aria-checked={active} aria-label={l.label}
                style={{
                  width: 140, height: 48, borderRadius: 24, border: "none", cursor: "pointer",
                  background: active ? "#C41E3A" : "rgba(255,255,255,0.08)",
                  color: "#FFF", fontFamily: F, fontSize: 14, fontWeight: active ? 700 : 400,
                  transition: "all .15s", display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 8,
                }}>
                <span>{l.flag}</span><span>{l.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      {/* Step 1: no back button */}
      <button onClick={() => setStep(2)} disabled={!selectedLang}
        style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          width: "calc(100% - 40px)", maxWidth: 460,
          height: 52, borderRadius: 14, border: "none",
          background: !selectedLang ? "#2a2a2a" : "linear-gradient(135deg,#C41E3A,#A01028)",
          color: !selectedLang ? "rgba(255,255,255,0.3)" : "#FFF",
          fontFamily: F, fontSize: 15, fontWeight: 700,
          cursor: !selectedLang ? "not-allowed" : "pointer",
          boxShadow: !selectedLang ? "none" : "0 4px 16px rgba(196,30,58,0.4)",
          transition: "all 0.2s", zIndex: 100,
        }}>
        Continuer →
      </button>
    </div>
  );

  // ── STEP 2: Name ──
  if (step === 2) {
    const firstEmpty = showRequired && !firstName.trim();
    const lastEmpty = showRequired && !lastName.trim();
    const canContinue = firstName.trim() && lastName.trim();
    return (
      <div dir={isRTL ? "rtl" : "ltr"} style={{
        minHeight: "100vh", background: "#121414",
        display: "flex", flexDirection: "column",
        alignItems: "center", padding: "32px 20px 0", fontFamily: F,
      }}>
        <div style={{ marginBottom: 28, marginTop: 8 }}>
          <MoundiLogo size={44} textColor="#FFF" showSubtitle={true} textSize={18}/>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          <StepDot active={false}/><StepDot active={true}/><StepDot active={false}/>
        </div>
        <div style={{
          width: "100%", maxWidth: 500,
          background: "rgba(255,255,255,0.05)", backdropFilter: "blur(16px)",
          borderRadius: 24, border: "1px solid rgba(255,255,255,0.08)",
          padding: "32px 24px", boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        }}>
          <div style={{ fontFamily: F, fontSize: 20, fontWeight: 800, color: "#FFF", textAlign: "center", marginBottom: 24 }}>
            {T.tellUsAboutYou || "Parlez-nous de vous"}
          </div>
          <input value={firstName} onChange={e => { setFirstName(e.target.value); setShowRequired(false); }}
            placeholder={T.firstName || "Prénom"} aria-label={T.firstName || "Prénom"} aria-required="true"
            style={inpStyle(firstEmpty)}/>
          <input value={lastName} onChange={e => { setLastName(e.target.value); setShowRequired(false); }}
            placeholder={T.lastName || "Nom de famille"} aria-label={T.lastName || "Nom de famille"} aria-required="true"
            style={inpStyle(lastEmpty)}/>
          {showRequired && (!firstName.trim() || !lastName.trim()) && (
            <div style={{ color: "#FF6B6B", fontSize: 13, marginTop: -4, marginBottom: 8, textAlign: isRTL ? "right" : "left" }}>
              {T.required || "Ce champ est obligatoire"}
            </div>
          )}
        </div>
        {/* Step 2 bottom bar: back + continue */}
        <div style={{
          width: "100%", maxWidth: 500, display: "flex", gap: 12,
          marginTop: 16, paddingBottom: 32,
        }}>
          <button onClick={() => setStep(1)} style={backBtnStyle}>
            {T.previous || "← Précédent"}
          </button>
          <button onClick={() => {
            if (!firstName.trim() || !lastName.trim()) { setShowRequired(true); return; }
            setStep(3);
          }}
            style={{
              flex: 1, height: 52, borderRadius: 12, border: "none",
              background: canContinue ? "linear-gradient(135deg,#C41E3A,#A01028)" : "#2a2a2a",
              color: canContinue ? "#FFF" : "rgba(255,255,255,0.3)",
              fontFamily: F, fontSize: 15, fontWeight: 700,
              cursor: "pointer",
              boxShadow: canContinue ? "0 4px 16px rgba(196,30,58,0.4)" : "none",
              transition: "all 0.2s",
            }}>
            Continuer →
          </button>
        </div>
      </div>
    );
  }

  // ── STEP 3: Team — fixed viewport height, internal scroll ──
  const teamSelected = !!selectedTeam;
  return (
    <div dir={isRTL ? "rtl" : "ltr"} style={{
      height: "100vh", overflow: "hidden",
      background: "#121414", display: "flex",
      flexDirection: "column", fontFamily: F,
    }}>
      {/* Header: logo + dots */}
      <div style={{
        padding: "20px 20px 0", flexShrink: 0,
        display: "flex", flexDirection: "column", alignItems: "center",
      }}>
        <MoundiLogo size={40} textColor="#FFF" showSubtitle={false} textSize={16}/>
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <StepDot active={false}/><StepDot active={false}/><StepDot active={true}/>
        </div>
      </div>

      {/* Content: title + search + scrollable list */}
      <div style={{
        flex: 1, overflow: "hidden",
        display: "flex", flexDirection: "column",
        maxWidth: 500, margin: "12px auto 0",
        width: "100%", padding: "0 16px",
      }}>
        {/* Fixed-height title + search */}
        <div style={{ flexShrink: 0, marginBottom: 8 }}>
          <div style={{ fontFamily: F, fontSize: 18, fontWeight: 800, color: "#FFF", textAlign: "center", marginBottom: 12 }}>
            {T.chooseFavoriteTeam || "Choisissez votre équipe favorite"}
          </div>
          <input
            value={teamSearch}
            onChange={e => setTeamSearch(e.target.value)}
            placeholder={T.searchTeam || "Rechercher une équipe..."}
            aria-label={T.searchTeam || "Rechercher une équipe"}
            style={{
              width: "100%", background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12, padding: "10px 16px",
              color: "#FFF", fontSize: 14,
              fontFamily: "Outfit, sans-serif", outline: "none",
              boxSizing: "border-box",
              direction: isRTL ? "rtl" : "ltr",
            }}
          />
        </div>

        {/* Team list — fills remaining space, scrolls internally */}
        <div role="listbox" aria-label={T.chooseFavoriteTeam || "Choisissez votre équipe favorite"}
          style={{
            flex: 1, overflowY: "auto",
            overscrollBehavior: "contain",
            padding: "4px 0",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.2) transparent",
          }}>
          {filteredTeams.map(name => {
            const isSelected = selectedTeam === name;
            const isHovered = hoveredTeamRow === name;
            const iso = (TEAM_ISO[name] || "ma").toLowerCase();
            return (
              <div key={name}
                role="option" aria-selected={isSelected} aria-label={name}
                onClick={() => setSelectedTeam(name)}
                onMouseEnter={() => setHoveredTeamRow(name)}
                onMouseLeave={() => setHoveredTeamRow(null)}
                style={{
                  height: 52,
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "0 16px", borderRadius: 12, cursor: "pointer",
                  border: `1px solid ${isSelected ? "#C41E3A" : "transparent"}`,
                  marginBottom: 6,
                  background: isSelected
                    ? "rgba(196,30,58,0.15)"
                    : isHovered ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
                  transition: "all 0.15s ease",
                }}>
                {/* FIX 3: use flagcdn img instead of emoji — works for England too */}
                <img
                  src={`https://flagcdn.com/48x36/${iso}.png`}
                  alt={name}
                  style={{ width: 28, height: 21, objectFit: "cover", borderRadius: 3, flexShrink: 0 }}
                  onError={e => { e.target.style.display = "none"; }}
                />
                <span style={{
                  fontFamily: F, fontSize: 15, fontWeight: 500,
                  color: "#FFF", flex: 1,
                  textAlign: isRTL ? "right" : "left",
                }}>
                  {name}
                </span>
                {isSelected && (
                  <span style={{ color: "#C41E3A", fontWeight: 700, fontSize: 18, flexShrink: 0 }}>✓</span>
                )}
              </div>
            );
          })}
          {filteredTeams.length === 0 && (
            <div style={{ textAlign: "center", padding: "24px 0", color: "rgba(255,255,255,0.3)", fontFamily: F, fontSize: 14 }}>
              —
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar: back + commencer */}
      <div style={{ padding: "12px 20px 20px", flexShrink: 0, background: "#121414" }}>
        <div style={{ maxWidth: 500, margin: "0 auto", display: "flex", gap: 12 }}>
          <button onClick={() => setStep(2)} style={backBtnStyle}>
            {T.previous || "← Précédent"}
          </button>
          <button onClick={complete} disabled={!teamSelected || saving}
            style={{
              flex: 1, height: 52, borderRadius: 12, border: "none",
              background: teamSelected ? "#C41E3A" : "rgba(255,255,255,0.08)",
              color: teamSelected ? "#FFF" : "rgba(255,255,255,0.4)",
              fontFamily: F, fontSize: 15, fontWeight: teamSelected ? 700 : 400,
              cursor: !teamSelected || saving ? "not-allowed" : "pointer",
              opacity: teamSelected ? 1 : 0.5,
              boxShadow: teamSelected ? "0 4px 16px rgba(196,30,58,0.4)" : "none",
              transition: "all 0.2s",
            }}>
            {saving ? "…" : teamSelected ? (T.letsGo || "→ Commencer") : (T.chooseTeam || "Choisissez une équipe")}
          </button>
        </div>
      </div>
    </div>
  );
}
