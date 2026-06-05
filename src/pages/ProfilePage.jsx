import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabase.js";
import { TEAM_DATA, TEAM_ISO, PLAYERS_IMG, TRANSLATIONS, LANGUAGES, F } from "../constants.js";
import logger from "../utils/logger.js";

// ─── Toggle Switch ────────────────────────────────────────────────────────────
function Toggle({ on, onChange, ariaLabel }) {
  return (
    <button
      role="switch" aria-checked={on} aria-label={ariaLabel}
      onClick={() => onChange(!on)}
      style={{
        width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
        background: on ? "linear-gradient(135deg,#C41E3A,#8B0000)" : "rgba(255,255,255,0.12)",
        position: "relative", padding: 0, flexShrink: 0,
        transition: "background 0.2s",
      }}
    >
      <div style={{
        width: 20, height: 20, borderRadius: "50%", background: "white",
        position: "absolute", top: 2, left: on ? 22 : 2,
        boxShadow: "0 1px 4px rgba(0,0,0,0.35)",
        transition: "left 0.2s ease",
      }}/>
    </button>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SecHeader({ emoji, title, bg }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: bg || "rgba(196,30,58,0.18)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18, flexShrink: 0,
      }}>
        {emoji}
      </div>
      <span style={{ color: "white", fontSize: 15, fontWeight: 700, fontFamily: F }}>
        {title}
      </span>
    </div>
  );
}

// ─── ProfilePage ──────────────────────────────────────────────────────────────
export default function ProfilePage({
  user, lang, setLang, onLogout, onSave, onBack,
  isDesk, setUserTeam, setUserAvatar,
}) {
  const T     = TRANSLATIONS[lang] || TRANSLATIONS.fr;
  const isRTL = lang === "ar";

  // ── ALL HOOKS — unconditional, in fixed order ──────────────────────────────
  const avatarInputRef = useRef(null);

  const [avatarPreview,  setAvatarPreview ] = useState(null);
  const [avatarUrl,      setAvatarUrl     ] = useState(null);
  const [pendingAvatar,  setPendingAvatar ] = useState(null);
  const [avatarMsg,      setAvatarMsg     ] = useState("");
  const [avatarError,    setAvatarError   ] = useState(null);
  const [favoriteTeam,   setFavoriteTeam  ] = useState(null);
  const [showTeamGrid,   setShowTeamGrid  ] = useState(false);
  const [firstName,      setFirstName     ] = useState("");
  const [lastName,       setLastName      ] = useState("");
  const [username,       setUsername      ] = useState("");
  const [memberSince,    setMemberSince   ] = useState("");
  const [saving,         setSaving        ] = useState(false);
  const [savedMsg,       setSavedMsg      ] = useState("");
  const [pwMsg,          setPwMsg         ] = useState("");
  const [deleteConfirm,  setDeleteConfirm ] = useState(false);
  const [notifMatches,   setNotifMatches  ] = useState(
    () => localStorage.getItem("moundiguide_notif_matches") === "true"
  );
  const [notifLive,      setNotifLive     ] = useState(
    () => localStorage.getItem("moundiguide_notif_live") === "true"
  );
  const [notifNews,      setNotifNews     ] = useState(
    () => localStorage.getItem("moundiguide_notif_news") === "true"
  );
  const [displayName,    setDisplayName   ] = useState({ first: "", last: "", username: "" });
  const [focusedInput,   setFocusedInput  ] = useState(null);
  const [hoveredTeam,    setHoveredTeam   ] = useState(null);

  useEffect(() => {
    if (!user) return;
    const locale = lang === "ar" ? "ar-MA" : lang === "zh" ? "zh-CN" : lang;
    setMemberSince(
      new Date(user.created_at || Date.now())
        .toLocaleDateString(locale, { year: "numeric", month: "long" })
    );
    supabase
      .from("profiles")
      .select("id,username,first_name,last_name,avatar_url,favorite_team")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        const uname = data?.username || user.email?.split("@")[0] || "";
        if (data?.first_name) setFirstName(data.first_name);
        if (data?.last_name)  setLastName(data.last_name);
        setUsername(uname);
        if (data?.avatar_url) setAvatarUrl(data.avatar_url);
        if (data?.favorite_team) {
          setFavoriteTeam(data.favorite_team);
          const obj = { t: data.favorite_team, f: TEAM_DATA[data.favorite_team]?.flag || "" };
          if (setUserTeam) setUserTeam(obj);
          localStorage.setItem("userTeam", JSON.stringify(obj));
        }
        setDisplayName({
          first:    data?.first_name || "",
          last:     data?.last_name  || "",
          username: uname,
        });
      })
      .catch(() => {
        const uname = user.email?.split("@")[0] || "";
        setUsername(uname);
        setDisplayName({ first: "", last: "", username: uname });
      });
  }, [user?.id]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  function getTeamImg(teamName) {
    if (!teamName) return "/players-default.webp";
    const isoRaw = TEAM_ISO[teamName] || "ma";
    const code = isoRaw.startsWith("gb-")
      ? isoRaw.slice(3, 5).toUpperCase()
      : isoRaw.slice(0, 2).toUpperCase();
    return PLAYERS_IMG[code] || "/players-default.webp";
  }

  async function saveProfile(teamOverride) {
    if (!user) return;
    setSaving(true); setSavedMsg("");
    try {
      await supabase.from("profiles").upsert({
        id: user.id,
        first_name: firstName, last_name: lastName, username,
        favorite_team: teamOverride ?? favoriteTeam,
      });
      setDisplayName({ first: firstName, last: lastName, username });
      setSavedMsg(T.saved || "✓ Sauvegardé");
      setTimeout(() => setSavedMsg(""), 2500);
      const team = teamOverride ?? favoriteTeam;
      if (team && setUserTeam) {
        const obj = { t: team, f: TEAM_DATA[team]?.flag || "" };
        setUserTeam(obj);
        localStorage.setItem("userTeam", JSON.stringify(obj));
      }
      logger.info("profile", "Profile updated",
        { fields: ["first_name", "last_name", "username"] }, user.id);
    } catch (err) {
      setSavedMsg("❌ " + (err?.message || "Erreur"));
      logger.error("profile", "Profile save failed", { error: err?.message }, user.id);
    }
    setSaving(false);
  }

  async function handleLogout() {
    try { await supabase.auth.signOut(); } catch (e) { console.error(e); }
    finally {
      if (onLogout) onLogout();
      ["moundiguide_avatar", "userTeam", "moundiguide_setup_done", "lang"]
        .forEach(k => localStorage.removeItem(k));
    }
  }

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!ALLOWED.includes(file.type)) {
      setAvatarError(T.avatarFormatError || "Format non supporté (JPG, PNG, WebP)");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError(T.avatarSizeError || "Image trop grande (max 5 Mo)");
      e.target.value = "";
      return;
    }
    setAvatarPreview(URL.createObjectURL(file));
    setPendingAvatar(file);
    setAvatarError(null);
    e.target.value = "";
  }

  async function confirmAvatarUpload() {
    if (!pendingAvatar || !user) return;
    try {
      const path = `${user.id}/avatar.jpg`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, pendingAvatar, { upsert: true, contentType: pendingAvatar.type });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      setAvatarUrl(publicUrl);
      setAvatarPreview(null);
      setPendingAvatar(null);
      setAvatarMsg(T.photoUpdated || "✓ Photo mise à jour");
      if (setUserAvatar) setUserAvatar(publicUrl);
      localStorage.setItem("moundiguide_avatar", publicUrl);
      setTimeout(() => setAvatarMsg(""), 3000);
      await supabase.from("profiles").upsert({ id: user.id, avatar_url: publicUrl });
    } catch (err) {
      setAvatarError(err?.message || "Upload failed");
      setTimeout(() => setAvatarError(null), 4000);
    }
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const displayAvatar = avatarPreview || avatarUrl;
  const initial = (
    displayName.first?.[0] ||
    displayName.username?.[0] ||
    user?.email?.[0] ||
    "?"
  ).toUpperCase();

  const card = {
    background: "rgba(255,255,255,0.04)",
    borderRadius: 20, padding: 20,
    border: "1px solid rgba(255,255,255,0.08)",
    margin: "12px 16px 0",
  };

  const inpStyle = (field) => ({
    width: "100%", padding: "13px 16px", borderRadius: 12,
    border: `1px solid ${focusedInput === field ? "#C41E3A" : "rgba(255,255,255,0.1)"}`,
    background: "rgba(255,255,255,0.06)", color: "white",
    fontSize: 15, fontFamily: F, outline: "none",
    boxSizing: "border-box",
    direction: isRTL ? "rtl" : "ltr",
    transition: "border-color 0.2s",
  });

  const side = isRTL ? "right" : "left";

  // ── Guard: no user (AFTER all hooks) ──────────────────────────────────────
  if (!user) return (
    <div style={{
      background: "#121414", minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <button onClick={() => onBack?.()}
        style={{
          color: "rgba(255,255,255,0.5)", background: "none",
          border: "none", cursor: "pointer", fontSize: 16, fontFamily: F,
        }}>
        ← {T.backHome || "Retour"}
      </button>
    </div>
  );

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div dir={isRTL ? "rtl" : "ltr"}
      style={{
        minHeight: "100dvh", background: "#121414", fontFamily: F,
        overflowY: "auto", overflowX: "hidden", WebkitOverflowScrolling: "touch",
        position: "relative",
      }}>
      <div style={{ paddingBottom: 100, overscrollBehavior: "contain" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>

          {/* ══ SECTION 0 — Stadium VIP Banner ══════════════════════════════ */}
          <div style={{
            height: isDesk ? 160 : 120,
            background: "linear-gradient(135deg,#1a0810 0%,#2d0f1a 40%,#121414 100%)",
            position: "relative", overflow: "visible",
          }}>
            {/* Decorative arcs */}
            <div style={{
              position: "absolute", right: -40, top: -60,
              width: 280, height: 280, borderRadius: "50%",
              border: "2px solid rgba(196,30,58,0.15)", pointerEvents: "none",
            }}/>
            <div style={{
              position: "absolute", right: 20, top: -20,
              width: 160, height: 160, borderRadius: "50%",
              border: "1px solid rgba(245,166,35,0.1)", pointerEvents: "none",
            }}/>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{
                position: "absolute", height: 1, width: "70%",
                background: "rgba(255,255,255,0.025)",
                transform: "rotate(45deg)",
                left: "-10%", top: `${8 + i * 22}%`,
                pointerEvents: "none",
              }}/>
            ))}

            {/* Back — always physically left: 16px; arrow flips for RTL */}
            <button
              onClick={() => onBack ? onBack() : onSave?.()}
              style={{
                position: "absolute", top: 16, left: 16,
                display: "flex", alignItems: "center", gap: 6,
                color: "rgba(255,255,255,0.65)", fontSize: 14,
                cursor: "pointer", background: "none", border: "none",
                fontFamily: F, zIndex: 2,
              }}>
              {isRTL ? "→" : "←"} {T.backHome || "Accueil"}
            </button>

            {/* Outer: absolutely positioned at banner bottom, overflows via overflow:visible on banner */}
            <div style={{ position: "absolute", bottom: -40, [side]: 24, zIndex: 10 }}>
              {/* Middle: relative container so badge positions against this, not the overflow:hidden child */}
              <div
                onClick={() => avatarInputRef.current?.click()}
                style={{ position: "relative", width: 80, height: 80, cursor: "pointer" }}
              >
                {/* Inner: clips image only */}
                <div style={{
                  width: 80, height: 80, borderRadius: "50%",
                  overflow: "hidden", flexShrink: 0,
                  border: "3px solid #C41E3A",
                  boxShadow: "0 4px 20px rgba(196,30,58,0.5), 0 0 0 2px #121414",
                  background: displayAvatar
                    ? "transparent"
                    : "linear-gradient(135deg,#C41E3A,#8B0000)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {displayAvatar
                    ? <img
                        src={avatarPreview ? avatarPreview : `${avatarUrl}?t=${Date.now()}`}
                        alt=""
                        style={{
                          width: "100%", height: "100%",
                          objectFit: "cover", display: "block",
                          borderRadius: "50%", background: "transparent",
                        }}
                        onError={() => { setAvatarUrl(null); setAvatarPreview(null); }}
                      />
                    : <span style={{ color: "white", fontSize: 32, fontWeight: 800 }}>{initial}</span>
                  }
                </div>
                {/* Camera badge — outside overflow:hidden so it is never clipped */}
                <div style={{
                  position: "absolute", bottom: 2, [isRTL ? "left" : "right"]: 2,
                  width: 22, height: 22, borderRadius: "50%",
                  background: "#F5A623", border: "2px solid #121414",
                  fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center",
                  zIndex: 2, pointerEvents: "none",
                }}>📷</div>
              </div>
            </div>
          </div>

          <input type="file" accept="image/*" ref={avatarInputRef}
            style={{ display: "none" }} onChange={handleAvatarChange}/>

          {/* ══ SECTION 1 — User Info ════════════════════════════════════════ */}
          <div style={{
            padding: "52px 24px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
            {(displayName.first || displayName.last) && (
              <div style={{ color: "white", fontSize: 22, fontWeight: 800, lineHeight: 1.2 }}>
                {displayName.first} {displayName.last}
              </div>
            )}
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginTop: 4 }}>
              @{displayName.username || user.email?.split("@")[0] || ""}
            </div>
            {memberSince && (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                background: "rgba(255,255,255,0.06)", borderRadius: 20,
                padding: "4px 12px", marginTop: 8,
              }}>
                <span>⚽</span>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
                  {T.memberSince || "Membre depuis"} {memberSince}
                </span>
              </div>
            )}
            {pendingAvatar && (
              <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                <button onClick={confirmAvatarUpload} style={{
                  background: "#C41E3A", color: "white", border: "none",
                  borderRadius: 20, padding: "6px 16px", fontSize: 13,
                  cursor: "pointer", fontFamily: F,
                }}>
                  {T.saveAvatar || "📷 Enregistrer la photo"}
                </button>
                <button
                  onClick={() => { setAvatarPreview(null); setPendingAvatar(null); }}
                  style={{
                    background: "transparent", color: "rgba(255,255,255,0.4)",
                    border: "none", fontSize: 13, cursor: "pointer", fontFamily: F,
                  }}>
                  {T.cancel || "Annuler"}
                </button>
              </div>
            )}
            {avatarError && <div style={{ color: "#FF6B6B", fontSize: 12, marginTop: 8 }}>{avatarError}</div>}
            {avatarMsg   && <div style={{ color: "#4ADE80", fontSize: 12, marginTop: 8 }}>{avatarMsg}</div>}
          </div>

          {/* ══ SECTION 2 — Informations personnelles ═══════════════════════ */}
          <div style={card}>
            <SecHeader emoji="👤"
              title={T.personalInfo || "Informations personnelles"}
              bg="rgba(196,30,58,0.18)"/>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                placeholder={T.firstName || "Prénom"}
                aria-label={T.firstName || "Prénom"} aria-required="true"
                onFocus={() => setFocusedInput("fn")} onBlur={() => setFocusedInput(null)}
                style={inpStyle("fn")}/>
              <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                placeholder={T.lastName || "Nom"}
                aria-label={T.lastName || "Nom"} aria-required="true"
                onFocus={() => setFocusedInput("ln")} onBlur={() => setFocusedInput(null)}
                style={inpStyle("ln")}/>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                placeholder={T.username || "Pseudo"}
                aria-label={T.username || "Pseudo"}
                onFocus={() => setFocusedInput("un")} onBlur={() => setFocusedInput(null)}
                style={inpStyle("un")}/>
              <div style={{
                padding: "13px 16px", borderRadius: 12,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.35)", fontSize: 15,
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span>🔒</span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", direction: "ltr" }}>
                  {user.email}
                </span>
              </div>
            </div>

            <button onClick={() => saveProfile()} disabled={saving}
              style={{
                width: "100%", height: 48, borderRadius: 12, border: "none", marginTop: 16,
                background: saving
                  ? "rgba(80,80,80,0.4)"
                  : "linear-gradient(135deg,#C41E3A,#8B0000)",
                color: "white", fontWeight: 700, fontSize: 15,
                cursor: saving ? "not-allowed" : "pointer",
                boxShadow: saving ? "none" : "0 4px 16px rgba(196,30,58,0.3)",
                fontFamily: F, transition: "all 0.2s",
              }}>
              {saving ? "…" : (T.saveChanges || "Sauvegarder")}
            </button>
            {savedMsg && (
              <div style={{
                marginTop: 10, padding: "8px 12px", borderRadius: 8, textAlign: "center",
                background: savedMsg.startsWith("❌")
                  ? "rgba(196,30,58,0.12)" : "rgba(74,222,128,0.1)",
                border: `1px solid ${savedMsg.startsWith("❌")
                  ? "rgba(196,30,58,0.3)" : "rgba(74,222,128,0.3)"}`,
                color: savedMsg.startsWith("❌") ? "#FF6B6B" : "#4ADE80",
                fontSize: 13,
              }}>
                {savedMsg}
              </div>
            )}
          </div>

          {/* ══ SECTION 3 — Équipe favorite ══════════════════════════════════ */}
          <div style={card}>
            <SecHeader emoji="🏆"
              title={T.favoriteTeam || "Équipe favorite"}
              bg="rgba(245,166,35,0.15)"/>

            {favoriteTeam ? (
              <div style={{
                height: 140, borderRadius: 14, overflow: "hidden",
                position: "relative", marginBottom: 12,
                boxShadow: "0 0 0 2px #C41E3A inset",
              }}>
                <img src={getTeamImg(favoriteTeam)} alt={favoriteTeam}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={e => { e.target.src = "/players-default.webp"; }}/>
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to top,rgba(0,0,0,0.82) 0%,transparent 60%)",
                }}/>
                <div style={{ position: "absolute", bottom: 14, [side]: 14, direction: "ltr" }}>
                  <div style={{ fontSize: 28 }}>{TEAM_DATA[favoriteTeam]?.flag}</div>
                  <div style={{ color: "white", fontSize: 15, fontWeight: 700, marginTop: 2 }}>
                    {favoriteTeam}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                height: 100, borderRadius: 14,
                border: "2px dashed rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "rgba(255,255,255,0.28)", fontSize: 13, marginBottom: 12,
              }}>
                {lang === "ar" ? "لم يتم اختيار فريق" : "Aucune équipe sélectionnée"}
              </div>
            )}

            <button onClick={() => setShowTeamGrid(v => !v)}
              style={{
                width: "100%", height: 40, borderRadius: 10,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "white", fontSize: 13, cursor: "pointer", fontFamily: F,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
              {showTeamGrid ? "▲" : "▼"} {T.changeTeam || "Changer d'équipe"}
            </button>

            {showTeamGrid && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))",
                gap: 8, marginTop: 12,
                maxHeight: 300, overflowY: "auto", overscrollBehavior: "contain",
              }}>
                {Object.entries(TEAM_DATA).map(([name, td]) => {
                  const isSel = favoriteTeam === name;
                  return (
                    <button key={name}
                      onClick={() => { setFavoriteTeam(name); setShowTeamGrid(false); saveProfile(name); }}
                      onMouseEnter={() => setHoveredTeam(name)}
                      onMouseLeave={() => setHoveredTeam(null)}
                      style={{
                        height: 80, borderRadius: 12, overflow: "hidden",
                        position: "relative", padding: 0, cursor: "pointer",
                        border: `2px solid ${isSel ? "#C41E3A" : "transparent"}`,
                        transform: hoveredTeam === name ? "scale(1.03)" : "scale(1)",
                        transition: "all 0.15s", background: "transparent",
                      }}>
                      <img src={getTeamImg(name)} alt={name}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        onError={e => { e.target.src = "/players-default.webp"; }}/>
                      <div style={{
                        position: "absolute", inset: 0,
                        background: "linear-gradient(to top,rgba(0,0,0,0.9) 0%,rgba(0,0,0,0.08) 100%)",
                      }}/>
                      <div style={{
                        position: "absolute", bottom: 4, left: 0, right: 0, textAlign: "center",
                      }}>
                        <div style={{ fontSize: 11 }}>{td.flag}</div>
                        <div style={{
                          color: "white", fontSize: 7, fontWeight: 600,
                          overflow: "hidden", textOverflow: "ellipsis",
                          whiteSpace: "nowrap", padding: "0 3px", lineHeight: 1.3,
                        }}>
                          {name.length > 9 ? name.slice(0, 8) + "…" : name}
                        </div>
                      </div>
                      {isSel && (
                        <div style={{
                          position: "absolute", top: 4, right: 4,
                          width: 16, height: 16, borderRadius: "50%",
                          background: "#C41E3A",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 8, color: "white",
                        }}>✓</div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ══ SECTION 4 — Notifications ════════════════════════════════════ */}
          <div style={card}>
            <SecHeader emoji="🔔"
              title={T.notifications || "Notifications"}
              bg="rgba(26,86,219,0.2)"/>

            {[
              {
                label:    T.matchAlerts || "Alertes matchs",
                value:    notifMatches,
                onChange: v => { setNotifMatches(v); localStorage.setItem("moundiguide_notif_matches", String(v)); },
              },
              {
                label:    T.liveScores || "Scores en direct",
                value:    notifLive,
                onChange: v => { setNotifLive(v); localStorage.setItem("moundiguide_notif_live", String(v)); },
              },
              {
                label:    T.teamNews || "Actualités équipe",
                value:    notifNews,
                onChange: v => { setNotifNews(v); localStorage.setItem("moundiguide_notif_news", String(v)); },
              },
            ].map((item, i, arr) => (
              <div key={item.label} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "13px 0",
                borderBottom: i < arr.length - 1
                  ? "1px solid rgba(255,255,255,0.06)" : "none",
              }}>
                <span style={{ color: "white", fontSize: 14, fontFamily: F }}>{item.label}</span>
                <Toggle on={item.value} onChange={item.onChange} ariaLabel={item.label}/>
              </div>
            ))}
          </div>

          {/* ══ SECTION 5 — Préférences ══════════════════════════════════════ */}
          <div style={card}>
            <SecHeader emoji="🌍"
              title={T.preferences || "Préférences"}
              bg="rgba(0,130,60,0.2)"/>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {LANGUAGES.map(({ code, label }) => {
                const active = lang === code;
                return (
                  <button key={code}
                    aria-pressed={active}
                    aria-label={`${T.language || "Langue"}: ${label}`}
                    onClick={() => { setLang(code); localStorage.setItem("lang", code); }}
                    style={{
                      padding: "8px 16px", borderRadius: 20, border: "none",
                      cursor: "pointer", fontSize: 14, fontFamily: F,
                      fontWeight: active ? 700 : 400, transition: "all .2s",
                      background: active ? "#C41E3A" : "rgba(255,255,255,0.06)",
                      color:      active ? "white"  : "rgba(255,255,255,0.6)",
                    }}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ══ SECTION 6 — Compte ═══════════════════════════════════════════ */}
          <div style={{
            ...card,
            background: "rgba(196,30,58,0.04)",
            border: "1px solid rgba(196,30,58,0.12)",
          }}>
            <SecHeader emoji="⚙️"
              title={T.account || "Compte"}
              bg="rgba(196,30,58,0.18)"/>

            <button
              onClick={async () => {
                await supabase.auth.resetPasswordForEmail(user.email);
                setPwMsg(T.emailSent || "📧 Email envoyé !");
              }}
              style={{
                width: "100%", height: 44, borderRadius: 12,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "white", fontSize: 13, cursor: "pointer", fontFamily: F,
              }}>
              {T.changePassword || "🔑 Modifier le mot de passe"}
            </button>
            {pwMsg && (
              <div style={{ color: "#4ADE80", fontSize: 12, marginTop: 8, textAlign: "center" }}>
                {pwMsg}
              </div>
            )}

            <button onClick={() => setDeleteConfirm(v => !v)}
              style={{
                width: "100%", height: 44, borderRadius: 12, marginTop: 8,
                background: "transparent",
                border: "1px solid rgba(196,30,58,0.4)",
                color: "rgba(196,30,58,0.8)", fontSize: 13,
                cursor: "pointer", fontFamily: F,
              }}>
              {T.deleteAccount || "Supprimer le compte"}
            </button>

            {deleteConfirm && (
              <div style={{
                marginTop: 8, padding: 12, borderRadius: 10,
                background: "rgba(196,30,58,0.08)",
                border: "1px solid rgba(196,30,58,0.2)",
              }}>
                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 8 }}>
                  {T.contactSupport || "Contactez le support pour supprimer votre compte."}
                </div>
                <button onClick={() => setDeleteConfirm(false)}
                  style={{
                    background: "none", border: "none",
                    color: "rgba(255,255,255,0.4)", fontSize: 12,
                    cursor: "pointer", fontFamily: F,
                  }}>
                  {T.cancel || "Annuler"}
                </button>
              </div>
            )}

            <div style={{ height: 16 }}/>

            <button onClick={handleLogout}
              style={{
                width: "100%", height: 52, borderRadius: 14, border: "none",
                background: "linear-gradient(135deg,#C41E3A,#8B0000)",
                color: "white", fontSize: 16, fontWeight: 800,
                cursor: "pointer", fontFamily: F,
                boxShadow: "0 8px 24px rgba(196,30,58,0.4)",
                transition: "all 0.2s",
              }}>
              {T.logout || "Se déconnecter"}
            </button>
          </div>

          <div style={{ height: 24 }}/>
        </div>
      </div>
    </div>
  );
}
