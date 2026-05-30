import { useState } from "react";
import { supabase } from "../supabase.js";
import { BR, F } from "../constants.js";
import MoundiLogo from "../components/MoundiLogo.jsx";

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

export default function LoginPage({ lang, onSkip }) {
  const t = T[lang] || T.fr;
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const isRTL = lang === "ar";

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setInfo(""); setLoading(true);
    try {
      if (tab === "login") {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) setError(err.message);
      } else {
        const { error: err } = await supabase.auth.signUp({ email, password });
        if (err) setError(err.message);
        else setInfo(t.checkEmail);
      }
    } catch(err) {
      setError(t.authError);
    } finally {
      setLoading(false);
    }
  }

  const inp = {
    width:"100%",padding:"12px 14px",borderRadius:10,border:"1px solid rgba(255,255,255,0.15)",
    background:"rgba(255,255,255,0.08)",color:"#FFF",fontSize:14,fontFamily:F,outline:"none",
    boxSizing:"border-box",direction:isRTL?"rtl":"ltr",
  };

  return (
    <div style={{minHeight:"100vh",background:"#121414",display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",padding:"24px",fontFamily:F}}>

      {/* Logo */}
      <div style={{marginBottom:32}}>
        <MoundiLogo size={48} textColor="#FFF" showSubtitle={true} textSize={20}/>
      </div>

      {/* Card */}
      <div style={{width:"100%",maxWidth:380,background:"rgba(255,255,255,0.05)",
        backdropFilter:"blur(16px)",borderRadius:20,border:"1px solid rgba(255,255,255,0.1)",
        padding:"32px 28px",boxShadow:"0 24px 64px rgba(0,0,0,0.5)"}}>

        {/* Tabs */}
        <div style={{display:"flex",gap:4,background:"rgba(255,255,255,0.08)",
          borderRadius:10,padding:4,marginBottom:28}}>
          {["login","signup"].map(t2=>(
            <button key={t2} onClick={()=>{setTab(t2);setError("");setInfo("");}}
              style={{flex:1,padding:"9px",borderRadius:8,border:"none",cursor:"pointer",
                fontSize:13,fontWeight:600,fontFamily:F,transition:"all .2s",
                background:tab===t2?"#C41E3A":"transparent",
                color:tab===t2?"#FFF":"rgba(255,255,255,0.5)"}}>
              {t2==="login"?t.login:t.signup}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:14}}>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
            placeholder={t.email} required style={inp} autoComplete="email"/>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
            placeholder={t.password} required style={inp} autoComplete="current-password"/>

          {error&&<div style={{color:"#FF6B6B",fontSize:13,textAlign:"center"}}>{error}</div>}
          {info&&<div style={{color:"#4ADE80",fontSize:13,textAlign:"center"}}>{info}</div>}

          <button type="submit" disabled={loading}
            style={{padding:"13px",borderRadius:12,border:"none",cursor:loading?"not-allowed":"pointer",
              background:loading?"#666":"linear-gradient(135deg,#C41E3A,#A01028)",
              color:"#FFF",fontSize:15,fontWeight:700,fontFamily:F,marginTop:4,
              boxShadow:"0 4px 16px rgba(196,30,58,0.4)"}}>
            {loading?t.submitting:(tab==="login"?t.login:t.signup)}
          </button>
        </form>

        {/* Skip */}
        <button onClick={onSkip}
          style={{marginTop:20,width:"100%",background:"none",border:"none",cursor:"pointer",
            color:"rgba(255,255,255,0.45)",fontSize:12,fontFamily:F,textDecoration:"underline",
            textAlign:"center",padding:"4px"}}>
          {t.continueWithout}
        </button>
      </div>
    </div>
  );
}
