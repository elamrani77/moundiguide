import { useState } from "react";
import { motion } from "framer-motion";
import { TRANSLATIONS, BR, TEAM_DATA, TEAM_ACCENT, F } from "../constants.js";
import MoundiLogo from "./MoundiLogo.jsx";

export default function Navbar({page, setPage, scrolled, C, lang, curLang, showLang, setShowLang, isDesk, selectedTeam, onPickTeam}){
  const [menuOpen, setMenuOpen] = useState(false);
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
      <div style={{maxWidth:1280,margin:"0 auto",height:68,display:"flex",alignItems:"center",justifyContent:"space-between"}}>

        {/* Logo — Bug 2 fix: size 52px desktop / 44px mobile */}
        <div onClick={()=>setPage("home")}>
          <MoundiLogo size={isDesk?52:44} textColor={BR.red}/>
        </div>

        {/* Desktop nav */}
        {isDesk?(
          <div style={{display:"flex",alignItems:"center",gap:28}}>
            <NavLink id="home"     label={T.navHome}/>
            <NavLink id="ticket"   label={T.navTicket}/>
            <NavLink id="schedule" label={T.navSchedule}/>

            {/* Divider */}
            <div style={{width:1,height:20,background:"#E5E7EB"}}/>

            {/* Team badge */}
            {(()=>{
              if(selectedTeam){const tc=TEAM_DATA[selectedTeam.t]?.colors[0]||TEAM_ACCENT[selectedTeam.t]||BR.red;return(
                <button onClick={onPickTeam} title="Change team"
                  style={{background:`${tc}12`,border:`1px solid ${tc}`,
                    borderRadius:20,padding:"4px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:5,transition:"all .2s",
                    boxShadow:`0 0 0 2px ${tc}22`}}>
                  <span style={{fontSize:16}}>{selectedTeam.f}</span>
                  <span style={{fontFamily:F,fontSize:11,color:tc,fontWeight:600}}>{selectedTeam.t}</span>
                </button>
              );}
              return(
                <button onClick={onPickTeam} title="Choose your team"
                  style={{background:"none",border:`1px solid ${C.bdr}`,
                    borderRadius:20,padding:"4px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:5,transition:"all .2s"}}>
                  <span style={{fontSize:14}}>⚽</span>
                  <span style={{fontFamily:F,fontSize:11,color:linkColor}}>Team</span>
                </button>
              );
            })()}

            {/* Language */}
            <button onClick={e=>{e.stopPropagation();setShowLang(p=>!p);}}
              style={{background:"none",border:`1px solid ${C.bdr}`,
                borderRadius:20,padding:"5px 12px",cursor:"pointer",fontFamily:F,fontSize:12,
                color:linkColor,display:"flex",alignItems:"center",gap:5,transition:"all .2s"}}>
              <span style={{fontSize:14}}>{curLang.flag}</span>
              <span>{curLang.label}</span>
              <span style={{opacity:.5,fontSize:8}}>▼</span>
            </button>
          </div>
        ):(
          /* Mobile: hamburger */
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={onPickTeam} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,lineHeight:1}} title="Choose team">
              {selectedTeam?selectedTeam.f:"⚽"}
            </button>
            <button onClick={()=>setMenuOpen(p=>!p)}
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
          borderTop:`1px solid ${C.bdr}`,padding:"16px 24px 20px",animation:"slideDown .2s ease"}}>
          {[{id:"home",label:T.mobileHome},{id:"ticket",label:T.mobileTick},{id:"schedule",label:T.mobileSch}].map(({id,label})=>(
            <button key={id} onClick={()=>{setPage(id);setMenuOpen(false);}}
              style={{display:"block",width:"100%",textAlign:"left",background:page===id?`${BR.red}11`:"none",
                border:"none",padding:"12px 14px",borderRadius:10,cursor:"pointer",
                fontFamily:F,fontSize:15,fontWeight:page===id?600:400,
                color:page===id?BR.red:C.str,marginBottom:4,transition:"all .15s"}}>
              {label}
            </button>
          ))}
          <div style={{display:"flex",gap:10,marginTop:12,paddingTop:12,borderTop:`1px solid ${C.bdr}`}}>
            <button onClick={()=>setShowLang(p=>!p)}
              style={{flex:1,padding:10,borderRadius:10,border:`1px solid ${C.bdr}`,
                background:C.card,color:C.str,cursor:"pointer",fontFamily:F,fontSize:13}}>
              {curLang.flag} {curLang.label}
            </button>
          </div>
        </div>
      )}
    </motion.nav>
  );
}
