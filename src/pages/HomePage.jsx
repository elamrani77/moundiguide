import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, useInView } from "framer-motion";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

import {
  TRANSLATIONS, BR, TEAM_DATA, TEAM_PLAYERS, PLAYERS_IMG, TEAM_ISO, PLAYERS,
  WELCOME_FAN, WELCOME, STADIUMS, CITIES, POIS, POI_CATS, NEWS,
  CURRENCIES, INFO_ITEMS, DARIJA, haversine, normalize, formatDist, F
} from "../constants.js";
import LEDBoard from "../components/LEDBoard.jsx";
import Weather from "../components/Weather.jsx";
import SMap from "../components/SMap.jsx";

// ── md renderer ──
function md(t){if(!t)return t;return t.split("\n").map((l,i)=>{let c=l.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>");if(l.startsWith("- ")||l.startsWith("• "))return<div key={i} style={{paddingLeft:12,marginBottom:2}} dangerouslySetInnerHTML={{__html:"• "+c.slice(2)}}/>;if(l.trim()==="")return<div key={i} style={{height:6}}/>;return<div key={i} dangerouslySetInnerHTML={{__html:c}}/>;});}

// ── PlayerReveal — TV broadcast animation ──
function PlayerReveal({teamData,teamName,isDesk,onDone}){
  const[phase,setPhase]=useState(0);
  const players=TEAM_PLAYERS[teamName]||[];
  const primary=teamData.colors[0];
  const secondary=teamData.colors[1]||primary;
  const photoSize=isDesk?120:80;
  const pDur=isDesk?1000:700;
  const font="'Outfit',sans-serif";
  const hex="polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)";

  useEffect(()=>{
    const ts=[
      setTimeout(()=>setPhase(1),300),
      setTimeout(()=>setPhase(2),300+pDur),
      setTimeout(()=>setPhase(3),300+pDur*2),
      setTimeout(()=>setPhase(4),300+pDur*3),
      setTimeout(()=>setPhase(5),300+pDur*3+700),
    ];
    const done=setTimeout(()=>onDone?.(),300+pDur*3+700+500);
    return()=>{ts.forEach(clearTimeout);clearTimeout(done);};
  },[]);

  const fromLeft=[true,false,true];
  const pHex=primary.replace("#","");

  return(
    <motion.div
      initial={{opacity:1}}
      animate={{opacity:phase>=5?0:1}}
      transition={{duration:0.5,ease:"easeIn"}}
      style={{position:"absolute",inset:0,zIndex:20,overflow:"hidden",
        background:"rgba(0,0,0,0.90)",display:"flex",flexDirection:"column",
        alignItems:"center",justifyContent:"center"}}
    >
      <style>{`
        @keyframes pr_scan{from{transform:scaleX(0)}to{transform:scaleX(1)}}
        @keyframes pr_shine{0%{left:-80%}100%{left:160%}}
        @keyframes pr_num{from{opacity:0;transform:scale(1.5)}to{opacity:0.13;transform:scale(1)}}
        @keyframes pr_type{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0% 0 0)}}
        @keyframes pr_flag{0%,100%{transform:scale(1)}50%{transform:scale(1.18)}}
        @keyframes pr_glow{0%,100%{text-shadow:0 0 8px rgba(255,255,255,0.25)}50%{text-shadow:0 0 28px rgba(255,255,255,0.95),0 0 48px #${pHex}CC}}
        @keyframes pr_shimmer{0%{left:-110%}100%{left:110%}}
      `}</style>

      {/* Scan line */}
      <div style={{position:"absolute",top:"50%",left:0,right:0,height:2,
        background:`linear-gradient(90deg,transparent,${primary},${primary},transparent)`,
        transformOrigin:"left center",animation:"pr_scan 0.28s ease-out both"}}/>

      {/* Players */}
      <div style={{display:"flex",flexDirection:isDesk?"row":"column",
        gap:isDesk?44:18,alignItems:"center",justifyContent:"center",
        padding:isDesk?"0 56px":"0 20px",width:"100%",position:"relative",zIndex:2}}>
        {players.map((player,idx)=>{
          if(phase<idx+1)return null;
          const goLeft=fromLeft[idx];
          return(
            <motion.div key={idx}
              initial={{x:goLeft?-140:140,opacity:0,filter:"blur(8px)"}}
              animate={{x:0,opacity:1,filter:"blur(0px)"}}
              transition={{duration:0.5,ease:[0.25,0.46,0.45,0.94]}}
              style={{display:"flex",flexDirection:"row",alignItems:"center",gap:isDesk?18:12}}
            >
              {/* Hexagon photo */}
              <div style={{position:"relative",width:photoSize,height:photoSize,flexShrink:0}}>
                <img src={player.img} alt={player.name}
                  style={{width:photoSize,height:photoSize,objectFit:"cover",
                    clipPath:hex,display:"block",border:`2px solid ${primary}`}}
                  onError={e=>{e.target.src=`https://ui-avatars.com/api/?name=${player.name.replace(/ /g,"+")}&size=200&background=${pHex}&color=fff&bold=true`;}}
                />
                <div style={{position:"absolute",inset:0,clipPath:hex,overflow:"hidden",pointerEvents:"none"}}>
                  <div style={{position:"absolute",top:0,bottom:0,width:"65%",
                    background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.45),transparent)",
                    animation:"pr_shine 0.55s 0.08s ease-out both"}}/>
                </div>
              </div>
              {/* Text */}
              <div style={{position:"relative",minWidth:isDesk?160:110}}>
                <div style={{position:"absolute",top:isDesk?-26:-16,left:isDesk?-8:-5,
                  fontFamily:font,fontSize:isDesk?68:44,fontWeight:900,color:"#FFF",
                  lineHeight:1,zIndex:0,userSelect:"none",
                  animation:"pr_num 0.4s 0.18s ease-out forwards",opacity:0}}>
                  {player.number}
                </div>
                <div style={{position:"relative",zIndex:1,display:"inline-block",
                  padding:"2px 8px",borderRadius:4,marginBottom:6,
                  background:secondary,fontFamily:font,fontSize:9,fontWeight:700,
                  color:"#FFF",letterSpacing:1.5,textTransform:"uppercase"}}>
                  {player.pos}
                </div>
                <div style={{position:"relative",zIndex:1,overflow:"hidden",whiteSpace:"nowrap"}}>
                  <div style={{fontFamily:font,fontSize:isDesk?18:13,fontWeight:800,color:"#FFF",
                    textShadow:`0 0 20px ${primary}CC`,letterSpacing:0.4,
                    animation:"pr_type 0.55s 0.1s steps(22,end) both"}}>
                    {player.name}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Phase 4+: Flag pulse + Team name + shimmer */}
      {phase>=4&&(
        <>
          <motion.div initial={{opacity:0,y:-16}} animate={{opacity:1,y:0}} transition={{duration:0.35}}
            style={{position:"absolute",top:isDesk?"14%":"8%",fontSize:isDesk?58:40,lineHeight:1,
              animation:"pr_flag 1.1s ease-in-out infinite",zIndex:3}}>
            {teamData.flag}
          </motion.div>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.35,delay:0.18}}
            style={{position:"absolute",bottom:isDesk?"14%":"8%",fontFamily:font,
              fontSize:isDesk?20:14,fontWeight:800,color:"#FFF",letterSpacing:5,
              textTransform:"uppercase",animation:"pr_glow 1.4s ease-in-out infinite",zIndex:3}}>
            {teamName}
          </motion.div>
          <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:1}}>
            <div style={{position:"absolute",top:0,bottom:0,width:"35%",
              background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.05),transparent)",
              animation:"pr_shimmer 0.9s ease-out both"}}/>
          </div>
        </>
      )}
    </motion.div>
  );
}

export default function HomePage({C,ac,F: Fprop,lang,send,setPage,isDesk,selectedTeam}){
  const font = Fprop || F;
  const T = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const teamData = selectedTeam ? TEAM_DATA[selectedTeam.t] : null;
  const heroTeamCode = selectedTeam ? (()=>{const r=TEAM_ISO[selectedTeam.t]||"ma";return r.startsWith("gb-")?r.slice(3,5).toUpperCase():r.slice(0,2).toUpperCase();})() : null;
  // Hero players image fade-in
  const [heroImgVisible,setHeroImgVisible]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setHeroImgVisible(true),400);return()=>clearTimeout(t);},[]);

  // Player reveal
  const [showReveal,setShowReveal]=useState(false);
  const prevTeamRef2=useRef(null);
  useEffect(()=>{
    if(!selectedTeam||!teamData)return;
    const key=`playerRevealPlayed_${selectedTeam.t}`;
    const prevKey=prevTeamRef2.current;
    prevTeamRef2.current=key;
    if(prevKey!==key||!sessionStorage.getItem(key)){
      setShowReveal(true);
      sessionStorage.setItem(key,"1");
    }
  },[selectedTeam?.t]);
  const[weatherCity,setWeatherCity]=useState("Casablanca");
  const[rt,sR]=useState(null);
  const[amt,sA]=useState("100");const[cur,sCur]=useState("EUR");
  useEffect(()=>{fetch("https://open.er-api.com/v6/latest/MAD").then(r=>r.json()).then(d=>sR(d.rates)).catch(()=>sR({EUR:.091,USD:.099,GBP:.078,BRL:.57,JPY:14.8}));},[]);
  const citiesRef=useRef(null);const citiesInView=useInView(citiesRef,{once:true,margin:"-80px"});
  const cityTrackRef=useRef(null);
  const flipRefs=useRef({d:null,h:null,m:null,s:null});
  const prevCountRef=useRef({d:0,h:0,m:0,s:0});
  const fanWallRef=useRef(null);const fanWallInView=useInView(fanWallRef,{once:true,margin:"-80px"});
  const timelineRef=useRef(null);const timelineInView=useInView(timelineRef,{margin:"-50px"});
  const timelineLineRef=useRef(null);
  const [selectedStadium,setSelectedStadium]=useState(null);
  const [poiCategory,setPoiCategory]=useState("all");
  const [selectedPoi,setSelectedPoi]=useState(null);
  const [mapFlyTarget,setMapFlyTarget]=useState(null);
  // Geolocation
  const [userCoords,setUserCoords]=useState(null);
  const [geoLoading,setGeoLoading]=useState(false);
  const [geoToast,setGeoToast]=useState("");
  const userCoordsRef=useRef(null);
  useEffect(()=>{userCoordsRef.current=userCoords;},[userCoords]);
  // Search
  const [poiSearch,setPoiSearch]=useState("");
  const [debouncedSearch,setDebouncedSearch]=useState("");
  useEffect(()=>{const t=setTimeout(()=>setDebouncedSearch(poiSearch),200);return()=>clearTimeout(t);},[poiSearch]);
  // Favorites
  const [favorites,setFavorites]=useState(()=>{try{return JSON.parse(localStorage.getItem("moundiguide_favs")||"[]");}catch{return [];}});
  const [showFavsOnly,setShowFavsOnly]=useState(false);
  useEffect(()=>{localStorage.setItem("moundiguide_favs",JSON.stringify(favorites));},[favorites]);
  // Reviews
  const [reviews,setReviews]=useState(()=>{try{return JSON.parse(localStorage.getItem("moundiguide_reviews")||"{}");}catch{return {};}});
  const [reviewFormPoi,setReviewFormPoi]=useState(null);
  const [draftRating,setDraftRating]=useState(0);
  const [draftComment,setDraftComment]=useState("");
  useEffect(()=>{localStorage.setItem("moundiguide_reviews",JSON.stringify(reviews));},[reviews]);

  // Computed: filtered POIs
  const filteredPois=useMemo(()=>{
    let list=POIS;
    if(poiCategory!=="all")list=list.filter(p=>p.category===poiCategory);
    if(showFavsOnly)list=list.filter(p=>favorites.includes(p.id));
    if(debouncedSearch.trim()){const q=normalize(debouncedSearch);list=list.filter(p=>normalize(p.name).includes(q)||normalize(p.city).includes(q));}
    if(userCoords)list=[...list].sort((a,b)=>haversine(userCoords.lat,userCoords.lng,a.lat,a.lng)-haversine(userCoords.lat,userCoords.lng,b.lat,b.lng));
    return list;
  },[poiCategory,showFavsOnly,debouncedSearch,userCoords,favorites]);

  // Helpers
  const toggleFav=useCallback((id)=>{setFavorites(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);},[]);
  const avgRating=(id)=>{const r=(reviews[id]||[]);if(!r.length)return null;return(r.reduce((s,x)=>s+x.rating,0)/r.length).toFixed(1);};
  const submitReview=(poiId)=>{if(!draftRating)return;setReviews(prev=>({...prev,[poiId]:[...(prev[poiId]||[]),{rating:draftRating,comment:draftComment.trim(),date:new Date().toLocaleDateString()}]}));setDraftRating(0);setDraftComment("");setReviewFormPoi(null);};
  const handleGeolocate=()=>{
    if(!navigator.geolocation){setGeoToast("Géolocalisation non supportée");setTimeout(()=>setGeoToast(""),3000);return;}
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos=>{setUserCoords({lat:pos.coords.latitude,lng:pos.coords.longitude});setGeoLoading(false);setGeoToast("");},
      ()=>{setGeoLoading(false);setGeoToast("Accès refusé");setTimeout(()=>setGeoToast(""),3000);},
      {timeout:8000}
    );
  };

  useEffect(()=>{
    window.__poiAsk=(id)=>{const p=POIS.find(x=>x.id===id);if(p)send(`Tell me about ${p.name} in ${p.city}`);};
    window.__poiFav=(id)=>{setFavorites(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);};
    window.__poiGo=(id)=>{const p=POIS.find(x=>x.id===id);if(!p)return;const uc=userCoordsRef.current;const url=uc?`https://www.google.com/maps/dir/${uc.lat},${uc.lng}/${p.lat},${p.lng}`:`https://www.google.com/maps?q=${p.lat},${p.lng}`;window.open(url,"_blank","noopener");};
    return()=>{delete window.__poiAsk;delete window.__poiFav;delete window.__poiGo;};
  },[send]);

  // Countdown to June 15, 2030 18:00 UTC
  const KICKOFF=new Date("2030-06-15T18:00:00Z").getTime();
  const [countdown,setCountdown]=useState({d:0,h:0,m:0,s:0});
  useEffect(()=>{
    const tick=()=>{const diff=Math.max(0,KICKOFF-Date.now());setCountdown({d:Math.floor(diff/86400000),h:Math.floor(diff/3600000)%24,m:Math.floor(diff/60000)%60,s:Math.floor(diff/1000)%60});};
    tick();const id=setInterval(tick,1000);return()=>clearInterval(id);
  },[]);
  useEffect(()=>{
    ['d','h','m','s'].forEach(k=>{
      if(countdown[k]!==prevCountRef.current[k]){
        const el=flipRefs.current[k];
        if(el){el.classList.add('flipping');setTimeout(()=>el.classList.remove('flipping'),250);}
      }
    });
    prevCountRef.current={...countdown};
  },[countdown]);

  // GSAP ScrollTrigger for timeline line
  useEffect(()=>{
    if(!timelineLineRef.current||!timelineRef.current)return;
    const ctx=gsap.context(()=>{
      gsap.fromTo(timelineLineRef.current,{scaleX:0},{scaleX:1,duration:1.4,ease:"power2.out",transformOrigin:"left center",
        scrollTrigger:{trigger:timelineRef.current,start:"top 80%",toggleActions:"play none none reverse"}});
    });
    return()=>ctx.revert();
  },[]);
  const convResult=rt&&amt?Math.round(parseFloat(amt)/(rt[cur]||1)).toLocaleString():"—";
  const inpS={padding:"8px 10px",borderRadius:10,border:`1px solid ${C.bdr}`,background:C.fld,color:C.str,fontSize:13,fontFamily:font,outline:"none"};

  return(
    <div style={{minHeight:"100vh",background:"transparent"}}>

      {/* ── HERO ── */}
      <div style={{position:"relative",height:"100vh",minHeight:560,overflow:"hidden",marginTop:0,paddingTop:0}}>
        {/* Player reveal overlay */}
        {showReveal&&teamData&&(
          <PlayerReveal
            teamData={teamData}
            teamName={selectedTeam.t}
            isDesk={isDesk}
            onDone={()=>setShowReveal(false)}
          />
        )}
        {/* Replay button — shows when no reveal is active and team is selected */}
        {!showReveal&&teamData&&(
          <button onClick={()=>setShowReveal(true)}
            style={{position:"absolute",bottom:72,right:isDesk?44:20,zIndex:10,
              background:"rgba(0,0,0,0.45)",backdropFilter:"blur(8px)",
              border:`1px solid ${teamData.colors[0]}55`,borderRadius:20,
              padding:"5px 12px",cursor:"pointer",
              fontFamily:"'Outfit',sans-serif",fontSize:10,fontWeight:600,
              color:"rgba(255,255,255,0.65)",display:"flex",alignItems:"center",gap:4,
              transition:"all .2s"}}>
            ▶ Squad
          </button>
        )}
        {/* Background: team gradient OR stadium image */}
        {teamData
          ?<div style={{position:"absolute",inset:0,background:teamData.heroGradient}}/>
          :<img src="/stadium-night.png" alt="Stadium Night"
            style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center"}}
            onError={e=>{e.target.style.display="none";}}/>
        }
        {/* Dark overlay */}
        <div style={{position:"absolute",inset:0,background:teamData
          ?"linear-gradient(to bottom,rgba(0,0,0,0.1),rgba(0,0,0,0.82))"
          :"linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(18,20,20,0.95))"}}/>


        {/* Trophy — floating right side */}
        {isDesk&&(
          <img src="/trophy-2030.png" alt="" aria-hidden="true" style={{
            position:"absolute",right:isDesk?"8%":"4%",top:"50%",transform:"translateY(-50%)",
            height:isDesk?320:200,objectFit:"contain",
            animation:"floatTrophy 3s ease-in-out infinite",
            filter:"drop-shadow(0 0 40px rgba(240,180,41,0.45))",
            pointerEvents:"none",zIndex:2,
          }} onError={e=>{e.target.style.display="none";}}/>
        )}

        {/* Players image — desktop only, right 55%, fade-in with left mask */}
        {isDesk&&(
          <div style={{position:"absolute",right:0,bottom:0,top:"auto",width:"65%",height:"92%",
            pointerEvents:"none",zIndex:1,
            maskImage:"linear-gradient(to right, transparent 0%, black 20%, black 100%)",
            WebkitMaskImage:"linear-gradient(to right, transparent 0%, black 20%, black 100%)",
            opacity:heroImgVisible?1:0,transition:"opacity 1.2s ease-out 0.4s"}}>
            <img src={PLAYERS_IMG[TEAM_ISO[selectedTeam?.t]?.toUpperCase()] || "/players-ma.png"} alt="" aria-hidden="true"
              style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 10%",display:"block"}}
              onError={e=>{e.target.parentElement.style.display="none";}}/>
          </div>
        )}

        {/* Hero content */}
        <div style={{position:"absolute",bottom:0,left:0,right:0,padding:isDesk?"48px 64px":"32px 24px",zIndex:2,maxWidth:560}}>
          {/* Badge */}
          <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(240,180,41,0.15)",backdropFilter:"blur(8px)",border:"1px solid rgba(240,180,41,0.35)",borderRadius:24,padding:"5px 14px",marginBottom:16}}>
            <span>⚽</span>
            <span style={{fontFamily:font,fontSize:11,fontWeight:600,color:BR.gold,letterSpacing:2,textTransform:"uppercase"}}>{T.heroBadge}</span>
          </div>

          {/* Welcome text — team mode */}
          {teamData&&(
            <div style={{marginBottom:12}}>
              <span style={{fontFamily:font,fontSize:isDesk?22:17,fontWeight:700,color:"rgba(255,255,255,0.92)",
                textShadow:`0 0 24px ${teamData.colors[0]}CC`}}>
                {(WELCOME_FAN[lang]||WELCOME_FAN.en)(teamData.flag,teamData.name||selectedTeam.t)}
              </span>
            </div>
          )}

          {/* Title */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{hidden:{},visible:{transition:{staggerChildren:0.14,delayChildren:0.15}}}}
            style={{fontFamily:"'Outfit',sans-serif",fontSize:isDesk?64:38,fontWeight:900,lineHeight:1.08,marginBottom:14,letterSpacing:-1}}
          >
            <motion.span
              variants={{hidden:{opacity:0,y:40},visible:{opacity:1,y:0,transition:{duration:0.75,ease:[0.25,0.46,0.45,0.94]}}}}
              style={{display:"inline-block",color:BR.gold}}
            >Yalla</motion.span>
            <motion.span
              variants={{hidden:{opacity:0,y:40},visible:{opacity:1,y:0,transition:{duration:0.75,ease:[0.25,0.46,0.45,0.94]}}}}
              style={{display:"inline-block",color:"#FFF"}}
            >&nbsp;Vamos</motion.span>
            <br/>
            <motion.span
              variants={{hidden:{opacity:0,y:40},visible:{opacity:1,y:0,transition:{duration:0.75,ease:[0.25,0.46,0.45,0.94]}}}}
              style={{display:"inline-block",color:"#FFF"}}
            >2030</motion.span>
          </motion.div>

          {/* Subtitle */}
          <p style={{fontFamily:font,fontSize:isDesk?17:14,color:"rgba(255,255,255,0.82)",marginBottom:teamData?14:28,lineHeight:1.6,maxWidth:480}}>
            {T.heroSub}
          </p>

          {/* Star players strip — team mode */}
          {teamData&&heroTeamCode&&PLAYERS[heroTeamCode]&&(
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:24,flexWrap:"wrap"}}>
              <span style={{fontSize:14}}>⭐</span>
              {[PLAYERS[heroTeamCode].p1,PLAYERS[heroTeamCode].p2,PLAYERS[heroTeamCode].p3].map((s,i,arr)=>(
                <span key={i} style={{fontFamily:font,fontSize:isDesk?14:12,fontWeight:600,color:"rgba(255,255,255,0.88)",
                  textShadow:`0 0 12px ${teamData.colors[0]}AA`}}>
                  {s}{i<arr.length-1&&<span style={{color:"rgba(255,255,255,0.4)",margin:"0 4px"}}>·</span>}
                </span>
              ))}
            </div>
          )}

          {/* Flags */}
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:32}}>
            {["🇲🇦","🇪🇸","🇵🇹"].map((f,i)=>(
              <span key={i} style={{fontSize:28,filter:"drop-shadow(0 2px 6px rgba(0,0,0,0.4))"}}>{f}</span>
            ))}
            <div style={{width:1,height:24,background:"rgba(255,255,255,0.3)",marginLeft:4}}/>
            <span style={{fontFamily:font,fontSize:12,color:"rgba(255,255,255,0.7)"}}>{T.heroFlags}</span>
          </div>

          {/* CTA buttons */}
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
            <button onClick={()=>setPage("schedule")}
              style={{padding:"13px 28px",borderRadius:12,background:`linear-gradient(135deg,${ac},${ac}BB)`,
                border:"none",cursor:"pointer",fontFamily:font,fontWeight:600,fontSize:15,color:"#FFF",
                boxShadow:`0 8px 24px ${ac}55`,transition:"all .2s",width:isDesk?"auto":"100%"}}>
              📅 {T.heroBtn1}
            </button>
            <button onClick={()=>setPage("ticket")}
              style={{padding:"13px 28px",borderRadius:12,background:"rgba(255,255,255,0.12)",
                border:"1px solid rgba(255,255,255,0.35)",backdropFilter:"blur(8px)",
                cursor:"pointer",fontFamily:font,fontWeight:600,fontSize:15,color:"#FFF",transition:"all .2s",width:isDesk?"auto":"100%"}}>
              🎟️ {T.heroBtn2}
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{position:"absolute",bottom:28,right:isDesk?40:20,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
          <div style={{width:1,height:40,background:"rgba(255,255,255,0.3)"}}/>
          <span style={{fontFamily:font,fontSize:9,color:"rgba(255,255,255,0.5)",letterSpacing:2,textTransform:"uppercase",writingMode:"vertical-rl"}}>{T.heroScroll}</span>
        </div>
      </div>

      {/* ── STATS STRIP ── */}
      <div style={{background:"rgba(255,255,255,0.85)",backdropFilter:"blur(20px)",borderBottom:`1px solid ${C.bdr}`,padding:"18px 32px"}}>
        <div style={{maxWidth:1200,margin:"0 auto",display:"flex",justifyContent:"space-around",flexWrap:"wrap",gap:16}}>
          {[{n:"48",l:T.statTeams},{n:"6",l:T.statCities},{n:"3",l:T.statCountries},{n:"104",l:T.statMatches},{n:"115K",l:"Stade Hassan II"},{n:"2030",l:T.statEdition}].map((s,i)=>(
            <div key={i} style={{textAlign:"center"}}>
              <div style={{fontFamily:font,fontSize:28,fontWeight:800,color:i%2===0?ac:BR.gold,lineHeight:1}}>{s.n}</div>
              <div style={{fontFamily:font,fontSize:11,color:C.mut,marginTop:3,textTransform:"uppercase",letterSpacing:1}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── LED BOARD ── */}
      <div style={{touchAction:"pan-y"}}>
        <LEDBoard days={countdown.d} hours={countdown.h} minutes={countdown.m} seconds={countdown.s}
          teamCode={(()=>{const r=TEAM_ISO[selectedTeam?.t]||"ma";return r.startsWith("gb-")?r.slice(3,5).toUpperCase():r.slice(0,2).toUpperCase();})()}
          isDesk={isDesk}/>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{maxWidth:1280,margin:"0 auto",padding:isDesk?"40px 32px":"20px 16px"}}>

        {/* Cities — infinite auto-scroll strip */}
        <div ref={citiesRef} style={{marginBottom:48}}>
          <motion.div
            initial={{opacity:0,y:24}}
            animate={citiesInView?{opacity:1,y:0}:{opacity:0,y:24}}
            transition={{duration:0.6,ease:[0.25,0.46,0.45,0.94]}}
            style={{textAlign:"center",marginBottom:28}}
          >
            <div style={{fontFamily:font,fontSize:isDesk?32:24,fontWeight:800,color:C.str}}>🇲🇦 {T.secCities}</div>
            <div style={{fontFamily:font,fontSize:13,color:C.mut,marginTop:6}}>{T.secCitiesSub}</div>
          </motion.div>
          <div
            style={{position:"relative",overflow:"hidden",
              maskImage:"linear-gradient(90deg,transparent 0%,black 12%,black 88%,transparent 100%)",
              WebkitMaskImage:"linear-gradient(90deg,transparent 0%,black 12%,black 88%,transparent 100%)"}}
            onMouseEnter={()=>{if(cityTrackRef.current)cityTrackRef.current.style.animationPlayState="paused";}}
            onMouseLeave={()=>{if(cityTrackRef.current)cityTrackRef.current.style.animationPlayState="running";}}
          >
            <div ref={cityTrackRef}
              style={{display:"flex",gap:16,width:"max-content",
                animation:"scrollCities 25s linear infinite"}}
            >
              {[...CITIES,...CITIES].map((city,i)=>(
                <div key={i}
                  style={{width:280,height:380,borderRadius:16,overflow:"hidden",
                    flexShrink:0,position:"relative",cursor:"pointer",
                    boxShadow:"0 2px 12px rgba(0,0,0,0.06)",
                    transition:"transform 0.3s ease"}}
                  onMouseEnter={e=>e.currentTarget.style.transform="scale(1.04)"}
                  onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
                >
                  <img src={city.img} alt={city.city}
                    style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}
                    onError={e=>{e.target.style.display="none";}}/>
                  <div style={{position:"absolute",inset:0,
                    background:"linear-gradient(to top,rgba(0,0,0,0.75) 0%,transparent 55%)"}}/>
                  <div style={{position:"absolute",bottom:20,left:20}}>
                    <div style={{fontFamily:font,fontSize:18,fontWeight:700,color:"#FFF"}}>{city.flag} {city.city}</div>
                    <div style={{fontFamily:font,fontSize:10,color:"rgba(255,255,255,0.6)",marginTop:4,
                      letterSpacing:2,textTransform:"uppercase"}}>{T.villeHote}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Map — full width */}
        <div style={{marginBottom:24}}>
          <div style={{width:"100%",background:C.card,border:`1px solid ${C.bdr}`,borderRadius:16,padding:"28px 24px 22px",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
            <div style={{fontFamily:font,marginBottom:20,display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:44,height:44,borderRadius:14,background:"linear-gradient(135deg,#00823C 0%,#1A56DB 100%)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0,boxShadow:"0 4px 16px rgba(0,130,60,0.40)"}}>🗺️</div>
              <div>
                <div style={{fontSize:18,fontWeight:800,color:C.str,lineHeight:1.15,fontFamily:font}}>{T.secMap}</div>
                <div style={{fontSize:11,fontWeight:400,color:C.mut,marginTop:2,fontFamily:font}}>Maroc · {filteredPois.length} points d'intérêt</div>
              </div>
            </div>
            {/* POI Search + Géolocalisation */}
            <div style={{display:"flex",flexDirection:isDesk?"row":"column",gap:8,marginBottom:geoToast?4:14,alignItems:isDesk?"center":"stretch"}}>
              <div style={{flex:1,display:"flex",alignItems:"center",background:C.fld,border:`1.5px solid ${C.bdr}`,borderRadius:999,padding:"0 16px",boxShadow:"inset 0 1px 3px rgba(0,0,0,0.05)",transition:"box-shadow .2s",width:isDesk?"auto":"100%"}}>
                <span style={{fontSize:14,marginRight:8,color:C.mut,flexShrink:0,lineHeight:1}}>🔍</span>
                <input value={poiSearch} onChange={e=>setPoiSearch(e.target.value)} placeholder="Rechercher un POI, une ville..."
                  style={{flex:1,padding:"11px 0",border:"none",background:"transparent",color:C.str,fontSize:12,fontFamily:font,outline:"none"}}/>
                {poiSearch&&<button onClick={()=>setPoiSearch("")} style={{background:"none",border:"none",cursor:"pointer",color:C.mut,fontSize:13,padding:"0 0 0 6px",flexShrink:0,lineHeight:1}}>✕</button>}
              </div>
              <button onClick={handleGeolocate} disabled={geoLoading}
                style={{padding:"11px 16px",borderRadius:999,border:"none",
                  background:userCoords?"linear-gradient(135deg,#00823C,#005A2A)":"linear-gradient(135deg,#1A56DB,#0F3DAA)",
                  color:"#FFF",fontFamily:font,fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",
                  width:isDesk?"auto":"100%",display:"flex",alignItems:"center",justifyContent:"center",
                  boxShadow:userCoords?"0 3px 14px rgba(0,130,60,0.45)":"0 3px 14px rgba(26,86,219,0.35)",transition:"all .2s"}}>
                {geoLoading?"⏳ ...":"📍 Près de moi"}
              </button>
            </div>
            {geoToast&&<div style={{fontFamily:font,fontSize:10,color:BR.red,marginBottom:12}}>{geoToast}</div>}
            {/* POI Category filter pills */}
            <div className="pills-row" style={{display:"flex",flexWrap:"nowrap",overflowX:"auto",overflowY:"visible",WebkitOverflowScrolling:"touch",scrollbarWidth:"none",msOverflowStyle:"none",gap:8,marginBottom:16,paddingBottom:4}}>
              {[
                {id:"all",    icon:"🗺️",label:"Tout",    count:filteredPois.length,  color:"#1A56DB"},
                ...POI_CATS.map(c=>({...c,count:POIS.filter(p=>p.category===c.id).length})),
                {id:"favs",   icon:"♥",  label:"Favoris", count:favorites.length,     color:"#EC4899"},
              ].map(cat=>{
                const isActive=cat.id==="favs"?showFavsOnly:(poiCategory===cat.id&&!showFavsOnly);
                const aCo=cat.color||"#00823C";
                return(
                  <button key={cat.id}
                    onClick={()=>{
                      if(cat.id==="favs"){setShowFavsOnly(p=>!p);setPoiCategory("all");}
                      else{setPoiCategory(cat.id);setShowFavsOnly(false);}
                    }}
                    style={{display:"flex",alignItems:"center",gap:5,padding:"7px 14px",borderRadius:999,
                      border:`1.5px solid ${isActive?aCo:C.bdr}`,
                      background:isActive?`${aCo}20`:C.fld,
                      color:isActive?aCo:C.mut,
                      fontFamily:font,fontSize:11,fontWeight:isActive?700:500,cursor:"pointer",
                      transition:"all .18s",whiteSpace:"nowrap",flexShrink:0,
                      boxShadow:isActive?`0 2px 10px ${aCo}33`:"none"}}>
                    <span style={{fontSize:13}}>{cat.icon}</span>
                    <span>{cat.label}</span>
                    <span style={{background:isActive?`${aCo}28`:"rgba(0,0,0,0.07)",
                      color:isActive?aCo:C.mut,borderRadius:999,padding:"1px 7px",fontSize:9,fontWeight:700,lineHeight:"16px"}}>
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
            <SMap C={C}
              onSelect={s=>{send(`Parle-moi du stade de ${s.city}`);setSelectedStadium(s);setSelectedPoi(null);}}
              onPoiSelect={poi=>{setSelectedPoi(poi);setSelectedStadium(null);setMapFlyTarget({lat:poi.lat,lng:poi.lng,id:poi.id,ts:Date.now()});}}
              activeCategory={poiCategory}
              flyTarget={mapFlyTarget}
              userCoords={userCoords}
              height={(selectedStadium||selectedPoi)?300:500}/>
            {/* Stadium info panel */}
            {selectedStadium&&(
              <div style={{marginTop:12,borderRadius:14,overflow:"hidden",border:`1px solid ${C.bdr}`,animation:"slideDown .25s ease"}}>
                {/* Header image */}
                <div style={{position:"relative",height:110}}>
                  <img src="/stadium-night.png" alt="" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} onError={e=>{e.target.style.display="none";}}/>
                  <img src="/stadium-aerial.png" alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";}}/>
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 40%,rgba(0,0,0,0.8))"}}/>
                  <button onClick={()=>setSelectedStadium(null)} style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,0.55)",border:"none",borderRadius:6,color:"#FFF",width:24,height:24,cursor:"pointer",fontSize:13,lineHeight:1}}>✕</button>
                  <div style={{position:"absolute",bottom:8,left:12}}>
                    <div style={{fontFamily:font,fontSize:13,fontWeight:700,color:"#FFF"}}>{selectedStadium.name}</div>
                    <div style={{fontFamily:font,fontSize:10,color:"rgba(255,255,255,0.65)"}}>{selectedStadium.city} · {selectedStadium.cap} places</div>
                  </div>
                </div>
                {/* Weather */}
                <div style={{padding:"10px 12px",background:C.card}}>
                  <Weather C={C} city={selectedStadium.city}/>
                  {/* Action buttons */}
                  <div style={{display:"flex",gap:8,marginTop:10}}>
                    <a href={`https://www.google.com/maps?q=${selectedStadium.lat},${selectedStadium.lng}`} target="_blank" rel="noopener noreferrer"
                      style={{flex:1,padding:"8px 0",borderRadius:10,background:`linear-gradient(135deg,${BR.blue},#0F3DAA)`,textDecoration:"none",
                        fontFamily:font,fontSize:11,fontWeight:600,color:"#FFF",textAlign:"center",display:"block"}}>
                      📍 Itinéraire
                    </a>
                    <button onClick={()=>{if(navigator.share)navigator.share({title:selectedStadium.name,text:`${selectedStadium.city} — ${selectedStadium.cap} places`,url:window.location.href}).catch(()=>{});else{navigator.clipboard?.writeText(`${selectedStadium.name}, ${selectedStadium.city}`);alert("Copié !");};}}
                      style={{flex:1,padding:"8px 0",borderRadius:10,background:C.fld,border:`1px solid ${C.bdr}`,
                        fontFamily:font,fontSize:11,fontWeight:600,color:C.str,cursor:"pointer"}}>
                      🔗 Partager
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* POI detail panel */}
            {selectedPoi&&!selectedStadium&&(()=>{
              const cat=POI_CATS.find(c=>c.id===selectedPoi.category)||{icon:"📍",color:BR.red,label:""};
              const isFav=favorites.includes(selectedPoi.id);
              const dist=userCoords?haversine(userCoords.lat,userCoords.lng,selectedPoi.lat,selectedPoi.lng):null;
              const poiRevs=reviews[selectedPoi.id]||[];
              const avg=avgRating(selectedPoi.id);
              const mapsUrl=userCoords?`https://www.google.com/maps/dir/${userCoords.lat},${userCoords.lng}/${selectedPoi.lat},${selectedPoi.lng}`:`https://www.google.com/maps?q=${selectedPoi.lat},${selectedPoi.lng}`;
              return(
              <div style={{marginTop:12,borderRadius:14,overflow:"hidden",border:`1px solid ${cat.color}44`,animation:"slideDown .25s ease"}}>
                <div style={{background:`linear-gradient(135deg,${cat.color}22,${cat.color}08)`,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div>
                    <div style={{fontFamily:font,fontSize:13,fontWeight:800,color:C.str}}>{cat.icon} {selectedPoi.name}</div>
                    <div style={{fontFamily:font,fontSize:10,color:C.mut,marginTop:2}}>
                      {cat.label} · {selectedPoi.city}
                      {dist!==null&&<span style={{marginLeft:8,color:BR.blue}}>📍 {formatDist(dist)}</span>}
                    </div>
                  </div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <button onClick={()=>toggleFav(selectedPoi.id)}
                      style={{background:"none",border:"none",cursor:"pointer",fontSize:18,lineHeight:1,padding:0,color:isFav?"#EC4899":C.mut}}>
                      {isFav?"♥":"♡"}
                    </button>
                    <button onClick={()=>setSelectedPoi(null)} style={{background:"none",border:"none",cursor:"pointer",color:C.mut,fontSize:16,lineHeight:1,padding:0}}>✕</button>
                  </div>
                </div>
                <div style={{padding:"10px 14px",background:C.card}}>
                  {(selectedPoi.rating||selectedPoi.price||avg)&&(
                    <div style={{fontFamily:font,fontSize:11,color:C.str,marginBottom:5}}>
                      {(selectedPoi.rating||avg)&&<span>⭐ {avg||selectedPoi.rating}&nbsp;&nbsp;</span>}
                      {selectedPoi.price&&<span>💰 {selectedPoi.price}</span>}
                    </div>
                  )}
                  {selectedPoi.address&&<div style={{fontFamily:font,fontSize:11,color:C.mut,marginBottom:4}}>📍 {selectedPoi.address}</div>}
                  {selectedPoi.hours&&<div style={{fontFamily:font,fontSize:11,color:C.mut,marginBottom:4}}>🕐 {selectedPoi.hours}</div>}
                  {selectedPoi.phone&&<div style={{marginBottom:8}}><a href={`tel:${selectedPoi.phone}`} style={{fontFamily:font,fontSize:11,color:cat.color,textDecoration:"none"}}>📞 {selectedPoi.phone}</a></div>}
                  <div style={{display:"flex",gap:8,marginTop:4}}>
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                      style={{flex:1,padding:"7px 0",borderRadius:10,background:`linear-gradient(135deg,${cat.color},${cat.color}AA)`,textDecoration:"none",
                        fontFamily:font,fontSize:11,fontWeight:600,color:"#FFF",textAlign:"center",display:"block"}}>
                      🧭 Y aller
                    </a>
                    <button onClick={()=>send(`Tell me about ${selectedPoi.name} in ${selectedPoi.city}`)}
                      style={{flex:1,padding:"7px 0",borderRadius:10,background:C.fld,border:`1px solid ${C.bdr}`,
                        fontFamily:font,fontSize:11,fontWeight:600,color:C.str,cursor:"pointer"}}>
                      💬 Ask AI
                    </button>
                  </div>
                  {/* Reviews */}
                  <div style={{marginTop:12,borderTop:`1px solid ${C.bdr}`,paddingTop:10}}>
                    <div style={{fontFamily:font,fontSize:11,fontWeight:700,color:C.str,marginBottom:6}}>
                      ⭐ Avis {poiRevs.length>0&&`(${poiRevs.length})`}
                    </div>
                    {poiRevs.slice(-3).map((rv,i)=>(
                      <div key={i} style={{background:C.fld,borderRadius:8,padding:"6px 8px",marginBottom:4}}>
                        <div style={{fontFamily:font,fontSize:10,color:BR.gold}}>{"★".repeat(rv.rating)}{"☆".repeat(5-rv.rating)}</div>
                        {rv.comment&&<div style={{fontFamily:font,fontSize:10,color:C.str,marginTop:2}}>{rv.comment}</div>}
                        <div style={{fontFamily:font,fontSize:9,color:C.mut,marginTop:2}}>{rv.date}</div>
                      </div>
                    ))}
                    {reviewFormPoi===selectedPoi.id?(
                      <div style={{background:C.fld,borderRadius:8,padding:"8px 10px",marginTop:4}}>
                        <div style={{display:"flex",gap:4,marginBottom:6}}>
                          {[1,2,3,4,5].map(n=>(
                            <button key={n} onClick={()=>setDraftRating(n)}
                              style={{background:"none",border:"none",cursor:"pointer",fontSize:16,color:n<=draftRating?BR.gold:C.bdr,padding:0}}>★</button>
                          ))}
                        </div>
                        <input value={draftComment} onChange={e=>setDraftComment(e.target.value)} placeholder="Votre commentaire (optionnel)"
                          style={{width:"100%",padding:"5px 8px",borderRadius:7,border:`1px solid ${C.bdr}`,background:C.card,color:C.str,fontSize:10,fontFamily:font,outline:"none",marginBottom:6,boxSizing:"border-box"}}/>
                        <div style={{display:"flex",gap:6}}>
                          <button onClick={()=>submitReview(selectedPoi.id)} disabled={!draftRating}
                            style={{flex:1,padding:"5px 0",borderRadius:7,background:draftRating?BR.red:C.bdr,border:"none",color:"#FFF",fontFamily:font,fontSize:10,fontWeight:600,cursor:draftRating?"pointer":"not-allowed"}}>
                            Publier
                          </button>
                          <button onClick={()=>setReviewFormPoi(null)}
                            style={{padding:"5px 10px",borderRadius:7,background:C.fld,border:`1px solid ${C.bdr}`,color:C.mut,fontFamily:font,fontSize:10,cursor:"pointer"}}>
                            Annuler
                          </button>
                        </div>
                      </div>
                    ):(
                      <button onClick={()=>setReviewFormPoi(selectedPoi.id)}
                        style={{marginTop:4,padding:"5px 12px",borderRadius:8,background:C.fld,border:`1px solid ${C.bdr}`,
                          color:C.mut,fontFamily:font,fontSize:10,cursor:"pointer"}}>
                        + Laisser un avis
                      </button>
                    )}
                  </div>
                </div>
              </div>
              );
            })()}
          </div>
        </div>

        {/* Météo + Convertisseur + Actualités */}
        <div style={{display:"grid",gridTemplateColumns:isDesk?"1fr 1fr 1fr":"1fr",gap:20,marginBottom:48}}>
          {/* Météo */}
          <div style={{background:C.card,border:`1px solid ${C.bdr}`,borderRadius:16,padding:20,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
            <div style={{fontFamily:font,fontSize:15,fontWeight:700,color:C.str,marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:20}}>☀️</span> {T.secWeather}
            </div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
              {STADIUMS.map(s=>(
                <button key={s.city} onClick={()=>setWeatherCity(s.city)}
                  style={{padding:"3px 9px",borderRadius:20,border:`1px solid ${weatherCity===s.city?ac:C.bdr}`,
                    background:weatherCity===s.city?`${ac}18`:C.fld,color:weatherCity===s.city?ac:C.mut,
                    fontSize:10,cursor:"pointer",fontFamily:font,transition:"all .18s"}}>
                  {s.city}
                </button>
              ))}
            </div>
            <Weather C={C} city={weatherCity}/>
          </div>
          {/* Convertisseur */}
          <div style={{background:C.card,border:`1px solid ${C.bdr}`,borderRadius:16,padding:20,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
            <div style={{fontFamily:font,fontSize:15,fontWeight:700,color:C.str,marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:20}}>💱</span> {T.secCurrency}
            </div>
            <div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap"}}>
              <input id="currency-amount" name="currency-amount" type="number" value={amt} onChange={e=>sA(e.target.value)} style={{...inpS,width:"30%",minWidth:60}}/>
              <select id="currency-select" name="currency-select" value={cur} onChange={e=>sCur(e.target.value)} style={{...inpS,cursor:"pointer"}}>
                {CURRENCIES.map(c=><option key={c.c} value={c.c}>{c.s} {c.c}</option>)}
              </select>
              <span style={{color:C.mut,fontSize:16}}>→</span>
              <div style={{fontFamily:font,fontSize:20,fontWeight:700,color:BR.gold}}>{convResult} <span style={{fontSize:11,color:C.mut,fontWeight:400}}>MAD</span></div>
            </div>
          </div>
          {/* Actualités */}
          <div style={{background:C.card,border:`1px solid ${C.bdr}`,borderRadius:16,padding:20,boxShadow:"0 2px 12px rgba(0,0,0,0.06)",maxHeight:480,overflowY:"auto"}}>
            <div style={{fontFamily:font,fontSize:15,fontWeight:700,color:C.str,marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:20}}>📰</span> {T.secNews}
            </div>
            {NEWS.map((n,i)=>(
              <div key={i} onClick={()=>send(n.t)}
                style={{padding:"10px 0",borderBottom:i<NEWS.length-1?`1px solid ${C.bdr}`:"none",cursor:"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,gap:4,overflow:"hidden"}}>
                  <span style={{fontFamily:font,fontSize:9,color:n.tc,fontWeight:600,background:`${n.tc}18`,padding:"2px 8px",borderRadius:20,flexShrink:0}}>{n.tg}</span>
                  <span style={{fontFamily:font,fontSize:9,color:C.mut,flexShrink:0}}>{n.d}</span>
                </div>
                <div style={{fontFamily:font,fontSize:12,color:C.str,lineHeight:1.4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{n.t}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Infos pratiques + Darija */}
        <div style={{display:"grid",gridTemplateColumns:isDesk?"1fr 1fr":"1fr",gap:24,marginBottom:48}}>
          <div style={{background:C.card,border:`1px solid ${C.bdr}`,borderRadius:16,padding:24,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
            <div style={{fontFamily:font,fontSize:15,fontWeight:700,color:C.str,marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:20}}>ℹ️</span> {T.secInfo}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
              {INFO_ITEMS.map((it,i)=>(
                <div key={i} style={{textAlign:"center",padding:"10px 6px",background:C.fld,borderRadius:12}}>
                  <div style={{fontSize:20,marginBottom:5}}>{it.i}</div>
                  <div style={{fontFamily:font,fontSize:13,fontWeight:700,color:C.str}}>{it.v}</div>
                  <div style={{fontFamily:font,fontSize:9,color:C.mut,marginTop:2}}>{it.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{background:C.card,border:`1px solid ${C.bdr}`,borderRadius:16,padding:24,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
            <div style={{fontFamily:font,fontSize:15,fontWeight:700,color:C.str,marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:20}}>🗣️</span> {T.secDarija}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {DARIJA.map((p,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                background:"#FFFFFF",border:"1px solid #E5E7EB",borderRadius:999,padding:"8px 18px"}}>
                <span style={{fontFamily:font,fontSize:14,fontWeight:600,color:C.str}}>{p.d}</span>
                <span style={{fontFamily:font,fontSize:13,color:C.mut}}>{p.t[lang]||p.t.en}</span>
              </div>
            ))}
            </div>
          </div>
        </div>

        {/* ── FAN WALL ── */}
        <div ref={fanWallRef} style={{marginBottom:56}}>

          {/* Section heading */}
          <motion.div
            initial={{opacity:0,y:24}}
            animate={fanWallInView?{opacity:1,y:0}:{opacity:0,y:24}}
            transition={{duration:0.6,ease:[0.25,0.46,0.45,0.94]}}
            style={{textAlign:"center",marginBottom:32}}
          >
            <div style={{fontFamily:font,fontSize:isDesk?32:24,fontWeight:800,color:C.str}}>📸 Fan Wall</div>
            <div style={{fontFamily:font,fontSize:13,color:C.mut,marginTop:6}}>Les 6 villes hôtes du Maroc</div>
          </motion.div>

          {/* Cork board */}
          <div style={{
            borderRadius:20,overflow:"hidden",position:"relative",
            backgroundColor:"#C4873A",
            backgroundImage:`repeating-radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0) 0 0 / 4px 4px, url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.14 0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize:"4px 4px, 200px 200px",
            boxShadow:"inset 0 0 70px rgba(0,0,0,0.28), 0 8px 32px rgba(0,0,0,0.28)",
            padding:isDesk?"28px 32px 44px":"20px 14px 32px",
          }}>
            {/* Inner border shadow */}
            <div style={{position:"absolute",inset:0,border:"10px solid rgba(0,0,0,0.08)",borderRadius:20,pointerEvents:"none",zIndex:10}}/>

            {/* Polaroid grid */}
            <motion.div
              variants={{hidden:{},visible:{transition:{staggerChildren:0.1}}}}
              initial="hidden"
              animate={fanWallInView?"visible":"hidden"}
              style={{
                display:"flex",
                flexWrap:"wrap",
                justifyContent:"space-evenly",
                gap:isDesk?24:14,
                alignItems:"start",
              }}
            >
              {[
                {city:"Casablanca",img:"/casablanca.jpg",  flag:"🌊",rot:-5,pin:BR.red},
                {city:"Rabat",     img:"/rabat.jpg",       flag:"👑",rot: 3,pin:BR.blue},
                {city:"Fès",       img:"/fes.webp",        flag:"🕌",rot:-4,pin:BR.gold},
                {city:"Marrakech", img:"/MARRAKECH-CITY.webp",flag:"🌹",rot: 6,pin:BR.green},
                {city:"Tanger",    img:"/Tanger.jpg",      flag:"🌊",rot:-3,pin:BR.purple},
                {city:"Agadir",    img:"/AGADIR.jpg",      flag:"🏖️",rot: 5,pin:BR.red},
              ].map((p)=>(
                <motion.div
                  key={p.city}
                  layout="position"
                  variants={{
                    hidden:{opacity:0,y:-50,rotate:0},
                    visible:{opacity:1,y:0,rotate:p.rot,transition:{duration:0.55,ease:[0.25,0.46,0.45,0.94]}}
                  }}
                  style={{position:"relative",width:isDesk?150:100,flexShrink:0,paddingTop:12}}
                >
                  {/* Push pin */}
                  <div style={{
                    position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",
                    width:16,height:16,borderRadius:"50%",background:p.pin,zIndex:3,
                    boxShadow:`0 2px 8px rgba(0,0,0,0.55),0 0 0 2px rgba(255,255,255,0.22),inset 0 1px 3px rgba(255,255,255,0.35)`,
                  }}/>
                  {/* Polaroid body */}
                  <div style={{
                    background:"var(--polaroid-paper)",padding:"8px 8px 34px 8px",
                    boxShadow:"0 6px 22px rgba(0,0,0,0.42)",position:"relative",
                  }}>
                    <img src={p.img} alt={p.city}
                      onError={e=>{e.target.src="/fallback.svg";}}
                      style={{width:"100%",height:isDesk?118:85,objectFit:"cover",display:"block"}}
                    />
                    <img src="/polaroid-frame.png" alt="" aria-hidden="true" style={{
                      position:"absolute",inset:0,width:"100%",height:"100%",
                      objectFit:"fill",opacity:0.15,pointerEvents:"none",mixBlendMode:"multiply",
                    }}/>
                    <div style={{
                      textAlign:"center",marginTop:6,fontFamily:"'Outfit',sans-serif",
                      fontSize:isDesk?11:8,fontWeight:600,color:"var(--polaroid-ink)",fontStyle:"italic",
                    }}>{p.flag} {p.city}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Horizontal Timeline */}
          <div ref={timelineRef} style={{marginTop:44}}>
            <motion.div
              initial={{opacity:0,y:16}}
              animate={timelineInView?{opacity:1,y:0}:{opacity:0,y:16}}
              transition={{duration:0.5,ease:[0.25,0.46,0.45,0.94]}}
              style={{fontFamily:font,fontSize:isDesk?20:17,fontWeight:700,color:C.str,textAlign:"center",marginBottom:28}}
            >
              🗓️ Road to 2030
            </motion.div>
            {isDesk ? (
            <div style={{overflowX:"auto",paddingBottom:8}}>
              <div style={{minWidth:580,position:"relative",height:170}}>
                {/* Gray base track */}
                <div style={{position:"absolute",top:"50%",left:"5%",right:"5%",height:2,background:C.bdr,transform:"translateY(-50%)"}}/>
                {/* Animated green fill (GSAP) */}
                <div ref={timelineLineRef} style={{
                  position:"absolute",top:"calc(50% - 1px)",left:"5%",height:2,
                  background:`linear-gradient(90deg,${BR.check},${BR.gold})`,
                  width:`${(3/7)*90}%`,
                  transformOrigin:"left center",
                }}/>
                {[
                  {date:"Dec 2022",  label:"FIFA Announcement",    status:"done"},
                  {date:"Feb 2024",  label:"Host Cities",          status:"done"},
                  {date:"Jun 2024",  label:"Construction",         status:"done"},
                  {date:"Jan 2029",  label:"Ticket Sales Open",    status:"current"},
                  {date:"Mar 2030",  label:"Qualification",        status:"future"},
                  {date:"Jun 14",    label:"Opening Ceremony",     status:"future"},
                  {date:"Jun 15",    label:"First Match",          status:"future"},
                  {date:"Jul 13",    label:"Final 🏆",             status:"future"},
                ].map((ev,i,arr)=>{
                  const pct = 5 + (i/(arr.length-1))*90;
                  const above = i%2===0;
                  const dotColor = ev.status==="done"?BR.check:ev.status==="current"?BR.gold:C.bdr;
                  const dotFill  = ev.status==="done"?BR.check:ev.status==="current"?BR.gold:"transparent";
                  return(
                    <motion.div
                      key={i}
                      initial={{opacity:0,scale:0.4}}
                      animate={timelineInView?{opacity:1,scale:1}:{opacity:0,scale:0.4}}
                      transition={{duration:0.35,delay:0.4+i*0.1,ease:"backOut"}}
                      style={{position:"absolute",left:`${pct}%`,top:"50%",transform:"translate(-50%,-50%)",zIndex:2}}
                    >
                      <div style={{
                        width:ev.status==="current"?18:12,height:ev.status==="current"?18:12,
                        borderRadius:"50%",background:dotFill,border:`2px solid ${dotColor}`,
                        animation:ev.status==="current"?"goldRing 1.8s ease-out infinite":
                                  ev.status==="done"?`particleBurst 0.4s ease ${0.4+i*0.1}s both`:undefined,
                        transform:"translate(-50%,-50%)",position:"absolute",top:"50%",left:"50%",
                      }}/>
                      <div style={{
                        position:"absolute",
                        ...(above?{bottom:18}:{top:18}),
                        left:"50%",transform:"translateX(-50%)",
                        textAlign:"center",width:72,
                      }}>
                        <div style={{fontFamily:font,fontSize:10,fontWeight:ev.status==="current"?700:ev.status==="done"?600:400,color:ev.status==="current"?BR.gold:ev.status==="done"?C.str:C.mut,lineHeight:1.3}}>{ev.label}</div>
                        <div style={{fontFamily:font,fontSize:7.5,color:C.mut,marginTop:1}}>{ev.date}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
            ) : (
            <div style={{display:"flex",flexDirection:"column",position:"relative",paddingLeft:28}}>
              <div style={{position:"absolute",left:8,top:6,bottom:6,width:2,background:C.bdr}}/>
              {[
                {date:"Dec 2022",  label:"FIFA Announcement",    status:"done"},
                {date:"Feb 2024",  label:"Host Cities",          status:"done"},
                {date:"Jun 2024",  label:"Construction",         status:"done"},
                {date:"Jan 2029",  label:"Ticket Sales Open",    status:"current"},
                {date:"Mar 2030",  label:"Qualification",        status:"future"},
                {date:"Jun 14",    label:"Opening Ceremony",     status:"future"},
                {date:"Jun 15",    label:"First Match",          status:"future"},
                {date:"Jul 13",    label:"Final 🏆",             status:"future"},
              ].map((ev,i)=>{
                const dotColor=ev.status==="done"?BR.check:ev.status==="current"?BR.gold:C.bdr;
                const dotFill=ev.status==="done"?BR.check:ev.status==="current"?BR.gold:"transparent";
                return(
                  <motion.div key={i}
                    initial={{opacity:0,x:-10}}
                    animate={timelineInView?{opacity:1,x:0}:{opacity:0,x:-10}}
                    transition={{duration:0.35,delay:0.1+i*0.07,ease:"easeOut"}}
                    style={{display:"flex",alignItems:"flex-start",gap:12,padding:"7px 0",position:"relative"}}
                  >
                    <div style={{position:"absolute",left:-20,top:13,width:12,height:12,borderRadius:"50%",
                      background:dotFill,border:`2px solid ${dotColor}`,
                      animation:ev.status==="current"?"goldRing 1.8s ease-out infinite":undefined}}/>
                    <div>
                      <div style={{fontFamily:font,fontSize:12,fontWeight:ev.status==="current"?700:ev.status==="done"?600:400,
                        color:ev.status==="current"?BR.gold:ev.status==="done"?C.str:C.mut,lineHeight:1.3}}>{ev.label}</div>
                      <div style={{fontFamily:font,fontSize:10,color:C.mut,marginTop:1}}>{ev.date}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            )}
          </div>
        </div>

        {/* AI CTA banner */}
        <div style={{borderRadius:24,background:`linear-gradient(135deg,${BR.red}22,${BR.gold}11)`,border:`1px solid ${BR.red}33`,padding:isDesk?"36px 48px":"24px",textAlign:"center",marginBottom:40}}>
          <div style={{fontSize:40,marginBottom:12}}>🤖</div>
          <div style={{fontFamily:font,fontSize:isDesk?24:18,fontWeight:700,color:C.str,marginBottom:8}}>{T.aiTitle}</div>
          <div style={{fontFamily:font,fontSize:14,color:C.mut,marginBottom:20}}>{T.aiSub}</div>
          <button onClick={()=>send(WELCOME[lang]||WELCOME.en)}
            style={{padding:"12px 32px",borderRadius:12,background:`linear-gradient(135deg,${BR.red},#B50F25)`,
              border:"none",cursor:"pointer",fontFamily:font,fontWeight:600,fontSize:15,color:"#FFF",
              boxShadow:`0 8px 24px ${BR.red}44`}}>
            💬 {T.aiBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
