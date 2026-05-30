import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabase.js";
import { TEAM_DATA, TEAM_ISO, PLAYERS_IMG, TRANSLATIONS, LANGUAGES, BR, F } from "../constants.js";

function Toggle({ on, onToggle }) {
  return (
    <div onClick={onToggle} style={{
      width:40,height:22,borderRadius:11,cursor:"pointer",flexShrink:0,
      background:on?"#C41E3A":"#444",transition:"background 0.2s",position:"relative",
    }}>
      <div style={{position:"absolute",top:2,left:on?18:2,width:18,height:18,borderRadius:"50%",background:"#FFF",transition:"left 0.2s"}}/>
    </div>
  );
}

export default function ProfilePage({ user, lang, setLang, onLogout, onSave, onBack, isDesk, setUserTeam, setUserAvatar }) {
  const T = TRANSLATIONS[lang] || TRANSLATIONS.fr;
  const isRTL = lang === "ar";

  const avatarInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarMsg, setAvatarMsg] = useState("");
  const [pendingAvatar, setPendingAvatar] = useState(null);
  const [favoriteTeam, setFavoriteTeam] = useState(null);
  const [showTeamGrid, setShowTeamGrid] = useState(false);
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [memberSince, setMemberSince] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const [notifMatches, setNotifMatches] = useState(()=>localStorage.getItem("moundiguide_notif_matches")==="true");
  const [notifLive,    setNotifLive]    = useState(()=>localStorage.getItem("moundiguide_notif_live")==="true");
  const [notifNews,    setNotifNews]    = useState(()=>localStorage.getItem("moundiguide_notif_news")==="true");

  useEffect(()=>{
    if(!user)return;
    setMemberSince(new Date(user.created_at||Date.now()).toLocaleDateString(
      lang==="ar"?"ar-MA":lang,{year:"numeric",month:"long"}
    ));
    supabase.from("profiles").select("*").eq("id",user.id).single().then(({data})=>{
      if(data?.favorite_team){
        setFavoriteTeam(data.favorite_team);
        if(setUserTeam) setUserTeam({t:data.favorite_team,f:TEAM_DATA[data.favorite_team]?.flag||""});
        localStorage.setItem("userTeam",JSON.stringify({t:data.favorite_team,f:TEAM_DATA[data.favorite_team]?.flag||""}));
      }
      if(data?.username) setUsername(data.username);
      else setUsername(user.email?.split("@")[0]||"");
      if(data?.first_name) setFirstName(data.first_name);
      if(data?.last_name) setLastName(data.last_name);
      if(data?.avatar_url) setAvatarUrl(data.avatar_url);
    });
  },[user]);

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if(!file||!user) return;
    setAvatarPreview(URL.createObjectURL(file));
    setPendingAvatar(file);
    e.target.value = "";
  }

  async function confirmAvatarUpload() {
    if(!pendingAvatar||!user) return;
    setSaving(true);
    try {
      await supabase.storage.from("avatars").upload(`${user.id}/avatar.jpg`, pendingAvatar, {upsert:true,contentType:pendingAvatar.type});
      const { data:{ publicUrl } } = supabase.storage.from("avatars").getPublicUrl(`${user.id}/avatar.jpg`);
      setAvatarUrl(publicUrl);
      setPendingAvatar(null);
      if(setUserAvatar) setUserAvatar(publicUrl);
      localStorage.setItem("moundiguide_avatar", publicUrl);
      setAvatarMsg(T.photoUpdated||"Photo mise à jour ✓");
      setTimeout(()=>setAvatarMsg(""),2500);
    } catch { /* ignore */ }
    setSaving(false);
  }

  function cancelAvatar() {
    setAvatarPreview(null);
    setPendingAvatar(null);
    if(avatarInputRef.current) avatarInputRef.current.value = "";
  }

  function getTeamCode(teamName) {
    const iso = TEAM_ISO[teamName];
    if(!iso) return "MA";
    return iso.startsWith("gb-") ? iso.slice(3,5).toUpperCase() : iso.slice(0,2).toUpperCase();
  }

  const teamImg = favoriteTeam ? (PLAYERS_IMG[getTeamCode(favoriteTeam)]||"/players-default.png") : "/players-default.png";
  const teams = Object.entries(TEAM_DATA);
  const displayAvatar = avatarPreview || avatarUrl;

  async function saveProfile(teamOverride) {
    if(!user) return;
    const teamToSave = teamOverride ?? favoriteTeam;
    setSaving(true); setSavedMsg("");
    await supabase.from("profiles").upsert({
      id:user.id, favorite_team:teamToSave, username,
      first_name:firstName, last_name:lastName,
    });
    if(teamToSave){
      const teamObj = {t:teamToSave, f:TEAM_DATA[teamToSave]?.flag||""};
      localStorage.setItem("userTeam", JSON.stringify(teamObj));
      if(setUserTeam) setUserTeam(teamObj);
    }
    setSaving(false); setSavedMsg(T.saved||"Enregistré !");
    setTimeout(()=>setSavedMsg(""),2500);
  }

  function toggle(key, val, setVal) {
    const next = !val;
    setVal(next);
    localStorage.setItem(key, String(next));
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    onLogout();
  }

  async function handleChangePassword() {
    if(!user?.email) return;
    await supabase.auth.resetPasswordForEmail(user.email);
    setPwMsg(T.emailSent||"📧 Email envoyé");
    setTimeout(()=>setPwMsg(""),3000);
  }

  const sec = {background:"rgba(255,255,255,0.04)",borderRadius:20,padding:20,marginBottom:16};
  const sectionTitle = {fontFamily:F,fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:1.5,marginBottom:16};
  const inpStyle = {background:"transparent",border:"none",outline:"none",fontFamily:F,color:"#FFF",padding:0,cursor:"text",width:"100%"};

  return (
    <div dir={isRTL?"rtl":"ltr"} style={{minHeight:"100vh",background:"#121414",fontFamily:F,paddingBottom:80}}>
      <div style={{maxWidth:680,margin:"0 auto",padding:isDesk?"32px 24px":"16px 16px"}}>

        {/* Back button */}
        <button onClick={onBack||onSave}
          style={{display:"flex",alignItems:"center",gap:8,padding:"12px 0 20px 0",
            cursor:"pointer",color:"rgba(255,255,255,0.7)",fontSize:15,fontFamily:F,
            background:"none",border:"none",width:"fit-content"}}>
          <span style={{fontSize:18}}>{isRTL?"→":"←"}</span>
          <span>{T.navHome||"Accueil"}</span>
        </button>

        {/* ── HEADER ── */}
        <div style={{display:"flex",alignItems:"flex-start",gap:16,marginBottom:28}}>

          {/* CHANGE 1: Avatar with upload */}
          <input type="file" accept="image/*" ref={avatarInputRef} style={{display:"none"}}
            onChange={handleAvatarChange}/>
          <div onClick={()=>avatarInputRef.current?.click()}
            style={{position:"relative",cursor:"pointer"}}>
            <div style={{width:80,height:80,borderRadius:"50%",
              overflow:"hidden",position:"relative",flexShrink:0,
              background:displayAvatar?"transparent":"#C41E3A",
              color:"#FFF",fontSize:32,fontWeight:700,
              display:"flex",alignItems:"center",justifyContent:"center",
              boxShadow:"0 4px 20px rgba(196,30,58,0.5)"}}>
              {displayAvatar&&(
                <img src={avatarPreview ? avatarPreview : `${avatarUrl}?t=${Date.now()}`} alt="avatar"
                  style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"50%",display:"block"}}
                  onError={()=>setAvatarPreview(null)}/>
              )}
              <span style={{display:displayAvatar?"none":undefined}}>
                {user?.email?.[0]?.toUpperCase()||"U"}
              </span>
            </div>
            {/* Camera icon overlay */}
            <div style={{position:"absolute",bottom:0,[isRTL?"left":"right"]:0,
              width:24,height:24,borderRadius:"50%",background:"#C41E3A",
              border:"2px solid #121414",display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:11,zIndex:2}}>
              📷
            </div>
          </div>

          {/* Header: read-only display */}
          <div style={{minWidth:0,flex:1}}>
            {(firstName||lastName)&&(
              <div style={{fontFamily:F,fontSize:20,fontWeight:700,color:"#FFF",marginBottom:4,lineHeight:1.2}}>
                {[firstName,lastName].filter(Boolean).join(" ")}
              </div>
            )}
            <div style={{fontFamily:F,fontSize:14,color:"rgba(255,255,255,0.5)",marginBottom:4}}>
              @{username||user?.email?.split("@")[0]||""}
            </div>
            {memberSince&&(
              <div style={{fontFamily:F,fontSize:12,color:"rgba(255,255,255,0.3)"}}>
                {T.memberSince||"Membre depuis"} {memberSince}
              </div>
            )}
          </div>
        </div>

        {/* Pending avatar confirm / success */}
        {pendingAvatar&&(
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
            <button onClick={confirmAvatarUpload}
              style={{background:"#C41E3A",color:"#FFF",borderRadius:20,
                padding:"8px 20px",fontSize:14,fontWeight:600,
                border:"none",cursor:"pointer",fontFamily:F}}>
              {T.saveAvatar||"Enregistrer la photo"}
            </button>
            <button onClick={cancelAvatar}
              style={{background:"none",border:"none",cursor:"pointer",
                color:"rgba(255,255,255,0.5)",fontFamily:F,fontSize:14}}>
              {T.cancel||"Annuler"}
            </button>
          </div>
        )}
        {avatarMsg&&<div style={{fontFamily:F,fontSize:11,color:"#4ADE80",marginBottom:16}}>{avatarMsg}</div>}

        {/* ── SECTION: Informations personnelles ── */}
        <div style={sec}>
          <div style={sectionTitle}>{T.personalInfo||"Informations personnelles"}</div>
          <input value={firstName} onChange={e=>setFirstName(e.target.value)}
            placeholder={T.firstName||"Prénom"}
            style={{width:"100%",background:"rgba(255,255,255,0.07)",
              border:"1px solid rgba(255,255,255,0.12)",borderRadius:12,
              padding:"12px 16px",color:"#FFF",fontSize:15,marginBottom:12,
              outline:"none",fontFamily:"Outfit, sans-serif"}}/>
          <input value={lastName} onChange={e=>setLastName(e.target.value)}
            placeholder={T.lastName||"Nom de famille"}
            style={{width:"100%",background:"rgba(255,255,255,0.07)",
              border:"1px solid rgba(255,255,255,0.12)",borderRadius:12,
              padding:"12px 16px",color:"#FFF",fontSize:15,marginBottom:12,
              outline:"none",fontFamily:"Outfit, sans-serif"}}/>
          <input value={username} onChange={e=>setUsername(e.target.value)}
            placeholder={T.username||"Nom d'utilisateur"}
            style={{width:"100%",background:"rgba(255,255,255,0.07)",
              border:"1px solid rgba(255,255,255,0.12)",borderRadius:12,
              padding:"12px 16px",color:"#FFF",fontSize:15,marginBottom:12,
              outline:"none",fontFamily:"Outfit, sans-serif"}}/>
          {/* Email — read-only */}
          <div style={{marginBottom:12}}>
            <div style={{fontFamily:F,fontSize:12,fontWeight:700,color:"rgba(255,255,255,0.4)",
              textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>
              {T.email||"Email"}
            </div>
            <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",
              borderRadius:12,padding:"12px 16px",color:"rgba(255,255,255,0.5)",
              fontSize:15,display:"flex",alignItems:"center",gap:8,cursor:"default",fontFamily:F}}>
              🔒 {user?.email}
            </div>
          </div>
          <button onClick={()=>saveProfile()} disabled={saving}
            style={{width:"100%",padding:"13px",borderRadius:12,border:"none",
              background:saving?"#444":"linear-gradient(135deg,#C41E3A,#A01028)",
              color:"#FFF",fontFamily:F,fontSize:14,fontWeight:700,
              cursor:saving?"not-allowed":"pointer",
              boxShadow:"0 4px 16px rgba(196,30,58,0.3)"}}>
            {saving?"…":(T.saveChanges||"Enregistrer les modifications")}
          </button>
          {savedMsg&&<div style={{marginTop:8,fontFamily:F,fontSize:12,color:"#4ADE80",textAlign:"center"}}>{savedMsg}</div>}
        </div>

        {/* ── SECTION A: Équipe favorite ── */}
        <div style={sec}>
          <div style={sectionTitle}>{T.favoriteTeam||"Équipe favorite"}</div>

          <div style={{position:"relative",height:160,borderRadius:14,overflow:"hidden",marginBottom:14}}>
            <img src={teamImg} alt={favoriteTeam||""} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 10%"}}
              onError={e=>{e.target.onerror=null;e.target.src="/players-default.png";}}/>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 30%,rgba(0,0,0,0.85))"}}/>
            {favoriteTeam&&(
              <div style={{position:"absolute",bottom:12,[isRTL?"right":"left"]:14,display:"flex",alignItems:"center",gap:8}}>
                <img src={`https://flagcdn.com/48x36/${(TEAM_ISO[favoriteTeam]||"ma").toLowerCase()}.png`}
                  alt={favoriteTeam} style={{width:32,height:24,objectFit:"cover",borderRadius:3}}
                  onError={e=>{e.target.style.display="none";}}/>
                <span style={{fontFamily:"'Outfit',sans-serif",fontSize:18,fontWeight:800,color:"#FFF"}}>{favoriteTeam}</span>
              </div>
            )}
          </div>

          <button onClick={()=>setShowTeamGrid(p=>!p)}
            style={{width:"100%",padding:"10px",borderRadius:10,border:"1px solid rgba(255,255,255,0.15)",
              background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.8)",fontFamily:F,
              fontSize:13,cursor:"pointer",marginBottom:showTeamGrid?14:0}}>
            {showTeamGrid?"▲ ":"▼ "}{T.changeTeam||"Changer d'équipe"}
          </button>

          {showTeamGrid&&(
            <div style={{display:"grid",gridTemplateColumns:`repeat(${isDesk?6:4},1fr)`,gap:8,marginTop:8}}>
              {teams.map(([name,td])=>{
                const isSelected = favoriteTeam===name;
                const iso = TEAM_ISO[name]||"xx";
                return(
                  <button key={name}
                    onClick={()=>{setFavoriteTeam(name);setShowTeamGrid(false);saveProfile(name);}}
                    style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,
                      padding:"8px 4px",borderRadius:10,cursor:"pointer",position:"relative",
                      border:`2px solid ${isSelected?td.colors[0]:"rgba(255,255,255,0.08)"}`,
                      background:isSelected?`${td.colors[0]}22`:"rgba(255,255,255,0.04)",
                      transition:"all .15s"}}>
                    {isSelected&&<span style={{position:"absolute",top:4,right:4,fontSize:9,color:td.colors[0]}}>✓</span>}
                    <img src={`https://flagcdn.com/48x36/${iso.toLowerCase()}.png`}
                      alt={name} style={{width:28,height:"auto",objectFit:"contain",borderRadius:2}}
                      onError={e=>{e.target.style.display="none";}}/>
                    <span style={{fontFamily:F,fontSize:7,color:isSelected?td.colors[0]:"rgba(255,255,255,0.5)",
                      textAlign:"center",lineHeight:1.2,wordBreak:"break-word"}}>{name}</span>
                  </button>
                );
              })}
            </div>
          )}

          {savedMsg&&<div style={{marginTop:10,fontFamily:F,fontSize:12,color:"#4ADE80",textAlign:"center"}}>{savedMsg}</div>}
        </div>

        {/* ── SECTION B: Notifications ── */}
        <div style={sec}>
          <div style={sectionTitle}>{T.notifications||"Notifications"}</div>
          {[
            {label:T.matchAlerts||"Alertes matchs",    key:"moundiguide_notif_matches",val:notifMatches,set:setNotifMatches},
            {label:T.liveScores||"Résultats en direct", key:"moundiguide_notif_live",   val:notifLive,   set:setNotifLive},
            {label:T.teamNews||"Actualités équipe",     key:"moundiguide_notif_news",   val:notifNews,   set:setNotifNews},
          ].map(({label,key,val,set},i,arr)=>(
            <div key={key} style={{display:"flex",alignItems:"center",justifyContent:"space-between",
              paddingBottom:i<arr.length-1?12:0,marginBottom:i<arr.length-1?12:0,
              borderBottom:i<arr.length-1?"1px solid rgba(255,255,255,0.06)":"none"}}>
              <span style={{fontFamily:F,fontSize:14,color:"rgba(255,255,255,0.85)"}}>{label}</span>
              <Toggle on={val} onToggle={()=>toggle(key,val,set)}/>
            </div>
          ))}
        </div>

        {/* ── SECTION C: Langue ── */}
        <div style={sec}>
          <div style={sectionTitle}>{T.language||"Langue"}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {LANGUAGES.map(l=>{
              const active = lang===l.code;
              return(
                <button key={l.code}
                  onClick={()=>{if(setLang)setLang(l.code);localStorage.setItem("lang",l.code);}}
                  style={{padding:"8px 16px",borderRadius:20,border:"none",cursor:"pointer",
                    fontFamily:F,fontSize:14,fontWeight:active?700:500,
                    background:active?"#C41E3A":"rgba(255,255,255,0.08)",
                    color:active?"#FFF":"rgba(255,255,255,0.7)",transition:"all .15s"}}>
                  {l.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── SECTION D: Compte ── */}
        <div style={sec}>
          <div style={sectionTitle}>{T.account||"Compte"}</div>

          <button onClick={handleChangePassword}
            style={{width:"100%",padding:"12px",borderRadius:10,border:"1px solid rgba(255,255,255,0.15)",
              background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.8)",fontFamily:F,
              fontSize:13,cursor:"pointer",marginBottom:10,textAlign:"center"}}>
            🔑 {T.changePassword||"Changer le mot de passe"}
          </button>
          {pwMsg&&<div style={{fontFamily:F,fontSize:12,color:"#4ADE80",textAlign:"center",marginBottom:10}}>{pwMsg}</div>}

          {!deleteConfirm?(
            <button onClick={()=>setDeleteConfirm(true)}
              style={{width:"100%",padding:"12px",borderRadius:10,border:"1px solid rgba(196,30,58,0.4)",
                background:"transparent",color:"rgba(196,30,58,0.8)",fontFamily:F,
                fontSize:13,cursor:"pointer",marginBottom:10,textAlign:"center"}}>
              🗑 {T.deleteAccount||"Supprimer le compte"}
            </button>
          ):(
            <div style={{background:"rgba(196,30,58,0.08)",borderRadius:10,padding:14,
              border:"1px solid rgba(196,30,58,0.3)",marginBottom:10}}>
              <div style={{fontFamily:F,fontSize:13,color:"rgba(255,255,255,0.7)",marginBottom:12,textAlign:"center"}}>
                {T.contactSupport||"Contactez le support"}
              </div>
              <button onClick={()=>setDeleteConfirm(false)}
                style={{width:"100%",padding:"8px",borderRadius:8,border:"1px solid rgba(255,255,255,0.2)",
                  background:"transparent",color:"rgba(255,255,255,0.6)",fontFamily:F,fontSize:12,cursor:"pointer"}}>
                {T.cancel||"Annuler"}
              </button>
            </div>
          )}

          {/* Sign Out — full-width red at bottom of Compte */}
          <button onClick={handleLogout}
            style={{width:"100%",height:48,borderRadius:12,border:"none",cursor:"pointer",
              background:"#C41E3A",color:"#FFF",fontFamily:F,fontSize:15,fontWeight:700,
              boxShadow:"0 4px 16px rgba(196,30,58,0.4)"}}>
            {T.logout||"Se déconnecter"}
          </button>
        </div>


      </div>
    </div>
  );
}
