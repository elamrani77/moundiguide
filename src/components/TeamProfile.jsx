import { useEffect } from "react";
import { TEAM_DATA, TEAM_ISO, PLAYERS, PLAYERS_IMG, TRANSLATIONS, BR, F } from "../constants.js";
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
          background:"#FFFFFF",
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

          {/* ── SECTION A — FIX 6: Squad / Hommes de match ── */}
          {players && (
            <div style={{padding:"20px 16px 0"}}>
              <div style={{fontFamily:F,fontSize:13,fontWeight:700,color:"#374151",
                textTransform:"uppercase",letterSpacing:1.5,marginBottom:12}}>
                ⚽ {T.squad || "Hommes de match"}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {[
                  {name:players.p1, num:players.n1},
                  {name:players.p2, num:players.n2},
                  {name:players.p3, num:players.n3},
                ].map((p,i)=>(
                  <div key={i} style={{
                    display:"flex",alignItems:"center",gap:12,
                    padding:"12px",borderRadius:12,
                    background:`${primaryColor}08`,
                    border:`1px solid ${primaryColor}22`,
                  }}>
                    <div style={{
                      width:40,height:40,borderRadius:10,flexShrink:0,
                      background:`linear-gradient(135deg,${primaryColor},${secondColor})`,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      color:"#FFF",fontSize:18,fontWeight:800,
                    }}>
                      {p.num}
                    </div>
                    <div style={{fontFamily:F,fontSize:14,fontWeight:600,color:"#111827",lineHeight:1.2}}>
                      {p.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Tournament grid — FIX 6: only Groupe + Matchs ── */}
          <div style={{padding:"20px 16px 0"}}>
            <div style={{fontFamily:F,fontSize:13,fontWeight:700,color:"#374151",
              textTransform:"uppercase",letterSpacing:1.5,marginBottom:12}}>
              🏆 {T.tournament || "Tournoi 2030"}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[
                {label:T.group       ||"Groupe", value:"TBD"},
                {label:T.navSchedule ||"Matchs", value:"TBD"},
              ].map(({label,value})=>(
                <div key={label} style={{
                  background:"#F9FAFB",border:"1px solid #E5E7EB",
                  borderRadius:10,padding:"12px 14px",
                }}>
                  <div style={{fontFamily:F,fontSize:10,color:"#9CA3AF",fontWeight:500,
                    textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>
                    {label}
                  </div>
                  <div style={{fontFamily:F,fontSize:16,fontWeight:700,color:"#111827"}}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── SECTION B — FIX 6: Statistiques (placeholder) ── */}
          <div style={{padding:"20px 16px 0"}}>
            <div style={{fontFamily:F,fontSize:13,fontWeight:700,color:"#374151",
              textTransform:"uppercase",letterSpacing:1.5,marginBottom:12}}>
              📊 {T.matchStats || "Statistiques"}
            </div>
            <div style={{display:"flex",gap:8}}>
              {[
                {icon:"🏆",val:"TBD",label:T.group||"Groupe"},
                {icon:"⚽",val:"0",  label:"Buts"},
                {icon:"📅",val:"TBD",label:T.navSchedule||"Matchs"},
              ].map(({icon,val,label})=>(
                <div key={label} style={{
                  flex:1,background:"#F9FAFB",border:"1px solid #E5E7EB",
                  borderRadius:12,padding:"12px",textAlign:"center",
                }}>
                  <div style={{fontSize:20}}>{icon}</div>
                  <div style={{fontFamily:F,fontSize:18,fontWeight:800,color:"#111827",margin:"4px 0 2px"}}>
                    {val}
                  </div>
                  <div style={{fontFamily:F,fontSize:10,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:1}}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
            <div style={{fontFamily:F,fontSize:11,color:"#9CA3AF",textAlign:"center",marginTop:8,fontStyle:"italic"}}>
              {T.comingSoon || "Données à venir"}
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
              onClick={()=>{setPage("home");setShowTeamProfile(false);}}
              style={{
                width:"100%",padding:"13px",borderRadius:12,
                background:"transparent",border:`1.5px solid ${primaryColor}`,
                cursor:"pointer",fontFamily:F,fontWeight:600,fontSize:14,color:primaryColor,
              }}
            >
              🗺️ {T.viewMap || "Carte des stades"}
            </button>
          </div>

        </div>{/* end scrollable */}
      </div>{/* end drawer */}
    </>
  );
}
