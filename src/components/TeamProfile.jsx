import { useEffect } from "react";
import { TEAM_DATA, TEAM_ISO, PLAYERS_IMG, TRANSLATIONS, BR, F } from "../constants.js";
import { useAnalytics } from "../hooks/useAnalytics.js";

export default function TeamProfile({selectedTeam, showTeamSheet, setShowTeamSheet, isDesk, setPage, lang}){
  const { track } = useAnalytics();
  const T = TRANSLATIONS[lang] || TRANSLATIONS.en;

  useEffect(()=>{
    if(showTeamSheet&&selectedTeam?.t) track("team_profile_viewed",{team:selectedTeam.t});
  },[showTeamSheet,selectedTeam?.t]);

  // FIX A: lock body scroll when panel is open
  useEffect(()=>{
    document.body.style.overflow = showTeamSheet ? "hidden" : "";
    return ()=>{ document.body.style.overflow = ""; };
  },[showTeamSheet]);

  if(!selectedTeam) return null;

  const teamData = TEAM_DATA[selectedTeam.t];
  const isoRaw = TEAM_ISO[selectedTeam.t] || "ma";
  const heroImg = PLAYERS_IMG[isoRaw.startsWith("gb-") ? isoRaw.slice(3,5).toUpperCase() : isoRaw.slice(0,2).toUpperCase()] || "/players-default.png";
  const primaryColor = teamData?.colors[0] || BR.red;
  const secondColor = teamData?.colors[1] || "#1a1a1a";
  const flagSrc = `https://flagcdn.com/48x36/${isoRaw.toLowerCase()}.png`;

  // FIX D: 3 stat cells — no city
  const statItems = [
    {label:T.group||"Groupe",   value:"TBD"},
    {label:T.matches||"Matchs", value:"TBD"},
    {label:T.status||"Statut",  value:T.qualified||"Qualifié"},
  ];

  function close() { setShowTeamSheet(false); }

  return(
    <>
      {/* Backdrop */}
      <div onClick={close}
        style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:1099,
          opacity:showTeamSheet?1:0,pointerEvents:showTeamSheet?"auto":"none",
          transition:"opacity 0.3s ease"}}/>

      {/* Drawer */}
      <div style={{
        position:"fixed",right:0,top:0,
        width:isDesk?420:"100vw",
        height:"100vh",
        background:"#FFFFFF",
        zIndex:1100,
        boxShadow:"-4px 0 32px rgba(0,0,0,0.15)",
        transform:showTeamSheet?"translateX(0)":"translateX(100%)",
        transition:"transform 0.35s ease",
        display:"flex",flexDirection:"column",
        overflowY:"auto",
        overscrollBehavior:"contain",
      }}>

        {/* ── HEADER ── */}
        <div style={{
          background:teamData?.heroGradient||`linear-gradient(135deg,${primaryColor},${secondColor})`,
          padding:"28px 20px 24px",
          position:"relative",
          flexShrink:0,
        }}>
          <button onClick={close}
            style={{position:"absolute",top:16,right:16,background:"rgba(255,255,255,0.15)",
              border:"none",borderRadius:8,width:32,height:32,cursor:"pointer",
              color:"#FFF",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",
              backdropFilter:"blur(4px)"}}>
            ✕
          </button>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <img src={flagSrc} alt={selectedTeam.t}
              style={{width:56,height:42,objectFit:"cover",borderRadius:4,
                boxShadow:"0 2px 12px rgba(0,0,0,0.3)"}}
              onError={e=>{e.target.style.display="none";}}/>
            <div>
              <div style={{fontFamily:F,fontSize:26,fontWeight:800,color:"#FFF",lineHeight:1.1}}>
                {selectedTeam.t}
              </div>
              {/* CHANGE 3: translated subtitle */}
              <div style={{fontFamily:F,fontSize:12,color:"rgba(255,255,255,0.7)",marginTop:4,fontWeight:500}}>
                {T.worldCup2030||"FIFA World Cup 2030"}
              </div>
            </div>
          </div>
        </div>

        {/* ── PLAYERS IMAGE ── */}
        <div style={{padding:"16px 16px 0",flexShrink:0}}>
          <img src={heroImg} alt={selectedTeam.t}
            width="400" height="200"
            style={{width:"100%",height:200,objectFit:"cover",objectPosition:"center 10%",
              borderRadius:12,display:"block"}}
            onError={e=>{e.target.onerror=null;e.target.src="/players-default.png";}}/>
        </div>

        {/* FIX B: Star players section REMOVED */}

        {/* ── STATS — FIX D: 3 cells in a row, no city ── */}
        <div style={{padding:"20px 16px 0",flexShrink:0}}>
          <div style={{fontFamily:F,fontSize:13,fontWeight:700,color:"#374151",
            textTransform:"uppercase",letterSpacing:1.5,marginBottom:12}}>
            🏆 {T.tournament||"Tournoi 2030"}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            {statItems.map(({label,value})=>(
              <div key={label} style={{background:"rgba(0,0,0,0.04)",border:"1px solid #E5E7EB",
                borderRadius:12,padding:"12px 10px"}}>
                <div style={{fontFamily:F,fontSize:9,color:"#9CA3AF",fontWeight:600,
                  textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>
                  {label}
                </div>
                <div style={{fontFamily:F,fontSize:15,fontWeight:700,color:"#111827"}}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FIX C: Updated action buttons ── */}
        <div style={{padding:"20px 16px 32px",display:"flex",flexDirection:"column",gap:10,flexShrink:0,marginTop:"auto"}}>
          <button onClick={()=>{setPage("schedule");close();}}
            style={{width:"100%",height:48,borderRadius:12,border:"none",cursor:"pointer",
              background:"linear-gradient(135deg,#C41E3A,#8B0000)",
              fontFamily:F,fontWeight:700,fontSize:14,color:"#FFF",
              boxShadow:"0 4px 16px rgba(196,30,58,0.4)"}}>
            📅 {T.viewMatches||"Voir les matchs"}
          </button>
          <button onClick={()=>{setPage("ticket");close();}}
            style={{width:"100%",height:48,borderRadius:12,cursor:"pointer",
              background:"rgba(255,255,255,0.08)",border:"1px solid rgba(0,0,0,0.15)",
              fontFamily:F,fontWeight:700,fontSize:14,color:"#374151"}}>
            🎟 {T.tickets||"Billets"}
          </button>
        </div>
      </div>
    </>
  );
}
