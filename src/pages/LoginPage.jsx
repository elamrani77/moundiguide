import { useState, useEffect } from "react";
import { supabase } from "../supabase.js";
import { F } from "../constants.js";

// ─── Translations ────────────────────────────────────────────────────────────
const T = {
  fr: { login:"Connexion", signup:"Inscription", email:"Email", password:"Mot de passe",
        continueWithout:"Continuer sans compte →", authError:"Erreur d'authentification",
        checkEmail:"Vérifiez votre email pour confirmer votre compte.", submitting:"Chargement…" },
  en: { login:"Sign In", signup:"Sign Up", email:"Email", password:"Password",
        continueWithout:"Continue without account →", authError:"Authentication error",
        checkEmail:"Check your email to confirm your account.", submitting:"Loading…" },
  ar: { login:"دخول", signup:"تسجيل", email:"البريد الإلكتروني", password:"كلمة المرور",
        continueWithout:"→ متابعة بدون حساب", authError:"خطأ في المصادقة",
        checkEmail:"تحقق من بريدك لتأكيد حسابك.", submitting:"جارٍ التحميل…" },
  es: { login:"Entrar", signup:"Registrarse", email:"Email", password:"Contraseña",
        continueWithout:"Continuar sin cuenta →", authError:"Error de autenticación",
        checkEmail:"Revisa tu email para confirmar tu cuenta.", submitting:"Cargando…" },
  pt: { login:"Entrar", signup:"Cadastrar", email:"Email", password:"Senha",
        continueWithout:"Continuar sem conta →", authError:"Erro de autenticação",
        checkEmail:"Verifique seu email para confirmar a conta.", submitting:"Carregando…" },
  zh: { login:"登录", signup:"注册", email:"邮箱", password:"密码",
        continueWithout:"不登录继续 →", authError:"认证错误",
        checkEmail:"请查看邮箱确认账户。", submitting:"加载中…" },
};

// ─── CSS Keyframes ────────────────────────────────────────────────────────────
const KF = `
  @keyframes mgSceneIn  { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }

  /* IDLE */
  @keyframes mgIdleBody { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.018)} }
  @keyframes mgIdleBall { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }

  /* RUNNING — one-directional dash toward goal */
  @keyframes mgRunP  { 0%{transform:translateX(0)} 100%{transform:translateX(120px)} }
  @keyframes mgRunB  { 0%{transform:translateX(0)} 100%{transform:translateX(120px)} }

  /* SUCCESS: dash → kick → ball arcs into net → jump celebrate */
  @keyframes mgSuccessP {
    0%   { transform: translate(0px,0px)     rotate(0deg)  }
    34%  { transform: translate(130px,0px)   rotate(0deg)  }
    44%  { transform: translate(135px,0px)   rotate(-16deg)}  /* wind-up kick */
    54%  { transform: translate(135px,0px)   rotate(8deg)  }  /* follow-through */
    66%  { transform: translate(135px,-24px) rotate(0deg)  }  /* jump! */
    82%  { transform: translate(135px,-24px) rotate(0deg)  }  /* hang time */
    100% { transform: translate(135px,0px)   rotate(0deg)  }  /* land */
  }
  /* Ball: travels with player, then launches on a parabolic arc into the net */
  @keyframes mgSuccessB {
    0%   { transform: translate(0px,0px);    opacity:1 }
    34%  { transform: translate(130px,0px);  opacity:1 }  /* at kick spot */
    50%  { transform: translate(195px,-90px); opacity:1 } /* rising arc */
    64%  { transform: translate(232px,-28px); opacity:1 } /* into net */
    100% { transform: translate(232px,-28px); opacity:1 } /* stays in net */
  }
  @keyframes mgNetShake {
    0%,100%{ transform:translateX(0) }
    20%,60%{ transform:translateX(-5px) }
    40%,80%{ transform:translateX(5px) }
  }
  @keyframes mgGoalText {
    0%   { opacity:0; transform:scale(0.35) translateY(12px) }
    14%  { opacity:1; transform:scale(1.2)  translateY(0) }
    26%  { transform:scale(1) translateY(0) }
    78%  { opacity:1 }
    100% { opacity:0 }
  }
  @keyframes mgStarPop {
    0%   { opacity:0; transform:scale(0)   rotate(0deg)  }
    30%  { opacity:1; transform:scale(1.1) rotate(20deg) }
    100% { opacity:0; transform:scale(1.7) rotate(48deg) }
  }

  /* FAILURE: dash → kick → ball misses wide right → player falls */
  @keyframes mgFailP {
    0%   { transform: translate(0px,0px)     rotate(0deg)  }
    34%  { transform: translate(130px,0px)   rotate(0deg)  }
    44%  { transform: translate(135px,0px)   rotate(-14deg)}  /* kick attempt */
    55%  { transform: translate(135px,0px)   rotate(6deg)  }
    68%  { transform: translate(135px,14px)  rotate(28deg) }  /* stumble */
    100% { transform: translate(135px,18px)  rotate(32deg) }  /* lying down */
  }
  /* Ball: launched but curves high and wide, misses goal, exits screen */
  @keyframes mgFailB {
    0%   { transform: translate(0px,0px);     opacity:1 }
    34%  { transform: translate(130px,0px);   opacity:1 }
    52%  { transform: translate(220px,-95px); opacity:1 } /* high arc */
    74%  { transform: translate(360px,40px);  opacity:0.5 } /* misses right */
    100% { transform: translate(420px,80px);  opacity:0 }   /* off screen */
  }
  @keyframes mgFailText {
    0%   { opacity:0; transform:translateY(14px) }
    14%  { opacity:1; transform:translateY(0) }
    76%  { opacity:1 }
    100% { opacity:0; transform:translateY(-8px) }
  }

  /* Arm waves on celebrate */
  @keyframes mgArmWave {
    0%,100%{ transform:rotate(0deg) }
    50%{ transform:rotate(-35deg) }
  }
`;

// ─── FootballerScene ──────────────────────────────────────────────────────────
function FootballerScene({ anim }) {
  const playerStyle = {
    transformBox: "fill-box",
    transformOrigin: "80px 215px",  /* pivot near hips */
    animation:
      anim === "idle"    ? "none"
    : anim === "running" ? "mgRunP 0.9s ease-in-out forwards"
    : anim === "success" ? "mgSuccessP 2.6s cubic-bezier(.4,0,.2,1) forwards"
    : anim === "fail"    ? "mgFailP 2.6s cubic-bezier(.4,0,.2,1) forwards"
    : "none",
  };

  const ballStyle = {
    transformBox: "fill-box",
    transformOrigin: "110px 245px",
    animation:
      anim === "idle"    ? "mgIdleBall 1.7s ease-in-out infinite"
    : anim === "running" ? "mgRunB 0.9s ease-in-out forwards"
    : anim === "success" ? "mgSuccessB 2.6s cubic-bezier(.4,0,.2,1) forwards"
    : anim === "fail"    ? "mgFailB 2.6s cubic-bezier(.4,0,.2,1) forwards"
    : "none",
  };

  const netStyle = {
    transformBox: "fill-box",
    transformOrigin: "339px 213px",
    animation: anim === "success" ? "mgNetShake 0.28s ease 1.65s 5 both" : "none",
  };

  const txtStyle = {
    transformBox: "fill-box",
    transformOrigin: "200px 115px",
    animation:
      anim === "success" ? "mgGoalText 3.2s ease forwards"
    : anim === "fail"    ? "mgFailText 3.2s ease forwards"
    : "none",
  };

  const bodyIdleStyle = {
    transformBox: "fill-box",
    transformOrigin: "80px 212px",
    animation: anim === "idle" ? "mgIdleBody 2.4s ease-in-out infinite" : "none",
  };

  return (
    <div style={{ width:"100%", height:"100%", animation:"mgSceneIn 0.85s ease both" }}>
      <style>{KF}</style>
      <svg viewBox="0 0 400 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">

        {/* ── Background ── */}
        {[[28,22],[85,16],[148,12],[212,38],[288,20],[352,15],[388,42],
          [46,72],[318,65],[164,55],[240,30],[120,45],[70,38],[200,18]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r={i%5===0?2.2:1.2}
            fill={`rgba(255,255,255,${0.05+i*0.008})`}/>
        ))}

        {/* Ambient glow */}
        <ellipse cx={339} cy={218} rx={62} ry={42} fill="rgba(196,30,58,0.07)"/>
        <ellipse cx={339} cy={218} rx={38} ry={24} fill="rgba(196,30,58,0.05)"/>

        {/* Ground */}
        <line x1={8} y1={250} x2={392} y2={250}
          stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} strokeDasharray="6 4"/>

        {/* ── Goal (right side) ── */}
        <g style={netStyle}>
          {/* Net diagonals */}
          {[0,14,28,42,56,70,74].map((dy,i)=>(
            <line key={`nd${i}`} x1={305} y1={176+dy} x2={373} y2={250}
              stroke="rgba(196,30,58,0.22)" strokeWidth={0.8}/>
          ))}
          {/* Net verticals */}
          {[0,17,34,51,68].map((dx,i)=>(
            <line key={`nv${i}`} x1={305+dx} y1={176} x2={305+dx} y2={250}
              stroke="rgba(196,30,58,0.16)" strokeWidth={0.8}/>
          ))}
          {/* Posts — glow then solid on top */}
          <line x1={305} y1={176} x2={305} y2={250} stroke="rgba(196,30,58,0.28)" strokeWidth={8} strokeLinecap="round"/>
          <line x1={373} y1={176} x2={373} y2={250} stroke="rgba(196,30,58,0.28)" strokeWidth={8} strokeLinecap="round"/>
          <line x1={305} y1={176} x2={373} y2={176} stroke="rgba(196,30,58,0.28)" strokeWidth={8} strokeLinecap="round"/>
          <line x1={305} y1={176} x2={305} y2={250} stroke="#C41E3A" strokeWidth={3} strokeLinecap="round"/>
          <line x1={373} y1={176} x2={373} y2={250} stroke="#C41E3A" strokeWidth={3} strokeLinecap="round"/>
          <line x1={305} y1={176} x2={373} y2={176} stroke="#C41E3A" strokeWidth={3} strokeLinecap="round"/>
        </g>

        {/* ── Player ── */}
        <g style={playerStyle}>
          {/* Foot shadow */}
          <ellipse cx={80} cy={251} rx={15} ry={3.5} fill="rgba(255,255,255,0.07)"/>

          {/* Body — idle breathing group */}
          <g style={bodyIdleStyle}>
            {/* Head */}
            <circle cx={80} cy={180} r={14} stroke="white" strokeWidth={2}
              fill="rgba(255,255,255,0.05)"/>
            {/* Hair tuft */}
            <path d="M72,172 Q80,167 88,172" stroke="white" strokeWidth={1.5}
              fill="none" strokeLinecap="round"/>
            {/* Eyes */}
            <circle cx={75.5} cy={179} r={1.9} fill="white"/>
            <circle cx={84.5} cy={179} r={1.9} fill="white"/>
            {/* Smile */}
            <path d="M74,186 Q80,191 86,186" stroke="white" strokeWidth={1.3}
              fill="none" strokeLinecap="round"/>

            {/* Body */}
            <line x1={80} y1={194} x2={80} y2={230}
              stroke="white" strokeWidth={2} strokeLinecap="round"/>
            {/* Jersey stripe */}
            <line x1={72} y1={207} x2={88} y2={207}
              stroke="rgba(196,30,58,0.7)" strokeWidth={1.3}/>

            {/* Left arm */}
            <line x1={80} y1={205} x2={60} y2={220}
              stroke="white" strokeWidth={2} strokeLinecap="round"/>
            {/* Right arm */}
            <line x1={80} y1={205} x2={100} y2={215}
              stroke="white" strokeWidth={2} strokeLinecap="round"/>

            {/* Shorts line */}
            <line x1={66} y1={238} x2={94} y2={238}
              stroke="rgba(255,255,255,0.38)" strokeWidth={1.2}/>

            {/* Left leg */}
            <line x1={80} y1={230} x2={65} y2={255}
              stroke="white" strokeWidth={2} strokeLinecap="round"/>
            {/* Right leg */}
            <line x1={80} y1={230} x2={95} y2={255}
              stroke="white" strokeWidth={2} strokeLinecap="round"/>
            {/* Cleats */}
            <line x1={62} y1={255} x2={68} y2={255}
              stroke="white" strokeWidth={2.5} strokeLinecap="round"/>
            <line x1={92} y1={255} x2={98} y2={255}
              stroke="white" strokeWidth={2.5} strokeLinecap="round"/>
          </g>
        </g>

        {/* ── Ball ── */}
        <g style={ballStyle}>
          <circle cx={110} cy={245} r={10} stroke="white" strokeWidth={2}
            fill="rgba(255,255,255,0.05)"/>
          {/* Pentagon */}
          <path d="M110,235 L114.8,239.5 L113,245 L107,245 L105.2,239.5 Z"
            stroke="white" strokeWidth={1.1} fill="rgba(0,0,0,0.22)"/>
          {/* Seams */}
          <line x1={110} y1={234} x2={110} y2={236} stroke="white" strokeWidth={1}/>
          <line x1={115} y1={240} x2={117} y2={239} stroke="white" strokeWidth={1}/>
          <line x1={113} y1={246} x2={115} y2={248} stroke="white" strokeWidth={1}/>
          <line x1={107} y1={246} x2={105} y2={248} stroke="white" strokeWidth={1}/>
          <line x1={105} y1={240} x2={103} y2={239} stroke="white" strokeWidth={1}/>
        </g>

        {/* ── Success extras ── */}
        {anim === "success" && (
          <>
            {/* Star burst particles */}
            {[[222,148],[256,134],[278,150],[244,166],[268,140]].map(([x,y],i)=>(
              <text key={i} x={x} y={y}
                style={{
                  fontSize: 13, fill: "#F5A623", fontFamily: F,
                  animation: `mgStarPop ${0.6+i*0.1}s ease ${1.38+i*0.1}s both`,
                  transformBox: "fill-box",
                  transformOrigin: `${x}px ${y}px`,
                }}>★</text>
            ))}
          </>
        )}

        {/* ── Outcome text ── */}
        {(anim === "success" || anim === "fail") && (
          <text x={200} y={115} textAnchor="middle"
            style={{
              ...txtStyle,
              fontSize: anim === "success" ? 28 : 20,
              fontWeight: 800,
              fill: anim === "success" ? "#F5A623" : "rgba(255,255,255,0.62)",
              fontFamily: F,
            }}>
            {anim === "success" ? "⚽ GOAL!" : "😅 Raté..."}
          </text>
        )}

        {/* Watermark */}
        <text x={200} y={290} textAnchor="middle"
          style={{ fontSize: 8, fill: "rgba(255,255,255,0.1)", fontFamily: F, letterSpacing: 3 }}>
          YALLAVAMOS 2030
        </text>
      </svg>
    </div>
  );
}

// ─── LoginPage ────────────────────────────────────────────────────────────────
export default function LoginPage({ lang, onSkip, onSuccess }) {
  const t = T[lang] || T.fr;
  const [tab,      setTab]      = useState("login");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [info,     setInfo]     = useState("");
  const [loading,  setLoading]  = useState(false);
  const [animState,setAnimState]= useState("idle");
  const [focused,  setFocused]  = useState(null);
  const [isDesk,   setIsDesk]   = useState(
    typeof window !== "undefined" && window.innerWidth >= 768
  );
  const isRTL = lang === "ar";

  useEffect(() => {
    const h = () => setIsDesk(window.innerWidth >= 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setInfo(""); setLoading(true);
    setAnimState("running");
    try {
      if (tab === "login") {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) {
          setError(err.message);
          setAnimState("fail");
          setTimeout(() => setAnimState("idle"), 3200);
        } else {
          setAnimState("success");
          setTimeout(() => { if (onSuccess) onSuccess(); }, 1500);
        }
      } else {
        const { error: err } = await supabase.auth.signUp({ email, password });
        if (err) {
          setError(err.message);
          setAnimState("fail");
          setTimeout(() => setAnimState("idle"), 3200);
        } else {
          setInfo(t.checkEmail);
          setAnimState("success");
        }
      }
    } catch {
      setError(t.authError);
      setAnimState("fail");
      setTimeout(() => setAnimState("idle"), 3200);
    } finally {
      setLoading(false);
    }
  }

  const inp = (field) => ({
    width: "100%", padding: "14px 18px", borderRadius: 14,
    border: `1px solid ${focused === field ? "#C41E3A" : "rgba(255,255,255,0.1)"}`,
    background: "rgba(255,255,255,0.06)", color: "#FFF",
    fontSize: 15, fontFamily: F, outline: "none", boxSizing: "border-box",
    direction: isRTL ? "rtl" : "ltr", transition: "border-color 0.2s",
  });

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg,#0a0a0f 0%,#121414 50%,#1a0a0a 100%)",
      display: "flex", fontFamily: F,
      direction: isRTL ? "rtl" : "ltr",
    }}>

      {/* ── Left panel — desktop SVG animation ── */}
      {isDesk && (
        <div style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          minHeight: "100vh", padding: "40px",
          borderRight: "1px solid rgba(255,255,255,0.04)",
        }}>
          <div style={{ width: "100%", maxWidth: 480, aspectRatio: "4/3" }}>
            <FootballerScene anim={animState}/>
          </div>
        </div>
      )}

      {/* ── Right panel — form ── */}
      <div style={{
        width: isDesk ? 460 : "100%",
        minHeight: "100vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: isDesk ? "48px 40px" : "24px 16px",
        flexShrink: 0,
      }}>

        {/* Mobile animation strip */}
        {!isDesk && (
          <div style={{ width: "100%", maxWidth: 360, height: 180, marginBottom: 8 }}>
            <FootballerScene anim={animState}/>
          </div>
        )}

        {/* ── Glassmorphism card ── */}
        <div style={{
          width: "100%", maxWidth: 420,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 24, padding: "36px 32px",
          backdropFilter: "blur(20px)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        }}>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
            <img src="/logo.webp" width={52} height={52} alt="MoundiGuide"
              style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
              onError={e => { e.target.src = "/logo.png"; }}/>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.15, fontFamily: F }}>
                <span style={{ color: "#C41E3A" }}>Moundi</span>
                <span style={{ color: "#FFF" }}> Guide</span>
              </div>
              <div style={{
                color: "rgba(255,255,255,0.35)", fontSize: 9,
                letterSpacing: 2.5, textTransform: "uppercase",
                marginTop: 2, fontFamily: F,
              }}>
                Mondial 2030
              </div>
            </div>
          </div>

          {/* Tab switcher */}
          <div style={{
            display: "flex", gap: 4,
            background: "rgba(255,255,255,0.06)",
            borderRadius: 12, padding: 4, marginBottom: 24,
          }}>
            {["login", "signup"].map(t2 => (
              <button key={t2}
                onClick={() => { setTab(t2); setError(""); setInfo(""); }}
                style={{
                  flex: 1, padding: "10px 8px", borderRadius: 10, border: "none",
                  cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: F,
                  transition: "all .2s",
                  background: tab === t2 ? "#C41E3A" : "transparent",
                  color:      tab === t2 ? "#FFF"    : "rgba(255,255,255,0.4)",
                  boxShadow:  tab === t2 ? "0 4px 12px rgba(196,30,58,0.35)" : "none",
                }}>
                {t2 === "login" ? t.login : t.signup}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t.email} required aria-label={t.email}
              onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
              style={inp("email")} autoComplete="email"/>

            <input
              type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={t.password} required aria-label={t.password}
              onFocus={() => setFocused("pass")} onBlur={() => setFocused(null)}
              style={inp("pass")} autoComplete="current-password"/>

            {error && (
              <div style={{
                background: "rgba(196,30,58,0.15)",
                border: "1px solid rgba(196,30,58,0.3)",
                borderRadius: 8, padding: "8px 12px",
                color: "#FF6B6B", fontSize: 13, fontFamily: F,
              }}>
                {error}
              </div>
            )}
            {info && (
              <div style={{
                background: "rgba(74,222,128,0.1)",
                border: "1px solid rgba(74,222,128,0.3)",
                borderRadius: 8, padding: "8px 12px",
                color: "#4ADE80", fontSize: 13, fontFamily: F,
              }}>
                {info}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{
                height: 50, borderRadius: 14, border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                background: loading
                  ? "rgba(80,80,80,0.4)"
                  : "linear-gradient(135deg,#C41E3A 0%,#8B0000 100%)",
                color: "#FFF", fontSize: 16, fontWeight: 700, fontFamily: F,
                marginTop: 4,
                boxShadow: loading ? "none" : "0 8px 24px rgba(196,30,58,0.4)",
                transition: "all 0.2s",
              }}>
              {loading ? t.submitting : (tab === "login" ? t.login : t.signup)}
            </button>
          </form>

          {/* Skip link */}
          <button onClick={onSkip}
            style={{
              marginTop: 20, width: "100%", background: "none", border: "none",
              cursor: "pointer", color: "rgba(255,255,255,0.35)",
              fontSize: 13, fontFamily: F, padding: "4px", textAlign: "center",
            }}>
            {t.continueWithout}
          </button>
        </div>
      </div>
    </div>
  );
}
