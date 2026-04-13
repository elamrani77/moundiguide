import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════
// DATA
// ═══════════════════════════════════════
const LANGUAGES = [
  { code:"fr", label:"Français", flag:"🇫🇷" },{ code:"en", label:"English", flag:"🇬🇧" },
  { code:"ar", label:"العربية", flag:"🇲🇦" },{ code:"es", label:"Español", flag:"🇪🇸" },
  { code:"pt", label:"Português", flag:"🇵🇹" },{ code:"zh", label:"中文", flag:"🇨🇳" },
];
const PLACEHOLDERS = { fr:"Posez votre question...", en:"Ask your question...", ar:"...اطرح سؤالك", es:"Haz tu pregunta...", pt:"Faça sua pergunta...", zh:"请输入问题..." };
const QUICK_TOPICS = {
  fr:["🏟️ Stades","🚇 Transport","🍜 Restaurants","🏨 Hôtels","🚑 Urgences","🕌 Culture","☀️ Météo"],
  en:["🏟️ Stadiums","🚇 Transport","🍜 Food","🏨 Hotels","🚑 Emergency","🕌 Culture","☀️ Weather"],
  ar:["🏟️ ملاعب","🚇 نقل","🍜 مطاعم","🏨 فنادق","🚑 طوارئ","🕌 ثقافة","☀️ طقس"],
  es:["🏟️ Estadios","🚇 Transporte","🍜 Comida","🏨 Hoteles","🚑 Urgencias","🕌 Cultura","☀️ Clima"],
  pt:["🏟️ Estádios","🚇 Transporte","🍜 Comida","🏨 Hotéis","🚑 Urgências","🕌 Cultura","☀️ Tempo"],
  zh:["🏟️ 球场","🚇 交通","🍜 美食","🏨 酒店","🚑 急救","🕌 文化","☀️ 天气"],
};
const SYSTEM_PROMPTS = {
  fr:`Tu es MoundiGuide, assistant IA du Mondial 2030 (Maroc, Espagne, Portugal). Réponds en 3-5 phrases MAX. Direct, pratique. Emojis. Villes: Casablanca, Rabat, Marrakech, Tanger, Agadir, Fès.`,
  en:`You are MoundiGuide, 2030 World Cup AI assistant. 3-5 sentences MAX. Direct, practical. Emojis.`,
  ar:`أنت MoundiGuide مساعد كأس العالم 2030. 3 جمل كحد أقصى. مباشر وعملي.`,
  es:`Eres MoundiGuide, asistente Mundial 2030. 3 frases MAX. Directo. Emojis.`,
  pt:`Você é MoundiGuide, assistente Copa 2030. 3 frases MAX. Direto. Emojis.`,
  zh:`你是MoundiGuide，2030世界杯助手。最多3句。直接。表情。`,
};
const WELCOME = { fr:"⚽ Bienvenue ! Posez-moi une question sur le Mondial 2030.", en:"⚽ Welcome! Ask about the 2030 World Cup.", ar:"⚽ مرحباً! اسألني عن المونديال.", es:"⚽ ¡Hola! Pregunta sobre el Mundial.", pt:"⚽ Olá! Pergunte sobre a Copa.", zh:"⚽ 你好！问我世界杯相关问题。" };
const STADIUMS = [
  { city:"Casablanca", name:"Grand Stade Hassan II", cap:"115 000", lat:33.57, lng:-7.59, img:"https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=400&h=200&fit=crop" },
  { city:"Rabat", name:"Complexe Moulay Abdallah", cap:"52 000", lat:33.96, lng:-6.86, img:"https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=200&fit=crop" },
  { city:"Marrakech", name:"Grand Stade de Marrakech", cap:"45 000", lat:31.62, lng:-8.01, img:"https://images.unsplash.com/photo-1597212618440-806b84589018?w=400&h=200&fit=crop" },
  { city:"Tanger", name:"Grand Stade de Tanger", cap:"65 000", lat:35.74, lng:-5.83, img:"https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&h=200&fit=crop" },
  { city:"Agadir", name:"Stade d'Agadir", cap:"45 000", lat:30.38, lng:-9.53, img:"https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400&h=200&fit=crop" },
  { city:"Fès", name:"Nouveau Stade de Fès", cap:"50 000", lat:34.02, lng:-5.01, img:"https://images.unsplash.com/photo-1569383746724-6f1b882b8f46?w=400&h=200&fit=crop" },
];
const FIFA_RANKINGS = [
  {r:1,t:"Spain",f:"🇪🇸",p:1867,c:"="},{r:2,t:"Argentina",f:"🇦🇷",p:1849,c:"="},{r:3,t:"France",f:"🇫🇷",p:1843,c:"="},
  {r:4,t:"England",f:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",p:1797,c:"="},{r:5,t:"Brazil",f:"🇧🇷",p:1775,c:"="},{r:6,t:"Portugal",f:"🇵🇹",p:1756,c:"="},
  {r:7,t:"Netherlands",f:"🇳🇱",p:1747,c:"="},{r:8,t:"Morocco",f:"🇲🇦",p:1733,c:"up"},{r:9,t:"Belgium",f:"🇧🇪",p:1729,c:"dn"},
  {r:10,t:"Germany",f:"🇩🇪",p:1713,c:"="},{r:11,t:"Croatia",f:"🇭🇷",p:1701,c:"="},{r:12,t:"Senegal",f:"🇸🇳",p:1694,c:"up"},
  {r:13,t:"Italy",f:"🇮🇹",p:1690,c:"dn"},{r:14,t:"Colombia",f:"🇨🇴",p:1679,c:"="},{r:15,t:"USA",f:"🇺🇸",p:1665,c:"dn"},
  {r:16,t:"Mexico",f:"🇲🇽",p:1658,c:"dn"},{r:17,t:"Uruguay",f:"🇺🇾",p:1650,c:"="},{r:18,t:"Switzerland",f:"🇨🇭",p:1637,c:"="},
  {r:19,t:"Japan",f:"🇯🇵",p:1625,c:"="},{r:20,t:"Iran",f:"🇮🇷",p:1612,c:"up"},
];
const MATCHES = [
  {ph:"G",d:"15 Jun",tm:"18:00",a:"🇲🇦 Maroc",b:"Brésil 🇧🇷",c:"Casablanca"},{ph:"G",d:"16 Jun",tm:"21:00",a:"🇪🇸 Espagne",b:"Argentine 🇦🇷",c:"Rabat"},
  {ph:"G",d:"17 Jun",tm:"18:00",a:"🇵🇹 Portugal",b:"France 🇫🇷",c:"Marrakech"},{ph:"G",d:"20 Jun",tm:"21:00",a:"🇲🇦 Maroc",b:"Allemagne 🇩🇪",c:"Tanger"},
  {ph:"G",d:"21 Jun",tm:"18:00",a:"🇪🇸 Espagne",b:"Japon 🇯🇵",c:"Agadir"},{ph:"8",d:"1 Jul",tm:"18:00",a:"1A",b:"2B",c:"Casablanca"},
  {ph:"Q",d:"5 Jul",tm:"21:00",a:"QF1",b:"QF2",c:"Rabat"},{ph:"S",d:"9 Jul",tm:"21:00",a:"SF1",b:"SF2",c:"Casablanca"},
  {ph:"F",d:"13 Jul",tm:"21:00",a:"🏆 Finale",b:"⚽",c:"Casablanca"},
];
const NEWS = [
  {d:"12 Avr",t:"Grand Stade Hassan II : 95% de construction",tg:"Infra",tc:"#00823C"},
  {d:"10 Avr",t:"Plan de mobilité pour les 6 villes hôtes",tg:"Transport",tc:"#1A56DB"},
  {d:"8 Avr",t:"FIFA confirme 48 équipes qualifiées",tg:"FIFA",tc:"#C41E3A"},
  {d:"5 Avr",t:"Billetterie en ligne ouvrira en janvier 2029",tg:"Billets",tc:"#F5A623"},
  {d:"3 Avr",t:"YallaVamos : 20 000 bénévoles recherchés",tg:"Bénévol.",tc:"#7C3AED"},
  {d:"1 Avr",t:"France reprend la 1ère place FIFA",tg:"FIFA",tc:"#C41E3A"},
];
const ADS = ["⚽ YALLAVAMOS 2030 — Maroc · Espagne · Portugal","🏟️ Grand Stade Hassan II — 115 000 places","🇲🇦 Visit Morocco — Découvrez le Maroc","🎫 Billetterie FIFA 2030 — Réservez vos places","✈️ Royal Air Maroc — Partenaire officiel","🏨 Booking.com — Hébergement Mondial 2030"];
const CURRENCIES = [{c:"EUR",s:"€"},{c:"USD",s:"$"},{c:"GBP",s:"£"},{c:"BRL",s:"R$"},{c:"JPY",s:"¥"}];
const INFO_ITEMS = [{i:"🚨",l:"Police",v:"19"},{i:"🚑",l:"SAMU",v:"15"},{i:"🚒",l:"Pompiers",v:"15"},{i:"💱",l:"Monnaie",v:"MAD"},{i:"🔌",l:"220V",v:"C,E"},{i:"🕐",l:"Fuseau",v:"GMT+1"},{i:"📱",l:"Indicatif",v:"+212"},{i:"💧",l:"Eau",v:"Bouteille"}];
const DARIJA = [{d:"Salam",t:{fr:"Bonjour",en:"Hello",ar:"مرحبا",es:"Hola"}},{d:"Beshhal?",t:{fr:"Combien?",en:"How much?",ar:"بكم؟",es:"¿Cuánto?"}},{d:"Shukran",t:{fr:"Merci",en:"Thanks",ar:"شكرا",es:"Gracias"}},{d:"Fin kayn?",t:{fr:"Où est?",en:"Where?",ar:"فين؟",es:"¿Dónde?"}},{d:"Mezyan",t:{fr:"Bien",en:"Good",ar:"مزيان",es:"Bien"}}];

const BR = {red:"#C41E3A",green:"#00823C",blue:"#1A56DB",gold:"#F5A623"};

const VIDEOS = [
  {id:"eMKxJMpOkKs",title:"🎬 YallaVamos 2030 — Vidéo officielle"},
  {id:"dMfYBg8NbKI",title:"🏟️ Grand Stade Hassan II — Construction"},
  {id:"xQGzgE4LIGY",title:"🏆 France 2018 — Tous les buts"},
  {id:"BKqSxG9ypEk",title:"🇦🇷 Argentine 2022 — Le sacre de Messi"},
  {id:"YjmM-2NZGGE",title:"🇲🇦 Maroc 2022 — L'épopée historique"},
  {id:"r7eFsfINmpg",title:"⚽ Top 50 — Plus beaux buts en Coupe du Monde"},
];

const CAROUSEL_PHOTOS = [
  "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800&h=350&fit=crop",
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=350&fit=crop",
  "https://images.unsplash.com/photo-1597212618440-806b84589018?w=800&h=350&fit=crop",
  "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=350&fit=crop",
  "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&h=350&fit=crop",
  "https://images.unsplash.com/photo-1569383746724-6f1b882b8f46?w=800&h=350&fit=crop",
];
const CAROUSEL_LABELS = ["Casablanca","Rabat","Marrakech","Tanger","Agadir","Fès"];
const TH = {
  dark:{bg:"#0C1117",hdr:"rgba(0,0,0,0.7)",card:"rgba(255,255,255,0.04)",bdr:"rgba(255,255,255,0.07)",txt:"rgba(255,255,255,0.88)",str:"#FFF",mut:"rgba(255,255,255,0.4)",fld:"rgba(255,255,255,0.05)",bot:"rgba(255,255,255,0.04)",bbdr:"rgba(255,255,255,0.07)",usr:`linear-gradient(135deg,${BR.red},#A01830)`,dd:"rgba(12,17,23,0.98)",la:"rgba(245,166,35,0.08)",sh:"0 12px 40px rgba(0,0,0,0.5)",sc:"rgba(255,255,255,0.08)",adBg:"#0A0E13",chatBg:"rgba(0,0,0,0.3)"},
  light:{bg:"#F5F6F8",hdr:"rgba(255,255,255,0.92)",card:"rgba(0,0,0,0.025)",bdr:"rgba(0,0,0,0.07)",txt:"rgba(0,0,0,0.8)",str:"#111",mut:"rgba(0,0,0,0.4)",fld:"rgba(0,0,0,0.03)",bot:"rgba(0,0,0,0.03)",bbdr:"rgba(0,0,0,0.07)",usr:`linear-gradient(135deg,${BR.red},#E02040)`,dd:"rgba(255,255,255,0.99)",la:"rgba(196,30,58,0.05)",sh:"0 12px 40px rgba(0,0,0,0.08)",sc:"rgba(0,0,0,0.08)",adBg:"#1A1E24",chatBg:"rgba(255,255,255,0.5)"},
};

function md(t){if(!t)return t;return t.split("\n").map((l,i)=>{let c=l.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>");if(l.startsWith("- ")||l.startsWith("• "))return<div key={i} style={{paddingLeft:10,marginBottom:1}} dangerouslySetInnerHTML={{__html:"• "+c.slice(2)}}/>;if(l.trim()==="")return<div key={i} style={{height:5}}/>;return<div key={i} dangerouslySetInnerHTML={{__html:c}}/>;});}

// Splash Screen
function Splash({onDone}){
  useEffect(()=>{const t=setTimeout(onDone,2800);return()=>clearTimeout(t);},[onDone]);
  return(<div style={{position:"fixed",inset:0,zIndex:999999,background:"linear-gradient(135deg,#0C1117 0%,#1a0a0a 50%,#0C1117 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",animation:"fadeIn .5s ease"}}>
    <style>{`@keyframes kickBall{0%{transform:translateY(0) rotate(0deg)}30%{transform:translateY(-60px) rotate(180deg)}50%{transform:translateY(0) rotate(360deg)}70%{transform:translateY(-30px) rotate(540deg)}100%{transform:translateY(0) rotate(720deg)}}@keyframes growBar{from{width:0}to{width:100%}}@keyframes fadeOut{from{opacity:1}to{opacity:0}}`}</style>
    <div style={{fontSize:64,animation:"kickBall 1.5s ease-in-out infinite"}}>⚽</div>
    <div style={{fontFamily:"'Outfit',sans-serif",fontSize:28,fontWeight:800,marginTop:16,letterSpacing:1}}>
      <span style={{color:"#C41E3A"}}>M</span><span style={{color:"#FFF"}}>oundi</span><span style={{color:"#00823C"}}>G</span><span style={{color:"#FFF"}}>uide</span>
    </div>
    <div style={{fontFamily:"'Outfit',sans-serif",fontSize:11,color:"#F5A623",letterSpacing:4,marginTop:6}}>YALLAVAMOS 2030</div>
    <div style={{width:120,height:3,background:"rgba(255,255,255,0.1)",borderRadius:2,marginTop:20,overflow:"hidden"}}>
      <div style={{height:"100%",background:"linear-gradient(90deg,#C41E3A,#F5A623,#00823C)",borderRadius:2,animation:"growBar 2.5s ease-out forwards"}}/>
    </div>
    <div style={{display:"flex",gap:6,marginTop:14}}>
      <span style={{fontSize:20}}>🇲🇦</span><span style={{fontSize:20}}>🇪🇸</span><span style={{fontSize:20}}>🇵🇹</span>
    </div>
  </div>);
}

// Photo Carousel
function Carousel({C}){
  const[idx,setIdx]=useState(0);
  useEffect(()=>{const id=setInterval(()=>setIdx(p=>(p+1)%CAROUSEL_PHOTOS.length),3500);return()=>clearInterval(id);},[]);
  return(<div style={{position:"relative",width:"100%",height:180,borderRadius:10,overflow:"hidden",border:`1px solid ${C.bdr}`}}>
    {CAROUSEL_PHOTOS.map((p,i)=>(<img key={i} src={p} alt={CAROUSEL_LABELS[i]} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:i===idx?1:0,transition:"opacity .8s ease"}}/>))}
    <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"20px 12px 8px",background:"linear-gradient(transparent,rgba(0,0,0,0.7))"}}>
      <div style={{fontFamily:"'Outfit'",fontSize:16,fontWeight:700,color:"#FFF"}}>{CAROUSEL_LABELS[idx]}</div>
      <div style={{fontFamily:"'Outfit'",fontSize:9,color:"rgba(255,255,255,0.7)"}}>Ville hôte — Mondial 2030</div>
    </div>
    <div style={{position:"absolute",bottom:6,right:10,display:"flex",gap:4}}>
      {CAROUSEL_PHOTOS.map((_,i)=>(<div key={i} onClick={()=>setIdx(i)} style={{width:i===idx?16:6,height:6,borderRadius:3,background:i===idx?"#F5A623":"rgba(255,255,255,0.4)",cursor:"pointer",transition:"all .3s"}}/>))}
    </div>
  </div>);
}

// Ad Banner
function AdBanner({C}){const[o,setO]=useState(0);const t=ADS.join("     ★     ");useEffect(()=>{const id=setInterval(()=>setO(p=>p-1),30);return()=>clearInterval(id);},[]);
return(<div style={{background:C.adBg,overflow:"hidden",height:30,display:"flex",alignItems:"center",position:"relative",borderTop:`2px solid ${BR.gold}`,borderBottom:`2px solid ${BR.gold}`,flexShrink:0}}><div style={{position:"absolute",left:0,top:0,bottom:0,width:30,background:`linear-gradient(90deg,${C.adBg},transparent)`,zIndex:2}}/><div style={{position:"absolute",right:0,top:0,bottom:0,width:30,background:`linear-gradient(270deg,${C.adBg},transparent)`,zIndex:2}}/><div style={{whiteSpace:"nowrap",transform:`translateX(${o}px)`,fontFamily:"'Outfit'",fontSize:11,fontWeight:600,color:BR.gold,letterSpacing:.5}}>{t+"     ★     "+t}</div></div>);}

// Weather
function Weather({C,city}){const[w,setW]=useState(null);useEffect(()=>{const s=STADIUMS.find(st=>st.city===city);if(!s)return;fetch(`https://api.open-meteo.com/v1/forecast?latitude=${s.lat}&longitude=${s.lng}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`).then(r=>r.json()).then(d=>setW(d.current)).catch(()=>{});},[city]);if(!w)return null;const ic=c=>{if(c===0)return"☀️";if(c<=3)return"⛅";if(c<=48)return"🌫️";if(c<=67)return"🌧️";return"⛈️";};
return(<div style={{background:C.card,border:`1px solid ${C.bdr}`,borderRadius:9,padding:"10px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontFamily:"'Outfit'",fontSize:10,color:C.mut}}>{city}</div><div style={{fontFamily:"'Outfit'",fontSize:22,fontWeight:700,color:C.str}}>{Math.round(w.temperature_2m)}°C</div></div><div style={{textAlign:"right"}}><div style={{fontSize:26}}>{ic(w.weather_code)}</div><div style={{fontFamily:"'Outfit'",fontSize:9,color:C.mut}}>💨 {Math.round(w.wind_speed_10m)} km/h</div></div></div>);}

// Currency
function CurrConv({C}){const[a,sA]=useState("100");const[f,sF]=useState("EUR");const[rt,sR]=useState(null);useEffect(()=>{fetch("https://open.er-api.com/v6/latest/MAD").then(r=>r.json()).then(d=>sR(d.rates)).catch(()=>sR({EUR:.091,USD:.099,GBP:.078,BRL:.57,JPY:14.8}));},[]);const r=rt&&a?Math.round(parseFloat(a)/(rt[f]||1)).toLocaleString():"—";const ss={padding:"6px 7px",borderRadius:6,border:`1px solid ${C.bdr}`,background:C.fld,color:C.str,fontSize:11,fontFamily:"'Outfit'"};
return(<div style={{background:C.card,border:`1px solid ${C.bdr}`,borderRadius:9,padding:10,marginTop:8}}><div style={{fontFamily:"'Outfit'",fontSize:11,fontWeight:600,color:BR.gold,marginBottom:6}}>💱 Convertisseur</div><div style={{display:"flex",gap:5,alignItems:"center"}}><input type="number" value={a} onChange={e=>sA(e.target.value)} style={{...ss,width:"28%"}}/><select value={f} onChange={e=>sF(e.target.value)} style={{...ss,width:"25%",cursor:"pointer"}}>{CURRENCIES.map(c=><option key={c.c} value={c.c}>{c.s} {c.c}</option>)}</select><span style={{color:C.mut,fontSize:11}}>→</span><div style={{fontFamily:"'Outfit'",fontSize:16,fontWeight:700,color:BR.gold}}>{r} <span style={{fontSize:10,fontWeight:400}}>MAD</span></div></div></div>);}

// Map
function SMap({C,onSelect,height}){const ref=useRef(null);const mR=useRef(null);useEffect(()=>{if(mR.current)return;if(!window.L){const l=document.createElement("link");l.rel="stylesheet";l.href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";document.head.appendChild(l);const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";s.onload=()=>go();document.head.appendChild(s);}else go();function go(){if(!ref.current||mR.current)return;const m=window.L.map(ref.current,{zoomControl:false}).setView([32.5,-6.5],5.5);window.L.control.zoom({position:"bottomright"}).addTo(m);window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"©OSM",maxZoom:18}).addTo(m);const ic=window.L.divIcon({className:"",html:`<div style="position:relative;width:28px;height:36px;cursor:pointer"><div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:linear-gradient(135deg,${BR.red},${BR.green});transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,0.4);border:2px solid white"><span style="transform:rotate(45deg);font-size:12px">⚽</span></div><div style="width:8px;height:8px;border-radius:50%;background:rgba(196,30,58,0.3);margin:2px auto 0;animation:pulse 2s infinite"></div></div>`,iconSize:[28,36],iconAnchor:[14,36]});STADIUMS.forEach(s=>{const mk=window.L.marker([s.lat,s.lng],{icon:ic}).addTo(m);mk.bindPopup(`<div style="font-family:Outfit,sans-serif"><strong>${s.city}</strong><br><span style="font-size:11px;color:#666">${s.name}</span><br><span style="color:${BR.red};font-weight:600">${s.cap}</span></div>`);mk.on("click",()=>onSelect&&onSelect(s));});mR.current=m;setTimeout(()=>m.invalidateSize(),200);}return()=>{if(mR.current){mR.current.remove();mR.current=null;}};},[]);return<div ref={ref} style={{width:"100%",height:height||240,borderRadius:9,overflow:"hidden",border:`1px solid ${C.bdr}`}}/>;}

// ═══════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════
export default function MoundiGuide(){
  const[splash,setSplash]=useState(true);
  const[lang,setLang]=useState("fr");
  const[msgs,setMsgs]=useState([]);
  const[input,setInput]=useState("");
  const[loading,setLoading]=useState(false);
  const[showLang,setShowLang]=useState(false);
  const[tab,setTab]=useState("chat");
  const[themeMode,setThemeMode]=useState("system");
  const[sysDark,setSysDark]=useState(true);
  const[weatherCity,setWeatherCity]=useState("Casablanca");
  const[listening,setListening]=useState(false);
  const[isDesk,setIsDesk]=useState(typeof window!=="undefined"&&window.innerWidth>=768);
  const[chatOpen,setChatOpen]=useState(false);
  const endRef=useRef(null);const inpRef=useRef(null);const recRef=useRef(null);

  useEffect(()=>{const mq=window.matchMedia("(prefers-color-scheme:dark)");setSysDark(mq.matches);const h=e=>setSysDark(e.matches);mq.addEventListener("change",h);return()=>mq.removeEventListener("change",h);},[]);
  useEffect(()=>{const h=()=>setIsDesk(window.innerWidth>=768);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h);},[]);
  const dk=themeMode==="system"?sysDark:themeMode==="dark";
  const C=dk?TH.dark:TH.light;
  const ac=dk?BR.gold:BR.red;
  useEffect(()=>{setMsgs([{role:"assistant",content:WELCOME[lang]}]);},[lang]);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);
  useEffect(()=>{if(!showLang)return;const cl=()=>setShowLang(false);setTimeout(()=>document.addEventListener("click",cl),0);return()=>document.removeEventListener("click",cl);},[showLang]);

  const send=useCallback(async(text)=>{
    const t=text||input.trim();if(!t||loading)return;setInput("");if(isDesk)setChatOpen(true);else setTab("chat");
    const nm=[...msgs,{role:"user",content:t}];setMsgs(nm);setLoading(true);
    try{const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({lang,messages:nm.map(m=>({role:m.role,content:m.content}))})});const d=await r.json();setMsgs(p=>[...p,{role:"assistant",content:d.content?.[0]?.text||d.error||"⚠️ Erreur"}]);}
    catch{setMsgs(p=>[...p,{role:"assistant",content:"⚠️ Hors-ligne"}]);}
    finally{setLoading(false);inpRef.current?.focus();}
  },[input,loading,msgs,lang,isDesk]);

  const startVoice=()=>{if(!("webkitSpeechRecognition" in window)&&!("SpeechRecognition" in window))return;const SR=window.SpeechRecognition||window.webkitSpeechRecognition;const rec=new SR();rec.lang=lang==="ar"?"ar-MA":lang;rec.continuous=false;rec.onresult=e=>{setInput(e.results[0][0].transcript);setListening(false);};rec.onerror=()=>setListening(false);rec.onend=()=>setListening(false);rec.start();setListening(true);recRef.current=rec;};
  const stopVoice=()=>{if(recRef.current){recRef.current.stop();setListening(false);}};

  const curLang=LANGUAGES.find(l=>l.code===lang);
  const isRTL=lang==="ar";
  const F="'Outfit'";

  // ── Shared chat messages render ──
  const renderChat=()=>(
    <>
      {msgs.map((m,i)=>(
        <div key={i} className="me" style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",direction:isRTL?"rtl":"ltr"}}>
          {m.role==="assistant"&&<div style={{width:22,height:22,borderRadius:"50%",flexShrink:0,background:`linear-gradient(135deg,${BR.red},${BR.green})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,marginRight:isRTL?0:5,marginLeft:isRTL?5:0,marginTop:2}}>⚽</div>}
          <div style={{maxWidth:"82%",padding:"8px 11px",borderRadius:m.role==="user"?"13px 13px 3px 13px":"13px 13px 13px 3px",background:m.role==="user"?C.usr:C.bot,border:m.role==="user"?"none":`1px solid ${C.bbdr}`,color:m.role==="user"?"#FFF":C.txt,fontSize:12,lineHeight:1.5,fontFamily:isRTL?"'Noto Sans Arabic'":F,fontWeight:300}}>
            {m.role==="assistant"?md(m.content):m.content}
          </div>
        </div>
      ))}
      {loading&&(<div className="me" style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:22,height:22,borderRadius:"50%",background:`linear-gradient(135deg,${BR.red},${BR.green})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10}}>⚽</div><div style={{padding:"8px 11px",borderRadius:"13px 13px 13px 3px",background:C.bot,border:`1px solid ${C.bbdr}`,display:"flex",gap:3}}>{[0,.15,.3].map((d,i)=><div key={i} style={{width:4,height:4,borderRadius:"50%",background:ac,animation:`dp 1s ease-in-out infinite`,animationDelay:`${d}s`}}/>)}</div></div>)}
      <div ref={endRef}/>
    </>
  );

  // ── Shared input bar ──
  const renderInput=()=>(
    <div style={{padding:"6px 8px 8px",background:C.chatBg,flexShrink:0}}>
      <div style={{display:"flex",gap:5,alignItems:"flex-end"}}>
        <button onMouseDown={startVoice} onMouseUp={stopVoice} onTouchStart={startVoice} onTouchEnd={stopVoice} style={{width:32,height:32,borderRadius:7,flexShrink:0,border:`1px solid ${C.bdr}`,background:listening?BR.red:C.card,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:listening?"white":C.mut,animation:listening?"pulse 1s infinite":"none"}}>🎤</button>
        <input ref={inpRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();send();}}} placeholder={PLACEHOLDERS[lang]} dir={isRTL?"rtl":"ltr"}
          style={{flex:1,padding:"7px 9px",background:C.fld,border:`1px solid ${C.bdr}`,borderRadius:9,color:C.str,fontSize:12,fontFamily:isRTL?"'Noto Sans Arabic'":F,fontWeight:300,outline:"none"}} />
        <button onClick={()=>send()} disabled={!input.trim()||loading} className="sb" style={{width:32,height:32,borderRadius:7,flexShrink:0,background:input.trim()&&!loading?`linear-gradient(135deg,${BR.red},${BR.green})`:C.card,border:input.trim()&&!loading?"none":`1px solid ${C.bdr}`,cursor:input.trim()&&!loading?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:input.trim()&&!loading?"white":C.mut}}>
          {loading?<div style={{width:12,height:12,border:`2px solid ${C.bdr}`,borderTopColor:ac,borderRadius:"50%",animation:"sp .6s linear infinite"}}/>:"➤"}
        </button>
      </div>
    </div>
  );

  return(
    <>
    {splash&&<Splash onDone={()=>setSplash(false)}/>}
    <div style={{height:"100vh",width:"100vw",overflow:"hidden",background:C.bg,fontFamily:"'Segoe UI',system-ui,sans-serif",display:"flex",flexDirection:"column",transition:"background .3s"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Noto+Sans+Arabic:wght@400;600&display=swap');
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes dp{0%,100%{opacity:1}50%{opacity:.3}}@keyframes sp{to{transform:rotate(360deg)}}@keyframes as{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(196,30,58,0.4)}70%{box-shadow:0 0 0 8px rgba(196,30,58,0)}}
        @keyframes popIn{from{opacity:0;transform:scale(0.9) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes cardHover{0%{transform:scale(1)}50%{transform:scale(1.02)}100%{transform:scale(1)}}
        .me{animation:fadeIn .25s ease both}.tb{transition:all .15s}.sb:hover:not(:disabled){opacity:.9;transform:scale(1.05)}
        .card-anim{animation:slideIn .3s ease both;transition:transform .2s,box-shadow .2s}.card-anim:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,0.15)}
        .stagger-1{animation-delay:.05s}.stagger-2{animation-delay:.1s}.stagger-3{animation-delay:.15s}.stagger-4{animation-delay:.2s}.stagger-5{animation-delay:.25s}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:${C.sc};border-radius:3px}
        *{box-sizing:border-box;margin:0;padding:0}
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}input[type=number]{-moz-appearance:textfield}
        html,body{overflow:hidden;height:100%;width:100%}
      `}</style>

      {/* HEADER */}
      <div style={{padding:"8px 14px 4px",background:C.hdr,backdropFilter:"blur(24px)",borderBottom:`1px solid ${C.bdr}`,flexShrink:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",maxWidth:1400,margin:"0 auto",width:"100%"}}>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <div style={{position:"relative",width:30,height:30}}>
              <svg width="30" height="30" viewBox="0 0 38 38" style={{animation:"as 20s linear infinite"}}>{[BR.red,BR.green,BR.blue,BR.gold].map((c,i)=><circle key={i} cx="19" cy="19" r="16" fill="none" stroke={c} strokeWidth="2.5" strokeDasharray="12 88" strokeDashoffset={i*-25}/>)}</svg>
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>⚽</div>
            </div>
            <div>
              <div style={{fontFamily:F,fontWeight:700,fontSize:isDesk?17:15,lineHeight:1}}><span style={{color:BR.red}}>M</span><span style={{color:C.str}}>oundi</span><span style={{color:BR.green}}>G</span><span style={{color:C.str}}>uide</span></div>
              <div style={{fontFamily:F,fontSize:7,color:C.mut,letterSpacing:2,textTransform:"uppercase",marginTop:1}}>YallaVamos 2030</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:5}}>
            <button onClick={()=>setThemeMode(p=>({system:"light",light:"dark",dark:"system"}[p]))} style={{width:26,height:26,borderRadius:6,border:`1px solid ${C.bdr}`,background:C.card,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,position:"relative"}}>
              {dk?"☀️":"🌙"}{themeMode==="system"&&<div style={{position:"absolute",bottom:-1,right:-1,width:5,height:5,borderRadius:3,background:BR.green,border:`1px solid ${dk?"#0C1117":"#F5F6F8"}`}}/>}
            </button>
            <div style={{position:"relative",zIndex:9999}}>
              <button onClick={e=>{e.stopPropagation();setShowLang(!showLang);}} style={{background:C.card,border:`1px solid ${C.bdr}`,borderRadius:14,padding:"3px 8px",cursor:"pointer",color:C.str,fontSize:10,fontWeight:500,display:"flex",alignItems:"center",gap:3,fontFamily:F}}>
                <span style={{fontSize:11}}>{curLang.flag}</span><span>{curLang.label}</span><span style={{opacity:.4,fontSize:7}}>▼</span>
              </button>
            </div>
          </div>
        </div>
        <div style={{display:"flex",height:2,marginTop:4,borderRadius:1,overflow:"hidden",maxWidth:1400,margin:"4px auto 0"}}>{[BR.red,BR.gold,BR.green,BR.blue].map((c,i)=><div key={i} style={{flex:1,background:c}}/>)}</div>
      </div>

      {/* Language overlay */}
      {showLang&&(<div onClick={()=>setShowLang(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:99999,display:"flex",alignItems:"center",justifyContent:"center",animation:"fadeIn .15s ease"}}>
        <div onClick={e=>e.stopPropagation()} style={{background:C.dd,border:`1px solid ${C.bdr}`,borderRadius:14,padding:"12px 6px",minWidth:200,boxShadow:C.sh,animation:"popIn .2s ease both"}}>
          <div style={{fontFamily:F,fontSize:11,fontWeight:600,color:C.mut,textAlign:"center",padding:"4px 0 8px",letterSpacing:1}}>🌍 LANGUE</div>
          {LANGUAGES.map(l=>(<button key={l.code} onClick={()=>{setLang(l.code);setShowLang(false);}} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"10px 16px",background:lang===l.code?C.la:"transparent",border:"none",cursor:"pointer",color:lang===l.code?ac:C.txt,fontSize:13,fontFamily:F,borderRadius:8,fontWeight:lang===l.code?600:400,transition:"all .15s"}}><span style={{fontSize:18}}>{l.flag}</span><span>{l.label}</span>{lang===l.code&&<span style={{marginLeft:"auto",fontSize:12}}>✓</span>}</button>))}
        </div>
      </div>)}

      <AdBanner C={C}/>

      {/* ═══ DESKTOP LAYOUT ═══ */}
      {isDesk?(
        <div style={{flex:1,display:"flex",maxWidth:1400,margin:"0 auto",width:"100%",overflow:"hidden",position:"relative"}}>
          {/* LEFT: Rankings */}
          <div style={{width:250,flexShrink:0,borderRight:`1px solid ${C.bdr}`,overflowY:"auto",background:dk?"rgba(0,0,0,0.15)":"rgba(255,255,255,0.4)"}}>
            <div style={{padding:10}}>
              <div style={{fontFamily:F,fontSize:12,fontWeight:700,color:C.str,marginBottom:6,display:"flex",alignItems:"center",gap:4}}>🏆 FIFA Rankings <span style={{fontSize:8,color:C.mut,fontWeight:400}}>Avr 2026</span></div>
              {FIFA_RANKINGS.map(r=>(<div key={r.r} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 5px",borderRadius:5,marginBottom:1,background:(r.f==="🇲🇦"||r.f==="🇪🇸"||r.f==="🇵🇹")?(dk?"rgba(245,166,35,0.06)":"rgba(196,30,58,0.03)"):"transparent"}}>
                <span style={{fontFamily:F,fontSize:9,fontWeight:600,color:C.mut,width:14,textAlign:"right"}}>{r.r}</span>
                <span style={{fontSize:13}}>{r.f}</span>
                <span style={{fontFamily:F,fontSize:10,fontWeight:r.f==="🇲🇦"?700:500,color:C.str,flex:1}}>{r.t}</span>
                <span style={{fontFamily:F,fontSize:8,color:C.mut}}>{r.p}</span>
                <span style={{fontSize:7,color:r.c==="up"?"#22C55E":r.c==="dn"?"#EF4444":"#888"}}>{r.c==="up"?"▲":r.c==="dn"?"▼":"•"}</span>
              </div>))}
            </div>
            <div style={{height:1,background:C.bdr,margin:"0 10px"}}/>
            <div style={{padding:10}}>
              <div style={{fontFamily:F,fontSize:12,fontWeight:700,color:C.str,marginBottom:6}}>📰 Actualités</div>
              {NEWS.map((n,i)=>(<div key={i} onClick={()=>send(n.t)} style={{background:C.card,border:`1px solid ${C.bdr}`,borderRadius:7,padding:"7px 9px",marginBottom:5,cursor:"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{fontFamily:F,fontSize:7,color:n.tc,fontWeight:600,background:`${n.tc}12`,padding:"1px 4px",borderRadius:3}}>{n.tg}</span><span style={{fontFamily:F,fontSize:7,color:C.mut}}>{n.d}</span></div>
                <div style={{fontFamily:F,fontSize:10,fontWeight:500,color:C.str,lineHeight:1.3}}>{n.t}</div>
              </div>))}
            </div>
          </div>

          {/* CENTER: Map + Matches + Stadiums + Info */}
          <div style={{flex:1,overflowY:"auto",minWidth:0}}>
            <div style={{padding:12}}>
              <Carousel C={C}/>
            </div>
            <div style={{padding:"0 12px 12px"}}>
              <div style={{fontFamily:F,fontSize:14,fontWeight:700,color:C.str,marginBottom:8}}>🗺️ Carte des stades</div>
              <SMap C={C} onSelect={s=>send(`Parle-moi du stade de ${s.city}`)} height={280}/>
            </div>
            <div style={{height:1,background:C.bdr,margin:"0 12px"}}/>
            <div style={{padding:12}}>
              <div style={{display:"flex",gap:8}}>
                <div style={{flex:1}}>
                  <div style={{fontFamily:F,fontSize:12,fontWeight:700,color:C.str,marginBottom:6}}>☀️ Météo</div>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:6}}>{STADIUMS.map(s=><button key={s.city} onClick={()=>setWeatherCity(s.city)} style={{padding:"2px 6px",borderRadius:10,border:`1px solid ${C.bdr}`,background:weatherCity===s.city?C.la:C.card,color:weatherCity===s.city?ac:C.txt,fontSize:8,cursor:"pointer",fontFamily:F,fontWeight:500}}>{s.city}</button>)}</div>
                  <Weather C={C} city={weatherCity}/>
                </div>
                <div style={{flex:1}}>
                  <CurrConv C={C}/>
                </div>
              </div>
            </div>
            <div style={{height:1,background:C.bdr,margin:"0 12px"}}/>
            <div style={{padding:12}}>
              <div style={{fontFamily:F,fontSize:12,fontWeight:700,color:C.str,marginBottom:6}}>📅 Matchs</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
                {MATCHES.map((m,i)=>(<div key={i} style={{background:C.card,border:`1px solid ${C.bdr}`,borderRadius:7,padding:"7px 9px",borderLeft:`3px solid ${m.ph==="F"?BR.gold:m.ph==="S"?BR.blue:m.ph==="Q"?BR.green:BR.red}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{fontFamily:F,fontSize:7,color:ac,fontWeight:600}}>{m.ph==="G"?"Groupe":m.ph==="8"?"8èmes":m.ph==="Q"?"Quarts":m.ph==="S"?"Demis":"Finale"}</span><span style={{fontFamily:F,fontSize:7,color:C.mut}}>{m.d}</span></div>
                  <div style={{fontFamily:F,fontSize:11,fontWeight:600,color:C.str}}>{m.a} vs {m.b}</div>
                  <div style={{fontFamily:F,fontSize:8,color:C.mut}}>📍 {m.c}</div>
                </div>))}
              </div>
            </div>
            <div style={{height:1,background:C.bdr,margin:"0 12px"}}/>
            {/* Info + Darija */}
            <div style={{padding:12}}>
              <div style={{fontFamily:F,fontSize:12,fontWeight:700,color:C.str,marginBottom:6}}>ℹ️ Infos pratiques</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4}}>
                {INFO_ITEMS.map((it,i)=>(<div key={i} style={{background:C.card,border:`1px solid ${C.bdr}`,borderRadius:6,padding:6,textAlign:"center"}}><div style={{fontSize:13}}>{it.i}</div><div style={{fontFamily:F,fontSize:10,fontWeight:600,color:C.str}}>{it.v}</div><div style={{fontFamily:F,fontSize:7,color:C.mut}}>{it.l}</div></div>))}
              </div>
              <div style={{marginTop:8,background:C.card,border:`1px solid ${C.bdr}`,borderRadius:7,padding:8}}>
                <div style={{fontFamily:F,fontSize:10,fontWeight:600,color:ac,marginBottom:4}}>🗣️ Darija</div>
                {DARIJA.map((p,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderBottom:i<4?`1px solid ${C.bdr}`:"none"}}><span style={{fontFamily:F,fontSize:10,fontWeight:500,color:C.str}}>{p.d}</span><span style={{fontFamily:F,fontSize:9,color:C.mut}}>{p.t[lang]||p.t.en}</span></div>))}
              </div>
            </div>
            {/* Videos */}
            <div style={{padding:12}}>
              <div style={{fontFamily:F,fontSize:12,fontWeight:700,color:C.str,marginBottom:6}}>🎬 Vidéos Mondial 2030</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {VIDEOS.map((v,i)=>(<div key={i} className="card-anim" style={{borderRadius:9,overflow:"hidden",border:`1px solid ${C.bdr}`}}><div style={{position:"relative",paddingBottom:"56.25%",height:0}}><iframe src={`https://www.youtube.com/embed/${v.id}`} title={v.title} allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowFullScreen style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:"none"}}/></div><div style={{padding:"6px 8px",background:C.card}}><div style={{fontFamily:F,fontSize:9,fontWeight:600,color:C.str}}>{v.title}</div></div></div>))}
              </div>
            </div>
          </div>

          {/* RIGHT: Floating Chat Bubble */}
          {chatOpen?(
            <div style={{width:360,flexShrink:0,borderLeft:`1px solid ${C.bdr}`,display:"flex",flexDirection:"column",background:dk?"rgba(0,0,0,0.2)":"rgba(255,255,255,0.4)",animation:"popIn .25s ease both"}}>
              <div style={{padding:"8px 10px",borderBottom:`1px solid ${C.bdr}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontFamily:F,fontSize:12,fontWeight:600,color:C.str}}>💬 Assistant MoundiGuide</span>
                <button onClick={()=>setChatOpen(false)} style={{background:"none",border:"none",cursor:"pointer",color:C.mut,fontSize:14}}>✕</button>
              </div>
              <div style={{flex:1,overflowY:"auto",padding:"10px 8px",display:"flex",flexDirection:"column",gap:6}}>{renderChat()}</div>
              <div style={{padding:"4px 8px",display:"flex",gap:3,overflowX:"auto",scrollbarWidth:"none",borderTop:`1px solid ${C.bdr}`}}>
                {(QUICK_TOPICS[lang]||QUICK_TOPICS.en).map((t,i)=>(<button key={i} onClick={()=>send(t)} style={{whiteSpace:"nowrap",padding:"2px 6px",background:C.card,border:`1px solid ${C.bdr}`,borderRadius:10,color:C.mut,fontSize:8,cursor:"pointer",fontFamily:F}}>{t}</button>))}
              </div>
              {renderInput()}
            </div>
          ):(
            <button onClick={()=>setChatOpen(true)} style={{position:"fixed",bottom:20,right:20,width:56,height:56,borderRadius:"50%",background:`linear-gradient(135deg,${BR.red},${BR.green})`,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,color:"white",boxShadow:"0 4px 20px rgba(196,30,58,0.4)",zIndex:1000,animation:"pulse 2s infinite"}}>💬</button>
          )}
        </div>
      ):(
        /* ═══ MOBILE LAYOUT ═══ */
        <>
          <div style={{display:"flex",background:dk?"rgba(0,0,0,0.3)":"rgba(255,255,255,0.6)",borderBottom:`1px solid ${C.bdr}`,flexShrink:0}}>
            {[{id:"chat",ic:"💬",l:"Chat"},{id:"matchs",ic:"📅",l:"Matchs"},{id:"map",ic:"🗺️",l:"Carte"},{id:"rankings",ic:"🏆",l:"FIFA"},{id:"videos",ic:"🎬",l:"Vidéos"},{id:"info",ic:"ℹ️",l:"Infos"}].map(t=>(
              <button key={t.id} className="tb" onClick={()=>setTab(t.id)} style={{flex:1,padding:"7px 0",border:"none",cursor:"pointer",background:tab===t.id?C.la:"transparent",borderBottom:tab===t.id?`2px solid ${ac}`:"2px solid transparent",color:tab===t.id?ac:C.mut,fontSize:9,fontWeight:500,fontFamily:F,display:"flex",alignItems:"center",justifyContent:"center",gap:3}}>
                <span style={{fontSize:10}}>{t.ic}</span>{t.l}
              </button>
            ))}
          </div>
          <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}>
            {tab==="chat"&&(<>
              <div style={{flex:1,overflowY:"auto",padding:"10px 8px",display:"flex",flexDirection:"column",gap:6}}>{renderChat()}</div>
              <div style={{padding:"4px 8px",display:"flex",gap:3,overflowX:"auto",scrollbarWidth:"none",borderTop:`1px solid ${C.bdr}`}}>
                {(QUICK_TOPICS[lang]||QUICK_TOPICS.en).map((t,i)=>(<button key={i} onClick={()=>send(t)} style={{whiteSpace:"nowrap",padding:"2px 6px",background:C.card,border:`1px solid ${C.bdr}`,borderRadius:10,color:C.mut,fontSize:8,cursor:"pointer",fontFamily:F}}>{t}</button>))}
              </div>
              {renderInput()}
            </>)}
            {tab==="matchs"&&(<div style={{padding:10}}><div style={{fontFamily:F,fontSize:13,fontWeight:700,color:C.str,marginBottom:8}}>📅 Matchs</div>{MATCHES.map((m,i)=>(<div key={i} style={{background:C.card,border:`1px solid ${C.bdr}`,borderRadius:7,padding:"7px 9px",marginBottom:5,borderLeft:`3px solid ${m.ph==="F"?BR.gold:m.ph==="S"?BR.blue:m.ph==="Q"?BR.green:BR.red}`}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{fontFamily:F,fontSize:7,color:ac,fontWeight:600}}>{m.ph==="G"?"Groupe":m.ph==="8"?"8èmes":m.ph==="Q"?"Quarts":m.ph==="S"?"Demis":"Finale"}</span><span style={{fontFamily:F,fontSize:7,color:C.mut}}>{m.d}</span></div><div style={{fontFamily:F,fontSize:11,fontWeight:600,color:C.str}}>{m.a} vs {m.b}</div><div style={{fontFamily:F,fontSize:8,color:C.mut}}>📍 {m.c}</div></div>))}</div>)}
            {tab==="map"&&(<div style={{padding:10}}><Carousel C={C}/><div style={{marginTop:8}}><SMap C={C} onSelect={s=>send(`Parle-moi du stade de ${s.city}`)} height={280}/></div><div style={{marginTop:6}}><Weather C={C} city={weatherCity}/></div><div style={{display:"flex",gap:4,marginTop:5,flexWrap:"wrap"}}>{STADIUMS.map(s=><button key={s.city} onClick={()=>setWeatherCity(s.city)} style={{padding:"2px 5px",borderRadius:10,border:`1px solid ${C.bdr}`,background:weatherCity===s.city?C.la:C.card,color:weatherCity===s.city?ac:C.txt,fontSize:8,cursor:"pointer",fontFamily:F}}>{s.city}</button>)}</div></div>)}
            {tab==="rankings"&&(<div style={{padding:10}}><div style={{fontFamily:F,fontSize:13,fontWeight:700,color:C.str,marginBottom:6}}>🏆 FIFA Rankings — Jan 2026</div>{FIFA_RANKINGS.map((r,idx)=>(<div key={r.r} className={`card-anim stagger-${Math.min(idx%6,5)}`} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 5px",borderRadius:5,marginBottom:1,background:(r.f==="🇲🇦"||r.f==="🇪🇸"||r.f==="🇵🇹")?C.la:"transparent"}}><span style={{fontFamily:F,fontSize:9,fontWeight:600,color:C.mut,width:14,textAlign:"right"}}>{r.r}</span><span style={{fontSize:13}}>{r.f}</span><span style={{fontFamily:F,fontSize:10,fontWeight:r.f==="🇲🇦"?700:500,color:C.str,flex:1}}>{r.t}</span><span style={{fontFamily:F,fontSize:8,color:C.mut}}>{r.p}</span><span style={{fontSize:7,color:r.c==="up"?"#22C55E":r.c==="dn"?"#EF4444":"#888"}}>{r.c==="up"?"▲":r.c==="dn"?"▼":"•"}</span></div>))}<div style={{height:1,background:C.bdr,margin:"10px 0"}}/><div style={{fontFamily:F,fontSize:13,fontWeight:700,color:C.str,marginBottom:6}}>📰 Actualités</div>{NEWS.map((n,i)=>(<div key={i} className="card-anim" onClick={()=>send(n.t)} style={{background:C.card,border:`1px solid ${C.bdr}`,borderRadius:7,padding:"7px 9px",marginBottom:5,cursor:"pointer"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{fontFamily:F,fontSize:7,color:n.tc,fontWeight:600}}>{n.tg}</span><span style={{fontFamily:F,fontSize:7,color:C.mut}}>{n.d}</span></div><div style={{fontFamily:F,fontSize:10,fontWeight:500,color:C.str,lineHeight:1.3}}>{n.t}</div></div>))}</div>)}
            {tab==="videos"&&(<div style={{padding:10,animation:"fadeIn .3s ease"}}><div style={{fontFamily:F,fontSize:13,fontWeight:700,color:C.str,marginBottom:8}}>🎬 Vidéos Mondial 2030</div>{VIDEOS.map((v,i)=>(<div key={i} className="card-anim" style={{marginBottom:10,borderRadius:10,overflow:"hidden",border:`1px solid ${C.bdr}`}}><div style={{position:"relative",paddingBottom:"56.25%",height:0}}><iframe src={`https://www.youtube.com/embed/${v.id}`} title={v.title} allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowFullScreen style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:"none"}}/></div><div style={{padding:"8px 10px",background:C.card}}><div style={{fontFamily:F,fontSize:11,fontWeight:600,color:C.str}}>{v.title}</div></div></div>))}</div>)}
            {tab==="info"&&(<div style={{padding:10}}><div style={{fontFamily:F,fontSize:13,fontWeight:700,color:C.str,marginBottom:6}}>ℹ️ Infos pratiques</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>{INFO_ITEMS.map((it,i)=>(<div key={i} style={{background:C.card,border:`1px solid ${C.bdr}`,borderRadius:7,padding:8,textAlign:"center"}}><div style={{fontSize:15}}>{it.i}</div><div style={{fontFamily:F,fontSize:12,fontWeight:600,color:C.str}}>{it.v}</div><div style={{fontFamily:F,fontSize:8,color:C.mut}}>{it.l}</div></div>))}</div><CurrConv C={C}/><div style={{marginTop:8,background:C.card,border:`1px solid ${C.bdr}`,borderRadius:8,padding:10}}><div style={{fontFamily:F,fontSize:11,fontWeight:600,color:ac,marginBottom:6}}>🗣️ Darija</div>{DARIJA.map((p,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:i<4?`1px solid ${C.bdr}`:"none"}}><span style={{fontFamily:F,fontSize:11,fontWeight:500,color:C.str}}>{p.d}</span><span style={{fontFamily:F,fontSize:10,color:C.mut}}>{p.t[lang]||p.t.en}</span></div>))}</div></div>)}
          </div>
        </>
      )}

      {/* FOOTER */}
      <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:4,padding:"4px 0",background:dk?"rgba(0,0,0,0.3)":"rgba(255,255,255,0.5)",flexShrink:0,borderTop:`1px solid ${C.bdr}`}}>
        {[BR.red,BR.gold,BR.green,BR.blue].map((c,i)=><div key={i} style={{width:6,height:2,borderRadius:1,background:c}}/>)}
        <span style={{fontFamily:F,fontSize:7,color:C.mut,letterSpacing:1.5,marginLeft:3}}>YALLAVAMOS 2030</span>
      </div>
    </div>
    </>
  );
}
