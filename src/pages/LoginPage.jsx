import { useState, useEffect } from "react";
import { supabase } from "../supabase.js";
import { BR, F } from "../constants.js";

const T = {
  fr: { login:"Connexion", signup:"Inscription", email:"Email", password:"Mot de passe",
        continueWithout:"Continuer sans compte", authError:"Erreur d'authentification",
        checkEmail:"Vérifiez votre email pour confirmer votre compte.", submitting:"Chargement..." },
  en: { login:"Sign In", signup:"Sign Up", email:"Email", password:"Password",
        continueWithout:"Continue without account", authError:"Authentication error",
        checkEmail:"Check your email to confirm your account.", submitting:"Loading..." },
  ar: { login:"تسجيل الدخول", signup:"إنشاء حساب", email:"البريد الإلكتروني", password:"كلمة المرور",
        continueWithout:"المتابعة بدون حساب", authError:"خطأ في المصادقة",
        checkEmail:"تحقق من بريدك الإلكتروني لتأكيد حسابك.", submitting:"جارٍ التحميل..." },
  es: { login:"Iniciar sesión", signup:"Registrarse", email:"Email", password:"Contraseña",
        continueWithout:"Continuar sin cuenta", authError:"Error de autenticación",
        checkEmail:"Revisa tu email para confirmar tu cuenta.", submitting:"Cargando..." },
  pt: { login:"Entrar", signup:"Cadastrar", email:"Email", password:"Senha",
        continueWithout:"Continuar sem conta", authError:"Erro de autenticação",
        checkEmail:"Verifique seu email para confirmar a conta.", submitting:"Carregando..." },
  zh: { login:"登录", signup:"注册", email:"邮箱", password:"密码",
        continueWithout:"不登录继续", authError:"认证错误",
        checkEmail:"请查看邮箱确认账户。", submitting:"加载中..." },
};

const KEYFRAMES = `
  @keyframes mgIdlePlayer { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
  @keyframes mgIdleBall   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
  @keyframes mgRunPlayer  { 0%{transform:translateX(0)} 50%{transform:translateX(22px)} 100%{transform:translateX(0)} }
  @keyframes mgRunBall    { 0%{transform:translateX(0)} 50%{transform:translateX(22px)} 100%{transform:translateX(0)} }
  @keyframes mgSuccessPlayer {
    0%   {transform:translate(0px,0px)   rotate(0deg)}
    36%  {transform:translate(155px,0px) rotate(0deg)}
    47%  {transform:translate(160px,0px) rotate(-14deg)}
    57%  {transform:translate(160px,0px) rotate(6deg)}
    70%  {transform:translate(160px,-22px) rotate(0deg)}
    86%  {transform:translate(160px,-22px) rotate(0deg)}
    100% {transform:translate(160px,0px)   rotate(0deg)}
  }
  @keyframes mgSuccessBall {
    0%   {transform:translate(0px,0px)}
    36%  {transform:translate(155px,0px)}
    55%  {transform:translate(178px,-18px)}
    100% {transform:translate(232px,-66px)}
  }
  @keyframes mgNetShake {
    0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-4px)} 40%,80%{transform:translateX(4px)}
  }
  @keyframes mgGoalText {
    0%  {opacity:0;transform:scale(0.4)}
    14% {opacity:1;transform:scale(1.18)}
    24% {transform:scale(1)}
    78% {opacity:1;transform:scale(1)}
    100%{opacity:0;transform:scale(0.85)}
  }
  @keyframes mgFailPlayer {
    0%   {transform:translate(0px,0px)   rotate(0deg)}
    36%  {transform:translate(140px,0px) rotate(0deg)}
    47%  {transform:translate(145px,0px) rotate(-12deg)}
    57%  {transform:translate(145px,0px) rotate(6deg)}
    72%  {transform:translate(145px,9px) rotate(22deg)}
    100% {transform:translate(145px,13px) rotate(28deg)}
  }
  @keyframes mgFailBall {
    0%   {transform:translate(0px,0px);  opacity:1}
    36%  {transform:translate(140px,0px);opacity:1}
    54%  {transform:translate(168px,-30px);opacity:1}
    80%  {transform:translate(296px,22px);opacity:1}
    100% {transform:translate(330px,42px);opacity:0}
  }
  @keyframes mgFailText {
    0%  {opacity:0;transform:translateY(12px)}
    14% {opacity:1;transform:translateY(0)}
    78% {opacity:1;transform:translateY(0)}
    100%{opacity:0;transform:translateY(-8px)}
  }
  @keyframes mgStarBurst {
    0%  {opacity:0;transform:scale(0) rotate(0deg)}
    30% {opacity:1;transform:scale(1.1) rotate(20deg)}
    100%{opacity:0;transform:scale(1.6) rotate(40deg)}
  }
  @keyframes mgSceneEntrance {
    from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)}
  }
`;

function FootballerScene({ anim }) {
  const pStyle = {
    transformBox:"fill-box", transformOrigin:"50% 80%",
    animation: anim==="idle"    ? "mgIdlePlayer 2.2s ease-in-out infinite"
             : anim==="running" ? "mgRunPlayer 0.55s ease-in-out infinite"
             : anim==="success" ? "mgSuccessPlayer 2.4s cubic-bezier(.4,0,.2,1) forwards"
             : anim==="fail"    ? "mgFailPlayer 2.4s cubic-bezier(.4,0,.2,1) forwards"
             : "",
  };
  const bStyle = {
    transformBox:"fill-box", transformOrigin:"50% 50%",
    animation: anim==="idle"    ? "mgIdleBall 1.6s ease-in-out infinite"
             : anim==="running" ? "mgRunBall 0.55s ease-in-out infinite"
             : anim==="success" ? "mgSuccessBall 2.4s cubic-bezier(.4,0,.2,1) forwards"
             : anim==="fail"    ? "mgFailBall 2.4s cubic-bezier(.4,0,.2,1) forwards"
             : "",
  };
  const netStyle = {
    animation: anim==="success" ? "mgNetShake 0.28s ease 1.5s 5 both" : "",
  };
  const txtStyle = {
    transformBox:"fill-box", transformOrigin:"50% 50%",
    animation: anim==="success" ? "mgGoalText 3s ease forwards"
             : anim==="fail"    ? "mgFailText 3s ease forwards" : "",
  };

  return (
    <div style={{ width:"100%", height:"100%", animation:"mgSceneEntrance 0.8s ease both" }}>
      <style>{KEYFRAMES}</style>
      <svg viewBox="0 0 400 300" style={{ width:"100%", height:"100%" }} xmlns="http://www.w3.org/2000/svg">

        {/* Background stars */}
        {[[28,22],[85,16],[148,12],[212,38],[288,20],[352,15],[388,42],[46,72],[318,65],[164,55],[240,30],[120,45]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r={i%4===0?2:1.2} fill={`rgba(255,255,255,${0.08+i*0.01})`}/>
        ))}

        {/* Ambient glow behind goal */}
        <ellipse cx={338} cy={220} rx={55} ry={38} fill="rgba(196,30,58,0.07)"/>
        <ellipse cx={338} cy={220} rx={35} ry={22} fill="rgba(196,30,58,0.06)"/>

        {/* Ground */}
        <line x1={8} y1={263} x2={392} y2={263} stroke="rgba(255,255,255,0.12)" strokeWidth={1.5} strokeDasharray="6 4"/>

        {/* Goal — right side */}
        <g style={netStyle}>
          {/* Net fill lines */}
          {[0,15,30,45,60,75,87].map((dy,i)=>(
            <line key={`nh${i}`} x1={305} y1={176+dy} x2={373} y2={263} stroke="rgba(196,30,58,0.22)" strokeWidth={0.8}/>
          ))}
          {[0,17,34,51,68].map((dx,i)=>(
            <line key={`nv${i}`} x1={305+dx} y1={176} x2={305+dx} y2={263} stroke="rgba(196,30,58,0.16)" strokeWidth={0.8}/>
          ))}
          {/* Posts */}
          <line x1={305} y1={176} x2={305} y2={263} stroke="#C41E3A" strokeWidth={3.5} strokeLinecap="round"/>
          <line x1={373} y1={176} x2={373} y2={263} stroke="#C41E3A" strokeWidth={3.5} strokeLinecap="round"/>
          <line x1={305} y1={176} x2={373} y2={176} stroke="#C41E3A" strokeWidth={3.5} strokeLinecap="round"/>
          {/* Post glow */}
          <line x1={305} y1={176} x2={305} y2={263} stroke="rgba(196,30,58,0.3)" strokeWidth={7} strokeLinecap="round"/>
          <line x1={373} y1={176} x2={373} y2={263} stroke="rgba(196,30,58,0.3)" strokeWidth={7} strokeLinecap="round"/>
          <line x1={305} y1={176} x2={373} y2={176} stroke="rgba(196,30,58,0.3)" strokeWidth={7} strokeLinecap="round"/>
        </g>

        {/* Player — stick figure */}
        <g style={pStyle}>
          {/* Shadow under feet */}
          <ellipse cx={70} cy={264} rx={14} ry={3} fill="rgba(255,255,255,0.1)"/>
          {/* Head */}
          <circle cx={70} cy={185} r={13} stroke="white" strokeWidth={2} fill="rgba(255,255,255,0.07)"/>
          {/* Hair */}
          <path d="M59,179 Q70,173 81,179" stroke="white" strokeWidth={1.5} fill="none" strokeLinecap="round"/>
          {/* Eyes */}
          <circle cx={66} cy={184} r={1.8} fill="white"/>
          <circle cx={74} cy={184} r={1.8} fill="white"/>
          {/* Smile */}
          <path d="M65,191 Q70,195.5 75,191" stroke="white" strokeWidth={1.3} fill="none" strokeLinecap="round"/>
          {/* Body */}
          <line x1={70} y1={198} x2={70} y2={234} stroke="white" strokeWidth={2.2} strokeLinecap="round"/>
          {/* Jersey stripe */}
          <line x1={62} y1={208} x2={78} y2={208} stroke="rgba(196,30,58,0.7)" strokeWidth={1.2}/>
          {/* Arms */}
          <line x1={70} y1={210} x2={51} y2={226} stroke="white" strokeWidth={2} strokeLinecap="round"/>
          <line x1={70} y1={210} x2={89} y2={220} stroke="white" strokeWidth={2} strokeLinecap="round"/>
          {/* Shorts */}
          <line x1={56} y1={243} x2={84} y2={243} stroke="rgba(255,255,255,0.45)" strokeWidth={1.2}/>
          {/* Legs */}
          <line x1={70} y1={234} x2={57} y2={261} stroke="white" strokeWidth={2.2} strokeLinecap="round"/>
          <line x1={70} y1={234} x2={83} y2={261} stroke="white" strokeWidth={2.2} strokeLinecap="round"/>
          {/* Cleats */}
          <line x1={54} y1={261} x2={60} y2={261} stroke="white" strokeWidth={2.5} strokeLinecap="round"/>
          <line x1={80} y1={261} x2={86} y2={261} stroke="white" strokeWidth={2.5} strokeLinecap="round"/>
        </g>

        {/* Ball */}
        <g style={bStyle}>
          <circle cx={97} cy={252} r={10} stroke="white" strokeWidth={2} fill="rgba(255,255,255,0.07)"/>
          {/* Pentagon */}
          <path d="M97,243 L101.7,247.4 L99.9,252.8 L94.1,252.8 L92.3,247.4 Z" stroke="white" strokeWidth={1.1} fill="rgba(0,0,0,0.25)"/>
          {/* Seam lines */}
          <line x1={97} y1={242} x2={97} y2={244} stroke="white" strokeWidth={1}/>
          <line x1={102} y1={247} x2={104} y2={246} stroke="white" strokeWidth={1}/>
          <line x1={100} y1={253} x2={102} y2={255} stroke="white" strokeWidth={1}/>
          <line x1={94} y1={253} x2={92} y2={255} stroke="white" strokeWidth={1}/>
          <line x1={92} y1={247} x2={90} y2={246} stroke="white" strokeWidth={1}/>
        </g>

        {/* Celebration stars */}
        {anim==="success" && [[215,148],[248,134],[274,152],[238,168],[264,138]].map(([x,y],i)=>(
          <text key={i} x={x} y={y}
            style={{ fontSize:11, fill:"#F5A623", fontFamily:F,
              animation:`mgStarBurst ${0.7+i*0.09}s ease ${1.25+i*0.08}s both`,
              transformBox:"fill-box", transformOrigin:`${x}px ${y}px` }}>★</text>
        ))}

        {/* Outcome text */}
        {(anim==="success"||anim==="fail") && (
          <text x={200} y={110} textAnchor="middle"
            style={{
              ...txtStyle,
              fontSize: anim==="success" ? 26 : 19,
              fontWeight: 800,
              fill: anim==="success" ? "#F5A623" : "rgba(255,255,255,0.65)",
              fontFamily: F,
            }}>
            {anim==="success" ? "⚽ GOAL!" : "😅 Raté..."}
          </text>
        )}

        {/* YallaVamos watermark */}
        <text x={200} y={292} textAnchor="middle"
          style={{ fontSize:8, fill:"rgba(255,255,255,0.12)", fontFamily:F, letterSpacing:3, textTransform:"uppercase" }}>
          YALLAVAMOS 2030
        </text>
      </svg>
    </div>
  );
}

export default function LoginPage({ lang, onSkip }) {
  const t = T[lang] || T.fr;
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [animState, setAnimState] = useState("idle");
  const [focused, setFocused] = useState(null);
  const [isDesk, setIsDesk] = useState(typeof window !== "undefined" && window.innerWidth >= 768);
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
        if (err) { setError(err.message); setAnimState("fail"); setTimeout(()=>setAnimState("idle"),3200); }
        else { setAnimState("success"); }
      } else {
        const { error: err } = await supabase.auth.signUp({ email, password });
        if (err) { setError(err.message); setAnimState("fail"); setTimeout(()=>setAnimState("idle"),3200); }
        else { setInfo(t.checkEmail); setAnimState("success"); }
      }
    } catch {
      setError(t.authError);
      setAnimState("fail");
      setTimeout(()=>setAnimState("idle"),3200);
    } finally {
      setLoading(false);
    }
  }

  const inp = (field) => ({
    width:"100%", padding:"14px 18px", borderRadius:14,
    border:`1px solid ${focused===field ? "#C41E3A" : "rgba(255,255,255,0.1)"}`,
    background:"rgba(255,255,255,0.06)", color:"#FFF",
    fontSize:15, fontFamily:F, outline:"none", boxSizing:"border-box",
    direction:isRTL?"rtl":"ltr", transition:"border-color 0.2s",
  });

  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(135deg,#0a0a0f 0%,#121414 50%,#1a0a0a 100%)",
      display:"flex", fontFamily:F, direction:isRTL?"rtl":"ltr",
    }}>

      {/* Left panel — desktop animation */}
      {isDesk && (
        <div style={{
          flex:1, display:"flex", alignItems:"center", justifyContent:"center",
          minHeight:"100vh", padding:"40px",
          borderRight:"1px solid rgba(255,255,255,0.04)",
        }}>
          <div style={{ width:"100%", maxWidth:480, aspectRatio:"4/3" }}>
            <FootballerScene anim={animState}/>
          </div>
        </div>
      )}

      {/* Right panel — form */}
      <div style={{
        width: isDesk ? 460 : "100%",
        minHeight:"100vh",
        display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        padding: isDesk ? "48px 40px" : "24px 16px",
        flexShrink: 0,
      }}>

        {/* Mobile animation */}
        {!isDesk && (
          <div style={{ width:"100%", maxWidth:360, height:180, marginBottom:8 }}>
            <FootballerScene anim={animState}/>
          </div>
        )}

        {/* Card */}
        <div style={{
          width:"100%", maxWidth:420,
          background:"rgba(255,255,255,0.04)",
          border:"1px solid rgba(255,255,255,0.1)",
          borderRadius:24, padding:"36px 32px",
          backdropFilter:"blur(20px)",
          boxShadow:"0 32px 80px rgba(0,0,0,0.6)",
        }}>

          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:28 }}>
            <img src="/logo.webp" width={52} height={52} alt="MoundiGuide"
              style={{ borderRadius:"50%", objectFit:"cover", flexShrink:0 }}
              onError={e=>{ e.target.src="/logo.png"; }}/>
            <div>
              <div style={{ fontSize:22, fontWeight:800, lineHeight:1.15, fontFamily:F }}>
                <span style={{ color:"#C41E3A" }}>Moundi</span>
                <span style={{ color:"#FFF" }}> Guide</span>
              </div>
              <div style={{ color:"rgba(255,255,255,0.35)", fontSize:9, letterSpacing:2.5, textTransform:"uppercase", marginTop:2, fontFamily:F }}>
                Mondial 2030
              </div>
            </div>
          </div>

          {/* Tab switcher */}
          <div style={{
            display:"flex", gap:4,
            background:"rgba(255,255,255,0.06)",
            borderRadius:12, padding:4, marginBottom:24,
          }}>
            {["login","signup"].map(t2=>(
              <button key={t2} onClick={()=>{ setTab(t2); setError(""); setInfo(""); }}
                style={{
                  flex:1, padding:"10px 8px", borderRadius:10, border:"none",
                  cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:F,
                  transition:"all .2s",
                  background: tab===t2 ? "#C41E3A" : "transparent",
                  color: tab===t2 ? "#FFF" : "rgba(255,255,255,0.4)",
                  boxShadow: tab===t2 ? "0 4px 12px rgba(196,30,58,0.35)" : "none",
                }}>
                {t2==="login" ? t.login : t.signup}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
              placeholder={t.email} required aria-label={t.email}
              onFocus={()=>setFocused("email")} onBlur={()=>setFocused(null)}
              style={inp("email")} autoComplete="email"/>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
              placeholder={t.password} required aria-label={t.password}
              onFocus={()=>setFocused("pass")} onBlur={()=>setFocused(null)}
              style={inp("pass")} autoComplete="current-password"/>

            {error && (
              <div style={{
                background:"rgba(196,30,58,0.15)", border:"1px solid rgba(196,30,58,0.3)",
                borderRadius:8, padding:"8px 12px",
                color:"#FF6B6B", fontSize:13, fontFamily:F,
              }}>
                {error}
              </div>
            )}
            {info && (
              <div style={{
                background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.3)",
                borderRadius:8, padding:"8px 12px",
                color:"#4ADE80", fontSize:13, fontFamily:F,
              }}>
                {info}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{
                height:50, borderRadius:14, border:"none",
                cursor: loading ? "not-allowed" : "pointer",
                background: loading
                  ? "rgba(80,80,80,0.4)"
                  : "linear-gradient(135deg,#C41E3A 0%,#8B0000 100%)",
                color:"#FFF", fontSize:16, fontWeight:700, fontFamily:F,
                marginTop:4,
                boxShadow: loading ? "none" : "0 8px 24px rgba(196,30,58,0.4)",
                transition:"all 0.2s",
              }}>
              {loading ? t.submitting : (tab==="login" ? t.login : t.signup)}
            </button>
          </form>

          {/* Skip */}
          <button onClick={onSkip}
            style={{
              marginTop:20, width:"100%", background:"none", border:"none",
              cursor:"pointer", color:"rgba(255,255,255,0.35)", fontSize:13,
              fontFamily:F, padding:"4px", textAlign:"center",
            }}>
            {t.continueWithout} →
          </button>
        </div>
      </div>
    </div>
  );
}
