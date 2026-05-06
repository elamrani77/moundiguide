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
  {d:"12 Avr",t:"Grand Stade Hassan II : 95% de construction",tg:"Infra",tc:"#00913F"},
  {d:"10 Avr",t:"Plan de mobilité pour les 6 villes hôtes",tg:"Transport",tc:"#1A56DB"},
  {d:"8 Avr",t:"FIFA confirme 48 équipes qualifiées",tg:"FIFA",tc:"#E41C3A"},
  {d:"5 Avr",t:"Billetterie en ligne ouvrira en janvier 2029",tg:"Billets",tc:"#F0B429"},
  {d:"3 Avr",t:"YallaVamos : 20 000 bénévoles recherchés",tg:"Bénévol.",tc:"#7C3AED"},
  {d:"1 Avr",t:"France reprend la 1ère place FIFA",tg:"FIFA",tc:"#E41C3A"},
];
const ADS = ["⚽ YALLAVAMOS 2030 — Maroc · Espagne · Portugal","🏟️ Grand Stade Hassan II — 115 000 places","🇲🇦 Visit Morocco — Découvrez le Maroc","🎫 Billetterie FIFA 2030 — Réservez vos places","✈️ Royal Air Maroc — Partenaire officiel","🏨 Booking.com — Hébergement Mondial 2030"];
const CURRENCIES = [{c:"EUR",s:"€"},{c:"USD",s:"$"},{c:"GBP",s:"£"},{c:"BRL",s:"R$"},{c:"JPY",s:"¥"}];
const INFO_ITEMS = [{i:"🚨",l:"Police",v:"19"},{i:"🚑",l:"SAMU",v:"15"},{i:"🚒",l:"Pompiers",v:"15"},{i:"💱",l:"Monnaie",v:"MAD"},{i:"🔌",l:"220V",v:"C,E"},{i:"🕐",l:"Fuseau",v:"GMT+1"},{i:"📱",l:"Indicatif",v:"+212"},{i:"💧",l:"Eau",v:"Bouteille"}];
const DARIJA = [{d:"Salam",t:{fr:"Bonjour",en:"Hello",ar:"مرحبا",es:"Hola"}},{d:"Beshhal?",t:{fr:"Combien?",en:"How much?",ar:"بكم؟",es:"¿Cuánto?"}},{d:"Shukran",t:{fr:"Merci",en:"Thanks",ar:"شكرا",es:"Gracias"}},{d:"Fin kayn?",t:{fr:"Où est?",en:"Where?",ar:"فين؟",es:"¿Dónde?"}},{d:"Mezyan",t:{fr:"Bien",en:"Good",ar:"مزيان",es:"Bien"}}];

// ── Premium brand palette ──
const BR = {red:"#E41C3A", green:"#00913F", blue:"#1A56DB", gold:"#F0B429"};

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

// ── Premium theme ──
const TH = {
  dark:{
    bg:"#07091A",
    hdr:"rgba(7,9,26,0.92)",
    card:"rgba(255,255,255,0.055)",
    bdr:"rgba(255,255,255,0.09)",
    txt:"rgba(255,255,255,0.76)",
    str:"#FFFFFF",
    mut:"rgba(255,255,255,0.35)",
    fld:"rgba(255,255,255,0.07)",
    bot:"rgba(255,255,255,0.05)",
    bbdr:"rgba(255,255,255,0.09)",
    usr:`linear-gradient(135deg,${BR.red},#9E0F28)`,
    dd:"rgba(7,9,26,0.99)",
    la:"rgba(240,180,41,0.12)",
    sh:"0 24px 64px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.07)",
    sc:"rgba(255,255,255,0.07)",
    adBg:"#04060F",
    chatBg:"rgba(7,9,26,0.75)",
  },
  light:{
    bg:"#EDF0F7",
    hdr:"rgba(255,255,255,0.96)",
    card:"rgba(255,255,255,0.78)",
    bdr:"rgba(0,0,0,0.08)",
    txt:"rgba(0,0,0,0.70)",
    str:"#07091A",
    mut:"rgba(0,0,0,0.38)",
    fld:"rgba(0,0,0,0.04)",
    bot:"rgba(255,255,255,0.85)",
    bbdr:"rgba(0,0,0,0.08)",
    usr:`linear-gradient(135deg,${BR.red},#B5102A)`,
    dd:"rgba(255,255,255,0.99)",
    la:"rgba(228,28,58,0.07)",
    sh:"0 16px 48px rgba(0,0,0,0.11), inset 0 1px 0 rgba(255,255,255,0.9)",
    sc:"rgba(0,0,0,0.06)",
    adBg:"#0F1220",
    chatBg:"rgba(255,255,255,0.78)",
  },
};

function md(t){if(!t)return t;return t.split("\n").map((l,i)=>{let c=l.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>");if(l.startsWith("- ")||l.startsWith("• "))return<div key={i} style={{paddingLeft:12,marginBottom:2}} dangerouslySetInnerHTML={{__html:"• "+c.slice(2)}}/>;if(l.trim()==="")return<div key={i} style={{height:6}}/>;return<div key={i} dangerouslySetInnerHTML={{__html:c}}/>;});}

// ── Splash Screen ──
function Splash({onDone}){
  useEffect(()=>{const t=setTimeout(onDone,2800);return()=>clearTimeout(t);},[onDone]);
  return(
    <div style={{position:"fixed",inset:0,zIndex:999999,background:"linear-gradient(135deg,#04060F 0%,#140509 55%,#04060F 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
      <style>{`@keyframes kickBall{0%{transform:translateY(0) rotate(0deg)}30%{transform:translateY(-70px) rotate(180deg)}50%{transform:translateY(0) rotate(360deg)}70%{transform:translateY(-35px) rotate(540deg)}100%{transform:translateY(0) rotate(720deg)}}@keyframes growBar{from{width:0}to{width:100%}}@keyframes splashFade{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{fontSize:76,animation:"kickBall 1.5s ease-in-out infinite",filter:"drop-shadow(0 0 20px rgba(240,180,41,0.6))",marginBottom:4}}>⚽</div>
      <div style={{fontFamily:"'Outfit',sans-serif",fontSize:34,fontWeight:800,letterSpacing:1,animation:"splashFade .6s .2s both"}}>
        <span style={{color:BR.red}}>M</span><span style={{color:"#FFF"}}>oundi</span><span style={{color:BR.green}}>G</span><span style={{color:"#FFF"}}>uide</span>
      </div>
      <div style={{fontFamily:"'Outfit',sans-serif",fontSize:11,color:BR.gold,letterSpacing:5,marginTop:8,textTransform:"uppercase",animation:"splashFade .6s .35s both"}}>YallaVamos 2030</div>
      <div style={{width:150,height:3,background:"rgba(255,255,255,0.08)",borderRadius:3,marginTop:28,overflow:"hidden",animation:"splashFade .6s .5s both"}}>
        <div style={{height:"100%",background:`linear-gradient(90deg,${BR.red},${BR.gold},${BR.green})`,borderRadius:3,animation:"growBar 2.5s .5s ease-out forwards",width:0}}/>
      </div>
      <div style={{display:"flex",gap:10,marginTop:18,animation:"splashFade .6s .65s both"}}>
        <span style={{fontSize:24}}>🇲🇦</span><span style={{fontSize:24}}>🇪🇸</span><span style={{fontSize:24}}>🇵🇹</span>
      </div>
    </div>
  );
}

// ── Photo Carousel ──
function Carousel({C,big}){
  const[idx,setIdx]=useState(0);
  useEffect(()=>{const id=setInterval(()=>setIdx(p=>(p+1)%CAROUSEL_PHOTOS.length),3800);return()=>clearInterval(id);},[]);
  return(
    <div style={{position:"relative",width:"100%",height:big?340:195,borderRadius:18,overflow:"hidden",border:`1px solid ${C.bdr}`,boxShadow:big?C.sh:"none"}}>
      {CAROUSEL_PHOTOS.map((p,i)=>(
        <img key={i} src={p} alt={CAROUSEL_LABELS[i]} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:i===idx?1:0,transform:i===idx?"scale(1.04)":"scale(1)",transition:"opacity 1.2s ease, transform 7s ease"}}/>
      ))}
      <div style={{position:"absolute",inset:0,background:"linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.15) 45%, transparent 75%)"}}/>
      <div style={{position:"absolute",top:12,left:14,background:"rgba(0,0,0,0.42)",backdropFilter:"blur(10px)",borderRadius:20,padding:"4px 12px",border:"1px solid rgba(255,255,255,0.12)"}}>
        <span style={{fontFamily:"'Outfit'",fontSize:9,fontWeight:600,color:BR.gold,letterSpacing:2.5,textTransform:"uppercase"}}>Mondial 2030</span>
      </div>
      <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"32px 18px 16px"}}>
        <div style={{fontFamily:"'Outfit'",fontSize:big?20:16,fontWeight:700,color:"#FFF",letterSpacing:0.2}}>{CAROUSEL_LABELS[idx]}</div>
        <div style={{fontFamily:"'Outfit'",fontSize:10,color:"rgba(255,255,255,0.6)",letterSpacing:2,textTransform:"uppercase",marginTop:3}}>Ville hôte · Maroc</div>
      </div>
      <div style={{position:"absolute",bottom:14,right:14,display:"flex",gap:5}}>
        {CAROUSEL_PHOTOS.map((_,i)=>(
          <div key={i} onClick={()=>setIdx(i)} style={{width:i===idx?20:6,height:6,borderRadius:3,background:i===idx?BR.gold:"rgba(255,255,255,0.3)",cursor:"pointer",transition:"all .4s ease"}}/>
        ))}
      </div>
    </div>
  );
}

// ── Ad Banner ──
function AdBanner({C}){
  const[o,setO]=useState(0);
  const t=ADS.join("     ✦     ");
  useEffect(()=>{const id=setInterval(()=>setO(p=>p-1),28);return()=>clearInterval(id);},[]);
  return(
    <div style={{background:C.adBg,overflow:"hidden",height:32,display:"flex",alignItems:"center",position:"relative",borderTop:`1px solid ${BR.gold}33`,borderBottom:`1px solid ${BR.gold}18`,flexShrink:0}}>
      <div style={{position:"absolute",left:0,top:0,bottom:0,width:56,background:`linear-gradient(90deg,${C.adBg},transparent)`,zIndex:2}}/>
      <div style={{position:"absolute",right:0,top:0,bottom:0,width:56,background:`linear-gradient(270deg,${C.adBg},transparent)`,zIndex:2}}/>
      <div style={{whiteSpace:"nowrap",transform:`translateX(${o}px)`,fontFamily:"'Outfit'",fontSize:11,fontWeight:500,color:BR.gold,letterSpacing:0.8}}>{t+"     ✦     "+t}</div>
    </div>
  );
}

// ── Weather ──
function Weather({C,city}){
  const[w,setW]=useState(null);
  useEffect(()=>{const s=STADIUMS.find(st=>st.city===city);if(!s)return;fetch(`https://api.open-meteo.com/v1/forecast?latitude=${s.lat}&longitude=${s.lng}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`).then(r=>r.json()).then(d=>setW(d.current)).catch(()=>{});},[city]);
  if(!w)return null;
  const ic=c=>{if(c===0)return"☀️";if(c<=3)return"⛅";if(c<=48)return"🌫️";if(c<=67)return"🌧️";return"⛈️";};
  return(
    <div style={{background:C.card,border:`1px solid ${C.bdr}`,borderRadius:16,padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",backdropFilter:"blur(16px)"}}>
      <div>
        <div style={{fontFamily:"'Outfit'",fontSize:10,color:C.mut,letterSpacing:1.5,textTransform:"uppercase"}}>{city}</div>
        <div style={{fontFamily:"'Outfit'",fontSize:32,fontWeight:700,color:C.str,marginTop:2,lineHeight:1}}>{Math.round(w.temperature_2m)}°<span style={{fontSize:16,fontWeight:400,color:C.mut}}>C</span></div>
      </div>
      <div style={{textAlign:"right"}}>
        <div style={{fontSize:34}}>{ic(w.weather_code)}</div>
        <div style={{fontFamily:"'Outfit'",fontSize:10,color:C.mut,marginTop:4}}>💨 {Math.round(w.wind_speed_10m)} km/h</div>
      </div>
    </div>
  );
}

// ── Currency Converter ──
function CurrConv({C}){
  const[a,sA]=useState("100");const[f,sF]=useState("EUR");const[rt,sR]=useState(null);
  useEffect(()=>{fetch("https://open.er-api.com/v6/latest/MAD").then(r=>r.json()).then(d=>sR(d.rates)).catch(()=>sR({EUR:.091,USD:.099,GBP:.078,BRL:.57,JPY:14.8}));},[]);
  const r=rt&&a?Math.round(parseFloat(a)/(rt[f]||1)).toLocaleString():"—";
  const ss={padding:"8px 10px",borderRadius:10,border:`1px solid ${C.bdr}`,background:C.fld,color:C.str,fontSize:13,fontFamily:"'Outfit'",outline:"none"};
  return(
    <div style={{background:C.card,border:`1px solid ${C.bdr}`,borderRadius:16,padding:16,marginTop:10,backdropFilter:"blur(16px)"}}>
      <div style={{fontFamily:"'Outfit'",fontSize:10,fontWeight:600,color:BR.gold,marginBottom:12,letterSpacing:1.5,textTransform:"uppercase"}}>💱 Convertisseur MAD</div>
      <div style={{display:"flex",gap:7,alignItems:"center"}}>
        <input type="number" value={a} onChange={e=>sA(e.target.value)} style={{...ss,width:"30%"}}/>
        <select value={f} onChange={e=>sF(e.target.value)} style={{...ss,width:"30%",cursor:"pointer"}}>{CURRENCIES.map(c=><option key={c.c} value={c.c}>{c.s} {c.c}</option>)}</select>
        <span style={{color:C.mut,fontSize:16}}>→</span>
        <div style={{fontFamily:"'Outfit'",fontSize:20,fontWeight:700,color:BR.gold}}>{r} <span style={{fontSize:11,fontWeight:400,color:C.mut}}>MAD</span></div>
      </div>
    </div>
  );
}

// ── Map ──
function SMap({C,onSelect,height}){
  const ref=useRef(null);const mR=useRef(null);
  useEffect(()=>{
    if(mR.current)return;
    if(!window.L){const l=document.createElement("link");l.rel="stylesheet";l.href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";document.head.appendChild(l);const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";s.onload=()=>go();document.head.appendChild(s);}else go();
    function go(){
      if(!ref.current||mR.current)return;
      const m=window.L.map(ref.current,{zoomControl:false}).setView([32.5,-6.5],5.5);
      window.L.control.zoom({position:"bottomright"}).addTo(m);
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"©OSM",maxZoom:18}).addTo(m);
      const ic=window.L.divIcon({className:"",html:`<div style="position:relative;width:32px;height:40px;cursor:pointer"><div style="width:32px;height:32px;border-radius:50% 50% 50% 0;background:linear-gradient(135deg,${BR.red},${BR.green});transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,0.5),0 0 0 2px rgba(255,255,255,0.2)"><span style="transform:rotate(45deg);font-size:14px">⚽</span></div><div style="width:10px;height:10px;border-radius:50%;background:rgba(228,28,58,0.3);margin:2px auto 0;animation:pulse 2s infinite"></div></div>`,iconSize:[32,40],iconAnchor:[16,40]});
      STADIUMS.forEach(s=>{const mk=window.L.marker([s.lat,s.lng],{icon:ic}).addTo(m);mk.bindPopup(`<div style="font-family:Outfit,sans-serif;padding:4px"><strong style="font-size:13px">${s.city}</strong><br><span style="font-size:11px;color:#666">${s.name}</span><br><span style="color:${BR.red};font-weight:700;font-size:12px">${s.cap} places</span></div>`);mk.on("click",()=>onSelect&&onSelect(s));});
      mR.current=m;setTimeout(()=>m.invalidateSize(),200);
    }
    return()=>{if(mR.current){mR.current.remove();mR.current=null;}};
  },[]);
  return <div ref={ref} style={{width:"100%",height:height||240,borderRadius:16,overflow:"hidden",border:`1px solid ${C.bdr}`}}/>;
}

// ── Section Header ──
function SecHead({icon,label,sub,C}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
      <div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${BR.red}22,${BR.gold}22)`,border:`1px solid ${BR.gold}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{icon}</div>
      <div>
        <div style={{fontFamily:"'Outfit'",fontSize:14,fontWeight:700,color:C.str,lineHeight:1}}>{label}</div>
        {sub&&<div style={{fontFamily:"'Outfit'",fontSize:10,color:C.mut,marginTop:2}}>{sub}</div>}
      </div>
    </div>
  );
}

// ── Phase Badge ──
const PHASE_COLORS = {G:BR.red,"8":"#9333EA",Q:BR.blue,S:BR.green,F:BR.gold};
const PHASE_LABELS = {G:"Groupe","8":"8èmes",Q:"Quarts",S:"Demis",F:"Finale"};

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

  const toggleVoice=()=>{
    if(listening){if(recRef.current){recRef.current.stop();}setListening(false);return;}
    if(!("webkitSpeechRecognition" in window)&&!("SpeechRecognition" in window)){alert("Voice not supported on this browser");return;}
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    const rec=new SR();rec.lang=lang==="ar"?"ar-MA":lang==="zh"?"zh-CN":lang==="pt"?"pt-PT":lang;rec.continuous=false;rec.interimResults=false;
    rec.onresult=e=>{const t=e.results[0][0].transcript;setInput(prev=>prev+t);setListening(false);};
    rec.onerror=()=>setListening(false);rec.onend=()=>setListening(false);
    rec.start();setListening(true);recRef.current=rec;
  };

  const curLang=LANGUAGES.find(l=>l.code===lang);
  const isRTL=lang==="ar";
  const F="'Outfit'";

  const renderChat=()=>(
    <>
      {msgs.map((m,i)=>(
        <div key={i} className="me" style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",direction:isRTL?"rtl":"ltr"}}>
          {m.role==="assistant"&&(
            <div style={{width:28,height:28,borderRadius:"50%",flexShrink:0,background:`linear-gradient(135deg,${BR.red},${BR.green})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,marginRight:isRTL?0:7,marginLeft:isRTL?7:0,marginTop:2,boxShadow:`0 4px 12px ${BR.red}44`}}>⚽</div>
          )}
          <div style={{maxWidth:"82%",padding:"10px 14px",borderRadius:m.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",background:m.role==="user"?C.usr:C.bot,border:m.role==="user"?"none":`1px solid ${C.bbdr}`,color:m.role==="user"?"#FFF":C.txt,fontSize:13,lineHeight:1.55,fontFamily:isRTL?"'Noto Sans Arabic'":F,fontWeight:300,boxShadow:m.role==="user"?`0 4px 16px ${BR.red}33`:"none"}}>
            {m.role==="assistant"?md(m.content):m.content}
          </div>
        </div>
      ))}
      {loading&&(
        <div className="me" style={{display:"flex",alignItems:"center",gap:7}}>
          <div style={{width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${BR.red},${BR.green})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,boxShadow:`0 4px 12px ${BR.red}44`}}>⚽</div>
          <div style={{padding:"10px 14px",borderRadius:"16px 16px 16px 4px",background:C.bot,border:`1px solid ${C.bbdr}`,display:"flex",gap:4,alignItems:"center"}}>
            {[0,.15,.3].map((d,i)=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:ac,animation:`dp 1s ease-in-out infinite`,animationDelay:`${d}s`}}/>)}
          </div>
        </div>
      )}
      <div ref={endRef}/>
    </>
  );

  const renderInput=()=>(
    <div style={{padding:"8px 12px 10px",background:C.chatBg,flexShrink:0,backdropFilter:"blur(16px)"}}>
      <div style={{display:"flex",gap:6,alignItems:"flex-end"}}>
        <button onClick={toggleVoice} style={{width:36,height:36,borderRadius:10,flexShrink:0,border:`1px solid ${listening?BR.red:C.bdr}`,background:listening?`${BR.red}22`:C.card,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:listening?BR.red:C.mut,animation:listening?"pulse 1s infinite":"none",transition:"all .2s"}}>🎤</button>
        <input ref={inpRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();send();}}} placeholder={PLACEHOLDERS[lang]} dir={isRTL?"rtl":"ltr"}
          style={{flex:1,padding:"9px 13px",background:C.fld,border:`1px solid ${C.bdr}`,borderRadius:12,color:C.str,fontSize:13,fontFamily:isRTL?"'Noto Sans Arabic'":F,fontWeight:300,outline:"none",transition:"border .2s"}} />
        <button onClick={()=>send()} disabled={!input.trim()||loading} className="sb" style={{width:36,height:36,borderRadius:10,flexShrink:0,background:input.trim()&&!loading?`linear-gradient(135deg,${BR.red},${BR.green})`:C.card,border:input.trim()&&!loading?"none":`1px solid ${C.bdr}`,cursor:input.trim()&&!loading?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:input.trim()&&!loading?"white":C.mut,boxShadow:input.trim()&&!loading?`0 4px 16px ${BR.red}44`:"none",transition:"all .2s"}}>
          {loading?<div style={{width:14,height:14,border:`2px solid ${C.bdr}`,borderTopColor:ac,borderRadius:"50%",animation:"sp .6s linear infinite"}}/>:"➤"}
        </button>
      </div>
    </div>
  );

  const bgStyle = dk
    ? {background:"radial-gradient(ellipse at 15% 0%, rgba(228,28,58,0.07) 0%, transparent 55%), radial-gradient(ellipse at 85% 100%, rgba(26,86,219,0.07) 0%, transparent 55%), #07091A"}
    : {background:"#EDF0F7"};

  return(
    <>
    {splash&&<Splash onDone={()=>setSplash(false)}/>}
    <div style={{height:"100vh",width:"100vw",overflow:"hidden",overscrollBehavior:"contain",...bgStyle,fontFamily:F,display:"flex",flexDirection:"column",transition:"background .4s"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Noto+Sans+Arabic:wght@400;600&display=swap');
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes dp{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(0.7)}}
        @keyframes sp{to{transform:rotate(360deg)}}
        @keyframes as{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(228,28,58,0.45)}70%{box-shadow:0 0 0 10px rgba(228,28,58,0)}}
        @keyframes popIn{from{opacity:0;transform:scale(0.92) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        .me{animation:fadeIn .28s ease both}
        .tb{transition:all .18s ease}
        .sb:hover:not(:disabled){opacity:.88;transform:scale(1.06)}
        .card-hover{transition:transform .22s ease,box-shadow .22s ease}
        .card-hover:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,0.22)!important}
        .stagger-1{animation-delay:.06s}.stagger-2{animation-delay:.12s}.stagger-3{animation-delay:.18s}.stagger-4{animation-delay:.24s}.stagger-5{animation-delay:.30s}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${C.sc};border-radius:4px}
        ::-webkit-scrollbar-thumb:hover{background:${C.mut}}
        *{box-sizing:border-box;margin:0;padding:0}
        input:focus{border-color:${ac}88!important}
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
        input[type=number]{-moz-appearance:textfield}
        html,body{height:100%;width:100%;overscroll-behavior:contain}
        select option{background:${dk?"#0F1220":"#FFF"};color:${C.str}}
      `}</style>

      {/* ── HEADER ── */}
      <div style={{padding:"10px 18px 6px",background:C.hdr,backdropFilter:"blur(28px)",borderBottom:`1px solid ${C.bdr}`,flexShrink:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",maxWidth:1440,margin:"0 auto",width:"100%"}}>
          {/* Logo */}
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{position:"relative",width:34,height:34}}>
              <svg width="34" height="34" viewBox="0 0 38 38" style={{animation:"as 22s linear infinite"}}>
                {[BR.red,BR.green,BR.blue,BR.gold].map((c,i)=>(
                  <circle key={i} cx="19" cy="19" r="15.5" fill="none" stroke={c} strokeWidth="2.5" strokeDasharray="11 89" strokeDashoffset={i*-24} opacity="0.9"/>
                ))}
              </svg>
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>⚽</div>
            </div>
            <div>
              <div style={{fontFamily:F,fontWeight:800,fontSize:isDesk?18:16,lineHeight:1,letterSpacing:0.2}}>
                <span style={{color:BR.red}}>M</span><span style={{color:C.str}}>oundi</span><span style={{color:BR.green}}>G</span><span style={{color:C.str}}>uide</span>
              </div>
              <div style={{fontFamily:F,fontSize:8,color:C.mut,letterSpacing:2.5,textTransform:"uppercase",marginTop:2}}>YallaVamos 2030</div>
            </div>
          </div>
          {/* Controls */}
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <button onClick={()=>setThemeMode(p=>({system:"light",light:"dark",dark:"system"}[p]))}
              style={{width:32,height:32,borderRadius:9,border:`1px solid ${C.bdr}`,background:C.card,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,position:"relative",backdropFilter:"blur(8px)",transition:"all .2s"}}>
              {dk?"☀️":"🌙"}
              {themeMode==="system"&&<div style={{position:"absolute",bottom:-2,right:-2,width:6,height:6,borderRadius:3,background:BR.green,border:`1.5px solid ${dk?"#07091A":"#EDF0F7"}`}}/>}
            </button>
            <div style={{position:"relative",zIndex:9999}}>
              <button onClick={e=>{e.stopPropagation();setShowLang(!showLang);}}
                style={{background:C.card,border:`1px solid ${C.bdr}`,borderRadius:20,padding:"5px 12px",cursor:"pointer",color:C.str,fontSize:11,fontWeight:500,display:"flex",alignItems:"center",gap:5,fontFamily:F,backdropFilter:"blur(8px)",transition:"all .2s"}}>
                <span style={{fontSize:14}}>{curLang.flag}</span><span>{curLang.label}</span><span style={{opacity:.4,fontSize:8}}>▼</span>
              </button>
            </div>
          </div>
        </div>
        {/* Color accent line */}
        <div style={{display:"flex",height:2.5,marginTop:6,borderRadius:2,overflow:"hidden",maxWidth:1440,margin:"6px auto 0"}}>
          {[BR.red,BR.gold,BR.green,BR.blue].map((c,i)=>(
            <div key={i} style={{flex:1,background:c,opacity:0.9}}/>
          ))}
        </div>
      </div>

      {/* ── Language Overlay ── */}
      {showLang&&(
        <div onClick={()=>setShowLang(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(4px)",zIndex:99999,display:"flex",alignItems:"center",justifyContent:"center",animation:"fadeIn .18s ease"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.dd,border:`1px solid ${C.bdr}`,borderRadius:18,padding:"14px 8px",minWidth:220,boxShadow:C.sh,animation:"popIn .22s ease both"}}>
            <div style={{fontFamily:F,fontSize:10,fontWeight:600,color:C.mut,textAlign:"center",padding:"4px 0 10px",letterSpacing:2,textTransform:"uppercase"}}>🌍 Langue</div>
            {LANGUAGES.map(l=>(
              <button key={l.code} onClick={()=>{setLang(l.code);setShowLang(false);}}
                style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"11px 18px",background:lang===l.code?C.la:"transparent",border:"none",cursor:"pointer",color:lang===l.code?ac:C.txt,fontSize:13,fontFamily:F,borderRadius:10,fontWeight:lang===l.code?600:400,transition:"all .18s"}}>
                <span style={{fontSize:20}}>{l.flag}</span><span>{l.label}</span>
                {lang===l.code&&<span style={{marginLeft:"auto",fontSize:14,color:ac}}>✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      <AdBanner C={C}/>

      {/* ═══ DESKTOP ═══ */}
      {isDesk?(
        <div style={{flex:1,display:"flex",maxWidth:1440,margin:"0 auto",width:"100%",overflow:"hidden",position:"relative"}}>

          {/* LEFT: Rankings + News */}
          <div style={{width:264,flexShrink:0,borderRight:`1px solid ${C.bdr}`,overflowY:"auto",background:dk?"rgba(0,0,0,0.18)":"rgba(255,255,255,0.38)"}}>
            <div style={{padding:"14px 12px 10px"}}>
              <SecHead icon="🏆" label="FIFA Rankings" sub="Avril 2026" C={C}/>
              {FIFA_RANKINGS.map((r,idx)=>{
                const isHost=r.f==="🇲🇦"||r.f==="🇪🇸"||r.f==="🇵🇹";
                const medal=r.r===1?"🥇":r.r===2?"🥈":r.r===3?"🥉":null;
                return(
                  <div key={r.r} className="card-hover" style={{display:"flex",alignItems:"center",gap:6,padding:"5px 7px",borderRadius:8,marginBottom:2,background:isHost?(dk?"rgba(240,180,41,0.07)":"rgba(228,28,58,0.04)"):"transparent",border:isHost?`1px solid ${BR.gold}22`:"1px solid transparent"}}>
                    <span style={{fontFamily:F,fontSize:10,fontWeight:700,color:r.r<=3?BR.gold:C.mut,width:16,textAlign:"right"}}>{medal||r.r}</span>
                    <span style={{fontSize:14}}>{r.f}</span>
                    <span style={{fontFamily:F,fontSize:11,fontWeight:isHost?700:400,color:isHost?C.str:C.txt,flex:1}}>{r.t}</span>
                    <span style={{fontFamily:F,fontSize:9,color:C.mut}}>{r.p}</span>
                    <span style={{fontSize:8,color:r.c==="up"?"#22C55E":r.c==="dn"?"#EF4444":"#555"}}>{r.c==="up"?"▲":r.c==="dn"?"▼":"•"}</span>
                  </div>
                );
              })}
            </div>
            <div style={{height:1,background:C.bdr,margin:"0 12px"}}/>
            <div style={{padding:"14px 12px 12px"}}>
              <SecHead icon="📰" label="Actualités" C={C}/>
              {NEWS.map((n,i)=>(
                <div key={i} className="card-hover" onClick={()=>send(n.t)}
                  style={{background:C.card,border:`1px solid ${C.bdr}`,borderRadius:12,padding:"10px 12px",marginBottom:7,cursor:"pointer",backdropFilter:"blur(12px)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontFamily:F,fontSize:9,color:n.tc,fontWeight:600,background:`${n.tc}16`,padding:"2px 7px",borderRadius:20}}>{n.tg}</span>
                    <span style={{fontFamily:F,fontSize:9,color:C.mut}}>{n.d}</span>
                  </div>
                  <div style={{fontFamily:F,fontSize:11,fontWeight:500,color:C.str,lineHeight:1.4}}>{n.t}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CENTER */}
          <div style={{flex:1,overflowY:"auto",minWidth:0}}>
            <div style={{padding:"16px 16px 12px"}}>
              <Carousel C={C} big={true}/>
            </div>

            {/* Map */}
            <div style={{padding:"0 16px 16px"}}>
              <SecHead icon="🗺️" label="Carte des stades" sub="6 villes hôtes au Maroc" C={C}/>
              <SMap C={C} onSelect={s=>send(`Parle-moi du stade de ${s.city}`)} height={290}/>
            </div>
            <div style={{height:1,background:C.bdr,margin:"0 16px"}}/>

            {/* Weather + Currency */}
            <div style={{padding:"16px"}}>
              <div style={{display:"flex",gap:12}}>
                <div style={{flex:1}}>
                  <SecHead icon="☀️" label="Météo en direct" C={C}/>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
                    {STADIUMS.map(s=>(
                      <button key={s.city} onClick={()=>setWeatherCity(s.city)}
                        style={{padding:"3px 10px",borderRadius:20,border:`1px solid ${weatherCity===s.city?ac:C.bdr}`,background:weatherCity===s.city?`${ac}18`:C.card,color:weatherCity===s.city?ac:C.mut,fontSize:10,cursor:"pointer",fontFamily:F,fontWeight:500,transition:"all .18s"}}>
                        {s.city}
                      </button>
                    ))}
                  </div>
                  <Weather C={C} city={weatherCity}/>
                </div>
                <div style={{flex:1}}>
                  <SecHead icon="💱" label="Convertisseur" C={C}/>
                  <CurrConv C={C}/>
                </div>
              </div>
            </div>
            <div style={{height:1,background:C.bdr,margin:"0 16px"}}/>

            {/* Matches */}
            <div style={{padding:"16px"}}>
              <SecHead icon="📅" label="Calendrier des matchs" sub="Mondial 2030" C={C}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {MATCHES.map((m,i)=>(
                  <div key={i} className="card-hover" style={{background:C.card,border:`1px solid ${C.bdr}`,borderRadius:14,padding:"10px 14px",borderLeft:`3px solid ${PHASE_COLORS[m.ph]}`,backdropFilter:"blur(12px)"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                      <span style={{fontFamily:F,fontSize:9,color:PHASE_COLORS[m.ph],fontWeight:700,background:`${PHASE_COLORS[m.ph]}18`,padding:"2px 8px",borderRadius:20}}>{PHASE_LABELS[m.ph]}</span>
                      <span style={{fontFamily:F,fontSize:9,color:C.mut}}>{m.d} · {m.tm}</span>
                    </div>
                    <div style={{fontFamily:F,fontSize:12,fontWeight:600,color:C.str,marginBottom:3}}>{m.a} <span style={{color:C.mut,fontWeight:400}}>vs</span> {m.b}</div>
                    <div style={{fontFamily:F,fontSize:10,color:C.mut}}>📍 {m.c}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{height:1,background:C.bdr,margin:"0 16px"}}/>

            {/* Info + Darija */}
            <div style={{padding:"16px"}}>
              <SecHead icon="ℹ️" label="Infos pratiques" C={C}/>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
                {INFO_ITEMS.map((it,i)=>(
                  <div key={i} style={{background:C.card,border:`1px solid ${C.bdr}`,borderRadius:12,padding:"10px 8px",textAlign:"center",backdropFilter:"blur(12px)"}}>
                    <div style={{fontSize:18,marginBottom:4}}>{it.i}</div>
                    <div style={{fontFamily:F,fontSize:12,fontWeight:700,color:C.str}}>{it.v}</div>
                    <div style={{fontFamily:F,fontSize:9,color:C.mut,marginTop:2}}>{it.l}</div>
                  </div>
                ))}
              </div>
              <div style={{marginTop:12,background:C.card,border:`1px solid ${C.bdr}`,borderRadius:14,padding:"12px 16px",backdropFilter:"blur(12px)"}}>
                <div style={{fontFamily:F,fontSize:11,fontWeight:600,color:ac,marginBottom:8,letterSpacing:1,textTransform:"uppercase"}}>🗣️ Darija Essentiel</div>
                {DARIJA.map((p,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:i<4?`1px solid ${C.bdr}`:"none"}}>
                    <span style={{fontFamily:F,fontSize:12,fontWeight:600,color:C.str}}>{p.d}</span>
                    <span style={{fontFamily:F,fontSize:11,color:C.mut}}>{p.t[lang]||p.t.en}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Videos */}
            <div style={{padding:"0 16px 20px"}}>
              <SecHead icon="🎬" label="Vidéos Mondial 2030" C={C}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {VIDEOS.map((v,i)=>(
                  <div key={i} className="card-hover" style={{borderRadius:14,overflow:"hidden",border:`1px solid ${C.bdr}`,backdropFilter:"blur(12px)"}}>
                    <div style={{position:"relative",paddingBottom:"56.25%",height:0}}>
                      <iframe src={`https://www.youtube.com/embed/${v.id}`} title={v.title} allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowFullScreen style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:"none"}}/>
                    </div>
                    <div style={{padding:"8px 12px",background:C.card}}>
                      <div style={{fontFamily:F,fontSize:10,fontWeight:600,color:C.str}}>{v.title}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Chat Panel */}
          {chatOpen?(
            <div style={{width:380,flexShrink:0,borderLeft:`1px solid ${C.bdr}`,display:"flex",flexDirection:"column",background:dk?"rgba(7,9,26,0.6)":"rgba(255,255,255,0.55)",animation:"popIn .28s ease both",backdropFilter:"blur(24px)"}}>
              <div style={{padding:"12px 14px 10px",borderBottom:`1px solid ${C.bdr}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:30,height:30,borderRadius:"50%",background:`linear-gradient(135deg,${BR.red},${BR.green})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,boxShadow:`0 4px 12px ${BR.red}44`}}>⚽</div>
                  <div>
                    <div style={{fontFamily:F,fontSize:13,fontWeight:700,color:C.str}}>Assistant MoundiGuide</div>
                    <div style={{fontFamily:F,fontSize:9,color:BR.green,marginTop:1}}>● En ligne · IA Groq Llama</div>
                  </div>
                </div>
                <button onClick={()=>setChatOpen(false)} style={{background:"none",border:"none",cursor:"pointer",color:C.mut,fontSize:16,lineHeight:1,width:28,height:28,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}>✕</button>
              </div>
              <div style={{flex:1,overflowY:"auto",padding:"12px 10px",display:"flex",flexDirection:"column",gap:8}}>{renderChat()}</div>
              <div style={{padding:"6px 10px",display:"flex",gap:4,overflowX:"auto",scrollbarWidth:"none",borderTop:`1px solid ${C.bdr}`,flexShrink:0}}>
                {(QUICK_TOPICS[lang]||QUICK_TOPICS.en).map((t,i)=>(
                  <button key={i} onClick={()=>send(t)}
                    style={{whiteSpace:"nowrap",padding:"4px 10px",background:C.card,border:`1px solid ${C.bdr}`,borderRadius:20,color:C.mut,fontSize:10,cursor:"pointer",fontFamily:F,transition:"all .18s",flexShrink:0}}>
                    {t}
                  </button>
                ))}
              </div>
              {renderInput()}
            </div>
          ):(
            <button onClick={()=>setChatOpen(true)}
              style={{position:"fixed",bottom:24,right:24,width:60,height:60,borderRadius:"50%",background:`linear-gradient(135deg,${BR.red},${BR.green})`,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,color:"white",boxShadow:`0 8px 28px ${BR.red}55, 0 0 0 0 ${BR.red}`,zIndex:1000,animation:"pulse 2.5s infinite"}}>
              💬
            </button>
          )}
        </div>

      ):(
        /* ═══ MOBILE ═══ */
        <>
          {/* Tab Nav */}
          <div style={{display:"flex",background:dk?"rgba(7,9,26,0.88)":"rgba(255,255,255,0.88)",borderBottom:`1px solid ${C.bdr}`,flexShrink:0,overflowX:"auto",scrollbarWidth:"none",WebkitOverflowScrolling:"touch",backdropFilter:"blur(20px)",padding:"6px 8px",gap:4}}>
            {[{id:"chat",ic:"💬",l:"Chat"},{id:"matchs",ic:"📅",l:"Matchs"},{id:"map",ic:"🗺️",l:"Carte"},{id:"rankings",ic:"🏆",l:"FIFA"},{id:"videos",ic:"🎬",l:"Vidéos"},{id:"info",ic:"ℹ️",l:"Infos"}].map(t=>(
              <button key={t.id} className="tb" onClick={()=>setTab(t.id)}
                style={{minWidth:"auto",padding:"6px 12px",cursor:"pointer",background:tab===t.id?`linear-gradient(135deg,${BR.red}22,${BR.gold}22)`:"transparent",borderRadius:20,border:tab===t.id?`1px solid ${ac}55`:"1px solid transparent",color:tab===t.id?ac:C.mut,fontSize:10,fontWeight:tab===t.id?600:400,fontFamily:F,display:"flex",alignItems:"center",justifyContent:"center",gap:3,whiteSpace:"nowrap",flexShrink:0}}>
                <span style={{fontSize:11}}>{t.ic}</span>{t.l}
              </button>
            ))}
          </div>

          <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}>

            {/* Chat Tab */}
            {tab==="chat"&&(
              <>
                <div style={{flex:1,overflowY:"auto",padding:"12px 10px",display:"flex",flexDirection:"column",gap:8}}>{renderChat()}</div>
                <div style={{padding:"6px 10px",display:"flex",gap:4,overflowX:"auto",scrollbarWidth:"none",borderTop:`1px solid ${C.bdr}`,flexShrink:0}}>
                  {(QUICK_TOPICS[lang]||QUICK_TOPICS.en).map((t,i)=>(
                    <button key={i} onClick={()=>send(t)}
                      style={{whiteSpace:"nowrap",padding:"4px 10px",background:C.card,border:`1px solid ${C.bdr}`,borderRadius:20,color:C.mut,fontSize:10,cursor:"pointer",fontFamily:F,flexShrink:0}}>
                      {t}
                    </button>
                  ))}
                </div>
                {renderInput()}
              </>
            )}

            {/* Matchs Tab */}
            {tab==="matchs"&&(
              <div style={{padding:"14px 12px"}}>
                <SecHead icon="📅" label="Calendrier des matchs" sub="Mondial 2030" C={C}/>
                {MATCHES.map((m,i)=>(
                  <div key={i} style={{background:C.card,border:`1px solid ${C.bdr}`,borderRadius:14,padding:"10px 14px",marginBottom:8,borderLeft:`3px solid ${PHASE_COLORS[m.ph]}`,backdropFilter:"blur(12px)"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                      <span style={{fontFamily:F,fontSize:9,color:PHASE_COLORS[m.ph],fontWeight:700,background:`${PHASE_COLORS[m.ph]}18`,padding:"2px 8px",borderRadius:20}}>{PHASE_LABELS[m.ph]}</span>
                      <span style={{fontFamily:F,fontSize:9,color:C.mut}}>{m.d} · {m.tm}</span>
                    </div>
                    <div style={{fontFamily:F,fontSize:13,fontWeight:600,color:C.str,marginBottom:3}}>{m.a} <span style={{color:C.mut,fontWeight:400}}>vs</span> {m.b}</div>
                    <div style={{fontFamily:F,fontSize:10,color:C.mut}}>📍 {m.c}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Map Tab */}
            {tab==="map"&&(
              <div style={{padding:"14px 12px"}}>
                <Carousel C={C}/>
                <div style={{marginTop:12}}>
                  <SMap C={C} onSelect={s=>send(`Parle-moi du stade de ${s.city}`)} height={290}/>
                </div>
                <div style={{marginTop:10}}>
                  <Weather C={C} city={weatherCity}/>
                </div>
                <div style={{display:"flex",gap:5,marginTop:8,flexWrap:"wrap"}}>
                  {STADIUMS.map(s=>(
                    <button key={s.city} onClick={()=>setWeatherCity(s.city)}
                      style={{padding:"4px 10px",borderRadius:20,border:`1px solid ${weatherCity===s.city?ac:C.bdr}`,background:weatherCity===s.city?`${ac}18`:C.card,color:weatherCity===s.city?ac:C.mut,fontSize:10,cursor:"pointer",fontFamily:F,fontWeight:500,transition:"all .18s"}}>
                      {s.city}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Rankings Tab */}
            {tab==="rankings"&&(
              <div style={{padding:"14px 12px"}}>
                <SecHead icon="🏆" label="FIFA Rankings" sub="Avril 2026" C={C}/>
                {FIFA_RANKINGS.map((r,idx)=>{
                  const isHost=r.f==="🇲🇦"||r.f==="🇪🇸"||r.f==="🇵🇹";
                  const medal=r.r===1?"🥇":r.r===2?"🥈":r.r===3?"🥉":null;
                  return(
                    <div key={r.r} className={`card-hover stagger-${Math.min(idx%6,5)}`} style={{display:"flex",alignItems:"center",gap:7,padding:"6px 8px",borderRadius:10,marginBottom:3,background:isHost?(dk?"rgba(240,180,41,0.07)":"rgba(228,28,58,0.04)"):"transparent",border:isHost?`1px solid ${BR.gold}22`:"1px solid transparent"}}>
                      <span style={{fontFamily:F,fontSize:10,fontWeight:700,color:r.r<=3?BR.gold:C.mut,width:18,textAlign:"right"}}>{medal||r.r}</span>
                      <span style={{fontSize:15}}>{r.f}</span>
                      <span style={{fontFamily:F,fontSize:12,fontWeight:isHost?700:400,color:isHost?C.str:C.txt,flex:1}}>{r.t}</span>
                      <span style={{fontFamily:F,fontSize:10,color:C.mut}}>{r.p}</span>
                      <span style={{fontSize:9,color:r.c==="up"?"#22C55E":r.c==="dn"?"#EF4444":"#555"}}>{r.c==="up"?"▲":r.c==="dn"?"▼":"•"}</span>
                    </div>
                  );
                })}
                <div style={{height:1,background:C.bdr,margin:"14px 0"}}/>
                <SecHead icon="📰" label="Actualités" C={C}/>
                {NEWS.map((n,i)=>(
                  <div key={i} className="card-hover" onClick={()=>send(n.t)}
                    style={{background:C.card,border:`1px solid ${C.bdr}`,borderRadius:12,padding:"10px 12px",marginBottom:8,cursor:"pointer",backdropFilter:"blur(12px)"}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontFamily:F,fontSize:9,color:n.tc,fontWeight:600,background:`${n.tc}16`,padding:"2px 7px",borderRadius:20}}>{n.tg}</span>
                      <span style={{fontFamily:F,fontSize:9,color:C.mut}}>{n.d}</span>
                    </div>
                    <div style={{fontFamily:F,fontSize:12,fontWeight:500,color:C.str,lineHeight:1.4}}>{n.t}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Videos Tab */}
            {tab==="videos"&&(
              <div style={{padding:"14px 12px",animation:"fadeIn .3s ease"}}>
                <SecHead icon="🎬" label="Vidéos Mondial 2030" C={C}/>
                {VIDEOS.map((v,i)=>(
                  <div key={i} style={{marginBottom:12,borderRadius:16,overflow:"hidden",border:`1px solid ${C.bdr}`,backdropFilter:"blur(12px)"}}>
                    <div style={{position:"relative",paddingBottom:"56.25%",height:0}}>
                      <iframe src={`https://www.youtube.com/embed/${v.id}`} title={v.title} allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowFullScreen style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:"none"}}/>
                    </div>
                    <div style={{padding:"10px 14px",background:C.card}}>
                      <div style={{fontFamily:F,fontSize:12,fontWeight:600,color:C.str}}>{v.title}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Info Tab */}
            {tab==="info"&&(
              <div style={{padding:"14px 12px"}}>
                <SecHead icon="ℹ️" label="Infos pratiques" C={C}/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                  {INFO_ITEMS.map((it,i)=>(
                    <div key={i} style={{background:C.card,border:`1px solid ${C.bdr}`,borderRadius:14,padding:"12px 10px",textAlign:"center",backdropFilter:"blur(12px)"}}>
                      <div style={{fontSize:20,marginBottom:5}}>{it.i}</div>
                      <div style={{fontFamily:F,fontSize:14,fontWeight:700,color:C.str}}>{it.v}</div>
                      <div style={{fontFamily:F,fontSize:9,color:C.mut,marginTop:2}}>{it.l}</div>
                    </div>
                  ))}
                </div>
                <CurrConv C={C}/>
                <div style={{marginTop:12,background:C.card,border:`1px solid ${C.bdr}`,borderRadius:14,padding:"12px 16px",backdropFilter:"blur(12px)"}}>
                  <div style={{fontFamily:F,fontSize:11,fontWeight:600,color:ac,marginBottom:8,letterSpacing:1,textTransform:"uppercase"}}>🗣️ Darija Essentiel</div>
                  {DARIJA.map((p,i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:i<4?`1px solid ${C.bdr}`:"none"}}>
                      <span style={{fontFamily:F,fontSize:13,fontWeight:600,color:C.str}}>{p.d}</span>
                      <span style={{fontFamily:F,fontSize:12,color:C.mut}}>{p.t[lang]||p.t.en}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── FOOTER ── */}
      <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:6,padding:"6px 0",background:dk?"rgba(0,0,0,0.35)":"rgba(255,255,255,0.6)",flexShrink:0,borderTop:`1px solid ${C.bdr}`,backdropFilter:"blur(12px)"}}>
        {[BR.red,BR.gold,BR.green,BR.blue].map((c,i)=><div key={i} style={{width:8,height:2.5,borderRadius:2,background:c,opacity:0.8}}/>)}
        <span style={{fontFamily:F,fontSize:8,color:C.mut,letterSpacing:2,marginLeft:4,textTransform:"uppercase"}}>YallaVamos 2030</span>
        {[BR.blue,BR.green,BR.gold,BR.red].map((c,i)=><div key={i} style={{width:8,height:2.5,borderRadius:2,background:c,opacity:0.8}}/>)}
      </div>
    </div>
    </>
  );
}
