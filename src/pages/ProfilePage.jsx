import { useState, useEffect } from "react";
import { supabase } from "../supabase.js";
import { TEAM_DATA, TEAM_ISO, PLAYERS_IMG, BR, F } from "../constants.js";

const T = {
  fr:{ title:"Mon Profil", favTeam:"Équipe favorite", save:"Enregistrer", logout:"Déconnexion",
       saving:"Sauvegarde…", saved:"Profil enregistré !", loggedAs:"Connecté en tant que" },
  en:{ title:"My Profile", favTeam:"Favorite Team", save:"Save", logout:"Sign Out",
       saving:"Saving…", saved:"Profile saved!", loggedAs:"Signed in as" },
  ar:{ title:"ملفي الشخصي", favTeam:"الفريق المفضل", save:"حفظ", logout:"تسجيل الخروج",
       saving:"جارٍ الحفظ…", saved:"تم حفظ الملف!", loggedAs:"مسجل دخول بـ" },
  es:{ title:"Mi Perfil", favTeam:"Equipo favorito", save:"Guardar", logout:"Salir",
       saving:"Guardando…", saved:"¡Perfil guardado!", loggedAs:"Conectado como" },
  pt:{ title:"Meu Perfil", favTeam:"Equipa favorita", save:"Guardar", logout:"Sair",
       saving:"Salvando…", saved:"Perfil salvo!", loggedAs:"Conectado como" },
  zh:{ title:"我的资料", favTeam:"最爱球队", save:"保存", logout:"退出",
       saving:"保存中…", saved:"资料已保存！", loggedAs:"已登录为" },
};

export default function ProfilePage({ user, lang, onSave, onLogout, isDesk }) {
  const t = T[lang] || T.fr;
  const [favoriteTeam, setFavoriteTeam] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const teams = Object.entries(TEAM_DATA);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("favorite_team").eq("id", user.id).single()
      .then(({ data }) => { if (data?.favorite_team) setFavoriteTeam(data.favorite_team); });
  }, [user]);

  async function handleSave() {
    if (!favoriteTeam) return;
    setSaving(true); setSaved(false);
    const iso = TEAM_ISO[favoriteTeam];
    const teamCode = iso ? (iso.startsWith("gb-") ? iso.slice(3,5).toUpperCase() : iso.slice(0,2).toUpperCase()) : "MA";
    await supabase.from("profiles").upsert({
      id: user.id,
      favorite_team: favoriteTeam,
      username: user.email?.split("@")[0] || "fan",
    });
    localStorage.setItem("userTeam", JSON.stringify({ t: favoriteTeam, f: TEAM_DATA[favoriteTeam]?.flag || "" }));
    setSaving(false); setSaved(true);
    setTimeout(() => { onSave(); }, 900);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    onLogout();
  }

  const teamImg = favoriteTeam ? (PLAYERS_IMG[(() => {
    const iso = TEAM_ISO[favoriteTeam];
    return iso ? (iso.startsWith("gb-") ? iso.slice(3,5).toUpperCase() : iso.slice(0,2).toUpperCase()) : "MA";
  })()] || "/players-default.png") : "/players-default.png";

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#1a0005 0%,#07091A 60%,#001a0a 100%)",
      display:"flex",flexDirection:"column",padding:"0",fontFamily:F}}>

      {/* Header */}
      <div style={{padding:"20px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",
        borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
        <div>
          <div style={{fontFamily:"'Outfit',sans-serif",fontSize:20,fontWeight:800,color:"#FFF"}}>{t.title}</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.45)",marginTop:2}}>{t.loggedAs} {user?.email}</div>
        </div>
        <button onClick={handleLogout}
          style={{padding:"7px 16px",borderRadius:8,border:"1px solid rgba(255,255,255,0.2)",
            background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.7)",
            fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:F}}>
          {t.logout}
        </button>
      </div>

      {/* Team banner */}
      <div style={{position:"relative",height:180,overflow:"hidden",flexShrink:0}}>
        <img src={teamImg} alt={favoriteTeam||""}
          style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 10%"}}
          onError={e=>{e.target.onerror=null;e.target.src="/players-default.png";}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 30%,#07091A 100%)"}}/>
        {favoriteTeam&&(
          <div style={{position:"absolute",bottom:12,left:20,display:"flex",alignItems:"center",gap:10}}>
            <img src={`https://flagcdn.com/48x36/${(TEAM_ISO[favoriteTeam]||"ma").toLowerCase()}.png`}
              alt={favoriteTeam} style={{width:40,height:30,objectFit:"cover",borderRadius:4}}
              onError={e=>{e.target.style.display="none";}}/>
            <div style={{fontFamily:"'Outfit',sans-serif",fontSize:22,fontWeight:800,color:"#FFF"}}>
              {favoriteTeam}
            </div>
          </div>
        )}
      </div>

      {/* Team selector */}
      <div style={{flex:1,overflowY:"auto",padding:"16px 16px 100px"}}>
        <div style={{fontFamily:F,fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.6)",
          textTransform:"uppercase",letterSpacing:1.5,marginBottom:14}}>
          {t.favTeam}
        </div>
        <div style={{display:"grid",gridTemplateColumns:`repeat(${isDesk?8:5},1fr)`,gap:8}}>
          {teams.map(([name, td]) => {
            const isSelected = favoriteTeam === name;
            const iso = TEAM_ISO[name] || "xx";
            return (
              <button key={name} onClick={() => { setFavoriteTeam(name); setSaved(false); }}
                style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,
                  padding:"10px 4px",borderRadius:12,cursor:"pointer",transition:"all .15s",
                  border:`2px solid ${isSelected ? td.colors[0] : "rgba(255,255,255,0.1)"}`,
                  background:isSelected ? `${td.colors[0]}22` : "rgba(255,255,255,0.05)",
                  boxShadow:isSelected ? `0 0 16px ${td.colors[0]}55` : "none"}}>
                <img src={`https://flagcdn.com/48x36/${iso.toLowerCase()}.png`}
                  alt={name} style={{width:isDesk?36:28,height:"auto",objectFit:"contain",borderRadius:3}}
                  onError={e=>{e.target.style.display="none";}}/>
                <span style={{fontFamily:F,fontSize:isDesk?8:6,fontWeight:isSelected?700:400,
                  color:isSelected?td.colors[0]:"rgba(255,255,255,0.5)",
                  textAlign:"center",lineHeight:1.2,wordBreak:"break-word"}}>
                  {name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Save button */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,
        padding:"16px 20px",background:"rgba(7,9,26,0.95)",backdropFilter:"blur(12px)",
        borderTop:"1px solid rgba(255,255,255,0.08)"}}>
        <button onClick={handleSave} disabled={!favoriteTeam||saving}
          style={{width:"100%",padding:"14px",borderRadius:12,border:"none",
            cursor:!favoriteTeam||saving?"not-allowed":"pointer",fontFamily:F,
            fontSize:15,fontWeight:700,color:"#FFF",transition:"all .2s",
            background:saved?"#00913F":(!favoriteTeam||saving)?"#444":`linear-gradient(135deg,#C41E3A,#A01028)`,
            boxShadow:favoriteTeam&&!saving?"0 4px 16px rgba(196,30,58,0.4)":"none"}}>
          {saved ? "✓ "+t.saved : saving ? t.saving : t.save}
        </button>
      </div>
    </div>
  );
}
