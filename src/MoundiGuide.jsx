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

const SYSTEM_PROMPTS = {
  fr:`Tu es MoundiGuide, assistant IA du Mondial 2030 (Maroc, Espagne, Portugal). Réponds en 3-5 phrases MAX. Sois direct, pratique. Emojis. Villes: Casablanca, Rabat, Marrakech, Tanger, Agadir, Fès.`,
  en:`You are MoundiGuide, 2030 World Cup AI assistant. Reply in 3-5 sentences MAX. Be direct, practical. Emojis. Cities: Casablanca, Rabat, Marrakech, Tangier, Agadir, Fez.`,
  ar:`أنت MoundiGuide مساعد كأس العالم 2030. أجب في 3 جمل كحد أقصى. كن مباشراً.`,
  es:`Eres MoundiGuide, asistente del Mundial 2030. Responde en 3 frases MAX. Directo y práctico. Emojis.`,
  pt:`Você é MoundiGuide, assistente Copa 2030. Responda em 3 frases MAX. Direto e prático. Emojis.`,
  zh:`你是MoundiGuide，2030世界杯助手。最多3句话。直接实用。表情。`,
};

const WELCOME = { fr:"⚽ Bienvenue ! Posez-moi une question sur le Mondial 2030.", en:"⚽ Welcome! Ask me about the 2030 World Cup.", ar:"⚽ مرحباً! اسألني عن المونديال.", es:"⚽ ¡Hola! Pregúntame sobre el Mundial.", pt:"⚽ Olá! Pergunte sobre a Copa.", zh:"⚽ 你好！问我世界杯相关问题。" };

const STADIUMS = [
  { city:"Casablanca", name:"Grand Stade Hassan II", cap:"115 000", lat:33.57, lng:-7.59, img:"https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=400&h=200&fit=crop" },
  { city:"Rabat", name:"Complexe Moulay Abdallah", cap:"52 000", lat:33.96, lng:-6.86, img:"https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=200&fit=crop" },
  { city:"Marrakech", name:"Grand Stade de Marrakech", cap:"45 000", lat:31.62, lng:-8.01, img:"https://images.unsplash.com/photo-1597212618440-806b84589018?w=400&h=200&fit=crop" },
  { city:"Tanger", name:"Grand Stade de Tanger", cap:"65 000", lat:35.74, lng:-5.83, img:"https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&h=200&fit=crop" },
  { city:"Agadir", name:"Stade d'Agadir", cap:"45 000", lat:30.38, lng:-9.53, img:"https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400&h=200&fit=crop" },
  { city:"Fès", name:"Nouveau Stade de Fès", cap:"50 000", lat:34.02, lng:-5.01, img:"https://images.unsplash.com/photo-1569383746724-6f1b882b8f46?w=400&h=200&fit=crop" },
];

const FIFA_RANKINGS = [
  { rank:1, team:"France", flag:"🇫🇷", pts:1860, change:"up" },
  { rank:2, team:"Spain", flag:"🇪🇸", pts:1853, change:"down" },
  { rank:3, team:"Argentina", flag:"🇦🇷", pts:1849, change:"down" },
  { rank:4, team:"England", flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", pts:1797, change:"same" },
  { rank:5, team:"Brazil", flag:"🇧🇷", pts:1775, change:"down" },
  { rank:6, team:"Portugal", flag:"🇵🇹", pts:1756, change:"up" },
  { rank:7, team:"Netherlands", flag:"🇳🇱", pts:1747, change:"same" },
  { rank:8, team:"Belgium", flag:"🇧🇪", pts:1729, change:"down" },
  { rank:9, team:"Italy", flag:"🇮🇹", pts:1726, change:"up" },
  { rank:10, team:"Germany", flag:"🇩🇪", pts:1713, change:"same" },
  { rank:11, team:"Colombia", flag:"🇨🇴", pts:1694, change:"up" },
  { rank:12, team:"Uruguay", flag:"🇺🇾", pts:1680, change:"down" },
  { rank:13, team:"Croatia", flag:"🇭🇷", pts:1676, change:"same" },
  { rank:14, team:"Japan", flag:"🇯🇵", pts:1652, change:"up" },
  { rank:15, team:"Mexico", flag:"🇲🇽", pts:1643, change:"up" },
  { rank:16, team:"USA", flag:"🇺🇸", pts:1639, change:"down" },
  { rank:17, team:"Morocco", flag:"🇲🇦", pts:1633, change:"up" },
  { rank:18, team:"Switzerland", flag:"🇨🇭", pts:1621, change:"down" },
  { rank:19, team:"Denmark", flag:"🇩🇰", pts:1610, change:"same" },
  { rank:20, team:"Senegal", flag:"🇸🇳", pts:1598, change:"up" },
];

const MATCHES = [
  { ph:"group", date:"15 Jun", t:"18:00", t1:"🇲🇦 Maroc", t2:"Brésil 🇧🇷", city:"Casablanca" },
  { ph:"group", date:"16 Jun", t:"21:00", t1:"🇪🇸 Espagne", t2:"Argentine 🇦🇷", city:"Rabat" },
  { ph:"group", date:"17 Jun", t:"18:00", t1:"🇵🇹 Portugal", t2:"France 🇫🇷", city:"Marrakech" },
  { ph:"group", date:"20 Jun", t:"21:00", t1:"🇲🇦 Maroc", t2:"Allemagne 🇩🇪", city:"Tanger" },
  { ph:"group", date:"21 Jun", t:"18:00", t1:"🇪🇸 Espagne", t2:"Japon 🇯🇵", city:"Agadir" },
  { ph:"r16", date:"1 Jul", t:"18:00", t1:"1A", t2:"2B", city:"Casablanca" },
  { ph:"qf", date:"5 Jul", t:"21:00", t1:"QF1", t2:"QF2", city:"Rabat" },
  { ph:"sf", date:"9 Jul", t:"21:00", t1:"SF1", t2:"SF2", city:"Casablanca" },
  { ph:"final", date:"13 Jul", t:"21:00", t1:"🏆 Finale", t2:"⚽", city:"Casablanca" },
];

const NEWS = [
  { date:"12 Avr 2026", title:"Le Grand Stade Hassan II atteint 95% de construction", tag:"Infrastructure", tagColor:"#00823C" },
  { date:"10 Avr 2026", title:"Le Maroc dévoile le plan de mobilité pour les 6 villes hôtes", tag:"Transport", tagColor:"#1A56DB" },
  { date:"8 Avr 2026", title:"FIFA confirme : 48 équipes qualifiées pour 2030", tag:"FIFA", tagColor:"#C41E3A" },
  { date:"5 Avr 2026", title:"La billetterie en ligne ouvrira en janvier 2029", tag:"Billetterie", tagColor:"#F5A623" },
  { date:"3 Avr 2026", title:"YallaVamos 2030 : 20 000 bénévoles recherchés", tag:"Bénévolat", tagColor:"#7C3AED" },
  { date:"1 Avr 2026", title:"France reprend la 1ère place du classement FIFA", tag:"FIFA", tagColor:"#C41E3A" },
];

const ADS = [
  "⚽ YALLAVAMOS 2030 — Le Mondial arrive au Maroc, en Espagne et au Portugal !",
  "🏟️ Grand Stade Hassan II — 115 000 places — Le plus grand stade d'Afrique",
  "🇲🇦 Visit Morocco — Découvrez la magie du Maroc pendant le Mondial 2030",
  "🎫 Billetterie FIFA 2030 — Réservez vos places dès l'ouverture officielle",
  "✈️ RAM — Royal Air Maroc — Partenaire officiel du Mondial 2030",
  "🏨 Booking.com — Trouvez votre hébergement pour le Mondial 2030",
];

const CURRENCIES = [{ code:"EUR",s:"€" },{ code:"USD",s:"$" },{ code:"GBP",s:"£" },{ code:"BRL",s:"R$" },{ code:"JPY",s:"¥" }];
const INFO_ITEMS = [
  { i:"🚨",l:"Police",v:"19" },{ i:"🚑",l:"SAMU",v:"15" },{ i:"🚒",l:"Pompiers",v:"15" },
  { i:"💱",l:"Monnaie",v:"MAD" },{ i:"🔌",l:"220V",v:"Type C,E" },{ i:"🕐",l:"Fuseau",v:"GMT+1" },
  { i:"📱",l:"Indicatif",v:"+212" },{ i:"💧",l:"Eau",v:"Bouteille" },
];
const DARIJA = [
  { d:"Salam",t:{fr:"Bonjour",en:"Hello",ar:"مرحبا",es:"Hola",pt:"Olá",zh:"你好"}},
  { d:"Beshhal?",t:{fr:"Combien ?",en:"How much?",ar:"بكم؟",es:"¿Cuánto?",pt:"Quanto?",zh:"多少？"}},
  { d:"Shukran",t:{fr:"Merci",en:"Thanks",ar:"شكرا",es:"Gracias",pt:"Obrigado",zh:"谢谢"}},
  { d:"Fin kayn?",t:{fr:"Où est ?",en:"Where?",ar:"فين؟",es:"¿Dónde?",pt:"Onde?",zh:"哪里？"}},
  { d:"Mezyan",t:{fr:"Bien",en:"Good",ar:"مزيان",es:"Bien",pt:"Bom",zh:"好"}},
];

const BR = { red:"#C41E3A", green:"#00823C", blue:"#1A56DB", gold:"#F5A623" };
const TH = {
  dark:{ bg:"#0C1117", bg2:"#111820", hdr:"rgba(0,0,0,0.7)", card:"rgba(255,255,255,0.04)", bdr:"rgba(255,255,255,0.07)", txt:"rgba(255,255,255,0.88)", str:"#FFF", mut:"rgba(255,255,255,0.4)", fld:"rgba(255,255,255,0.05)", bot:"rgba(255,255,255,0.04)", bbdr:"rgba(255,255,255,0.07)", usr:`linear-gradient(135deg,${BR.red},#A01830)`, dd:"rgba(12,17,23,0.98)", sh:"0 12px 40px rgba(0,0,0,0.5)", sc:"rgba(255,255,255,0.08)", adBg:"#0A0E13" },
  light:{ bg:"#F5F6F8", bg2:"#FFFFFF", hdr:"rgba(255,255,255,0.92)", card:"rgba(0,0,0,0.025)", bdr:"rgba(0,0,0,0.07)", txt:"rgba(0,0,0,0.8)", str:"#111", mut:"rgba(0,0,0,0.4)", fld:"rgba(0,0,0,0.03)", bot:"rgba(0,0,0,0.03)", bbdr:"rgba(0,0,0,0.07)", usr:`linear-gradient(135deg,${BR.red},#E02040)`, dd:"rgba(255,255,255,0.99)", sh:"0 12px 40px rgba(0,0,0,0.08)", sc:"rgba(0,0,0,0.08)", adBg:"#1A1E24" },
};

function md(text) {
  if (!text) return text;
  return text.split("\n").map((l,i) => {
    let c = l.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>");
    if (l.startsWith("- ")||l.startsWith("• ")) return <div key={i} style={{paddingLeft:10,marginBottom:1}} dangerouslySetInnerHTML={{__html:"• "+c.slice(2)}} />;
    if (l.trim()==="") return <div key={i} style={{height:5}} />;
    return <div key={i} dangerouslySetInnerHTML={{__html:c}} />;
  });
}

// ═══════════════════════════════════════
// STADIUM AD BANNER
// ═══════════════════════════════════════
function AdBanner({ C }) {
  const [offset, setOffset] = useState(0);
  const text = ADS.join("     ★     ");
  useEffect(() => {
    const id = setInterval(() => setOffset(p => p - 1), 30);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ background: C.adBg, overflow:"hidden", height:32, display:"flex", alignItems:"center", position:"relative", borderTop:`2px solid ${BR.gold}`, borderBottom:`2px solid ${BR.gold}`, flexShrink:0 }}>
      <div style={{ position:"absolute", left:0, top:0, bottom:0, width:40, background:`linear-gradient(90deg,${C.adBg},transparent)`, zIndex:2 }} />
      <div style={{ position:"absolute", right:0, top:0, bottom:0, width:40, background:`linear-gradient(270deg,${C.adBg},transparent)`, zIndex:2 }} />
      <div style={{ whiteSpace:"nowrap", transform:`translateX(${offset}px)`, fontFamily:"'Outfit'", fontSize:12, fontWeight:600, color:BR.gold, letterSpacing:0.5 }}>
        {text + "     ★     " + text}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// WEATHER WIDGET
// ═══════════════════════════════════════
function Weather({ C, city }) {
  const [w, setW] = useState(null);
  useEffect(() => {
    const s = STADIUMS.find(st => st.city === city);
    if (!s) return;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${s.lat}&longitude=${s.lng}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`)
      .then(r=>r.json()).then(d=>setW(d.current)).catch(()=>{});
  }, [city]);
  if (!w) return null;
  const ic = (c) => { if(c===0) return "☀️"; if(c<=3) return "⛅"; if(c<=48) return "🌫️"; if(c<=67) return "🌧️"; return "⛈️"; };
  return (
    <div style={{ background:C.card, border:`1px solid ${C.bdr}`, borderRadius:9, padding:"10px 12px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
      <div>
        <div style={{ fontFamily:"'Outfit'", fontSize:10, color:C.mut }}>{city}</div>
        <div style={{ fontFamily:"'Outfit'", fontSize:24, fontWeight:700, color:C.str }}>{Math.round(w.temperature_2m)}°C</div>
      </div>
      <div style={{ textAlign:"right" }}>
        <div style={{ fontSize:28 }}>{ic(w.weather_code)}</div>
        <div style={{ fontFamily:"'Outfit'", fontSize:9, color:C.mut }}>💨 {Math.round(w.wind_speed_10m)} km/h</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// CURRENCY CONVERTER
// ═══════════════════════════════════════
function CurrConv({ C }) {
  const [amt,setAmt]=useState("100");
  const [from,setFrom]=useState("EUR");
  const [rates,setRates]=useState(null);
  useEffect(()=>{ fetch("https://open.er-api.com/v6/latest/MAD").then(r=>r.json()).then(d=>setRates(d.rates)).catch(()=>setRates({EUR:.091,USD:.099,GBP:.078,BRL:.57,JPY:14.8})); },[]);
  const r = rates&&amt ? Math.round(parseFloat(amt)/(rates[from]||1)).toLocaleString() : "—";
  const ss = { padding:"6px 8px", borderRadius:6, border:`1px solid ${C.bdr}`, background:C.fld, color:C.str, fontSize:11, fontFamily:"'Outfit'" };
  return (
    <div style={{ background:C.card, border:`1px solid ${C.bdr}`, borderRadius:9, padding:10, marginTop:8 }}>
      <div style={{ fontFamily:"'Outfit'", fontSize:11, fontWeight:600, color:BR.gold, marginBottom:6 }}>💱 Convertisseur</div>
      <div style={{ display:"flex", gap:5, alignItems:"center" }}>
        <input type="number" value={amt} onChange={e=>setAmt(e.target.value)} style={{...ss, width:"28%"}} />
        <select value={from} onChange={e=>setFrom(e.target.value)} style={{...ss, width:"25%", cursor:"pointer"}}>{CURRENCIES.map(c=><option key={c.code} value={c.code}>{c.s} {c.code}</option>)}</select>
        <span style={{color:C.mut, fontSize:11}}>→</span>
        <div style={{ fontFamily:"'Outfit'", fontSize:16, fontWeight:700, color:BR.gold }}>{r} <span style={{fontSize:10,fontWeight:400}}>MAD</span></div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// MAP
// ═══════════════════════════════════════
function SMap({ C, onSelect, height }) {
  const ref=useRef(null); const mRef=useRef(null);
  useEffect(()=>{
    if(mRef.current) return;
    if(!window.L){ const l=document.createElement("link");l.rel="stylesheet";l.href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";document.head.appendChild(l); const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";s.onload=()=>init();document.head.appendChild(s); } else init();
    function init(){
      if(!ref.current||mRef.current) return;
      const m=window.L.map(ref.current,{zoomControl:false}).setView([32.5,-6.5],5.5);
      window.L.control.zoom({position:"bottomright"}).addTo(m);
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"©OSM",maxZoom:18}).addTo(m);
      const ic=window.L.divIcon({className:"",html:`<div style="width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,${BR.red},${BR.green});display:flex;align-items:center;justify-content:center;font-size:11px;box-shadow:0 2px 8px rgba(0,0,0,0.4);border:2px solid white;cursor:pointer">⚽</div>`,iconSize:[24,24],iconAnchor:[12,12]});
      STADIUMS.forEach(s=>{ const mk=window.L.marker([s.lat,s.lng],{icon:ic}).addTo(m); mk.bindPopup(`<div style="font-family:Outfit,sans-serif"><strong>${s.city}</strong><br><span style="font-size:11px;color:#666">${s.name}</span><br><span style="color:${BR.red};font-weight:600">${s.cap}</span></div>`); mk.on("click",()=>onSelect&&onSelect(s)); });
      mRef.current=m; setTimeout(()=>m.invalidateSize(),200);
    }
    return ()=>{ if(mRef.current){mRef.current.remove();mRef.current=null;} };
  },[]);
  return <div ref={ref} style={{width:"100%",height:height||260,borderRadius:9,overflow:"hidden",border:`1px solid ${C.bdr}`}} />;
}

// ═══════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════
export default function MoundiGuide() {
  const [lang,setLang]=useState("fr");
  const [msgs,setMsgs]=useState([]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [showLang,setShowLang]=useState(false);
  const [tab,setTab]=useState("chat");
  const [themeMode,setThemeMode]=useState("system");
  const [sysDark,setSysDark]=useState(true);
  const [weatherCity,setWeatherCity]=useState("Casablanca");
  const [listening,setListening]=useState(false);
  const [isDesktop,setIsDesktop]=useState(window.innerWidth>=768);
  const endRef=useRef(null); const inpRef=useRef(null); const recRef=useRef(null);

  useEffect(()=>{
    const mq=window.matchMedia("(prefers-color-scheme:dark)");
    setSysDark(mq.matches); const h=e=>setSysDark(e.matches);
    mq.addEventListener("change",h); return()=>mq.removeEventListener("change",h);
  },[]);
  useEffect(()=>{
    const h=()=>setIsDesktop(window.innerWidth>=768);
    window.addEventListener("resize",h); return()=>window.removeEventListener("resize",h);
  },[]);

  const dk=themeMode==="system"?sysDark:themeMode==="dark";
  const C=dk?TH.dark:TH.light;
  const ac=dk?BR.gold:BR.red;

  useEffect(()=>{ setMsgs([{role:"assistant",content:WELCOME[lang]}]); },[lang]);
  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs]);
  useEffect(()=>{ if(!showLang) return; const cl=()=>setShowLang(false); setTimeout(()=>document.addEventListener("click",cl),0); return()=>document.removeEventListener("click",cl); },[showLang]);

  const send = useCallback(async(text)=>{
    const t=text||input.trim(); if(!t||loading) return;
    setInput(""); setTab("chat");
    const nm=[...msgs,{role:"user",content:t}]; setMsgs(nm); setLoading(true);
    try {
      const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({lang,messages:nm.map(m=>({role:m.role,content:m.content}))})});
      const d=await r.json(); const reply=d.content?.[0]?.text||d.error||"⚠️ Erreur";
      setMsgs(p=>[...p,{role:"assistant",content:reply}]);
    } catch { setMsgs(p=>[...p,{role:"assistant",content:"⚠️ Hors-ligne"}]); }
    finally { setLoading(false); inpRef.current?.focus(); }
  },[input,loading,msgs,lang]);

  const startVoice=()=>{
    if(!("webkitSpeechRecognition" in window)&&!("SpeechRecognition" in window)) return;
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    const rec=new SR(); rec.lang=lang==="ar"?"ar-MA":lang; rec.continuous=false;
    rec.onresult=e=>{setInput(e.results[0][0].transcript);setListening(false);};
    rec.onerror=()=>setListening(false); rec.onend=()=>setListening(false);
    rec.start(); setListening(true); recRef.current=rec;
  };
  const stopVoice=()=>{ if(recRef.current){recRef.current.stop();setListening(false);} };

  const curLang=LANGUAGES.find(l=>l.code===lang);
  const isRTL=lang==="ar";

  // ═══════════════════════════════════════
  // SIDEBAR CONTENT (Desktop) / TAB CONTENT (Mobile)
  // ═══════════════════════════════════════
  const RankingsPanel = () => (
    <div style={{ padding:10 }}>
      <div style={{ fontFamily:"'Outfit'", fontSize:13, fontWeight:700, color:C.str, marginBottom:8, display:"flex", alignItems:"center", gap:5 }}>🏆 FIFA Rankings <span style={{fontSize:9,color:C.mut,fontWeight:400}}>Avr 2026</span></div>
      {FIFA_RANKINGS.map(r=>(
        <div key={r.rank} style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 6px", borderRadius:6, marginBottom:2, background: r.flag==="🇲🇦"||r.flag==="🇪🇸"||r.flag==="🇵🇹" ? (dk?"rgba(245,166,35,0.06)":"rgba(196,30,58,0.04)") : "transparent" }}>
          <span style={{ fontFamily:"'Outfit'", fontSize:10, fontWeight:600, color:C.mut, width:16, textAlign:"right" }}>{r.rank}</span>
          <span style={{ fontSize:14 }}>{r.flag}</span>
          <span style={{ fontFamily:"'Outfit'", fontSize:11, fontWeight: r.flag==="🇲🇦"?700:500, color:C.str, flex:1 }}>{r.team}</span>
          <span style={{ fontFamily:"'Outfit'", fontSize:9, color:C.mut }}>{r.pts}</span>
          <span style={{ fontSize:8, color: r.change==="up"?"#22C55E":r.change==="down"?"#EF4444":"#888" }}>
            {r.change==="up"?"▲":r.change==="down"?"▼":"•"}
          </span>
        </div>
      ))}
    </div>
  );

  const NewsPanel = () => (
    <div style={{ padding:10 }}>
      <div style={{ fontFamily:"'Outfit'", fontSize:13, fontWeight:700, color:C.str, marginBottom:8 }}>📰 Actualités Mondial 2030</div>
      {NEWS.map((n,i)=>(
        <div key={i} onClick={()=>send(n.title)} style={{ background:C.card, border:`1px solid ${C.bdr}`, borderRadius:8, padding:"8px 10px", marginBottom:6, cursor:"pointer", transition:"all .15s" }}
          onMouseEnter={e=>e.currentTarget.style.borderColor=ac} onMouseLeave={e=>e.currentTarget.style.borderColor=C.bdr}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:3 }}>
            <span style={{ fontFamily:"'Outfit'", fontSize:8, color:n.tagColor, fontWeight:600, background:`${n.tagColor}15`, padding:"1px 5px", borderRadius:3 }}>{n.tag}</span>
            <span style={{ fontFamily:"'Outfit'", fontSize:8, color:C.mut }}>{n.date}</span>
          </div>
          <div style={{ fontFamily:"'Outfit'", fontSize:11, fontWeight:500, color:C.str, lineHeight:1.3 }}>{n.title}</div>
        </div>
      ))}
    </div>
  );

  const InfoPanel = () => (
    <div style={{ padding:10 }}>
      <div style={{ fontFamily:"'Outfit'", fontSize:13, fontWeight:700, color:C.str, marginBottom:8 }}>ℹ️ Infos pratiques</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5 }}>
        {INFO_ITEMS.map((it,i)=>(
          <div key={i} style={{ background:C.card, border:`1px solid ${C.bdr}`, borderRadius:7, padding:7, textAlign:"center" }}>
            <div style={{fontSize:14}}>{it.i}</div>
            <div style={{ fontFamily:"'Outfit'", fontSize:11, fontWeight:600, color:C.str }}>{it.v}</div>
            <div style={{ fontFamily:"'Outfit'", fontSize:7.5, color:C.mut }}>{it.l}</div>
          </div>
        ))}
      </div>
      <CurrConv C={C} />
      <div style={{ marginTop:8, background:C.card, border:`1px solid ${C.bdr}`, borderRadius:8, padding:10 }}>
        <div style={{ fontFamily:"'Outfit'", fontSize:11, fontWeight:600, color:ac, marginBottom:6 }}>🗣️ Darija</div>
        {DARIJA.map((p,i)=>(
          <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"4px 0", borderBottom:i<4?`1px solid ${C.bdr}`:"none" }}>
            <span style={{ fontFamily:"'Outfit'", fontSize:11, fontWeight:500, color:C.str }}>{p.d}</span>
            <span style={{ fontFamily:"'Outfit'", fontSize:10, color:C.mut }}>{p.t[lang]||p.t.en}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // MOBILE TABS
  const TABS = [
    {id:"chat",icon:"💬",l:"Chat"},{id:"matchs",icon:"📅",l:"Matchs"},{id:"map",icon:"🗺️",l:"Carte"},
    {id:"rankings",icon:"🏆",l:"FIFA"},{id:"info",icon:"ℹ️",l:"Infos"},
  ];

  // ═══════════════════════════════════════
  // CHAT PANEL (shared between mobile & desktop)
  // ═══════════════════════════════════════
  const ChatPanel = () => (
    <div style={{ flex:1, display:"flex", flexDirection:"column", height:"100%" }}>
      <div style={{ flex:1, overflowY:"auto", padding:"12px 10px", display:"flex", flexDirection:"column", gap:7 }}>
        {msgs.map((m,i)=>(
          <div key={i} className="me" style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start", direction:isRTL?"rtl":"ltr" }}>
            {m.role==="assistant"&&<div style={{ width:22, height:22, borderRadius:"50%", flexShrink:0, background:`linear-gradient(135deg,${BR.red},${BR.green})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, marginRight:isRTL?0:5, marginLeft:isRTL?5:0, marginTop:2 }}>⚽</div>}
            <div style={{ maxWidth:"82%", padding:"8px 11px", borderRadius:m.role==="user"?"13px 13px 3px 13px":"13px 13px 13px 3px", background:m.role==="user"?C.usr:C.bot, border:m.role==="user"?"none":`1px solid ${C.bbdr}`, color:m.role==="user"?"#FFF":C.txt, fontSize:12, lineHeight:1.5, fontFamily:isRTL?"'Noto Sans Arabic'":"'Outfit'", fontWeight:300 }}>
              {m.role==="assistant"?md(m.content):m.content}
            </div>
          </div>
        ))}
        {loading&&(
          <div className="me" style={{display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:22,height:22,borderRadius:"50%",background:`linear-gradient(135deg,${BR.red},${BR.green})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10}}>⚽</div>
            <div style={{padding:"8px 11px",borderRadius:"13px 13px 13px 3px",background:C.bot,border:`1px solid ${C.bbdr}`,display:"flex",gap:3}}>
              {[0,.15,.3].map((d,i)=><div key={i} style={{width:4,height:4,borderRadius:"50%",background:ac,animation:`dp 1s ease-in-out infinite`,animationDelay:`${d}s`}} />)}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      {/* Quick topics */}
      <div style={{ padding:"4px 8px", display:"flex", gap:4, overflowX:"auto", flexShrink:0, scrollbarWidth:"none", borderTop:`1px solid ${C.bdr}` }}>
        {(QUICK_TOPICS[lang]||QUICK_TOPICS.en).map((t,i)=>(
          <button key={i} onClick={()=>send(t)} style={{ whiteSpace:"nowrap", padding:"3px 7px", background:C.card, border:`1px solid ${C.bdr}`, borderRadius:10, color:C.mut, fontSize:9, cursor:"pointer", fontFamily:"'Outfit'", fontWeight:400 }}>{t}</button>
        ))}
      </div>
      {/* Input */}
      <div style={{ padding:"6px 8px 8px", background:dk?"rgba(0,0,0,0.3)":"rgba(255,255,255,0.5)", flexShrink:0 }}>
        <div style={{ display:"flex", gap:5, alignItems:"flex-end" }}>
          <button onMouseDown={startVoice} onMouseUp={stopVoice} onTouchStart={startVoice} onTouchEnd={stopVoice}
            style={{ width:34, height:34, borderRadius:8, flexShrink:0, border:`1px solid ${C.bdr}`, background:listening?BR.red:C.card, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:listening?"white":C.mut, animation:listening?"pulse 1s infinite":"none" }}>
            🎤
          </button>
          <textarea ref={inpRef} value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
            placeholder={PLACEHOLDERS[lang]} rows={1} dir={isRTL?"rtl":"ltr"}
            style={{ flex:1, resize:"none", padding:"7px 9px", background:C.fld, border:`1px solid ${C.bdr}`, borderRadius:9, color:C.str, fontSize:12, fontFamily:isRTL?"'Noto Sans Arabic'":"'Outfit'", fontWeight:300, lineHeight:1.4 }} />
          <button onClick={()=>send()} disabled={!input.trim()||loading} className="sb" style={{
            width:34, height:34, borderRadius:8, flexShrink:0,
            background:input.trim()&&!loading?`linear-gradient(135deg,${BR.red},${BR.green})`:C.card,
            border:input.trim()&&!loading?"none":`1px solid ${C.bdr}`,
            cursor:input.trim()&&!loading?"pointer":"not-allowed",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:13, color:input.trim()&&!loading?"white":C.mut,
          }}>
            {loading?<div style={{width:12,height:12,border:`2px solid ${C.bdr}`,borderTopColor:ac,borderRadius:"50%",animation:"sp .6s linear infinite"}} />:"➤"}
          </button>
        </div>
      </div>
    </div>
  );

  const MatchesPanel = () => (
    <div style={{ padding:10, overflowY:"auto" }}>
      <div style={{ fontFamily:"'Outfit'", fontSize:13, fontWeight:700, color:C.str, marginBottom:8 }}>📅 Calendrier des matchs</div>
      {MATCHES.map((m,i)=>(
        <div key={i} style={{ background:C.card, border:`1px solid ${C.bdr}`, borderRadius:8, padding:"8px 10px", marginBottom:5, borderLeft:`3px solid ${m.ph==="final"?BR.gold:m.ph==="sf"?BR.blue:m.ph==="qf"?BR.green:BR.red}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
            <span style={{ fontFamily:"'Outfit'", fontSize:8, color:ac, fontWeight:600, textTransform:"uppercase" }}>{m.ph==="group"?"Groupes":m.ph==="r16"?"8èmes":m.ph==="qf"?"Quarts":m.ph==="sf"?"Demis":"Finale"}</span>
            <span style={{ fontFamily:"'Outfit'", fontSize:8, color:C.mut }}>{m.date} · {m.t}</span>
          </div>
          <div style={{ fontFamily:"'Outfit'", fontSize:12, fontWeight:600, color:C.str }}>{m.t1}  vs  {m.t2}</div>
          <div style={{ fontFamily:"'Outfit'", fontSize:9, color:C.mut, marginTop:2 }}>📍 {m.city}</div>
        </div>
      ))}
    </div>
  );

  const StadiumsPanel = () => (
    <div style={{ padding:10, overflowY:"auto" }}>
      <div style={{ fontFamily:"'Outfit'", fontSize:13, fontWeight:700, color:C.str, marginBottom:8 }}>🏟️ Stades du Maroc</div>
      {STADIUMS.map((s,i)=>(
        <div key={i} onClick={()=>send(`Parle-moi du stade de ${s.city}`)} style={{ background:C.card, border:`1px solid ${C.bdr}`, borderRadius:9, marginBottom:6, overflow:"hidden", cursor:"pointer" }}>
          <img src={s.img} alt={s.name} style={{width:"100%",height:100,objectFit:"cover"}} onError={e=>{e.target.style.display="none";}} />
          <div style={{ padding:"8px 10px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontFamily:"'Outfit'", fontSize:12, fontWeight:600, color:C.str }}>{s.city}</div>
              <div style={{ fontFamily:"'Outfit'", fontSize:9, color:C.mut }}>{s.name}</div>
            </div>
            <span style={{ fontFamily:"'Outfit'", fontSize:9, fontWeight:600, color:dk?BR.gold:BR.red, background:C.card, padding:"2px 5px", borderRadius:4 }}>{s.cap}</span>
          </div>
        </div>
      ))}
    </div>
  );

  // ═══════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════
  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Segoe UI',system-ui,sans-serif", display:"flex", flexDirection:"column", transition:"background .3s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Noto+Sans+Arabic:wght@400;600&display=swap');
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes dp{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes sp{to{transform:rotate(360deg)}}
        @keyframes as{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(196,30,58,0.4)}70%{box-shadow:0 0 0 8px rgba(196,30,58,0)}}
        .me{animation:fadeIn .2s ease both}.tb{transition:all .12s}.sb:hover:not(:disabled){opacity:.9;transform:scale(1.03)}
        textarea:focus{outline:none;border-color:${ac}!important}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:${C.sc};border-radius:3px}
        *{box-sizing:border-box;margin:0;padding:0}
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}input[type=number]{-moz-appearance:textfield}
      `}</style>

      {/* ═══ HEADER ═══ */}
      <div style={{ padding:"10px 16px 6px", background:C.hdr, backdropFilter:"blur(24px)", borderBottom:`1px solid ${C.bdr}`, flexShrink:0, position:"relative", zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", maxWidth:1400, margin:"0 auto", width:"100%" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ position:"relative", width:32, height:32 }}>
              <svg width="32" height="32" viewBox="0 0 38 38" style={{animation:"as 20s linear infinite"}}>
                {[BR.red,BR.green,BR.blue,BR.gold].map((c,i)=><circle key={i} cx="19" cy="19" r="16" fill="none" stroke={c} strokeWidth="2.5" strokeDasharray="12 88" strokeDashoffset={i*-25}/>)}
              </svg>
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>⚽</div>
            </div>
            <div>
              <div style={{fontFamily:"'Outfit'",fontWeight:700,fontSize:isDesktop?18:16,lineHeight:1}}>
                <span style={{color:BR.red}}>M</span><span style={{color:C.str}}>oundi</span><span style={{color:BR.green}}>G</span><span style={{color:C.str}}>uide</span>
              </div>
              <div style={{fontFamily:"'Outfit'",fontSize:7,color:C.mut,letterSpacing:2,textTransform:"uppercase",marginTop:1}}>YallaVamos 2030</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:5}}>
            {isDesktop && <Weather C={C} city="Casablanca" />}
            <button onClick={()=>setThemeMode(p=>({system:"light",light:"dark",dark:"system"}[p]))} style={{width:28,height:28,borderRadius:7,border:`1px solid ${C.bdr}`,background:C.card,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,position:"relative"}}>
              {dk?"☀️":"🌙"}
              {themeMode==="system"&&<div style={{position:"absolute",bottom:-1,right:-1,width:6,height:6,borderRadius:3,background:BR.green,border:`1px solid ${dk?"#0C1117":"#F5F6F8"}`}} />}
            </button>
            <div style={{position:"relative"}}>
              <button onClick={e=>{e.stopPropagation();setShowLang(!showLang);}} style={{background:C.card,border:`1px solid ${C.bdr}`,borderRadius:14,padding:"3px 8px",cursor:"pointer",color:C.str,fontSize:10,fontWeight:500,display:"flex",alignItems:"center",gap:3,fontFamily:"'Outfit'"}}>
                <span style={{fontSize:12}}>{curLang.flag}</span><span>{curLang.label}</span><span style={{opacity:.4,fontSize:7}}>▼</span>
              </button>
              {showLang&&(
                <div onClick={e=>e.stopPropagation()} style={{position:"absolute",right:0,top:"calc(100% + 4px)",background:C.dd,backdropFilter:"blur(20px)",border:`1px solid ${C.bdr}`,borderRadius:8,overflow:"hidden",zIndex:9999,minWidth:130,boxShadow:C.sh,animation:"fadeIn .12s ease both"}}>
                  {LANGUAGES.map(l=>(
                    <button key={l.code} onClick={()=>{setLang(l.code);setShowLang(false);}} style={{display:"flex",alignItems:"center",gap:5,width:"100%",padding:"6px 10px",background:lang===l.code?C.la:"transparent",border:"none",cursor:"pointer",color:lang===l.code?ac:C.txt,fontSize:11,fontFamily:"'Outfit'"}}>
                      <span style={{fontSize:12}}>{l.flag}</span><span>{l.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={{display:"flex",height:2,marginTop:6,borderRadius:1,overflow:"hidden",maxWidth:1400,margin:"6px auto 0"}}>
          {[BR.red,BR.gold,BR.green,BR.blue].map((c,i)=><div key={i} style={{flex:1,background:c}} />)}
        </div>
      </div>

      {/* ═══ AD BANNER ═══ */}
      <AdBanner C={C} />

      {/* ═══ MAIN LAYOUT ═══ */}
      {isDesktop ? (
        /* DESKTOP: 3-column layout */
        <div style={{ flex:1, display:"flex", maxWidth:1400, margin:"0 auto", width:"100%", overflow:"hidden" }}>
          {/* LEFT SIDEBAR: Rankings + News */}
          <div style={{ width:260, flexShrink:0, borderRight:`1px solid ${C.bdr}`, overflowY:"auto", background:dk?"rgba(0,0,0,0.2)":"rgba(255,255,255,0.5)" }}>
            <RankingsPanel />
            <div style={{ height:1, background:C.bdr, margin:"0 10px" }} />
            <NewsPanel />
          </div>

          {/* CENTER: Chat */}
          <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
            <ChatPanel />
          </div>

          {/* RIGHT SIDEBAR: Map + Info + Stadiums */}
          <div style={{ width:280, flexShrink:0, borderLeft:`1px solid ${C.bdr}`, overflowY:"auto", background:dk?"rgba(0,0,0,0.2)":"rgba(255,255,255,0.5)" }}>
            <div style={{ padding:10 }}>
              <div style={{ fontFamily:"'Outfit'", fontSize:13, fontWeight:700, color:C.str, marginBottom:8 }}>🗺️ Carte des stades</div>
              <SMap C={C} onSelect={s=>send(`Parle-moi du stade de ${s.city}`)} height={220} />
            </div>
            <div style={{ height:1, background:C.bdr, margin:"0 10px" }} />
            <div style={{ padding:10 }}>
              <div style={{ fontFamily:"'Outfit'", fontSize:13, fontWeight:700, color:C.str, marginBottom:6 }}>☀️ Météo</div>
              <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:6 }}>
                {STADIUMS.map(s=>(
                  <button key={s.city} onClick={()=>setWeatherCity(s.city)} style={{padding:"2px 6px",borderRadius:10,border:`1px solid ${C.bdr}`,background:weatherCity===s.city?C.la:C.card,color:weatherCity===s.city?ac:C.txt,fontSize:9,cursor:"pointer",fontFamily:"'Outfit'",fontWeight:500}}>{s.city}</button>
                ))}
              </div>
              <Weather C={C} city={weatherCity} />
            </div>
            <div style={{ height:1, background:C.bdr, margin:"0 10px" }} />
            <InfoPanel />
          </div>
        </div>
      ) : (
        /* MOBILE: Tabs + Content */
        <>
          <div style={{ display:"flex", background:dk?"rgba(0,0,0,0.3)":"rgba(255,255,255,0.6)", borderBottom:`1px solid ${C.bdr}`, flexShrink:0 }}>
            {TABS.map(t=>(
              <button key={t.id} className="tb" onClick={()=>setTab(t.id)} style={{
                flex:1, padding:"7px 0", border:"none", cursor:"pointer",
                background:tab===t.id?C.la:"transparent",
                borderBottom:tab===t.id?`2px solid ${ac}`:"2px solid transparent",
                color:tab===t.id?ac:C.mut, fontSize:9, fontWeight:500, fontFamily:"'Outfit'",
                display:"flex", alignItems:"center", justifyContent:"center", gap:3,
              }}>
                <span style={{fontSize:10}}>{t.icon}</span>{t.l}
              </button>
            ))}
          </div>
          <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column" }}>
            {tab==="chat"&&<ChatPanel />}
            {tab==="matchs"&&<MatchesPanel />}
            {tab==="map"&&(
              <div style={{padding:10}}>
                <SMap C={C} onSelect={s=>send(`Parle-moi du stade de ${s.city}`)} height={300} />
                <div style={{marginTop:8}}><Weather C={C} city={weatherCity} /></div>
                <div style={{display:"flex",gap:4,marginTop:6,flexWrap:"wrap"}}>
                  {STADIUMS.map(s=><button key={s.city} onClick={()=>setWeatherCity(s.city)} style={{padding:"2px 6px",borderRadius:10,border:`1px solid ${C.bdr}`,background:weatherCity===s.city?C.la:C.card,color:weatherCity===s.city?ac:C.txt,fontSize:9,cursor:"pointer",fontFamily:"'Outfit'"}}>{s.city}</button>)}
                </div>
              </div>
            )}
            {tab==="rankings"&&<><RankingsPanel /><div style={{height:1,background:C.bdr,margin:"0 10px"}} /><NewsPanel /><StadiumsPanel /></>}
            {tab==="info"&&<InfoPanel />}
          </div>
        </>
      )}

      {/* ═══ FOOTER BRAND ═══ */}
      <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:4, padding:"5px 0", background:dk?"rgba(0,0,0,0.3)":"rgba(255,255,255,0.5)", flexShrink:0, borderTop:`1px solid ${C.bdr}` }}>
        {[BR.red,BR.gold,BR.green,BR.blue].map((c,i)=><div key={i} style={{width:6,height:2,borderRadius:1,background:c}} />)}
        <span style={{fontFamily:"'Outfit'",fontSize:7,color:C.mut,letterSpacing:1.5,marginLeft:3}}>YALLAVAMOS 2030 — MAROC · ESPAGNE · PORTUGAL</span>
      </div>
    </div>
  );
}
