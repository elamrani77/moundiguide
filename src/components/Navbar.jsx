import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TRANSLATIONS, BR, TEAM_DATA, TEAM_ACCENT, TEAM_ISO, F } from "../constants.js";
import MoundiLogo from "./MoundiLogo.jsx";

function Navbar({page, setPage, scrolled, C, lang, curLang, showLang, setShowLang, isDesk, selectedTeam, onPickTeam, setShowTeamSheet, user, avatarUrl}){
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(()=>{
    if(!selectedTeam)return;
    const iso=(TEAM_ISO[selectedTeam.t]||"ma").toLowerCase();
    const link=document.createElement("link");
    link.rel="preload";link.as="image";
    link.href=`https://flagcdn.com/24x18/${iso}.png`;
    document.head.appendChild(link);
    return()=>{if(document.head.contains(link))document.head.removeChild(link);};
  },[selectedTeam?.t]);
  const [notifGranted,setNotifGranted]=useState(
    typeof Notification!=="undefined"&&Notification.permission==="granted"
  );
  async function handleNotifBell(){
    if(notifGranted)return;
    if(!("Notification" in window))return;
    const perm=await Notification.requestPermission();
    if(perm==="granted"){
      setNotifGranted(true);
      localStorage.setItem("moundiNotif","true");
      new Notification("MoundiGuide 🏆",{
        body:"Notifications activées ! Vous recevrez des alertes avant les matchs.",
        icon:"/logo.png",badge:"/logo.png",
      });
    }
  }
  const T = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const navBg = "#FFFFFF";
  const linkColor = "#374151";

  const NavLink = ({id, label}) => {
    const active = page === id;
    return(
      <button onClick={()=>{setPage(id);setMenuOpen(false);}}
        style={{background:"none",border:"none",cursor:"pointer",fontFamily:F,fontSize:14,fontWeight:active?600:400,
          color:active?"#C8102E":linkColor,
          padding:"6px 4px",position:"relative",transition:"all .2s",letterSpacing:0.3}}>
        {label}
        {active&&<div style={{position:"absolute",bottom:-2,left:0,right:0,height:2,background:"#C8102E",borderRadius:2}}/>}
      </button>
    );
  };

  return(
    <motion.nav
      initial={{opacity:0,y:-24}}
      animate={{opacity:1,y:0}}
      transition={{duration:0.6,ease:"easeOut"}}
      style={{position:"fixed",top:0,left:0,right:0,zIndex:1000,background:navBg,backdropFilter:"blur(12px)",
      borderBottom:"1px solid #E5E7EB",padding:"0 24px"}}>
      <div style={{maxWidth:1280,margin:"0 auto",height:isDesk?64:52,display:"flex",alignItems:"center",justifyContent:"space-between"}}>

        {/* Logo */}
        <div onClick={()=>setPage("home")} style={{cursor:"pointer"}}>
          <MoundiLogo size={isDesk?52:32} textColor={BR.red} showSubtitle={isDesk} textSize={isDesk?18:15}/>
        </div>

        {/* Desktop nav */}
        {isDesk?(
          <div style={{display:"flex",alignItems:"center",gap:28}}>
            <NavLink id="home"     label={T.navHome}/>
            <NavLink id="ticket"   label={T.navTicket}/>
            <NavLink id="schedule" label={T.navSchedule}/>

            {/* Divider */}
            <div style={{width:1,height:20,background:"#E5E7EB"}}/>

            {/* Desktop right: profile only */}
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              {/* Profile circle */}
              <button onClick={()=>setPage(user?"profile":"login")}
                title={user?.email||"Se connecter"}
                style={{width:36,height:36,borderRadius:"50%",border:"none",cursor:"pointer",
                  background:avatarUrl?"transparent":"#C41E3A",color:"#FFF",fontWeight:700,fontSize:14,fontFamily:F,
                  display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
                  overflow:"hidden",
                  boxShadow:"0 2px 8px rgba(196,30,58,0.4)"}}>
                {avatarUrl
                  ?<img src={`${avatarUrl}?t=${Date.now()}`} alt="avatar"
                      style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"50%",display:"block"}}
                      onError={e=>{e.target.style.display="none";}}/>
                  :(user?user.email?.[0]?.toUpperCase()||"U":"👤")}
              </button>
            </div>
          </div>
        ):(
          /* Mobile right side: hamburger only */
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {/* Hamburger */}
            <button onClick={()=>setMenuOpen(p=>!p)}
              aria-label={menuOpen?"Fermer le menu":"Ouvrir le menu"}
              style={{background:"none",border:`1px solid ${C.bdr}`,
                borderRadius:8,width:36,height:36,cursor:"pointer",color:linkColor,fontSize:18,
                display:"flex",alignItems:"center",justifyContent:"center"}}>
              {menuOpen?"✕":"☰"}
            </button>
          </div>
        )}
      </div>

      {/* Mobile dropdown menu */}
      {!isDesk&&menuOpen&&(
        <div style={{background:"rgba(255,255,255,0.99)",
          borderTop:`1px solid ${C.bdr}`,padding:"12px 20px 20px",animation:"slideDown .2s ease"}}>

          {/* Profile row */}
          {user?(
            <div onClick={()=>{setPage("profile");setMenuOpen(false);}}
              style={{display:"flex",alignItems:"center",gap:12,padding:16,cursor:"pointer",
                background:"rgba(196,30,58,0.06)",borderRadius:12,
                marginBottom:12,border:"1px solid rgba(196,30,58,0.15)"}}>
              <div style={{width:40,height:40,borderRadius:"50%",
                background:avatarUrl?"transparent":"#C41E3A",
                color:"#FFF",fontSize:18,fontWeight:700,fontFamily:F,flexShrink:0,
                display:"flex",alignItems:"center",justifyContent:"center",
                overflow:"hidden"}}>
                {avatarUrl
                  ?<img src={`${avatarUrl}?t=${Date.now()}`} alt="avatar"
                      style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"50%",display:"block"}}
                      onError={e=>{e.target.style.display="none";}}/>
                  :(user.email?.[0]?.toUpperCase()||"U")}
              </div>
              <div>
                <div style={{fontFamily:F,fontSize:14,fontWeight:600,color:C.str}}>
                  {user.email?.split("@")[0]||"Fan"}
                </div>
                <div style={{fontFamily:F,fontSize:12,color:"#C41E3A",marginTop:2}}>
                  {T.myProfile||"Mon Profil"} →
                </div>
              </div>
            </div>
          ):(
            <button onClick={()=>{setPage("login");setMenuOpen(false);}}
              style={{width:"100%",padding:"12px",borderRadius:12,border:"none",cursor:"pointer",
                background:"#C41E3A",color:"#FFF",fontFamily:F,fontSize:14,fontWeight:600,
                marginBottom:12,textAlign:"center"}}>
              Se connecter
            </button>
          )}

          {/* Nav links */}
          {[
            {id:"home",     label:T.mobileHome},
            {id:"ticket",   label:T.mobileTick},
            {id:"teamSheet",label:`📋 ${T.teamSheet||"Fiche Équipe"}`, action:()=>{if(selectedTeam){setShowTeamSheet(true);}else{setPage("profile");}setMenuOpen(false);}},
            {id:"schedule", label:T.mobileSch},
          ].map(({id,label,action})=>(
            <button key={id}
              onClick={action?action:()=>{setPage(id);setMenuOpen(false);}}
              style={{display:"block",width:"100%",textAlign:"left",
                background:page===id?`${BR.red}11`:"none",
                border:"none",padding:"12px 14px",borderRadius:10,cursor:"pointer",
                fontFamily:F,fontSize:15,fontWeight:page===id?600:400,
                color:page===id?BR.red:C.str,marginBottom:4,transition:"all .15s"}}>
              {label}
            </button>
          ))}

        </div>
      )}
    </motion.nav>
  );
}

export default React.memo(Navbar);
