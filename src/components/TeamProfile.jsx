import { useEffect } from "react";
import { TEAM_DATA, TEAM_ISO, PLAYERS, PLAYERS_IMG, TRANSLATIONS, BR, F, TEAM_GROUPS, TEAM_OPPONENTS } from "../constants.js";
import { useAnalytics } from "../hooks/useAnalytics.js";

export default function TeamProfile({
  selectedTeam, showTeamProfile, setShowTeamProfile, isDesk, setPage, lang,
}){
  const { track } = useAnalytics();
  const T = TRANSLATIONS[lang] || TRANSLATIONS.fr;

  useEffect(()=>{
    if(showTeamProfile&&selectedTeam?.t) track("team_profile_viewed",{team:selectedTeam.t});
  },[showTeamProfile,selectedTeam?.t,lang]);

  if(!selectedTeam) return null;

  const teamData    = TEAM_DATA[selectedTeam.t];
  const isoRaw      = TEAM_ISO[selectedTeam.t] || "ma";
  const teamCode    = isoRaw.startsWith("gb-") ? isoRaw.slice(3,5).toUpperCase() : isoRaw.slice(0,2).toUpperCase();
  const players     = PLAYERS[teamCode];
  const heroImg     = PLAYERS_IMG[teamCode] || "/players-default.webp";
  const primaryColor= teamData?.colors[0] || BR.red;
  const secondColor = teamData?.colors[1] || "#1a1a1a";
  const flagSrc     = `https://flagcdn.com/48x36/${isoRaw.toLowerCase()}.png`;
  const group = TEAM_GROUPS[selectedTeam.t] || '?';

  return(
    <>
      {/* Backdrop */}
      <div
        onClick={()=>setShowTeamProfile(false)}
        style={{
          position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",
          zIndex:1099,
          opacity:showTeamProfile?1:0,
          pointerEvents:showTeamProfile?"auto":"none",
          transition:"opacity 0.3s ease",
        }}
      />

      {/* Drawer — FIX 5: onWheel stops page scroll, outer has overflow:hidden */}
      <div
        onWheel={e=>e.stopPropagation()}
        style={{
          position:"fixed",right:0,top:0,
          width:isDesk?420:"100vw",
          height:"100vh",
          background:"#0f0f0f",
          zIndex:1100,
          boxShadow:"-4px 0 32px rgba(0,0,0,0.15)",
          transform:showTeamProfile?"translateX(0)":"translateX(100%)",
          transition:"transform 0.35s ease",
          display:"flex",flexDirection:"column",
          overflow:"hidden",
        }}
      >

        {/* ── HEADER (fixed, not scrollable) ── */}
        <div style={{
          background:teamData?.heroGradient||`linear-gradient(135deg,${primaryColor},${secondColor})`,
          padding:"28px 20px 24px",
          position:"relative",
          flexShrink:0,
        }}>
          <button
            onClick={()=>setShowTeamProfile(false)}
            style={{
              position:"absolute",top:16,right:16,
              background:"rgba(255,255,255,0.15)",
              border:"none",borderRadius:8,width:32,height:32,
              cursor:"pointer",color:"#FFF",fontSize:18,
              display:"flex",alignItems:"center",justifyContent:"center",
              backdropFilter:"blur(4px)",
            }}
          >
            ✕
          </button>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <img
              src={flagSrc} alt={selectedTeam.t}
              style={{width:56,height:42,objectFit:"cover",borderRadius:4,
                boxShadow:"0 2px 12px rgba(0,0,0,0.3)"}}
              onError={e=>{e.target.style.display="none";}}
            />
            <div>
              <div style={{fontFamily:F,fontSize:26,fontWeight:800,color:"#FFF",lineHeight:1.1}}>
                {selectedTeam.t}
              </div>
              <div style={{fontFamily:F,fontSize:12,color:"rgba(255,255,255,0.7)",marginTop:4,fontWeight:500}}>
                {T.worldCup2030 || "FIFA World Cup 2030"}
              </div>
            </div>
          </div>
        </div>

        {/* ── SCROLLABLE CONTENT — FIX 5 ── */}
        <div style={{
          flex:1,
          overflowY:"auto",
          overflowX:"hidden",
          overscrollBehavior:"contain",
        }}>

          {/* Players banner image */}
          <div style={{padding:"16px 16px 0"}}>
            <img
              src={heroImg} alt={selectedTeam.t}
              width="400" height="200"
              style={{width:"100%",height:200,objectFit:"cover",objectPosition:"center 10%",
                borderRadius:12,display:"block"}}
              onError={e=>{e.target.onerror=null;e.target.src="/players-default.webp";}}
            />
          </div>

          {/* ── SECTION A — Homme de match (featured star) ── */}
          {players && (
            <div style={{padding:"20px 16px 0"}}>
              <div style={{fontFamily:F,fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.5)",
                textTransform:"uppercase",letterSpacing:1.5,marginBottom:12,
                borderLeft:`3px solid ${primaryColor}`,paddingLeft:10}}>
                ⚽ {T.manOfMatch || "Homme de match"}
              </div>
              <div style={{
                display:"flex",alignItems:"center",gap:16,
                padding:"16px 20px",borderRadius:14,
                background:"rgba(255,255,255,0.05)",
                border:"1px solid rgba(255,255,255,0.1)",
              }}>
                <div style={{
                  width:52,height:52,borderRadius:12,flexShrink:0,
                  background:`linear-gradient(135deg,${primaryColor},${secondColor})`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  color:"#FFF",fontSize:22,fontWeight:900,
                }}>
                  {players.n1}
                </div>
                <div>
                  <div style={{fontFamily:F,fontSize:16,fontWeight:700,color:"#FFFFFF"}}>
                    {players.p1}
                  </div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:4}}>
                    {T.manOfMatch || "Homme de match"} ⭐
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Tournament ── */}
          <div style={{padding:"20px 16px 0"}}>
            <div style={{fontFamily:F,fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.5)",
              textTransform:"uppercase",letterSpacing:1.5,marginBottom:12,
              borderLeft:`3px solid ${primaryColor}`,paddingLeft:10}}>
              🏆 {T.tournament || "Tournoi 2026"}
            </div>
            <div style={{
              background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",
              borderRadius:10,padding:"12px 14px",
            }}>
              <div style={{fontFamily:F,fontSize:10,color:"rgba(255,255,255,0.4)",fontWeight:500,
                textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>
                {T.group||"Groupe"}
              </div>
              <div style={{fontFamily:F,fontSize:16,fontWeight:700,color:'#111827'}}>
                {group}
              </div>
              <div style={{fontFamily:F,fontSize:11,color:'#9CA3AF',marginTop:4}}>
                {TEAM_OPPONENTS[selectedTeam.t] || ''}
              </div>
            </div>
          </div>

          {/* ── Actions ── */}
          <div style={{padding:"20px 16px 32px",display:"flex",flexDirection:"column",gap:10}}>
            <button
              onClick={()=>{setPage("schedule");setShowTeamProfile(false);}}
              style={{
                width:"100%",padding:"13px",borderRadius:12,
                background:`linear-gradient(135deg,${primaryColor},${secondColor})`,
                border:"none",cursor:"pointer",fontFamily:F,fontWeight:600,fontSize:14,
                color:"#FFF",boxShadow:`0 4px 16px ${primaryColor}44`,
              }}
            >
              📅 {T.viewMatches || "Voir les matchs"}
            </button>
            <button
              onClick={()=>{setPage("ticket");setShowTeamProfile(false);}}
              style={{
                width:"100%",padding:"13px",borderRadius:12,
                background:"transparent",border:`1.5px solid ${primaryColor}`,
                cursor:"pointer",fontFamily:F,fontWeight:600,fontSize:14,color:primaryColor,
              }}
            >
              🎟 {T.navTicket || "Billets"}
            </button>
          </div>

        </div>{/* end scrollable */}
      </div>{/* end drawer */}
    </>
  );
}
