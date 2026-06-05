import { useEffect, useState } from "react";
import { TEAM_DATA, TEAM_ISO, PLAYERS, PLAYERS_IMG, TRANSLATIONS, BR, F, TEAM_GROUPS, TEAM_OPPONENTS, FIFA_RANKINGS_MAP, POLL_FAVORITES } from "../constants.js";
import { useAnalytics } from "../hooks/useAnalytics.js";
import { supabase } from "../supabase.js";

function buildDonut(favs, results, total){
  const R=50, ri=28, cx=60, cy=60;
  let cum = -Math.PI/2;
  return favs.map(team=>{
    const votes = results?.[team.t] || 0;
    const pct = total > 0 ? votes/total : 1/favs.length;
    const s0 = cum; cum += pct*2*Math.PI; const s1 = cum;
    const pt = (r,a) => [(cx+r*Math.cos(a)).toFixed(1),(cy+r*Math.sin(a)).toFixed(1)];
    const [ox0,oy0]=pt(R,s0),[ox1,oy1]=pt(R,s1),[ix0,iy0]=pt(ri,s0),[ix1,iy1]=pt(ri,s1);
    const lg = pct*2*Math.PI > Math.PI ? 1 : 0;
    const d = `M${ox0},${oy0} A${R},${R} 0 ${lg},1 ${ox1},${oy1} L${ix1},${iy1} A${ri},${ri} 0 ${lg},0 ${ix0},${iy0} Z`;
    return {...team, votes, pct, d};
  });
}

export default function TeamProfile({
  selectedTeam, showTeamProfile, setShowTeamProfile, isDesk, setPage, lang,
}){
  const { track } = useAnalytics();
  const T = TRANSLATIONS[lang] || TRANSLATIONS.fr;

  useEffect(()=>{
    if(showTeamProfile&&selectedTeam?.t) track("team_profile_viewed",{team:selectedTeam.t});
  },[showTeamProfile,selectedTeam?.t,lang]);

  const [pollVote,setPollVote]     = useState(null);
  const [pollResults,setPollResults] = useState(null);
  const [pollLoading,setPollLoading] = useState(false);
  const [pollTotal,setPollTotal]   = useState(0);

  useEffect(()=>{
    const saved = localStorage.getItem('moundiguide_poll_vote');
    if(saved) setPollVote(saved);
    async function loadPoll(){
      try{
        const{data,error}=await supabase.from('polls').select('team_name,votes');
        if(error||!data?.length) throw new Error('no data');
        const results={};let t=0;
        data.forEach(r=>{results[r.team_name]=r.votes;t+=r.votes;});
        setPollResults(results);setPollTotal(t);
      }catch{
        const mock={Morocco:4200,Spain:3100,Brazil:2800,France:2500,Argentina:3300,Portugal:1900};
        setPollResults(mock);setPollTotal(Object.values(mock).reduce((a,b)=>a+b,0));
      }
    }
    loadPoll();
  },[]);

  if(!selectedTeam) return null;

  const teamData    = TEAM_DATA[selectedTeam.t];
  const fifaRank    = FIFA_RANKINGS_MAP[selectedTeam.t] || null;

  async function handleVote(teamName){
    if(pollVote||pollLoading) return;
    setPollLoading(true);
    try{ await supabase.rpc('increment_poll',{p_team:teamName}); }catch{}
    const nr={...pollResults,[teamName]:(pollResults?.[teamName]||0)+1};
    setPollResults(nr);setPollTotal(prev=>prev+1);
    setPollVote(teamName);
    localStorage.setItem('moundiguide_poll_vote',teamName);
    setPollLoading(false);
  }

  const pollSlices = buildDonut(POLL_FAVORITES, pollResults, pollTotal);
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
              background:"rgba(0,0,0,0.08)",
              border:"none",borderRadius:8,width:32,height:32,
              cursor:"pointer",color:"#111827",fontSize:18,
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
              <div style={{fontFamily:F,fontSize:13,fontWeight:700,color:"rgba(0,0,0,0.45)",
                textTransform:"uppercase",letterSpacing:1.5,marginBottom:12,
                borderLeft:`3px solid ${primaryColor}`,paddingLeft:10}}>
                ⚽ {T.manOfMatch || "Homme de match"}
              </div>
              <div style={{
                display:"flex",alignItems:"center",gap:16,
                padding:"16px 20px",borderRadius:14,
                background:"#F3F4F6",
                border:"1px solid rgba(0,0,0,0.08)",
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
                  <div style={{fontFamily:F,fontSize:16,fontWeight:700,color:"#111827"}}>
                    {players.p1}
                  </div>
                  <div style={{fontSize:11,color:"rgba(0,0,0,0.45)",marginTop:4}}>
                    {T.manOfMatch || "Homme de match"} ⭐
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── FIFA Ranking ── */}
          {fifaRank&&(
            <div style={{padding:"20px 16px 0"}}>
              <div style={{fontFamily:F,fontSize:13,fontWeight:700,color:"rgba(0,0,0,0.45)",
                textTransform:"uppercase",letterSpacing:1.5,marginBottom:12,
                borderLeft:`3px solid ${primaryColor}`,paddingLeft:10}}>
                🏅 {T.fifaRanking||"Classement FIFA"}
              </div>
              <div style={{background:"#F9FAFB",border:"1px solid rgba(0,0,0,0.08)",
                borderRadius:10,padding:"14px 16px",display:"flex",alignItems:"center",gap:16}}>
                <div style={{
                  width:56,height:56,borderRadius:12,flexShrink:0,
                  background:`linear-gradient(135deg,${primaryColor},${secondColor})`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  color:"#FFF",fontSize:18,fontWeight:900,
                }}>
                  #{fifaRank.rank}
                </div>
                <div>
                  <div style={{fontFamily:F,fontSize:11,color:"rgba(0,0,0,0.4)",fontWeight:500,
                    textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>
                    {T.worldRanking||"Classement mondial"}
                  </div>
                  <div style={{fontFamily:F,fontSize:22,fontWeight:900,color:"#111827",lineHeight:1.1}}>
                    {fifaRank.points.toLocaleString()} pts
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Tournament ── */}
          <div style={{padding:"20px 16px 0"}}>
            <div style={{fontFamily:F,fontSize:13,fontWeight:700,color:"rgba(0,0,0,0.45)",
              textTransform:"uppercase",letterSpacing:1.5,marginBottom:12,
              borderLeft:`3px solid ${primaryColor}`,paddingLeft:10}}>
              🏆 {T.tournament || "Tournoi 2026"}
            </div>
            <div style={{
              background:"#F9FAFB",border:"1px solid rgba(0,0,0,0.08)",
              borderRadius:10,padding:"12px 14px",
            }}>
              <div style={{fontFamily:F,fontSize:10,color:"rgba(0,0,0,0.4)",fontWeight:500,
                textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>
                {T.group||"Groupe"}
              </div>
              <div style={{fontFamily:F,fontSize:24,fontWeight:900,color:"#111827"}}>
                {group}
              </div>
              <div style={{fontFamily:F,fontSize:11,color:"rgba(0,0,0,0.5)",marginTop:4}}>
                {TEAM_OPPONENTS[selectedTeam.t] || ''}
              </div>
            </div>
          </div>

          {/* ── Fan Poll ── */}
          {pollResults&&(
            <div style={{padding:"20px 16px 0"}}>
              <div style={{fontFamily:F,fontSize:13,fontWeight:700,color:"rgba(0,0,0,0.45)",
                textTransform:"uppercase",letterSpacing:1.5,marginBottom:12,
                borderLeft:`3px solid ${primaryColor}`,paddingLeft:10}}>
                📊 {T.fanPoll||"Sondage des fans"}
              </div>
              <div style={{background:"#F9FAFB",border:"1px solid rgba(0,0,0,0.08)",
                borderRadius:10,padding:"14px 12px"}}>
                <div style={{fontFamily:F,fontSize:11,color:"rgba(0,0,0,0.5)",marginBottom:10,textAlign:"center"}}>
                  {T.whoWillWin||"Qui gagnera la Coupe du Monde 2030 ?"}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <svg width="120" height="120" viewBox="0 0 120 120" style={{flexShrink:0}}>
                    {pollSlices.map(s=>(
                      <path key={s.t} d={s.d} fill={s.color} stroke="#FFF" strokeWidth="1.5"/>
                    ))}
                  </svg>
                  <div style={{flex:1,display:"flex",flexDirection:"column",gap:5}}>
                    {pollSlices.map(s=>(
                      <div key={s.t}
                        onClick={()=>handleVote(s.t)}
                        style={{
                          display:"flex",alignItems:"center",gap:6,
                          cursor:pollVote?"default":"pointer",
                          opacity:pollLoading?0.6:1,
                          padding:"3px 6px",borderRadius:6,
                          background:pollVote===s.t?"rgba(196,30,58,0.06)":"transparent",
                          border:pollVote===s.t?`1px solid ${s.color}`:"1px solid transparent",
                          transition:"all 0.2s",
                        }}
                      >
                        <div style={{width:8,height:8,borderRadius:2,background:s.color,flexShrink:0}}/>
                        <div style={{flex:1,fontFamily:F,fontSize:11,color:"#111827",fontWeight:pollVote===s.t?700:400}}>
                          {s.f} {s.t}
                        </div>
                        <div style={{fontFamily:F,fontSize:11,color:"rgba(0,0,0,0.5)",fontWeight:600}}>
                          {(s.pct*100).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {!pollVote&&(
                  <div style={{fontFamily:F,fontSize:10,color:"rgba(0,0,0,0.4)",textAlign:"center",marginTop:8}}>
                    {T.clickToVote||"Cliquez pour voter"}
                  </div>
                )}
                {pollVote&&(
                  <div style={{fontFamily:F,fontSize:10,color:primaryColor,textAlign:"center",marginTop:8,fontWeight:600}}>
                    ✓ {T.votedFor||"Voté pour"} {pollVote} · {(pollTotal).toLocaleString()} {T.votes||"votes"}
                  </div>
                )}
              </div>
            </div>
          )}

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
