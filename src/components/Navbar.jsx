import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TRANSLATIONS, BR, TEAM_DATA, TEAM_ACCENT, TEAM_ISO, F } from "../constants.js";
import MoundiLogo from "./MoundiLogo.jsx";

function Navbar({page, setPage, scrolled, C, lang, curLang, showLang, setShowLang, isDesk, selectedTeam, onPickTeam, setShowTeamProfile}){
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

            {/* Team + Language buttons */}
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <button onClick={onPickTeam}
                aria-label={`Changer d'équipe - ${selectedTeam?.t||"Sélectionner une équipe"}`}
                style={{background:"transparent",border:"1.5px solid currentColor",borderRadius:999,
                  padding:"6px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:6,
                  fontFamily:F,fontSize:13,fontWeight:600,color:BR.red,transition:"all .2s"}}>
                {selectedTeam
                  ?<img src={`https://flagcdn.com/24x18/${(TEAM_ISO[selectedTeam.t]||"ma").toLowerCase()}.png`}
                    alt={selectedTeam.t} style={{width:24,height:18,borderRadius:2,objectFit:"cover"}}
                    onError={e=>{e.target.style.display="none";}}/>
                  :<span style={{fontSize:18}}>🌍</span>}
                <span>{selectedTeam?.t||"Team"}</span>
              </button>
              {selectedTeam&&(
                <button onClick={()=>setShowTeamProfile(true)}
                  aria-label="Voir le profil de l'équipe"
                  style={{width:28,height:28,borderRadius:"50%",border:"1.5px solid #E5E7EB",
                    background:"white",fontSize:12,cursor:"pointer",marginLeft:4,
                    display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  ℹ
                </button>
              )}
              <button onClick={handleNotifBell} title="Activer les alertes matchs"
                aria-label="Activer les notifications"
                style={{width:28,height:28,borderRadius:"50%",border:"1.5px solid #E5E7EB",
                  background:"white",fontSize:14,cursor:"pointer",
                  display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {notifGranted?"🔔":"🔕"}
              </button>
              <button onClick={e=>{e.stopPropagation();setShowLang(p=>!p);}}
                aria-label={`Changer de langue - ${curLang?.label}`}
                style={{background:"transparent",border:"1.5px solid currentColor",borderRadius:999,
                  padding:"6px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:6,
                  fontFamily:F,fontSize:13,fontWeight:600,color:linkColor,transition:"all .2s"}}>
                <span>{curLang.label}</span>
                <span style={{opacity:.5,fontSize:10}}>▼</span>
              </button>
            </div>
          </div>
        ):(
          /* Mobile right side: bell + flag + hamburger */
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {/* Bell */}
            <button onClick={handleNotifBell} aria-label="Activer les notifications"
              style={{background:"none",border:"none",cursor:"pointer",fontSize:18,lineHeight:1,padding:2}}>
              {notifGranted?"🔔":"🔕"}
            </button>
            {/* Team flag → opens picker */}
            <button onClick={onPickTeam}
              aria-label={`Changer d'équipe - ${selectedTeam?.t||"Sélectionner une équipe"}`}
              style={{background:"none",border:"none",cursor:"pointer",lineHeight:1,display:"flex",alignItems:"center",padding:2}}>
              {selectedTeam
                ?<img src={`https://flagcdn.com/24x18/${(TEAM_ISO[selectedTeam.t]||"ma").toLowerCase()}.png`}
                  alt={selectedTeam.t} style={{width:24,height:18,borderRadius:3,objectFit:"cover"}}
                  onError={e=>{e.target.style.display="none";}}/>
                :<span style={{fontSize:18}}>🌍</span>}
            </button>
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

          {/* Team row at top */}
          {selectedTeam&&(
            <div style={{display:"flex",gap:8,marginBottom:8,paddingBottom:8,borderBottom:`1px solid ${C.bdr}`}}>
              <button onClick={()=>{onPickTeam();setMenuOpen(false);}}
                style={{flex:1,display:"flex",alignItems:"center",gap:10,padding:"10px 14px",
                  background:C.fld,border:`1px solid ${C.bdr}`,borderRadius:10,cursor:"pointer"}}>
                <img src={`https://flagcdn.com/24x18/${(TEAM_ISO[selectedTeam.t]||"ma").toLowerCase()}.png`}
                  alt={selectedTeam.t} style={{width:24,height:18,borderRadius:3,objectFit:"cover"}}
                  onError={e=>{e.target.style.display="none";}}/>
                <span style={{fontFamily:F,fontSize:14,fontWeight:600,color:C.str}}>{selectedTeam.t}</span>
              </button>
              <button onClick={()=>{setShowTeamProfile(true);setMenuOpen(false);}}
                style={{padding:"10px 14px",background:C.fld,border:`1px solid ${C.bdr}`,
                  borderRadius:10,cursor:"pointer",fontFamily:F,fontSize:12,color:C.mut,whiteSpace:"nowrap"}}>
                👤 Profil
              </button>
            </div>
          )}

          {/* Nav links */}
          {[{id:"home",label:T.mobileHome},{id:"ticket",label:T.mobileTick},{id:"schedule",label:T.mobileSch}].map(({id,label})=>(
            <button key={id} onClick={()=>{setPage(id);setMenuOpen(false);}}
              style={{display:"block",width:"100%",textAlign:"left",background:page===id?`${BR.red}11`:"none",
                border:"none",padding:"12px 14px",borderRadius:10,cursor:"pointer",
                fontFamily:F,fontSize:15,fontWeight:page===id?600:400,
                color:page===id?BR.red:C.str,marginBottom:4,transition:"all .15s"}}>
              {label}
            </button>
          ))}

          {/* Language selector */}
          <div style={{display:"flex",gap:10,marginTop:8,paddingTop:12,borderTop:`1px solid ${C.bdr}`}}>
            <button onClick={()=>setShowLang(p=>!p)}
              style={{flex:1,padding:10,borderRadius:10,border:`1px solid ${C.bdr}`,
                background:C.card,color:C.str,cursor:"pointer",fontFamily:F,fontSize:13}}>
              {curLang.label}
            </button>
          </div>
        </div>
      )}
    </motion.nav>
  );
}

export default React.memo(Navbar);
