import { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from "react";
import { motion, useInView } from "framer-motion";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

import {
  TRANSLATIONS, BR, TEAM_DATA, PLAYERS_IMG, TEAM_ISO, PLAYERS,
  WELCOME_FAN, WELCOME, STADIUMS, CITIES, POIS, POI_CATS, NEWS,
  CURRENCIES, INFO_ITEMS, DARIJA, haversine, normalize, formatDist, F
} from "../constants.js";
import { useAnalytics } from "../hooks/useAnalytics.js";
import LEDBoard from "../components/LEDBoard.jsx";
import Weather from "../components/Weather.jsx";
import { useLiveScores } from "../hooks/useLiveScores";

const SMap = lazy(() => import("../components/SMap.jsx"));

// ── md renderer ──
function md(t){if(!t)return t;return t.split("\n").map((l,i)=>{let c=l.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>");if(l.startsWith("- ")||l.startsWith("• "))return<div key={i} style={{paddingLeft:12,marginBottom:2}} dangerouslySetInnerHTML={{__html:"• "+c.slice(2)}}/>;if(l.trim()==="")return<div key={i} style={{height:6}}/>;return<div key={i} dangerouslySetInnerHTML={{__html:c}}/>;});}

export default function HomePage({C,ac,F: Fprop,lang,send,setPage,isDesk,selectedTeam}){
  const font = Fprop || F;
  const { track } = useAnalytics();
  const T = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const teamData = selectedTeam ? TEAM_DATA[selectedTeam.t] : null;
  const heroTeamCode = selectedTeam ? (()=>{const r=TEAM_ISO[selectedTeam.t]||"ma";return r.startsWith("gb-")?r.slice(3,5).toUpperCase():r.slice(0,2).toUpperCase();})() : null;
  const teamCode = selectedTeam ? (TEAM_ISO[selectedTeam?.t]?.toUpperCase()||"MA") : null;
  const heroImg = teamCode ? (PLAYERS_IMG[teamCode]||"/players-ma.png") : "/players-default.png";

  const [installPrompt,setInstallPrompt]=useState(null);
  const [showInstall,setShowInstall]=useState(false);
  useEffect(()=>{
    const handler=e=>{e.preventDefault();setInstallPrompt(e);setShowInstall(true);};
    window.addEventListener("beforeinstallprompt",handler);
    return()=>window.removeEventListener("beforeinstallprompt",handler);
  },[]);

  const [notifEnabled,setNotifEnabled]=useState(localStorage.getItem("moundiNotif")==="true");
  const [notifDismissed,setNotifDismissed]=useState(localStorage.getItem("moundiNotifDismissed")==="true");

  async function requestNotifications(){
    if(!("Notification" in window))return;
    const permission=await Notification.requestPermission();
    if(permission==="granted"){
      setNotifEnabled(true);
      localStorage.setItem("moundiNotif","true");
      new Notification("MoundiGuide 🏆",{
        body:"Notifications activées ! Vous recevrez des alertes avant les matchs.",
        icon:"/logo.png",badge:"/logo.png",
      });
    }
  }

  function scheduleMatchNotification(matchTime,homeTeam,awayTeam){
    const timeUntilMatch=new Date(matchTime)-Date.now();
    const oneHourBefore=timeUntilMatch-3600000;
    if(oneHourBefore>0){
      setTimeout(()=>{
        new Notification("Match dans 1h ! 🏟️",{
          body:`${homeTeam} vs ${awayTeam} — Préparez-vous !`,
          icon:"/logo.png",tag:`match-${homeTeam}-${awayTeam}`,
        });
      },oneHourBefore);
    }
  }

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
  useEffect(()=>{const t=setTimeout(()=>setDebouncedSearch(poiSearch),300);return()=>clearTimeout(t);},[poiSearch]);
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

  const { fixtures, latestGoal } = useLiveScores(300000);

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
    gsap.registerPlugin(ScrollTrigger);
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
      <div style={{position:"relative",height:"100vh",minHeight:560,overflow:"hidden",marginTop:0,paddingTop:0,
        background:"linear-gradient(135deg,#1a0005 0%,#07091A 55%,#001a0a 100%)"}}>
        {/* Background: team gradient layered on top of dark base */}
        {teamData&&<div style={{position:"absolute",inset:0,background:teamData.heroGradient,zIndex:0}}/>}
        {/* Dark overlay */}
        <div style={{position:"absolute",inset:0,
          background:teamData
            ?"linear-gradient(to bottom,rgba(0,0,0,0.1),rgba(0,0,0,0.82))"
            :"rgba(0,0,0,0.55)",
          zIndex:1}}/>



        {/* Trophy — floating right side */}
        {isDesk&&(
          <img src="/trophy-2030.png" alt="" aria-hidden="true" style={{
            position:"absolute",right:isDesk?"8%":"4%",top:"50%",transform:"translateY(-50%)",
            height:isDesk?320:200,objectFit:"contain",
            animation:"floatTrophy 3s ease-in-out infinite",
            filter:"drop-shadow(0 0 40px rgba(240,180,41,0.45))",
            pointerEvents:"none",zIndex:3,
          }} onError={e=>{e.target.style.display="none";}}/>
        )}

        {/* Players image — desktop only */}
        {isDesk&&(
          <img
            src={heroImg}
            alt={`Joueurs de ${selectedTeam?.t||"l'équipe hôte"}`}
            width="800" height="600"
            fetchpriority="high"
            decoding="async"
            style={{
              position:"absolute",right:0,bottom:0,
              height:"92%",width:"65%",
              objectFit:"cover",objectPosition:"center 10%",
              WebkitMaskImage:"linear-gradient(to right, transparent 0%, black 20%, black 100%)",
              maskImage:"linear-gradient(to right, transparent 0%, black 20%, black 100%)",
              pointerEvents:"none",zIndex:2,
            }}
          />
        )}

        {/* Hero content */}
        <div style={{position:"absolute",left:isDesk?40:16,top:"50%",transform:"translateY(-50%)",zIndex:3,maxWidth:lang==="ar"&&isDesk?480:isDesk?560:"90%",direction:"ltr"}}>
          {/* Badge */}
          <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(240,180,41,0.15)",backdropFilter:"blur(8px)",border:"1px solid rgba(240,180,41,0.35)",borderRadius:24,padding:"5px 14px",marginBottom:16,flexDirection:lang==="ar"?"row-reverse":"row"}}>
            <span>⚽</span>
            <span style={{fontFamily:font,fontSize:11,fontWeight:600,color:BR.gold,letterSpacing:2,textTransform:"uppercase"}}>{T.heroBadge}</span>
          </div>

          {/* Welcome text — team mode */}
          {teamData&&(
            <div style={{marginBottom:12,direction:lang==="ar"?"rtl":"ltr",textAlign:lang==="ar"?"right":"left"}}>
              <span style={{fontFamily:font,fontSize:isDesk?22:17,fontWeight:700,color:"rgba(255,255,255,0.92)",
                textShadow:`0 0 24px ${teamData.colors[0]}CC`}}>
                {lang==="ar"
                  ?`!أهلاً مشجع ${teamData.flag} ${teamData.name||selectedTeam.t}`
                  :(WELCOME_FAN[lang]||WELCOME_FAN.en)(teamData.flag,teamData.name||selectedTeam.t)}
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
            <span style={{direction:"ltr",display:"inline-block"}}>
              <motion.span
                variants={{hidden:{opacity:0,y:40},visible:{opacity:1,y:0,transition:{duration:0.75,ease:[0.25,0.46,0.45,0.94]}}}}
                style={{display:"inline-block",color:BR.gold}}
              >Yalla</motion.span>
              <motion.span
                variants={{hidden:{opacity:0,y:40},visible:{opacity:1,y:0,transition:{duration:0.75,ease:[0.25,0.46,0.45,0.94]}}}}
                style={{display:"inline-block",color:"#FFF"}}
              >&nbsp;Vamos</motion.span>
            </span>
            <br/>
            <motion.span
              variants={{hidden:{opacity:0,y:40},visible:{opacity:1,y:0,transition:{duration:0.75,ease:[0.25,0.46,0.45,0.94]}}}}
              style={{display:"inline-block",color:"#FFF"}}
            >2030</motion.span>
          </motion.div>

          {/* Subtitle */}
          <p style={{fontFamily:font,fontSize:isDesk?17:14,color:"rgba(255,255,255,0.82)",marginBottom:teamData?14:28,lineHeight:1.6,maxWidth:480,direction:lang==="ar"?"rtl":"ltr",textAlign:lang==="ar"?"right":"left"}}>
            {T.heroSub}
          </p>

          {/* Star players strip — team mode */}
          {teamData&&heroTeamCode&&PLAYERS[heroTeamCode]&&(
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:24,flexWrap:"wrap",direction:lang==="ar"?"rtl":"ltr",textAlign:lang==="ar"?"right":"left"}}>
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
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:32,position:"relative",zIndex:3,direction:lang==="ar"?"rtl":"ltr"}}>
            {["ma","es","pt"].map(code=>{
              const names={ma:"Maroc",es:"Espagne",pt:"Portugal"};
              return(
                <img key={code}
                  src={`https://flagcdn.com/24x18/${code}.png`}
                  alt={`Drapeau ${names[code]}`}
                  style={{width:24,height:18,borderRadius:2,objectFit:"cover",
                    filter:"drop-shadow(0 2px 6px rgba(0,0,0,0.4))",cursor:"default"}}
                  onError={e=>{e.target.style.display="none";}}/>
              );
            })}
            <div style={{width:1,height:24,background:"rgba(255,255,255,0.3)",marginLeft:4}}/>
            <span style={{fontFamily:font,fontSize:12,color:"rgba(255,255,255,0.7)"}}>{T.heroFlags}</span>
          </div>

          {/* CTA buttons */}
          <div style={{display:"flex",gap:12,flexWrap:"wrap",flexDirection:lang==="ar"?"row-reverse":"row"}}>
            <button onClick={()=>{setPage("schedule");track("cta_click",{button:"calendrier"});}}
              aria-label={T.heroBtn1}
              style={{padding:"13px 28px",borderRadius:12,background:`linear-gradient(135deg,${ac},${ac}BB)`,
                border:"none",cursor:"pointer",fontFamily:font,fontWeight:600,fontSize:15,color:"#FFF",
                boxShadow:`0 8px 24px ${ac}55`,transition:"all .2s",width:isDesk?"auto":"100%"}}>
              📅 {T.heroBtn1}
            </button>
            <button onClick={()=>{setPage("ticket");track("cta_click",{button:"billets"});}}
              aria-label={T.heroBtn2}
              style={{padding:"13px 28px",borderRadius:12,background:"rgba(255,255,255,0.12)",
                border:"1px solid rgba(255,255,255,0.35)",backdropFilter:"blur(8px)",
                cursor:"pointer",fontFamily:font,fontWeight:600,fontSize:15,color:"#FFF",transition:"all .2s",width:isDesk?"auto":"100%"}}>
              🎟️ {T.heroBtn2}
            </button>
          </div>

          {/* PWA install banner */}
          {showInstall&&(
            <div style={{display:"flex",alignItems:"center",gap:10,
              background:"rgba(255,255,255,0.1)",borderRadius:12,
              padding:"10px 16px",marginTop:12,backdropFilter:"blur(8px)",
              border:"1px solid rgba(255,255,255,0.2)",maxWidth:340}}>
              <span style={{fontSize:24}}>📲</span>
              <div style={{flex:1}}>
                <div style={{color:"white",fontSize:13,fontWeight:600}}>Installer MoundiGuide</div>
                <div style={{color:"rgba(255,255,255,0.7)",fontSize:11}}>Accès rapide depuis l'écran d'accueil</div>
              </div>
              <button
                onClick={()=>{installPrompt.prompt();setShowInstall(false);}}
                style={{background:"#C8102E",color:"white",border:"none",borderRadius:8,padding:"6px 12px",fontSize:12,fontWeight:600,cursor:"pointer"}}>
                Installer
              </button>
              <button
                onClick={()=>setShowInstall(false)}
                style={{background:"transparent",border:"none",color:"rgba(255,255,255,0.6)",cursor:"pointer",fontSize:16}}>
                ✕
              </button>
            </div>
          )}
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
          isDesk={isDesk} fixtures={fixtures} latestGoal={latestGoal}/>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{maxWidth:1280,margin:"0 auto",padding:isDesk?"40px 32px":"20px 16px"}}>

        {/* Cities — infinite auto-scroll strip */}
        <div ref={citiesRef} style={{marginBottom:48}}>
          <motion.div
            initial={{opacity:0,y:24}}
            animate={citiesInView?{opacity:1,y:0}:{opacity:0,y:24}}
            transition={{duration:0.6,ease:[0.25,0.46,0.45,0.94]}}
            style={{textAlign:lang==="ar"?"right":"center",direction:lang==="ar"?"rtl":"ltr",marginBottom:28}}
          >
            <div style={{fontFamily:font,fontSize:isDesk?32:24,fontWeight:800,color:C.str}}>🇲🇦 {T.secCities}</div>
            <div style={{fontFamily:font,fontSize:13,color:C.mut,marginTop:6}}>{T.secCitiesSub}</div>
          </motion.div>
          <div dir="ltr"
            style={{position:"relative",overflow:"hidden",width:"100%",direction:"ltr",
              maskImage:"linear-gradient(90deg,transparent 0%,black 8%,black 92%,transparent 100%)",
              WebkitMaskImage:"linear-gradient(90deg,transparent 0%,black 8%,black 92%,transparent 100%)"}}
            onMouseEnter={()=>{if(cityTrackRef.current)cityTrackRef.current.style.animationPlayState="paused";}}
            onMouseLeave={()=>{if(cityTrackRef.current)cityTrackRef.current.style.animationPlayState="running";}}
          >
            <div ref={cityTrackRef} className="cities-scroll-inner"
              style={{display:"flex",gap:isDesk?16:10,width:"max-content",
                animation:`scrollCities ${isDesk?25:18}s linear infinite`}}
            >
              {[...CITIES,...CITIES].map((city,i)=>(
                <div key={i}
                  style={{width:isDesk?280:160,height:isDesk?380:220,borderRadius:16,overflow:"hidden",
                    flexShrink:0,position:"relative",cursor:"pointer",
                    boxShadow:"0 2px 12px rgba(0,0,0,0.06)",
                    transition:"transform 0.3s ease"}}
                  onMouseEnter={e=>e.currentTarget.style.transform="scale(1.04)"}
                  onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
                >
                  <img src={city.img} alt={city.city}
                    loading="lazy" decoding="async"
                    width={isDesk?280:160} height={isDesk?380:220}
                    style={{width:"100%",height:"100%",objectFit:"cover",display:"block",aspectRatio:"auto"}}
                    onError={e=>{e.target.style.display="none";}}/>
                  <div style={{position:"absolute",inset:0,
                    background:"linear-gradient(to top,rgba(0,0,0,0.75) 0%,transparent 55%)"}}/>
                  <div style={{position:"absolute",bottom:isDesk?20:12,left:isDesk?20:12,direction:"ltr",textAlign:"left"}}>
                    <div style={{fontFamily:font,fontSize:isDesk?18:13,fontWeight:700,color:"#FFF"}}>{city.flag} {city.city}</div>
                    <div style={{fontFamily:font,fontSize:isDesk?10:9,color:"rgba(255,255,255,0.6)",marginTop:4,
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
            {/* POI Category filter — dropdown */}
            <div style={{position:"relative",display:"inline-block",marginBottom:16}}>
              <select
                value={showFavsOnly?"favs":poiCategory}
                onChange={e=>{const v=e.target.value;if(v==="favs"){setShowFavsOnly(true);setPoiCategory("all");}else{setPoiCategory(v);setShowFavsOnly(false);}}}
                style={{width:200,borderRadius:12,border:"1.5px solid #E5E7EB",padding:"10px 36px 10px 14px",fontSize:14,background:"white",color:"#374151",appearance:"none",WebkitAppearance:"none",cursor:"pointer",fontFamily:font,outline:"none"}}
              >
                <option value="all">🗺️ Tout ({filteredPois.length})</option>
                {POI_CATS.map(c=><option key={c.id} value={c.id}>{c.icon} {c.label} ({POIS.filter(p=>p.category===c.id).length})</option>)}
                <option value="favs">♥ Favoris ({favorites.length})</option>
              </select>
              <div style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",color:"#6B7280",fontSize:12}}>▾</div>
            </div>
            <Suspense fallback={<div style={{height:(selectedStadium||selectedPoi)?300:500,background:"#F3F4F6",borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",color:"#9CA3AF",fontSize:13}}>🗺️ Chargement de la carte…</div>}>
              <SMap C={C}
                onSelect={s=>{send(`Parle-moi du stade de ${s.city}`);setSelectedStadium(s);setSelectedPoi(null);}}
                onPoiSelect={poi=>{setSelectedPoi(poi);setSelectedStadium(null);setMapFlyTarget({lat:poi.lat,lng:poi.lng,id:poi.id,ts:Date.now()});}}
                activeCategory={poiCategory}
                flyTarget={mapFlyTarget}
                userCoords={userCoords}
                height={(selectedStadium||selectedPoi)?300:500}/>
            </Suspense>
            {/* Stadium info panel */}
            {selectedStadium&&(
              <div style={{marginTop:12,borderRadius:14,overflow:"hidden",border:`1px solid ${C.bdr}`,animation:"slideDown .25s ease"}}>
                {/* Header image */}
                <div style={{position:"relative",height:110}}>
                  <img src="/stadium-night.png" alt="" loading="lazy" decoding="async" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} onError={e=>{e.target.style.display="none";}}/>
                  <img src="/stadium-aerial.png" alt="" loading="lazy" decoding="async" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";}}/>
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
                      loading="lazy" decoding="async"
                      width={isDesk?134:84} height={isDesk?118:85}
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
