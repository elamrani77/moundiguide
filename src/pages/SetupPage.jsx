import { useState, useEffect } from "react";
import {
  LANGUAGES, TRANSLATIONS, TEAM_DATA, TEAM_ISO, PLAYERS_IMG, F,
} from "../constants.js";
import { supabase } from "../supabase.js";
import logger from "../utils/logger.js";

const TEAM_ORDER = [
  "Morocco","Brazil","Argentina","France","England","Portugal","Spain",
  "Germany","Netherlands","Belgium","Croatia","Italy","USA","Mexico",
  "Japan","Senegal","Canada","Australia","South Korea","Saudi Arabia",
  "Qatar","Tunisia","Ghana","Ecuador","Uruguay","Colombia",
];

const KEYFRAMES = `
  @keyframes setupProgress { from { width: 0; } to { width: 100%; } }
  @keyframes bellSwing {
    0%,100% { transform: rotate(0deg); }
    15%  { transform: rotate(15deg); }
    30%  { transform: rotate(-10deg); }
    45%  { transform: rotate(8deg); }
    60%  { transform: rotate(-5deg); }
    75%  { transform: rotate(3deg); }
  }
`;

export default function SetupPage({ user, lang, setLang, setUserTeam, onComplete }) {

  // ── ALL hooks unconditionally at top ──────────────────────────────────
  const [step,         setStep        ] = useState(1);
  const [selectedLang, setSelectedLang] = useState(lang || "fr");
  const [firstName,    setFirstName   ] = useState("");
  const [lastName,     setLastName    ] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [searchQ,      setSearchQ     ] = useState("");
  const [saving,       setSaving      ] = useState(false);
  const [fnError,      setFnError     ] = useState(false);
  const [lnError,      setLnError     ] = useState(false);
  const [fnFocus,      setFnFocus     ] = useState(false);
  const [lnFocus,      setLnFocus     ] = useState(false);

  const T     = TRANSLATIONS[selectedLang] || TRANSLATIONS.fr;
  const isRTL = selectedLang === "ar";

  // Auto-advance from confirmation screen after 2.5 s
  useEffect(() => {
    if (step !== 5) return;
    const t = setTimeout(() => onComplete(), 2500);
    return () => clearTimeout(t);
  }, [step]);

  // ── Helpers ───────────────────────────────────────────────────────────
  function getTeamCode(name) {
    const iso = TEAM_ISO[name] || "ma";
    return iso.startsWith("gb-")
      ? iso.slice(3, 5).toUpperCase()
      : iso.slice(0, 2).toUpperCase();
  }

  const allTeams      = TEAM_ORDER.filter(t => TEAM_DATA[t]);
  const filteredTeams = searchQ.trim()
    ? allTeams.filter(t => t.toLowerCase().includes(searchQ.trim().toLowerCase()))
    : allTeams;

  // ── Action handlers ───────────────────────────────────────────────────
  function handleStep1() {
    setLang(selectedLang);
    localStorage.setItem("lang", selectedLang);
    setStep(2);
  }

  function handleStep2() {
    const fe = !firstName.trim();
    const le = !lastName.trim();
    setFnError(fe);
    setLnError(le);
    if (fe || le) return;
    setStep(3);
  }

  async function handleStep3() {
    if (!selectedTeam) return;
    setSaving(true);
    try {
      await supabase.from("profiles").upsert({
        id: user.id,
        first_name:    firstName.trim(),
        last_name:     lastName.trim(),
        favorite_team: selectedTeam,
        username:      firstName.trim().toLowerCase() + "." + lastName.trim().toLowerCase(),
      });
      const teamObj = { t: selectedTeam, f: TEAM_DATA[selectedTeam]?.flag || "" };
      localStorage.setItem("userTeam", JSON.stringify(teamObj));
      if (setUserTeam) setUserTeam(teamObj);
      logger.info("setup", "Setup completed", { lang: selectedLang, team: selectedTeam }, user?.id);
    } catch (err) {
      console.error("Setup error:", err);
      logger.error("setup", "Setup failed", { error: err?.message }, user?.id);
    }
    setSaving(false);
    setStep(4);
  }

  async function handleActivateNotif() {
    if ("Notification" in window) {
      const perm = await Notification.requestPermission();
      if (perm === "granted") {
        ["moundiguide_notif_matches", "moundiguide_notif_live", "moundiguide_notif_news"]
          .forEach(k => localStorage.setItem(k, "true"));
        new Notification("MoundiGuide 🏆", {
          body: "Notifications activées ! Vous recevrez des alertes avant les matchs.",
          icon: "/logo.webp",
        });
      }
    }
    setStep(5);
  }

  // ── Shared style helpers ──────────────────────────────────────────────
  const cardStyle = {
    maxWidth: 480, width: "100%", margin: "0 auto",
    background: "rgba(255,255,255,0.04)",
    borderRadius: 24, padding: 32,
    border: "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(16px)",
  };

  const backBtnStyle = {
    height: 48, padding: "0 20px", borderRadius: 12,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "rgba(255,255,255,0.7)", fontSize: 14,
    cursor: "pointer", fontFamily: F,
  };

  function primaryBtn(disabled) {
    return {
      height: 48, padding: "0 28px", borderRadius: 12, border: "none",
      background: disabled
        ? "rgba(255,255,255,0.1)"
        : "linear-gradient(135deg,#C41E3A,#8B0000)",
      color: disabled ? "rgba(255,255,255,0.3)" : "white",
      fontWeight: 700, fontSize: 15,
      cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: F, transition: "all .2s",
      opacity: disabled ? 0.4 : 1,
    };
  }

  const continueLabel = isRTL
    ? `→ ${T.continue || "Continuer"}`
    : `${T.continue || "Continuer"} →`;
  const startLabel = saving
    ? "..."
    : isRTL
      ? `→ ${T.start || "Commencer"}`
      : `${T.start || "Commencer"} →`;
  const backLabel = isRTL ? "السابق →" : "← Précédent";

  // ── Step dots (4 total) ───────────────────────────────────────────────
  const StepDots = () => (
    <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 32 }}>
      {[1, 2, 3, 4].map(n => (
        <div key={n} style={{
          width:  n === step ? 10 : 8,
          height: n === step ? 10 : 8,
          borderRadius: "50%", alignSelf: "center",
          background: n === step
            ? "#C41E3A"
            : n < step
              ? "rgba(196,30,58,0.45)"
              : "rgba(255,255,255,0.2)",
          transition: "all .3s",
        }}/>
      ))}
    </div>
  );

  // ── CONFIRMATION SCREEN — early return (step 5) ───────────────────────
  if (step === 5) {
    const code = selectedTeam ? getTeamCode(selectedTeam) : null;
    const img  = code
      ? (PLAYERS_IMG[code] || "/players-default.webp")
      : "/players-default.webp";

    return (
      <div dir={isRTL ? "rtl" : "ltr"} style={{
        minHeight: "100vh", background: "#121414", fontFamily: F,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: 24, textAlign: "center",
      }}>
        <style>{KEYFRAMES}</style>

        <img src={img} alt={selectedTeam || ""}
          style={{
            width: "100%", maxWidth: 380, height: 200,
            objectFit: "cover", borderRadius: 20,
          }}
          onError={e => { e.target.src = "/players-default.webp"; }}
        />

        <div style={{ color: "white", fontSize: 28, fontWeight: 800, marginTop: 20 }}>
          {selectedTeam}
        </div>

        <div style={{
          color: "rgba(255,255,255,0.8)", fontSize: 15, marginTop: 12,
          maxWidth: 320, lineHeight: 1.6,
        }}>
          {T.setupComplete || "Vous êtes prêt ! Bienvenue dans l'aventure Mondial 2030 🎉"}
        </div>

        <div style={{
          width: 280, height: 3,
          background: "rgba(255,255,255,0.1)",
          borderRadius: 2, marginTop: 28, overflow: "hidden",
        }}>
          <div style={{
            height: "100%", borderRadius: 2,
            background: "#C41E3A",
            animation: "setupProgress 2.5s linear forwards",
          }}/>
        </div>

        <button
          onClick={onComplete}
          style={{
            marginTop: 20, background: "none", border: "none",
            color: "rgba(255,255,255,0.4)", fontSize: 13,
            cursor: "pointer", fontFamily: F,
          }}
        >
          {isRTL
            ? `→ ${T.continuNow || "Continuer maintenant"}`
            : `${T.continuNow || "Continuer maintenant"} →`}
        </button>
      </div>
    );
  }

  // ── MAIN RENDER (steps 1–4) ───────────────────────────────────────────
  const step2disabled = !firstName.trim() || !lastName.trim();
  const step3disabled = !selectedTeam || saving;

  return (
    <div dir={isRTL ? "rtl" : "ltr"} style={{
      minHeight: "100vh", background: "#121414", fontFamily: F,
    }}>
      <style>{KEYFRAMES}</style>

      {/* Scrollable content */}
      <div style={{
        minHeight: "100vh",
        paddingTop: 40, paddingBottom: 96,
        paddingLeft: 16, paddingRight: 16,
        display: "flex", flexDirection: "column", alignItems: "center",
      }}>

        {/* Logo */}
        <div style={{ marginBottom: 28 }}>
          <img
            src="/logo.webp"
            alt="MoundiGuide"
            style={{ width: 56, height: 56, objectFit: "contain", display: "block" }}
            onError={e => { e.target.style.display = "none"; }}
          />
        </div>

        <StepDots />

        {/* Card */}
        <div style={cardStyle}>

          {/* ── STEP 1 — Language ──────────────────────────────── */}
          {step === 1 && (
            <>
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <div style={{ color: "white", fontSize: 22, fontWeight: 800, marginBottom: 6 }}>
                  Choisissez votre langue
                </div>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>
                  Choose your language
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {LANGUAGES.map(l => {
                  const active = selectedLang === l.code;
                  return (
                    <button
                      key={l.code}
                      role="radio"
                      aria-checked={active}
                      onClick={() => setSelectedLang(l.code)}
                      style={{
                        height: 52, borderRadius: 14, border: "none",
                        background: active ? "#C41E3A" : "rgba(255,255,255,0.06)",
                        color: active ? "white" : "rgba(255,255,255,0.7)",
                        fontWeight: active ? 700 : 400,
                        fontSize: 15, cursor: "pointer", fontFamily: F,
                        transition: "all .15s",
                      }}
                    >
                      {l.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* ── STEP 2 — Name ──────────────────────────────────── */}
          {step === 2 && (
            <>
              <div style={{ textAlign: isRTL ? "right" : "left", marginBottom: 28 }}>
                <div style={{ color: "white", fontSize: 22, fontWeight: 800 }}>
                  {T.tellUsAboutYou || "Parlez-nous de vous"}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                {/* First name */}
                <div>
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => {
                      setFirstName(e.target.value);
                      if (e.target.value.trim()) setFnError(false);
                    }}
                    onFocus={() => setFnFocus(true)}
                    onBlur={()  => setFnFocus(false)}
                    placeholder={T.firstName || "Prénom"}
                    aria-label={T.firstName || "Prénom"}
                    aria-required="true"
                    style={{
                      width: "100%", boxSizing: "border-box",
                      padding: "14px 16px", borderRadius: 12,
                      background: "rgba(255,255,255,0.07)",
                      border: `1px solid ${
                        fnError ? "#E24B4A" : fnFocus ? "#C41E3A" : "rgba(255,255,255,0.12)"
                      }`,
                      color: "white", fontSize: 16, fontFamily: F,
                      outline: "none", direction: isRTL ? "rtl" : "ltr",
                      transition: "border-color .2s",
                    }}
                  />
                  {fnError && (
                    <div style={{
                      color: "#E24B4A", fontSize: 12, marginTop: 4,
                      textAlign: isRTL ? "right" : "left",
                    }}>
                      {T.required || "Ce champ est obligatoire"}
                    </div>
                  )}
                </div>

                {/* Last name */}
                <div>
                  <input
                    type="text"
                    value={lastName}
                    onChange={e => {
                      setLastName(e.target.value);
                      if (e.target.value.trim()) setLnError(false);
                    }}
                    onFocus={() => setLnFocus(true)}
                    onBlur={()  => setLnFocus(false)}
                    placeholder={T.lastName || "Nom"}
                    aria-label={T.lastName || "Nom"}
                    aria-required="true"
                    style={{
                      width: "100%", boxSizing: "border-box",
                      padding: "14px 16px", borderRadius: 12,
                      background: "rgba(255,255,255,0.07)",
                      border: `1px solid ${
                        lnError ? "#E24B4A" : lnFocus ? "#C41E3A" : "rgba(255,255,255,0.12)"
                      }`,
                      color: "white", fontSize: 16, fontFamily: F,
                      outline: "none", direction: isRTL ? "rtl" : "ltr",
                      transition: "border-color .2s",
                    }}
                  />
                  {lnError && (
                    <div style={{
                      color: "#E24B4A", fontSize: 12, marginTop: 4,
                      textAlign: isRTL ? "right" : "left",
                    }}>
                      {T.required || "Ce champ est obligatoire"}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ── STEP 3 — Team ──────────────────────────────────── */}
          {step === 3 && (
            <>
              <div style={{ textAlign: isRTL ? "right" : "left", marginBottom: 20 }}>
                <div style={{ color: "white", fontSize: 22, fontWeight: 800 }}>
                  {T.chooseFavoriteTeam || "Choisissez votre équipe favorite"}
                </div>
              </div>

              {/* Search */}
              <input
                type="text"
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder={T.search || "Rechercher..."}
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "10px 16px", borderRadius: 12, marginBottom: 12,
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "white", fontSize: 14, fontFamily: F,
                  outline: "none", direction: isRTL ? "rtl" : "ltr",
                }}
              />

              {/* Team list */}
              <div style={{
                maxHeight: 360, overflowY: "auto",
                overscrollBehavior: "contain",
              }}>
                {filteredTeams.map(name => {
                  const isoRaw = TEAM_ISO[name] || "ma";
                  const active = selectedTeam === name;
                  return (
                    <button
                      key={name}
                      onClick={() => setSelectedTeam(name)}
                      style={{
                        display: "flex",
                        flexDirection: isRTL ? "row-reverse" : "row",
                        alignItems: "center", gap: 12,
                        width: "100%", height: 52, padding: "0 16px",
                        borderRadius: 12, cursor: "pointer", marginBottom: 6,
                        background: active ? "rgba(196,30,58,0.15)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${active ? "#C41E3A" : "transparent"}`,
                        boxSizing: "border-box", transition: "all .15s",
                        textAlign: isRTL ? "right" : "left",
                      }}
                    >
                      <img
                        src={`https://flagcdn.com/48x36/${isoRaw.toLowerCase()}.png`}
                        alt={name}
                        style={{ width: 28, height: "auto", borderRadius: 3, flexShrink: 0 }}
                        onError={e => { e.target.style.display = "none"; }}
                      />
                      <span style={{ color: "white", fontSize: 15, fontWeight: 500, flex: 1 }}>
                        {name}
                      </span>
                      {active && (
                        <span style={{
                          color: "#C41E3A", fontSize: 16, fontWeight: 700, flexShrink: 0,
                        }}>
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* ── STEP 4 — Notifications ─────────────────────────── */}
          {step === 4 && (
            <>
              <div style={{ textAlign: "center", marginBottom: 8 }}>
                <div style={{
                  fontSize: 64, display: "inline-block", marginBottom: 20,
                  animation: "bellSwing 1.5s ease-in-out infinite",
                }}>
                  🔔
                </div>
                <div style={{ color: "white", fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
                  {T.notifStep || "Restez informé"}
                </div>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>
                  {T.notifSubtitle || "Recevez des alertes avant les matchs"}
                </div>
              </div>

              <div style={{
                color: "rgba(255,255,255,0.6)", fontSize: 15, lineHeight: 1.6,
                textAlign: "center", maxWidth: 300, margin: "16px auto 28px",
              }}>
                Ne manquez aucun match de votre équipe favorite.
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <button
                  onClick={handleActivateNotif}
                  style={{
                    width: "100%", height: 52, borderRadius: 14, border: "none",
                    background: "linear-gradient(135deg,#C41E3A,#8B0000)",
                    color: "white", fontSize: 15, fontWeight: 700,
                    cursor: "pointer", fontFamily: F,
                  }}
                >
                  {T.activateNotif || "🔔 Activer les notifications"}
                </button>
                <button
                  onClick={() => setStep(5)}
                  style={{
                    width: "100%", height: 48, borderRadius: 14,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.6)", fontSize: 14,
                    cursor: "pointer", fontFamily: F,
                  }}
                >
                  {T.laterBtn || "Plus tard"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Fixed bottom bar ─────────────────────────────────────────────── */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
        background: "#121414",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "12px 20px",
        display: "flex", alignItems: "center",
        justifyContent:
          step === 1 ? (isRTL ? "flex-start" : "flex-end") :
          step === 4 ? (isRTL ? "flex-end" : "flex-start") :
          "space-between",
      }}>

        {/* Back button — steps 2, 3, 4 */}
        {step > 1 && (
          <button onClick={() => setStep(step - 1)} style={backBtnStyle}>
            {backLabel}
          </button>
        )}

        {/* Continue — step 1 */}
        {step === 1 && (
          <button onClick={handleStep1} style={primaryBtn(false)}>
            {continueLabel}
          </button>
        )}

        {/* Continue — step 2 */}
        {step === 2 && (
          <button
            onClick={handleStep2}
            disabled={step2disabled}
            style={primaryBtn(step2disabled)}
          >
            {continueLabel}
          </button>
        )}

        {/* Commencer — step 3 */}
        {step === 3 && (
          <button
            onClick={handleStep3}
            disabled={step3disabled}
            style={primaryBtn(step3disabled)}
          >
            {startLabel}
          </button>
        )}

        {/* step 4: action buttons are inside the card; only back button here */}
      </div>
    </div>
  );
}
