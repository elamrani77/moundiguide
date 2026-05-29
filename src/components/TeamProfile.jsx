import { useEffect } from "react";
import { TEAM_DATA, TEAM_ISO, PLAYERS, PLAYERS_IMG, BR, F } from "../constants.js";
import { useAnalytics } from "../hooks/useAnalytics.js";

export default function TeamProfile({selectedTeam, showTeamProfile, setShowTeamProfile, isDesk, setPage}){
  const { track } = useAnalytics();
  useEffect(()=>{
    if(showTeamProfile&&selectedTeam?.t) track("team_profile_viewed",{team:selectedTeam.t});
  },[showTeamProfile,selectedTeam?.t]);

  if(!selectedTeam) return null;

  const teamData = TEAM_DATA[selectedTeam.t];
  const isoRaw = TEAM_ISO[selectedTeam.t] || "ma";
  const teamCode = isoRaw.startsWith("gb-") ? isoRaw.slice(3,5).toUpperCase() : isoRaw.slice(0,2).toUpperCase();
  const players = PLAYERS[teamCode];
  const heroImg = PLAYERS_IMG[teamCode];
  const primaryColor = teamData?.colors[0] || BR.red;
  const secondColor = teamData?.colors[1] || "#1a1a1a";
  const flagSrc = `https://flagcdn.com/48x36/${isoRaw.toLowerCase()}.png`;

  const statItems = [
    {label:"Groupe",  value:"TBD"},
    {label:"Ville",   value:"Maroc"},
    {label:"Matchs",  value:"TBD"},
    {label:"Statut",  value:"Qualifié"},
  ];

  return(
    <>
      {/* Backdrop */}
      <div onClick={()=>setShowTeamProfile(false)}
        style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:1099,
          opacity:showTeamProfile?1:0,pointerEvents:showTeamProfile?"auto":"none",
          transition:"opacity 0.3s ease"}}/>

      {/* Drawer */}
      <div style={{
        position:"fixed",right:0,top:0,
        width:isDesk?420:"100vw",
        height:"100vh",
        background:"#FFFFFF",
        zIndex:1100,
        boxShadow:"-4px 0 32px rgba(0,0,0,0.15)",
        transform:showTeamProfile?"translateX(0)":"translateX(100%)",
        transition:"transform 0.35s ease",
        display:"flex",flexDirection:"column",
        overflowY:"auto",
      }}>

        {/* ── HEADER ── */}
        <div style={{
          background:teamData?.heroGradient||`linear-gradient(135deg,${primaryColor},${secondColor})`,
          padding:"28px 20px 24px",
          position:"relative",
          flexShrink:0,
        }}>
          {/* Close */}
          <button onClick={()=>setShowTeamProfile(false)}
            style={{position:"absolute",top:16,right:16,background:"rgba(255,255,255,0.15)",
              border:"none",borderRadius:8,width:32,height:32,cursor:"pointer",
              color:"#FFF",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",
              backdropFilter:"blur(4px)"}}>
            ✕
          </button>
          {/* Flag + Name */}
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <img src={flagSrc} alt={selectedTeam.t}
              style={{width:56,height:42,objectFit:"cover",borderRadius:4,
                boxShadow:"0 2px 12px rgba(0,0,0,0.3)"}}
              onError={e=>{e.target.style.display="none";}}/>
            <div>
              <div style={{fontFamily:F,fontSize:26,fontWeight:800,color:"#FFF",lineHeight:1.1}}>
                {selectedTeam.t}
              </div>
              <div style={{fontFamily:F,fontSize:12,color:"rgba(255,255,255,0.7)",marginTop:4,fontWeight:500}}>
                FIFA World Cup 2030
              </div>
            </div>
          </div>
        </div>

        {/* ── PLAYERS IMAGE ── */}
        {heroImg&&(
          <div style={{padding:"16px 16px 0",flexShrink:0}}>
            <img src={heroImg} alt={selectedTeam.t}
              style={{width:"100%",height:200,objectFit:"cover",objectPosition:"center 10%",
                borderRadius:12,display:"block"}}
              onError={e=>{e.target.style.display="none";}}/>
          </div>
        )}

        {/* ── STAR PLAYERS ── */}
        {players&&(
          <div style={{padding:"20px 16px 0",flexShrink:0}}>
            <div style={{fontFamily:F,fontSize:13,fontWeight:700,color:"#374151",
              textTransform:"uppercase",letterSpacing:1.5,marginBottom:12}}>
              ⭐ Joueurs Stars
            </div>
            <div style={{display:"flex",gap:8}}>
              {[{name:players.p1,num:players.n1},{name:players.p2,num:players.n2},{name:players.p3,num:players.n3}].map((p,i)=>(
                <div key={i} style={{flex:1,background:`${primaryColor}12`,border:`1px solid ${primaryColor}33`,
                  borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
                  <div style={{fontFamily:F,fontSize:20,fontWeight:800,color:primaryColor,lineHeight:1}}>
                    {p.num}
                  </div>
                  <div style={{fontFamily:F,fontSize:10,fontWeight:600,color:"#374151",
                    marginTop:6,lineHeight:1.3,wordBreak:"break-word"}}>
                    {p.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STATS ── */}
        <div style={{padding:"20px 16px 0",flexShrink:0}}>
          <div style={{fontFamily:F,fontSize:13,fontWeight:700,color:"#374151",
            textTransform:"uppercase",letterSpacing:1.5,marginBottom:12}}>
            🏆 Tournoi 2030
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {statItems.map(({label,value})=>(
              <div key={label} style={{background:"#F9FAFB",border:"1px solid #E5E7EB",
                borderRadius:10,padding:"12px 14px"}}>
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

        {/* ── ACTIONS ── */}
        <div style={{padding:"20px 16px 32px",display:"flex",flexDirection:"column",gap:10,flexShrink:0}}>
          <button
            onClick={()=>{setPage("schedule");setShowTeamProfile(false);}}
            style={{width:"100%",padding:"13px",borderRadius:12,
              background:`linear-gradient(135deg,${primaryColor},${secondColor})`,
              border:"none",cursor:"pointer",fontFamily:F,fontWeight:600,fontSize:14,color:"#FFF",
              boxShadow:`0 4px 16px ${primaryColor}44`}}>
            📅 Voir les matchs
          </button>
          <button
            onClick={()=>{setPage("home");setShowTeamProfile(false);}}
            style={{width:"100%",padding:"13px",borderRadius:12,
              background:"transparent",border:`1.5px solid ${primaryColor}`,
              cursor:"pointer",fontFamily:F,fontWeight:600,fontSize:14,color:primaryColor}}>
            🗺️ Carte des stades
          </button>
        </div>
      </div>
    </>
  );
}
