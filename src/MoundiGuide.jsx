import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import { motion } from "framer-motion";

import {
  LANGUAGES, TRANSLATIONS, BR, TEAM_DATA, TEAM_ACCENT, TEAM_ISO, WELCOME, F
} from "./constants.js";
import { C as makeTheme } from "./theme.js";
import Splash from "./components/Splash.jsx";
import Navbar from "./components/Navbar.jsx";
import HomePage from "./pages/HomePage.jsx";
import { useAnalytics } from "./hooks/useAnalytics.js";

const TicketPage   = lazy(() => import("./pages/TicketPage.jsx"));
const SchedulePage = lazy(() => import("./pages/SchedulePage.jsx"));
const TeamProfile  = lazy(() => import("./components/TeamProfile.jsx"));
const Footer       = lazy(() => import("./components/Footer.jsx"));
const ChatFloat    = lazy(() => import("./components/ChatFloat.jsx"));

export default function MoundiGuide(){
  const { track } = useAnalytics();
  const[splash,setSplash]=useState(true);
  const[page,setPage]=useState("home");
  const[lang,setLang]=useState(()=>localStorage.getItem("lang")||"fr");
  const[msgs,setMsgs]=useState([]);
  const[input,setInput]=useState("");
  const[loading,setLoading]=useState(false);
  const[showLang,setShowLang]=useState(false);
  const[listening,setListening]=useState(false);
  const[isDesk,setIsDesk]=useState(typeof window!=="undefined"&&window.innerWidth>=768);
  const[chatOpen,setChatOpen]=useState(false);
  const[scrolled,setScrolled]=useState(false);
  const[selectedTeam,setSelectedTeam]=useState(()=>{try{const s=localStorage.getItem("userTeam");if(!s||s==="neutral")return null;const saved=JSON.parse(s);return{t:saved.t,f:TEAM_DATA[saved.t]?.flag||saved.f};}catch{return null;}});
  const[showTeamPicker,setShowTeamPicker]=useState(false);
  const[showTeamProfile,setShowTeamProfile]=useState(false);
  const[hoveredTeam,setHoveredTeam]=useState(null);
  const hasShownPicker=useRef(false);
  const endRef=useRef(null);const inpRef=useRef(null);const recRef=useRef(null);

  useEffect(()=>{const h=()=>setIsDesk(window.innerWidth>=768);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h);},[]);
  useEffect(()=>{setScrolled(false);window.scrollTo(0,0);},[page]);
  useEffect(()=>{const h=()=>setScrolled(window.scrollY>60);window.addEventListener("scroll",h,{passive:true});return()=>window.removeEventListener("scroll",h);},[]);
  // Persist lang, selectedTeam
  useEffect(()=>{localStorage.setItem("lang",lang);},[lang]);
  useEffect(()=>{if(selectedTeam)localStorage.setItem("userTeam",JSON.stringify(selectedTeam));else localStorage.setItem("userTeam","neutral");},[selectedTeam]);
  // Show picker after splash only if user has never chosen a team
  useEffect(()=>{
    if(!splash&&!hasShownPicker.current){
      hasShownPicker.current=true;
      if(!localStorage.getItem("userTeam")){
        const t=setTimeout(()=>setShowTeamPicker(true),600);
        return()=>clearTimeout(t);
      }
    }
  },[splash]);

  const _t=makeTheme();
  const C={bg:_t.bg,hdr:_t.nav,card:_t.card,bdr:_t.border,txt:_t.bod,str:_t.str,mut:_t.mut,fld:"#F9FAFB",bot:_t.card,bbdr:_t.border,usr:`linear-gradient(135deg,${_t.red},#B5102A)`,sh:_t.shadow,sc:_t.border};
  const teamColor=TEAM_DATA[selectedTeam?.t]?.colors[0]||TEAM_ACCENT[selectedTeam?.t]||BR.red;
  const ac=teamColor;
  const isRTL=lang==="ar";

  useEffect(()=>{setMsgs([{role:"assistant",content:WELCOME[lang]}]);},[lang]);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);
  useEffect(()=>{if(!showLang)return;const cl=()=>setShowLang(false);setTimeout(()=>document.addEventListener("click",cl),0);return()=>document.removeEventListener("click",cl);},[showLang]);

  const send=useCallback(async(text)=>{
    const t=text||input.trim();if(!t||loading)return;setInput("");setChatOpen(true);
    const nm=[...msgs,{role:"user",content:t}];setMsgs(nm);setLoading(true);
    try{const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({lang,messages:nm.map(m=>({role:m.role,content:m.content})),selectedTeam:selectedTeam?.t||null})});const d=await r.json();const text=d.content?.[0]?.text||d.content||d.error||"⚠️ Erreur";setMsgs(p=>[...p,{role:"assistant",content:text}]);}
    catch{setMsgs(p=>[...p,{role:"assistant",content:"⚠️ Hors-ligne"}]);}
    finally{setLoading(false);inpRef.current?.focus();}
  },[input,loading,msgs,lang,selectedTeam]);

  const toggleVoice=()=>{
    if(listening){if(recRef.current)recRef.current.stop();setListening(false);return;}
    if(!("webkitSpeechRecognition" in window)&&!("SpeechRecognition" in window)){alert("Voice not supported");return;}
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    const rec=new SR();rec.lang=lang==="ar"?"ar-MA":lang==="zh"?"zh-CN":lang;rec.continuous=false;rec.interimResults=false;
    rec.onresult=e=>{setInput(p=>p+e.results[0][0].transcript);setListening(false);};
    rec.onerror=()=>setListening(false);rec.onend=()=>setListening(false);
    rec.start();setListening(true);recRef.current=rec;
  };

  const curLang=LANGUAGES.find(l=>l.code===lang);
  const bgStyle={background:"#F4F5F7"};

  return(
    <>
    {splash&&<Splash onDone={()=>setSplash(false)}/>}
    <div style={{minHeight:"100vh",width:"100%",...bgStyle,fontFamily:F,overflowX:"hidden",overflowY:"auto"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Noto+Sans+Arabic:wght@400;600&display=swap');
        *{font-family:'Inter',system-ui,sans-serif}
        body{background:#F4F5F7}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes dp{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(.7)}}
        @keyframes sp{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(228,28,58,0.45)}70%{box-shadow:0 0 0 12px rgba(228,28,58,0)}}
        @keyframes popIn{from{opacity:0;transform:scale(0.92) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes floatTrophy{0%,100%{transform:translateY(-10px)}50%{transform:translateY(10px)}}
        @keyframes flagWave{0%,100%{transform:rotate(-3deg) scaleX(1)}50%{transform:rotate(3deg) scaleX(0.97)}}
        @keyframes scrollCities{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes flipNum{from{transform:perspective(400px) rotateX(90deg);opacity:0}to{transform:perspective(400px) rotateX(0deg);opacity:1}}
        @keyframes ledTicker{0%{transform:translateX(0)}100%{transform:translateX(-25%)}}
        @keyframes ledTickerRev{0%{transform:translateX(-25%)}100%{transform:translateX(0)}}
        @keyframes flipTop{0%{transform:rotateX(0deg)}100%{transform:rotateX(-90deg)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}
        @keyframes pulseGlow{0%,100%{opacity:0.6}50%{opacity:1}}
        @keyframes screenFlash{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes slotFade{0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:translateY(0)}}
        @keyframes chatPulse{0%,100%{box-shadow:0 0 0 0 rgba(200,16,46,0.4)}50%{box-shadow:0 0 0 10px rgba(200,16,46,0)}}
        .flipping{animation:flipTop 250ms ease-in forwards;transform-origin:bottom center;}
        .led-screen{animation:pulseGlow 3s ease-in-out infinite;}
        .live-badge{animation:screenFlash 1.5s ease-in-out infinite;}
        @keyframes goldRing{0%{box-shadow:0 0 0 0 rgba(240,180,41,0.7)}70%{box-shadow:0 0 0 18px rgba(240,180,41,0)}100%{box-shadow:0 0 0 0 rgba(240,180,41,0)}}
        @keyframes particleBurst{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(3)}}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:${C.sc};border-radius:4px}
        .pills-row::-webkit-scrollbar{display:none}
        .cities-scroll-inner{direction:ltr!important}
        input:focus{border-color:${ac}88!important}
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
        input[type=number]{-moz-appearance:textfield}
        html,body{min-height:100%;width:100%}
        :root{--polaroid-paper:#FFFDF5;--polaroid-ink:#3A2A1A}
        select option{background:#FFF;color:${C.str}}
        a:hover{opacity:.85}
      `}</style>

      {/* Navbar — always on top */}
      <Navbar page={page} setPage={setPage} scrolled={scrolled} C={C}
        lang={lang} curLang={curLang} showLang={showLang} setShowLang={setShowLang}
        isDesk={isDesk} selectedTeam={selectedTeam} onPickTeam={()=>setShowTeamPicker(true)}
        setShowTeamProfile={setShowTeamProfile}/>

      {/* Language overlay */}
      {showLang&&(
        <div onClick={()=>setShowLang(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(4px)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"rgba(255,255,255,0.99)",border:`1px solid ${C.bdr}`,borderRadius:20,padding:"16px 10px",minWidth:230,boxShadow:C.sh,animation:"popIn .2s ease"}}>
            <div style={{fontFamily:F,fontSize:10,fontWeight:600,color:C.mut,textAlign:"center",padding:"4px 0 12px",letterSpacing:2,textTransform:"uppercase"}}>{(TRANSLATIONS[lang]||TRANSLATIONS.en).langLabel}</div>
            {LANGUAGES.map(l=>(
              <button key={l.code} onClick={()=>{setLang(l.code);setShowLang(false);track("language_changed",{lang:l.code});}}
                style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 18px",background:lang===l.code?`${BR.red}10`:"transparent",border:"none",cursor:"pointer",color:lang===l.code?ac:C.txt,fontSize:13,fontFamily:F,borderRadius:10,fontWeight:lang===l.code?600:400,transition:"all .15s"}}>
                <span style={{fontSize:20}}>{l.flag}</span><span>{l.label}</span>
                {lang===l.code&&<span style={{marginLeft:"auto",color:ac}}>✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Team picker modal */}
      {showTeamPicker&&(()=>{
        const PT={fr:{title:"Choisissez votre équipe",sub:"Votre sélection personnalise l'interface",skip:"⏭ Passer",close:"✕ Fermer"},en:{title:"Choose your team",sub:"Your selection personalizes the interface",skip:"⏭ Skip",close:"✕ Close"},ar:{title:"اختر فريقك",sub:"اختيارك يخصص الواجهة",skip:"⏭ تخطى",close:"✕ إغلاق"},es:{title:"Elige tu equipo",sub:"Tu selección personaliza la interfaz",skip:"⏭ Omitir",close:"✕ Cerrar"},pt:{title:"Escolha sua equipe",sub:"Sua seleção personaliza a interface",skip:"⏭ Pular",close:"✕ Fechar"},zh:{title:"选择你的队伍",sub:"你的选择将个性化界面",skip:"⏭ 跳过",close:"✕ 关闭"}};
        const pk=PT[lang]||PT.en;
        const teams=Object.entries(TEAM_DATA);
        return(
        <div onClick={()=>setShowTeamPicker(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(8px)",zIndex:9998,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"rgba(255,255,255,0.99)",border:`1px solid ${C.bdr}`,borderRadius:24,padding:"24px 16px 16px",maxWidth:580,width:"100%",boxShadow:"0 32px 80px rgba(0,0,0,0.6)",animation:"popIn .25s ease",display:"flex",flexDirection:"column",maxHeight:"88vh"}}>
            <div style={{textAlign:"center",marginBottom:18,flexShrink:0}}>
              <div style={{fontSize:36,marginBottom:8}}>⚽</div>
              <div style={{fontFamily:F,fontSize:20,fontWeight:800,color:C.str,marginBottom:4}}>{pk.title}</div>
              <div style={{fontFamily:F,fontSize:12,color:C.mut}}>{pk.sub}</div>
            </div>
            {/* Scrollable grid */}
            <div style={{overflowY:"auto",flex:1,scrollbarWidth:"thin",scrollbarColor:`${C.sc} transparent`,paddingRight:4}}>
              <div style={{display:"grid",gridTemplateColumns:`repeat(${isDesk?6:4},1fr)`,gap:6}}>
                {teams.map(([name,td])=>{
                  const isSelected=selectedTeam?.t===name;
                  const isHovered=hoveredTeam===name;
                  const tColor=td.colors[0];
                  return(
                    <button key={name}
                      onClick={()=>{setSelectedTeam({t:name,f:td.flag});setShowTeamPicker(false);setHoveredTeam(null);track("team_selected",{team:name});}}
                      onMouseEnter={()=>setHoveredTeam(name)}
                      onMouseLeave={()=>setHoveredTeam(null)}
                      style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"10px 4px",borderRadius:12,
                        border:`2px solid ${isSelected||isHovered?tColor:C.bdr}`,
                        background:isSelected?`${tColor}22`:isHovered?`${tColor}12`:C.fld,
                        cursor:"pointer",transition:"all .15s",
                        boxShadow:isHovered&&!isSelected?`0 0 16px ${tColor}44`:"none"}}>
                      <img
                        src={`https://flagcdn.com/48x36/${TEAM_ISO[name]||"xx"}.png`}
                        alt={name}
                        style={{width:isDesk?40:30,height:"auto",objectFit:"contain",borderRadius:3,display:"block",flexShrink:0}}
                        onError={e=>{e.target.style.display="none";}}
                      />
                      <span style={{fontFamily:F,fontSize:isDesk?8:7,fontWeight:isSelected?700:400,
                        color:isSelected||isHovered?tColor:C.mut,textAlign:"center",lineHeight:1.2}}>{name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Footer buttons */}
            <div style={{display:"flex",gap:8,marginTop:14,flexShrink:0}}>
              <button onClick={()=>{setSelectedTeam(null);setShowTeamPicker(false);}}
                style={{flex:1,padding:"10px",borderRadius:12,border:`1px solid ${C.bdr}`,
                  background:"transparent",fontFamily:F,fontSize:13,color:C.mut,cursor:"pointer"}}>
                {pk.skip}
              </button>
              <button onClick={()=>setShowTeamPicker(false)}
                style={{flex:1,padding:"10px",borderRadius:12,border:`1px solid ${C.bdr}`,
                  background:"transparent",fontFamily:F,fontSize:13,color:C.mut,cursor:"pointer"}}>
                {pk.close}
              </button>
            </div>
          </div>
        </div>
        );
      })()}

      {/* Page content */}
      <div style={{overflowX:"hidden",direction:lang==="ar"?"rtl":"ltr"}}>
        {!splash&&page==="home"    &&<HomePage    C={C} ac={ac} F={F} lang={lang} send={send} setPage={setPage} isDesk={isDesk} selectedTeam={selectedTeam}/>}
        <Suspense fallback={<div style={{minHeight:400}}/>}>
          {!splash&&page==="ticket"  &&<TicketPage  C={C} F={F} isDesk={isDesk} lang={lang}/>}
          {!splash&&page==="schedule"&&<SchedulePage C={C} ac={ac} F={F} send={send} isDesk={isDesk} lang={lang} selectedTeam={selectedTeam}/>}
          {!splash&&<Footer C={C} F={F} setPage={setPage} lang={lang}/>}
        </Suspense>
      </div>

      {/* Team Profile drawer */}
      <Suspense fallback={null}>
        <TeamProfile selectedTeam={selectedTeam} showTeamProfile={showTeamProfile}
          setShowTeamProfile={setShowTeamProfile} isDesk={isDesk} setPage={setPage}/>
      </Suspense>

      {/* Floating AI Chat */}
      <Suspense fallback={null}>
        <ChatFloat C={C} lang={lang} msgs={msgs} input={input} setInput={setInput}
          loading={loading} send={send} listening={listening} toggleVoice={toggleVoice}
          chatOpen={chatOpen} setChatOpen={setChatOpen} isRTL={isRTL} ac={ac} F={F}
          endRef={endRef} inpRef={inpRef} isDesk={isDesk} selectedTeam={selectedTeam}/>
      </Suspense>
    </div>
    </>
  );
}
