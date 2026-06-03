import React, { useState, useEffect, useRef } from "react";

const videos = [
  "https://res.cloudinary.com/dcrk8qhqo/video/upload/q_auto,f_auto/v1780229376/wc2026-intro_ojxtmg.mp4",
  "https://res.cloudinary.com/dcrk8qhqo/video/upload/q_auto,f_auto/v1780229706/pepsi-football_jjofyj.mp4",
  "https://res.cloudinary.com/dcrk8qhqo/video/upload/q_auto,f_auto/v1780229327/adidas_com_rgkjsp.mp4",
];

const TEAM_COLORS = {
  MA: { primary:"#C8102E", secondary:"#00913F", accent:"#F0B429" },
  ES: { primary:"#AA151B", secondary:"#F1BF00", accent:"#AA151B" },
  PT: { primary:"#006600", secondary:"#FF0000", accent:"#006600" },
  FR: { primary:"#002395", secondary:"#ED2939", accent:"#FFFFFF" },
  AR: { primary:"#74ACDF", secondary:"#FFFFFF", accent:"#74ACDF" },
  BR: { primary:"#009C3B", secondary:"#FEDD00", accent:"#009C3B" },
  DE: { primary:"#000000", secondary:"#DD0000", accent:"#FFCE00" },
  EN: { primary:"#003090", secondary:"#CF081F", accent:"#FFFFFF" },
  IT: { primary:"#003399", secondary:"#009246", accent:"#CE2B37" },
  NL: { primary:"#FF6600", secondary:"#FFFFFF", accent:"#FF6600" },
  DEFAULT: { primary:"#F0B429", secondary:"#F0B429", accent:"#F0B429" },
};

const LAYOUTS = ["full","split2","split3"];
const DURATIONS = { full:6000, split2:5000, split3:8000 };
const MONO = "'Courier New',monospace";

// Convert hex + alpha to rgba string
function alpha(hex, a) {
  const h = hex.replace("#","");
  const r = parseInt(h.slice(0,2),16);
  const g = parseInt(h.slice(2,4),16);
  const b = parseInt(h.slice(4,6),16);
  return `rgba(${r},${g},${b},${a})`;
}

const Scanline = () => (
  <div style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:10,
    background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.07) 2px,rgba(0,0,0,0.07) 4px)"}}/>
);

function LayoutIcon({ mode, active, activeColor, onClick }) {
  const col = active ? activeColor : "rgba(255,255,255,0.22)";
  const box = (w,h) => <div style={{width:w,height:h,background:col,borderRadius:2}}/>;
  return (
    <button onClick={onClick}
      style={{background:"none",border:"none",cursor:"pointer",padding:"4px 5px",display:"flex",alignItems:"center",lineHeight:1}}>
      {mode==="full"  && box(12,12)}
      {mode==="split2"&& <div style={{display:"flex",gap:2}}>{box(5,12)}{box(7,12)}</div>}
      {mode==="split3"&& <div style={{display:"flex",gap:2}}>{box(4,12)}{box(4,12)}{box(5,12)}</div>}
    </button>
  );
}

function LEDBoard({days,hours,minutes,seconds,teamCode,isDesk,fixtures=[],latestGoal}){
  const [slot,setSlot]=useState(0);
  const [layoutMode,setLayoutMode]=useState("split3");
  const [userPicked,setUserPicked]=useState(false);
  const [videoIdx,setVideoIdx]=useState(0);
  const [videoPlaying,setVideoPlaying]=useState(true);
  const [videoLoaded,setVideoLoaded]=useState(false);
  const resumeRef=useRef(null);
  const videoTimerRef=useRef(null);

  useEffect(()=>{
    const observer=new IntersectionObserver(
      ([entry])=>{if(entry.isIntersecting)setVideoLoaded(true);},
      {threshold:0.1}
    );
    const el=document.getElementById("led-video-section");
    if(el)observer.observe(el);
    return()=>observer.disconnect();
  },[]);

  const tc = TEAM_COLORS[teamCode] || TEAM_COLORS.DEFAULT;
  const tickerPrefix = fixtures.length > 0
    ? fixtures.slice(0,3).map(f=>`⚽ ${f.home} ${f.homeGoals}-${f.awayGoals} ${f.away} ${f.minute}'`).join(' · ') + ' · '
    : '';

  // Slot rotation — pauses while video is playing
  useEffect(()=>{
    if(videoPlaying) return;
    const t=setInterval(()=>setSlot(s=>(s+1)%4),4000);
    return()=>clearInterval(t);
  },[videoPlaying]);

  // Auto-cycle: chained setTimeout, respects per-mode durations
  useEffect(()=>{
    if(userPicked) return;
    const id=setTimeout(()=>{
      setLayoutMode(prev=>LAYOUTS[(LAYOUTS.indexOf(prev)+1)%LAYOUTS.length]);
    },DURATIONS[layoutMode]);
    return()=>clearTimeout(id);
  },[layoutMode,userPicked]);

  function pickLayout(mode){
    setLayoutMode(mode);
    setUserPicked(true);
    if(resumeRef.current) clearTimeout(resumeRef.current);
    resumeRef.current=setTimeout(()=>setUserPicked(false),15000);
  }

  function handleVideoMeta(e){
    if(videoTimerRef.current)clearTimeout(videoTimerRef.current);
    const delay=Math.max((e.target.duration||30)*1000,30000);
    videoTimerRef.current=setTimeout(()=>{
      setVideoPlaying(false);
      setVideoIdx(i=>(i+1)%videos.length);
    },delay);
  }

  useEffect(()=>()=>{if(videoTimerRef.current)clearTimeout(videoTimerRef.current);},[]);

  const screenH = layoutMode==="full" ? 340 : layoutMode==="split2" ? 300 : 280;
  const gridCols = layoutMode==="full" ? "1fr" : layoutMode==="split2" ? "1fr 1.6fr" : "1fr 1fr 1.6fr";

  const screenBase = {
    borderRadius:12, overflow:"hidden",
    border:`1.5px solid ${alpha(tc.accent,0.35)}`,
    boxShadow:`0 0 24px ${alpha(tc.accent,0.2)},0 0 60px ${alpha(tc.accent,0.08)},inset 0 0 30px rgba(0,0,0,0.5)`,
    background:"#050508", height:screenH, position:"relative",
    transition:"height 0.6s ease",
  };

  const fadeIn = { animation:"slotFade 0.4s ease both" };

  return(
    <div id="led-video-section" style={{background:"#020204",width:"100%",padding:0,overflow:"hidden",position:"relative",transition:"all 0.8s ease",touchAction:"pan-y",pointerEvents:"none"}}>

      {/* Ambient light blobs */}
      <div style={{position:"absolute",top:"10%",left:"5%",width:300,height:300,background:tc.primary,opacity:0.10,filter:"blur(80px)",borderRadius:"50%",pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"absolute",top:"0%",left:"40%",width:400,height:400,background:tc.accent,opacity:0.07,filter:"blur(100px)",borderRadius:"50%",pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"absolute",top:"10%",right:"5%",width:300,height:300,background:tc.secondary,opacity:0.09,filter:"blur(80px)",borderRadius:"50%",pointerEvents:"none",zIndex:0}}/>

      {/* TOP TICKER */}
      <div style={{height:32,background:"#0a0a0a",borderTop:`3px solid ${tc.accent}`,borderBottom:`1px solid ${alpha(tc.accent,0.3)}`,overflow:"hidden",display:"flex",alignItems:"center",
        maskImage:"linear-gradient(90deg,transparent 0%,black 6%,black 94%,transparent 100%)",
        WebkitMaskImage:"linear-gradient(90deg,transparent 0%,black 6%,black 94%,transparent 100%)"}}>
        <div style={{display:"flex",animation:"ledTicker 18s linear infinite",whiteSpace:"nowrap"}}>
          {[...Array(4)].map((_,i)=>(
            <span key={i} style={{fontFamily:MONO,fontSize:11,letterSpacing:3,color:tc.accent,paddingRight:40}}>
              {tickerPrefix}<span style={{fontFamily:"sans-serif"}}>⚽</span> YALLA VAMOS 2030 &nbsp;·&nbsp; <span style={{fontFamily:"sans-serif"}}>🏟️</span> GRAND STADE HASSAN II &nbsp;·&nbsp; <span style={{fontFamily:"sans-serif"}}>🗓️</span> 15 JUIN 2030 &nbsp;·&nbsp; <span style={{fontFamily:"sans-serif"}}>🇲🇦</span> MAROC &nbsp;·&nbsp; <span style={{fontFamily:"sans-serif"}}>🇪🇸</span> ESPAGNE &nbsp;·&nbsp; <span style={{fontFamily:"sans-serif"}}>🇵🇹</span> PORTUGAL &nbsp;·&nbsp; 48 ÉQUIPES · 104 MATCHS &nbsp;·&nbsp; <span style={{fontFamily:"sans-serif"}}>🏆</span> FIFA WORLD CUP 2030 &nbsp;·&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* Layout indicator — desktop only */}
      {isDesk&&(
        <div style={{position:"absolute",top:40,right:16,zIndex:5,display:"flex",gap:1,
          background:"rgba(0,0,0,0.6)",borderRadius:7,padding:"3px 4px",
          border:`1px solid ${alpha(tc.accent,0.2)}`,pointerEvents:"auto"}}>
          {LAYOUTS.map(m=>(
            <LayoutIcon key={m} mode={m} active={layoutMode===m} activeColor={tc.accent} onClick={()=>pickLayout(m)}/>
          ))}
        </div>
      )}

      {/* Mobile: full-width video + countdown strip */}
      {!isDesk&&(
        <>
          {/* Video screen — full width, no border-radius */}
          <div style={{position:"relative",width:"100%",height:200,background:"#000",overflow:"hidden"}}>
            <Scanline/>
            <video
              key={videoIdx}
              src={videoLoaded?videos[videoIdx]:undefined}
              autoPlay muted loop={false} playsInline preload="none"
              style={{width:"100%",height:"100%",objectFit:"cover",display:"block",position:"absolute",top:0,left:0,zIndex:1,pointerEvents:"none"}}
              onPlay={()=>setVideoPlaying(true)}
              onLoadedMetadata={handleVideoMeta}
              onError={e=>{e.target.style.display="none";}}
            />
            <div style={{position:"absolute",bottom:0,left:0,right:0,height:60,background:"linear-gradient(to top,rgba(0,0,0,0.85),transparent)",zIndex:2}}/>
            <div style={{position:"absolute",bottom:10,left:12,zIndex:3}}>
              <div style={{fontFamily:"monospace",fontSize:11,fontWeight:700,color:"white",letterSpacing:2}}>
                🏆 FIFA WORLD CUP 2030
              </div>
            </div>
            <div style={{position:"absolute",top:8,right:8,zIndex:3,background:tc.primary,borderRadius:4,padding:"3px 8px",color:"white",fontSize:9,fontWeight:700,letterSpacing:3,fontFamily:"monospace",animation:"screenFlash 1.5s ease-in-out infinite"}}>
              ● LIVE
            </div>
          </div>
          {/* Countdown strip */}
          <div style={{height:44,background:"#07091A",display:"flex",justifyContent:"center",alignItems:"center",gap:16}}>
            {[
              {v:String(days).padStart(4,"0"),l:"J"},
              {v:String(hours).padStart(2,"0"),l:"H"},
              {v:String(minutes).padStart(2,"0"),l:"M"},
              {v:String(seconds).padStart(2,"0"),l:"S"},
            ].map(({v,l},i)=>(
              <div key={l} style={{display:"flex",alignItems:"baseline",gap:2}}>
                <span style={{fontFamily:MONO,fontSize:16,fontWeight:700,color:tc.accent}}>{v}</span>
                <span style={{fontFamily:MONO,fontSize:9,color:"rgba(255,255,255,0.45)",marginLeft:1}}>{l}</span>
                {i<3&&<span style={{fontFamily:MONO,fontSize:14,color:tc.accent,opacity:0.4,marginLeft:3}}>·</span>}
              </div>
            ))}
          </div>
        </>
      )}

      {/* SCREENS GRID — desktop only */}
      <div style={{
        display:isDesk?"grid":"none",
        gridTemplateColumns:gridCols,
        gap:12,
        padding:"12px 16px",
        background:"#020204",
        position:"relative",
        zIndex:1,
        transition:"grid-template-columns 0.6s ease",
        touchAction:"pan-y",
      }}>

        {/* SCREEN 1 — COUNTDOWN (hidden in full mode) */}
        {layoutMode!=="full"&&(
          <div key={`s1-${layoutMode}`} style={{...screenBase,...fadeIn}}>
            <Scanline/>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",padding:16,zIndex:1,position:"relative"}}>
              <div style={{fontFamily:MONO,fontSize:9,letterSpacing:4,color:tc.accent,marginBottom:16}}>COUNTDOWN TO KICKOFF</div>
              <div style={{display:"flex",gap:10,alignItems:"flex-end"}}>
                {[
                  {v:String(days).padStart(4,"0"),l:"JOURS"},
                  {v:String(hours).padStart(2,"0"),l:"HEURES"},
                  {v:String(minutes).padStart(2,"0"),l:"MINUTES"},
                  {v:String(seconds).padStart(2,"0"),l:"SECONDES"},
                ].map(({v,l})=>(
                  <div key={l} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                    <div style={{width:56,height:64,background:"#0d0d14",border:`1px solid ${alpha(tc.accent,0.4)}`,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,fontWeight:"bold",color:"white",fontFamily:MONO,boxShadow:`0 0 12px ${alpha(tc.accent,0.15)}`,position:"relative"}}>
                      {v}
                      <div style={{position:"absolute",width:"100%",top:"50%",borderTop:`1px solid ${alpha(tc.accent,0.5)}`}}/>
                    </div>
                    <span style={{fontSize:8,letterSpacing:3,color:tc.accent,fontFamily:"monospace"}}>{l}</span>
                  </div>
                ))}
              </div>
              <div style={{fontFamily:"monospace",fontSize:10,color:"rgba(255,255,255,0.35)",letterSpacing:2,marginTop:16}}>
                <span style={{fontFamily:"sans-serif"}}>🗓️</span> 15 JUIN 2030 · CASABLANCA
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 2 — ROTATING SLOTS (split3 only) */}
        {layoutMode==="split3"&&(
          <div key="s2" style={{...screenBase,...fadeIn}}>
            <Scanline/>

            {/* SLOT 0 — Stats */}
            <div style={{position:"absolute",inset:0,opacity:slot===0?1:0,transition:"opacity 0.4s ease",display:"grid",gridTemplateColumns:"1fr 1fr",gap:1,zIndex:1}}>
              {[{n:"48",l:"ÉQUIPES"},{n:"104",l:"MATCHS"},{n:"3",l:"PAYS"},{n:"6",l:"VILLES"}].map(({n,l})=>(
                <div key={l} style={{background:"#07070f",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",border:`0.5px solid ${alpha(tc.accent,0.12)}`}}>
                  <span style={{fontSize:36,fontWeight:800,color:tc.accent,fontFamily:MONO}}>{n}</span>
                  <span style={{fontSize:9,letterSpacing:3,color:"rgba(255,255,255,0.6)",marginTop:4}}>{l}</span>
                </div>
              ))}
            </div>

            {/* SLOT 1 — Players */}
            <div style={{position:"absolute",inset:0,opacity:slot===1?1:0,transition:"opacity 0.4s ease",background:"linear-gradient(135deg,#0a0005,#050508)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,zIndex:1}}>
              <div style={{background:tc.primary,color:"white",fontSize:9,letterSpacing:3,padding:"4px 12px",borderRadius:4,fontFamily:"monospace"}}>
                ⭐ LIONS DE L'ATLAS
              </div>
              <div style={{overflow:"hidden",width:"100%"}}>
                <div style={{display:"flex",animation:"ledTicker 8s linear infinite",whiteSpace:"nowrap"}}>
                  {[1,2].map(i=>(
                    <span key={i} style={{fontFamily:MONO,fontSize:14,color:tc.accent,letterSpacing:2,padding:"0 16px"}}>
                      HAKIMI #2 · EN-NESYRI #14 · ZIYECH #7 ·&nbsp;
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* SLOT 2 — Tickets */}
            <div style={{position:"absolute",inset:0,opacity:slot===2?1:0,transition:"opacity 0.4s ease",background:"linear-gradient(135deg,#001a00,#050508)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,zIndex:1}}>
              <span style={{fontSize:44,fontFamily:"sans-serif"}}>🎟️</span>
              <div style={{fontFamily:MONO,fontSize:17,fontWeight:800,color:"white",letterSpacing:4}}>BILLETS OFFICIELS</div>
              <div style={{fontFamily:"monospace",fontSize:12,color:tc.accent,letterSpacing:2}}>fifa.com/tickets</div>
            </div>

            {/* SLOT 3 — Live Scores */}
            <div style={{position:"absolute",inset:0,opacity:slot===3?1:0,transition:"opacity 0.4s ease",background:"linear-gradient(135deg,#00001a,#050508)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,zIndex:1,padding:12}}>
              <div style={{fontFamily:MONO,fontSize:9,letterSpacing:3,color:"#F0B429",marginBottom:4}}>LIVE SCORES</div>
              {fixtures.length > 0 ? fixtures.slice(0,3).map((f,i)=>(
                <div key={i} style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 8px",borderRadius:6,background:"rgba(255,255,255,0.04)"}}>
                  <span style={{fontFamily:MONO,fontSize:10,color:"white",flex:1,textAlign:"right",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.home}</span>
                  <span style={{fontFamily:MONO,fontSize:13,fontWeight:700,color:"#F0B429",margin:"0 8px",whiteSpace:"nowrap"}}>
                    {f.homeGoals} - {f.awayGoals}
                    <span style={{fontSize:8,color:"rgba(255,255,255,0.5)",marginLeft:4}}>{f.minute}'</span>
                  </span>
                  <span style={{fontFamily:MONO,fontSize:10,color:"white",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.away}</span>
                </div>
              )) : (
                <div style={{fontFamily:MONO,fontSize:11,color:"rgba(255,255,255,0.5)",textAlign:"center"}}>
                  <div>Aucun match en direct</div>
                  <div style={{fontSize:9,color:"#F0B429",marginTop:4}}>{new Date().toLocaleDateString("fr-FR")}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SCREEN 3 — VIDEO (always visible) */}
        <div style={{...screenBase,background:"#000"}}>
          <Scanline/>
          <video
            key={videoIdx}
            src={videos[videoIdx]}
            autoPlay muted loop={false} playsInline preload="none"
            style={{width:"100%",height:"100%",objectFit:"cover",display:"block",position:"absolute",top:0,left:0,zIndex:1,pointerEvents:"none"}}
            onPlay={()=>setVideoPlaying(true)}
            onLoadedMetadata={handleVideoMeta}
            onError={e=>{e.target.style.display="none";}}
          />
          {latestGoal&&Date.now()-latestGoal.timestamp<30000&&(
            <div style={{position:"absolute",inset:0,zIndex:20,background:"rgba(200,16,46,0.9)",
              display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
              animation:"screenFlash 0.3s ease 3"}}>
              <div style={{fontFamily:MONO,fontSize:48,color:"white",fontWeight:900}}>⚽ BUT !</div>
              <div style={{fontFamily:MONO,fontSize:18,color:"white",marginTop:8,textAlign:"center",padding:"0 12px"}}>
                {latestGoal.home} {latestGoal.homeGoals} - {latestGoal.awayGoals} {latestGoal.away}
              </div>
              <div style={{fontFamily:MONO,fontSize:14,color:"#F0B429",marginTop:6}}>{latestGoal.minute}'</div>
            </div>
          )}
          <div style={{position:"absolute",bottom:0,left:0,right:0,height:80,background:"linear-gradient(to top,rgba(0,0,0,0.85),transparent)",zIndex:2}}/>
          <div style={{position:"absolute",bottom:12,left:14,zIndex:3}}>
            <div style={{fontFamily:"monospace",fontSize:12,fontWeight:700,color:"white",letterSpacing:2,marginBottom:4}}>
              🏆 FIFA WORLD CUP 2030
            </div>
            <div style={{fontFamily:"monospace",fontSize:10,color:tc.accent,letterSpacing:1}}>
              Maroc · Espagne · Portugal
            </div>
          </div>
          <div style={{position:"absolute",top:10,right:10,zIndex:3,background:tc.primary,borderRadius:4,padding:"3px 10px",color:"white",fontSize:10,fontWeight:700,letterSpacing:3,fontFamily:"monospace",animation:"screenFlash 1.5s ease-in-out infinite"}}>
            ● LIVE
          </div>
        </div>

      </div>

      {/* BOTTOM TICKER */}
      <div style={{height:32,background:"#0a0a0a",borderTop:`1px solid ${alpha(tc.accent,0.3)}`,borderBottom:`3px solid ${tc.accent}`,overflow:"hidden",display:"flex",alignItems:"center",
        maskImage:"linear-gradient(90deg,transparent 0%,black 6%,black 94%,transparent 100%)",
        WebkitMaskImage:"linear-gradient(90deg,transparent 0%,black 6%,black 94%,transparent 100%)"}}>
        <div style={{display:"flex",animation:"ledTickerRev 22s linear infinite",whiteSpace:"nowrap"}}>
          {[...Array(4)].map((_,i)=>(
            <span key={i} style={{fontFamily:MONO,fontSize:11,letterSpacing:3,color:tc.accent,paddingRight:40}}>
              <span style={{fontFamily:"sans-serif"}}>📅</span> OUVERTURE 15 JUIN 2030 · GROUP A · GROUP B · GROUP C · QUARTS 4 JUILLET · DEMIES 9 JUILLET · FINALE 13 JUILLET 2030 · CASABLANCA · RABAT · MARRAKECH · TANGER · FÈS · AGADIR &nbsp;·&nbsp;
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}

export default React.memo(LEDBoard);
