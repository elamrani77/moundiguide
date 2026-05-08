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
  fr:`Tu es MoundiGuide, assistant IA du Mondial 2030. Réponds en 3-5 phrases MAX. Direct, pratique. Emojis.`,
  en:`You are MoundiGuide, 2030 World Cup AI assistant. 3-5 sentences MAX. Direct, practical. Emojis.`,
  ar:`أنت MoundiGuide مساعد كأس العالم 2030. 3 جمل كحد أقصى. مباشر وعملي.`,
  es:`Eres MoundiGuide, asistente Mundial 2030. 3 frases MAX. Directo. Emojis.`,
  pt:`Você é MoundiGuide, assistente Copa 2030. 3 frases MAX. Direto. Emojis.`,
  zh:`你是MoundiGuide，2030世界杯助手。最多3句。直接。表情。`,
};
const WELCOME = { fr:"⚽ Bienvenue ! Posez-moi une question sur le Mondial 2030.", en:"⚽ Welcome! Ask about the 2030 World Cup.", ar:"⚽ مرحباً! اسألني عن المونديال.", es:"⚽ ¡Hola! Pregunta sobre el Mundial.", pt:"⚽ Olá! Pergunte sobre a Copa.", zh:"⚽ 你好！问我世界杯相关问题。" };
const STADIUMS = [
  { city:"Casablanca", name:"Grand Stade Hassan II", cap:"115 000", lat:33.57, lng:-7.59 },
  { city:"Rabat",      name:"Complexe Moulay Abdallah", cap:"52 000", lat:33.96, lng:-6.86 },
  { city:"Marrakech",  name:"Grand Stade de Marrakech", cap:"45 000", lat:31.62, lng:-8.01 },
  { city:"Tanger",     name:"Grand Stade de Tanger", cap:"65 000", lat:35.74, lng:-5.83 },
  { city:"Agadir",     name:"Stade d'Agadir", cap:"45 000", lat:30.38, lng:-9.53 },
  { city:"Fès",        name:"Nouveau Stade de Fès", cap:"50 000", lat:34.02, lng:-5.01 },
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
  {ph:"G",d:"15 Jun",tm:"18:00",a:"🇲🇦 Maroc",b:"Brésil 🇧🇷",c:"Casablanca"},
  {ph:"G",d:"16 Jun",tm:"21:00",a:"🇪🇸 Espagne",b:"Argentine 🇦🇷",c:"Rabat"},
  {ph:"G",d:"17 Jun",tm:"18:00",a:"🇵🇹 Portugal",b:"France 🇫🇷",c:"Marrakech"},
  {ph:"G",d:"20 Jun",tm:"21:00",a:"🇲🇦 Maroc",b:"Allemagne 🇩🇪",c:"Tanger"},
  {ph:"G",d:"21 Jun",tm:"18:00",a:"🇪🇸 Espagne",b:"Japon 🇯🇵",c:"Agadir"},
  {ph:"G",d:"22 Jun",tm:"21:00",a:"🇵🇹 Portugal",b:"Mexique 🇲🇽",c:"Fès"},
  {ph:"8",d:"1 Jul", tm:"18:00",a:"1A",b:"2B",c:"Casablanca"},
  {ph:"8",d:"2 Jul", tm:"21:00",a:"1B",b:"2A",c:"Rabat"},
  {ph:"Q",d:"5 Jul", tm:"21:00",a:"W1",b:"W2",c:"Marrakech"},
  {ph:"Q",d:"6 Jul", tm:"21:00",a:"W3",b:"W4",c:"Casablanca"},
  {ph:"S",d:"9 Jul", tm:"21:00",a:"SF1",b:"SF2",c:"Casablanca"},
  {ph:"S",d:"10 Jul",tm:"21:00",a:"SF3",b:"SF4",c:"Rabat"},
  {ph:"F",d:"13 Jul",tm:"21:00",a:"🏆 Finale",b:"⚽",c:"Casablanca"},
];
const NEWS = [
  {d:"12 Avr",t:"Grand Stade Hassan II : 95% de construction",tg:"Infra",tc:"#00913F"},
  {d:"10 Avr",t:"Plan de mobilité pour les 6 villes hôtes",tg:"Transport",tc:"#1A56DB"},
  {d:"8 Avr", t:"FIFA confirme 48 équipes qualifiées",tg:"FIFA",tc:"#E41C3A"},
  {d:"5 Avr", t:"Billetterie en ligne ouvrira en janvier 2029",tg:"Billets",tc:"#F0B429"},
  {d:"3 Avr", t:"YallaVamos : 20 000 bénévoles recherchés",tg:"Bénévol.",tc:"#7C3AED"},
];
const CURRENCIES = [{c:"EUR",s:"€"},{c:"USD",s:"$"},{c:"GBP",s:"£"},{c:"BRL",s:"R$"},{c:"JPY",s:"¥"}];
const INFO_ITEMS = [{i:"🚨",l:"Police",v:"19"},{i:"🚑",l:"SAMU",v:"15"},{i:"🚒",l:"Pompiers",v:"15"},{i:"💱",l:"Monnaie",v:"MAD"},{i:"🔌",l:"220V",v:"C,E"},{i:"🕐",l:"Fuseau",v:"GMT+1"},{i:"📱",l:"Indicatif",v:"+212"},{i:"💧",l:"Eau",v:"Bouteille"}];
const DARIJA = [{d:"Salam",t:{fr:"Bonjour",en:"Hello",ar:"مرحبا",es:"Hola"}},{d:"Beshhal?",t:{fr:"Combien?",en:"How much?",ar:"بكم؟",es:"¿Cuánto?"}},{d:"Shukran",t:{fr:"Merci",en:"Thanks",ar:"شكرا",es:"Gracias"}},{d:"Fin kayn?",t:{fr:"Où est?",en:"Where?",ar:"فين؟",es:"¿Dónde?"}},{d:"Mezyan",t:{fr:"Bien",en:"Good",ar:"مزيان",es:"Bien"}}];
const TICKET_CATS = [
  {cat:"Category 1",price:"990 USD",color:"#F0B429",desc:"Best seats — behind the goal or central stands",icon:"⭐"},
  {cat:"Category 2",price:"605 USD",color:"#E41C3A",desc:"Upper lateral stands with excellent view",icon:"🎟️"},
  {cat:"Category 3",price:"385 USD",color:"#1A56DB",desc:"Standard seats — great atmosphere",icon:"🏟️"},
  {cat:"Category 4",price:"110 USD",color:"#00913F",desc:"Host nation residents price (MAD equiv.)",icon:"🇲🇦"},
];
const CITIES = [
  {city:"Casablanca",img:"https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=600&h=400&fit=crop",flag:"🌊"},
  {city:"Rabat",     img:"https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=400&fit=crop",flag:"👑"},
  {city:"Marrakech", img:"https://images.unsplash.com/photo-1597212618440-806b84589018?w=600&h=400&fit=crop",flag:"🌹"},
  {city:"Tanger",    img:"https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&h=400&fit=crop",flag:"🌊"},
  {city:"Agadir",    img:"https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=600&h=400&fit=crop",flag:"🏖️"},
  {city:"Fès",       img:"https://images.unsplash.com/photo-1569383746724-6f1b882b8f46?w=600&h=400&fit=crop",flag:"🕌"},
];

const BR = { red:"#E41C3A", green:"#00913F", blue:"#1A56DB", gold:"#F0B429" };
const PHASE_COLORS = {G:BR.red,"8":"#9333EA",Q:BR.blue,S:BR.green,F:BR.gold};
const PHASE_LABELS = {G:"Groupe","8":"8èmes",Q:"Quarts",S:"Demis",F:"Finale"};

// ── md renderer ──
function md(t){if(!t)return t;return t.split("\n").map((l,i)=>{let c=l.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>");if(l.startsWith("- ")||l.startsWith("• "))return<div key={i} style={{paddingLeft:12,marginBottom:2}} dangerouslySetInnerHTML={{__html:"• "+c.slice(2)}}/>;if(l.trim()==="")return<div key={i} style={{height:6}}/>;return<div key={i} dangerouslySetInnerHTML={{__html:c}}/>;});}

// ══════════════════════════════════════════════
// LOGO COMPONENT
// ══════════════════════════════════════════════
function MoundiLogo({size=36, showText=true, textColor="#111"}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
      <img src="/logo.png" alt="Moundi Guide" style={{height:size,width:size,objectFit:"contain"}}
        onError={e=>{e.target.style.display="none";e.target.nextSibling&&(e.target.nextSibling.style.display="flex");}}
      />
      {/* SVG fallback shown if logo.png missing */}
      <svg width={size} height={size} viewBox="0 0 100 100" style={{display:"none",flexShrink:0}}>
        <circle cx="50" cy="20" r="8" fill={BR.red}/>
        <circle cx="80" cy="50" r="8" fill={BR.gold}/>
        <circle cx="50" cy="80" r="8" fill={BR.green}/>
        <circle cx="20" cy="50" r="8" fill={BR.blue}/>
        <path d="M50 20 Q80 20 80 50 Q80 80 50 80 Q20 80 20 50 Q20 20 50 20" fill="none" stroke={BR.red} strokeWidth="3" strokeDasharray="8,4"/>
        <text x="50" y="54" textAnchor="middle" fontSize="18" fontWeight="800" fill={BR.red}>M</text>
      </svg>
      {showText&&(
        <div style={{lineHeight:1}}>
          <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:18,color:textColor,letterSpacing:0.3}}>
            Moundi Guide
          </div>
          <div style={{fontFamily:"'Outfit',sans-serif",fontSize:8,color:"rgba(120,120,120,0.9)",letterSpacing:2,textTransform:"uppercase",marginTop:2}}>
            Unity · Community · Innovation
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════
// NAVBAR
// ══════════════════════════════════════════════
function Navbar({page, setPage, scrolled, dk, C, themeMode, setThemeMode, lang, curLang, showLang, setShowLang, isDesk}){
  const [menuOpen, setMenuOpen] = useState(false);
  const navBg = scrolled
    ? (dk ? "rgba(7,9,26,0.96)" : "rgba(255,255,255,0.97)")
    : "transparent";
  const linkColor = scrolled ? C.str : "#FFFFFF";
  const mutColor  = scrolled ? C.mut : "rgba(255,255,255,0.7)";
  const F = "'Outfit'";

  const NavLink = ({id, label}) => {
    const active = page === id;
    return(
      <button onClick={()=>{setPage(id);setMenuOpen(false);}}
        style={{background:"none",border:"none",cursor:"pointer",fontFamily:F,fontSize:14,fontWeight:active?600:400,
          color:active?(scrolled?BR.red:"#F0B429"):linkColor,
          padding:"6px 4px",position:"relative",transition:"all .2s",letterSpacing:0.3}}>
        {label}
        {active&&<div style={{position:"absolute",bottom:-2,left:0,right:0,height:2,background:scrolled?BR.red:BR.gold,borderRadius:2}}/>}
      </button>
    );
  };

  return(
    <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:1000,background:navBg,backdropFilter:scrolled?"blur(24px)":"none",
      borderBottom:scrolled?`1px solid ${C.bdr}`:"none",transition:"all .35s ease",padding:"0 24px"}}>
      <div style={{maxWidth:1280,margin:"0 auto",height:68,display:"flex",alignItems:"center",justifyContent:"space-between"}}>

        {/* Logo */}
        <div onClick={()=>setPage("home")}>
          <MoundiLogo size={40} textColor={scrolled?(dk?"#FFF":BR.red):"#FFF"}/>
        </div>

        {/* Desktop nav */}
        {isDesk?(
          <div style={{display:"flex",alignItems:"center",gap:28}}>
            <NavLink id="home"     label="Home"/>
            <NavLink id="ticket"   label="Ticket"/>
            <NavLink id="schedule" label="Schedule"/>

            {/* Divider */}
            <div style={{width:1,height:20,background:scrolled?C.bdr:"rgba(255,255,255,0.3)"}}/>

            {/* Theme toggle */}
            <button onClick={()=>setThemeMode(p=>({system:"light",light:"dark",dark:"system"}[p]))}
              style={{background:"none",border:`1px solid ${scrolled?C.bdr:"rgba(255,255,255,0.35)"}`,
                borderRadius:8,width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",
                justifyContent:"center",fontSize:14,color:linkColor,transition:"all .2s"}}>
              {dk?"☀️":"🌙"}
            </button>

            {/* Language */}
            <button onClick={e=>{e.stopPropagation();setShowLang(p=>!p);}}
              style={{background:"none",border:`1px solid ${scrolled?C.bdr:"rgba(255,255,255,0.35)"}`,
                borderRadius:20,padding:"5px 12px",cursor:"pointer",fontFamily:F,fontSize:12,
                color:linkColor,display:"flex",alignItems:"center",gap:5,transition:"all .2s"}}>
              <span style={{fontSize:14}}>{curLang.flag}</span>
              <span>{curLang.label}</span>
              <span style={{opacity:.5,fontSize:8}}>▼</span>
            </button>
          </div>
        ):(
          /* Mobile: hamburger */
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={()=>setMenuOpen(p=>!p)}
              style={{background:"none",border:`1px solid ${scrolled?C.bdr:"rgba(255,255,255,0.4)"}`,
                borderRadius:8,width:36,height:36,cursor:"pointer",color:linkColor,fontSize:18,
                display:"flex",alignItems:"center",justifyContent:"center"}}>
              {menuOpen?"✕":"☰"}
            </button>
          </div>
        )}
      </div>

      {/* Mobile dropdown menu */}
      {!isDesk&&menuOpen&&(
        <div style={{background:dk?"rgba(7,9,26,0.98)":"rgba(255,255,255,0.99)",
          borderTop:`1px solid ${C.bdr}`,padding:"16px 24px 20px",animation:"slideDown .2s ease"}}>
          {["home","ticket","schedule"].map(id=>(
            <button key={id} onClick={()=>{setPage(id);setMenuOpen(false);}}
              style={{display:"block",width:"100%",textAlign:"left",background:page===id?`${BR.red}11`:"none",
                border:"none",padding:"12px 14px",borderRadius:10,cursor:"pointer",
                fontFamily:F,fontSize:15,fontWeight:page===id?600:400,
                color:page===id?BR.red:C.str,marginBottom:4,transition:"all .15s"}}>
              {{home:"🏠 Home",ticket:"🎟️ Ticket",schedule:"📅 Schedule"}[id]}
            </button>
          ))}
          <div style={{display:"flex",gap:10,marginTop:12,paddingTop:12,borderTop:`1px solid ${C.bdr}`}}>
            <button onClick={()=>setThemeMode(p=>({system:"light",light:"dark",dark:"system"}[p]))}
              style={{flex:1,padding:10,borderRadius:10,border:`1px solid ${C.bdr}`,
                background:C.card,color:C.str,cursor:"pointer",fontFamily:F,fontSize:13}}>
              {dk?"☀️ Clair":"🌙 Sombre"}
            </button>
            <button onClick={()=>setShowLang(p=>!p)}
              style={{flex:1,padding:10,borderRadius:10,border:`1px solid ${C.bdr}`,
                background:C.card,color:C.str,cursor:"pointer",fontFamily:F,fontSize:13}}>
              {curLang.flag} {curLang.label}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

// ══════════════════════════════════════════════
// SPLASH SCREEN
// ══════════════════════════════════════════════
function Splash({onDone}){
  useEffect(()=>{const t=setTimeout(onDone,2600);return()=>clearTimeout(t);},[onDone]);
  return(
    <div style={{position:"fixed",inset:0,zIndex:999999,background:"#07091A",
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
      <style>{`@keyframes kickBall{0%{transform:translateY(0) rotate(0deg)}30%{transform:translateY(-60px) rotate(180deg)}50%{transform:translateY(0) rotate(360deg)}70%{transform:translateY(-30px) rotate(540deg)}100%{transform:translateY(0) rotate(720deg)}}@keyframes growBar{from{width:0}to{width:100%}}@keyframes spl{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{fontSize:72,animation:"kickBall 1.5s ease-in-out infinite",filter:"drop-shadow(0 0 20px rgba(240,180,41,0.6))"}}>⚽</div>
      <div style={{fontFamily:"'Outfit',sans-serif",fontSize:34,fontWeight:800,marginTop:20,animation:"spl .6s .2s both"}}>
        <span style={{color:BR.red}}>Moundi</span><span style={{color:"#FFF"}}> Guide</span>
      </div>
      <div style={{fontFamily:"'Outfit',sans-serif",fontSize:10,color:BR.gold,letterSpacing:5,marginTop:6,textTransform:"uppercase",animation:"spl .6s .4s both"}}>
        Unity · Community · Innovation
      </div>
      <div style={{width:140,height:3,background:"rgba(255,255,255,0.08)",borderRadius:3,marginTop:28,overflow:"hidden",animation:"spl .6s .5s both"}}>
        <div style={{height:"100%",background:`linear-gradient(90deg,${BR.red},${BR.gold},${BR.green})`,borderRadius:3,animation:"growBar 2.2s .5s ease-out forwards",width:0}}/>
      </div>
      <div style={{display:"flex",gap:10,marginTop:16,animation:"spl .6s .6s both"}}>
        <span style={{fontSize:22}}>🇲🇦</span><span style={{fontSize:22}}>🇪🇸</span><span style={{fontSize:22}}>🇵🇹</span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// WEATHER widget
// ══════════════════════════════════════════════
function Weather({C,city}){
  const[w,setW]=useState(null);
  useEffect(()=>{const s=STADIUMS.find(st=>st.city===city);if(!s)return;fetch(`https://api.open-meteo.com/v1/forecast?latitude=${s.lat}&longitude=${s.lng}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`).then(r=>r.json()).then(d=>setW(d.current)).catch(()=>{});},[city]);
  if(!w)return null;
  const ic=c=>{if(c===0)return"☀️";if(c<=3)return"⛅";if(c<=48)return"🌫️";if(c<=67)return"🌧️";return"⛈️";};
  return(
    <div style={{background:C.card,border:`1px solid ${C.bdr}`,borderRadius:16,padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",backdropFilter:"blur(16px)"}}>
      <div>
        <div style={{fontFamily:"'Outfit'",fontSize:10,color:C.mut,letterSpacing:1.5,textTransform:"uppercase"}}>{city}</div>
        <div style={{fontFamily:"'Outfit'",fontSize:30,fontWeight:700,color:C.str,lineHeight:1,marginTop:2}}>{Math.round(w.temperature_2m)}°<span style={{fontSize:15,fontWeight:400,color:C.mut}}>C</span></div>
      </div>
      <div style={{textAlign:"right"}}>
        <div style={{fontSize:32}}>{ic(w.weather_code)}</div>
        <div style={{fontFamily:"'Outfit'",fontSize:10,color:C.mut,marginTop:4}}>💨 {Math.round(w.wind_speed_10m)} km/h</div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// MAP
// ══════════════════════════════════════════════
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
      const ic=window.L.divIcon({className:"",html:`<div style="position:relative;width:30px;height:38px;cursor:pointer"><div style="width:30px;height:30px;border-radius:50% 50% 50% 0;background:linear-gradient(135deg,${BR.red},${BR.green});transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0,0,0,0.5)"><span style="transform:rotate(45deg);font-size:13px">⚽</span></div></div>`,iconSize:[30,38],iconAnchor:[15,38]});
      STADIUMS.forEach(s=>{const mk=window.L.marker([s.lat,s.lng],{icon:ic}).addTo(m);mk.bindPopup(`<b>${s.city}</b><br><small>${s.name}</small><br><span style="color:${BR.red};font-weight:700">${s.cap} places</span>`);mk.on("click",()=>onSelect&&onSelect(s));});
      mR.current=m;setTimeout(()=>m.invalidateSize(),200);
    }
    return()=>{if(mR.current){mR.current.remove();mR.current=null;}};
  },[]);
  return <div ref={ref} style={{width:"100%",height:height||260,borderRadius:16,overflow:"hidden",border:`1px solid ${C.bdr}`}}/>;
}

// ══════════════════════════════════════════════
// CHAT (floating)
// ══════════════════════════════════════════════
function ChatFloat({C,dk,lang,msgs,input,setInput,loading,send,listening,toggleVoice,chatOpen,setChatOpen,isRTL,ac,F,endRef,inpRef}){
  if(!chatOpen) return(
    <button onClick={()=>setChatOpen(true)}
      style={{position:"fixed",bottom:28,right:28,width:58,height:58,borderRadius:"50%",
        background:`linear-gradient(135deg,${BR.red},${BR.green})`,border:"none",cursor:"pointer",
        display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,color:"white",
        boxShadow:`0 8px 28px ${BR.red}66`,zIndex:900,animation:"pulse 2.5s infinite"}}>
      💬
    </button>
  );
  return(
    <div style={{position:"fixed",bottom:28,right:28,width:360,height:520,borderRadius:20,
      background:dk?"rgba(7,9,26,0.95)":"rgba(255,255,255,0.97)",
      border:`1px solid ${C.bdr}`,boxShadow:C.sh,zIndex:900,
      display:"flex",flexDirection:"column",backdropFilter:"blur(24px)",
      animation:"popIn .25s ease both"}}>
      {/* Chat header */}
      <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.bdr}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:30,height:30,borderRadius:"50%",background:`linear-gradient(135deg,${BR.red},${BR.green})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>⚽</div>
          <div>
            <div style={{fontFamily:F,fontSize:13,fontWeight:700,color:C.str}}>MoundiGuide AI</div>
            <div style={{fontFamily:F,fontSize:9,color:BR.green}}>● En ligne</div>
          </div>
        </div>
        <button onClick={()=>setChatOpen(false)} style={{background:"none",border:"none",cursor:"pointer",color:C.mut,fontSize:18,lineHeight:1}}>✕</button>
      </div>
      {/* Messages */}
      <div style={{flex:1,overflowY:"auto",padding:"12px 10px",display:"flex",flexDirection:"column",gap:8}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",direction:isRTL?"rtl":"ltr"}}>
            {m.role==="assistant"&&<div style={{width:24,height:24,borderRadius:"50%",flexShrink:0,background:`linear-gradient(135deg,${BR.red},${BR.green})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,marginRight:6,marginTop:2}}>⚽</div>}
            <div style={{maxWidth:"82%",padding:"9px 13px",borderRadius:m.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px",background:m.role==="user"?C.usr:C.bot,border:m.role==="user"?"none":`1px solid ${C.bbdr}`,color:m.role==="user"?"#FFF":C.txt,fontSize:12.5,lineHeight:1.55,fontFamily:isRTL?"'Noto Sans Arabic'":F}}>
              {m.role==="assistant"?md(m.content):m.content}
            </div>
          </div>
        ))}
        {loading&&<div style={{display:"flex",gap:6,padding:"6px 10px"}}>{[0,.15,.3].map((d,i)=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:ac,animation:`dp 1s ease-in-out infinite`,animationDelay:`${d}s`}}/>)}</div>}
        <div ref={endRef}/>
      </div>
      {/* Quick topics */}
      <div style={{padding:"5px 10px",display:"flex",gap:4,overflowX:"auto",scrollbarWidth:"none",borderTop:`1px solid ${C.bdr}`,flexShrink:0}}>
        {(({fr:["🏟️ Stades","🚇 Transport","🍜 Restaurants","🏨 Hôtels","☀️ Météo"],en:["🏟️ Stadiums","🍜 Food","🏨 Hotels","☀️ Weather"]})[lang]||[]).map((t,i)=>(
          <button key={i} onClick={()=>send(t)} style={{whiteSpace:"nowrap",padding:"3px 9px",background:C.card,border:`1px solid ${C.bdr}`,borderRadius:20,color:C.mut,fontSize:10,cursor:"pointer",fontFamily:F,flexShrink:0}}>{t}</button>
        ))}
      </div>
      {/* Input */}
      <div style={{padding:"8px 12px 12px",flexShrink:0}}>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <button onClick={toggleVoice} style={{width:34,height:34,borderRadius:10,border:`1px solid ${listening?BR.red:C.bdr}`,background:listening?`${BR.red}22`:C.card,cursor:"pointer",fontSize:13,color:listening?BR.red:C.mut}}>🎤</button>
          <input ref={inpRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();send();}}} placeholder={PLACEHOLDERS[lang]} dir={isRTL?"rtl":"ltr"}
            style={{flex:1,padding:"8px 12px",background:C.fld,border:`1px solid ${C.bdr}`,borderRadius:10,color:C.str,fontSize:12,fontFamily:F,outline:"none"}}/>
          <button onClick={()=>send()} disabled={!input.trim()||loading}
            style={{width:34,height:34,borderRadius:10,background:input.trim()&&!loading?`linear-gradient(135deg,${BR.red},${BR.green})`:C.card,border:"none",cursor:input.trim()&&!loading?"pointer":"not-allowed",fontSize:14,color:input.trim()&&!loading?"white":C.mut}}>
            {loading?<div style={{width:12,height:12,border:`2px solid ${C.bdr}`,borderTopColor:ac,borderRadius:"50%",animation:"sp .6s linear infinite",margin:"auto"}}/>:"➤"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// PAGE: HOME
// ══════════════════════════════════════════════
function HomePage({C,dk,ac,F,lang,send,setPage,isDesk}){
  const[weatherCity,setWeatherCity]=useState("Casablanca");
  const[cityIdx,setCityIdx]=useState(0);
  const[rt,sR]=useState(null);
  const[amt,sA]=useState("100");const[cur,sCur]=useState("EUR");
  useEffect(()=>{const id=setInterval(()=>setCityIdx(p=>(p+1)%CITIES.length),3500);return()=>clearInterval(id);},[]);
  useEffect(()=>{fetch("https://open.er-api.com/v6/latest/MAD").then(r=>r.json()).then(d=>sR(d.rates)).catch(()=>sR({EUR:.091,USD:.099,GBP:.078,BRL:.57,JPY:14.8}));},[]);
  const convResult=rt&&amt?Math.round(parseFloat(amt)/(rt[cur]||1)).toLocaleString():"—";
  const inpS={padding:"8px 10px",borderRadius:10,border:`1px solid ${C.bdr}`,background:C.fld,color:C.str,fontSize:13,fontFamily:F,outline:"none"};

  return(
    <div style={{minHeight:"100vh",background:"transparent"}}>

      {/* ── HERO ── */}
      <div style={{position:"relative",height:"100vh",minHeight:560,overflow:"hidden"}}>
        {/* Hero image */}
        <img src="/hero.png" alt="YallaVamos 2030"
          style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top"}}
          onError={e=>{e.target.style.background="linear-gradient(135deg,#0A0F1A,#1A0505)";e.target.style.opacity=1;}}
        />
        {/* Gradient overlays */}
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.65) 100%)"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to right, rgba(0,0,0,0.3) 0%, transparent 60%)"}}/>

        {/* Hero content */}
        <div style={{position:"absolute",bottom:0,left:0,right:0,padding:isDesk?"48px 64px":"32px 24px",maxWidth:700}}>
          {/* Badge */}
          <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(240,180,41,0.15)",backdropFilter:"blur(8px)",border:"1px solid rgba(240,180,41,0.35)",borderRadius:24,padding:"5px 14px",marginBottom:16}}>
            <span>⚽</span>
            <span style={{fontFamily:F,fontSize:11,fontWeight:600,color:BR.gold,letterSpacing:2,textTransform:"uppercase"}}>FIFA World Cup 2030</span>
          </div>

          {/* Title */}
          <div style={{fontFamily:"'Outfit',sans-serif",fontSize:isDesk?64:38,fontWeight:900,color:"#FFF",lineHeight:1.08,marginBottom:14,letterSpacing:-1}}>
            <span style={{color:BR.gold}}>Yalla</span>
            <span style={{color:"#FFF"}}> Vamos</span>
            <br/>
            <span style={{color:"#FFF"}}>2030</span>
          </div>

          {/* Subtitle */}
          <p style={{fontFamily:F,fontSize:isDesk?17:14,color:"rgba(255,255,255,0.82)",marginBottom:28,lineHeight:1.6,maxWidth:480}}>
            Your ultimate guide for the 2030 FIFA World Cup in Morocco, Spain & Portugal.
            Everything you need, powered by AI.
          </p>

          {/* Flags */}
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:32}}>
            {["🇲🇦","🇪🇸","🇵🇹"].map((f,i)=>(
              <span key={i} style={{fontSize:28,filter:"drop-shadow(0 2px 6px rgba(0,0,0,0.4))"}}>{f}</span>
            ))}
            <div style={{width:1,height:24,background:"rgba(255,255,255,0.3)",marginLeft:4}}/>
            <span style={{fontFamily:F,fontSize:12,color:"rgba(255,255,255,0.7)"}}>3 Countries · 6 Cities · 48 Teams</span>
          </div>

          {/* CTA buttons */}
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
            <button onClick={()=>setPage("schedule")}
              style={{padding:"13px 28px",borderRadius:12,background:`linear-gradient(135deg,${BR.red},#B50F25)`,
                border:"none",cursor:"pointer",fontFamily:F,fontWeight:600,fontSize:15,color:"#FFF",
                boxShadow:`0 8px 24px ${BR.red}55`,transition:"all .2s"}}>
              📅 View Schedule
            </button>
            <button onClick={()=>setPage("ticket")}
              style={{padding:"13px 28px",borderRadius:12,background:"rgba(255,255,255,0.12)",
                border:"1px solid rgba(255,255,255,0.35)",backdropFilter:"blur(8px)",
                cursor:"pointer",fontFamily:F,fontWeight:600,fontSize:15,color:"#FFF",transition:"all .2s"}}>
              🎟️ Get Tickets
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{position:"absolute",bottom:28,right:isDesk?40:20,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
          <div style={{width:1,height:40,background:"rgba(255,255,255,0.3)"}}/>
          <span style={{fontFamily:F,fontSize:9,color:"rgba(255,255,255,0.5)",letterSpacing:2,textTransform:"uppercase",writingMode:"vertical-rl"}}>Scroll</span>
        </div>
      </div>

      {/* ── STATS STRIP ── */}
      <div style={{background:dk?"rgba(0,0,0,0.6)":"rgba(255,255,255,0.85)",backdropFilter:"blur(20px)",borderBottom:`1px solid ${C.bdr}`,padding:"18px 32px"}}>
        <div style={{maxWidth:1200,margin:"0 auto",display:"flex",justifyContent:"space-around",flexWrap:"wrap",gap:16}}>
          {[{n:"48",l:"Équipes"},{n:"6",l:"Villes hôtes"},{n:"3",l:"Pays"},{n:"104",l:"Matchs"},{n:"115K",l:"Stade Hassan II"},{n:"2030",l:"Edition"}].map((s,i)=>(
            <div key={i} style={{textAlign:"center"}}>
              <div style={{fontFamily:F,fontSize:28,fontWeight:800,color:i%2===0?BR.red:BR.gold,lineHeight:1}}>{s.n}</div>
              <div style={{fontFamily:F,fontSize:11,color:C.mut,marginTop:3,textTransform:"uppercase",letterSpacing:1}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{maxWidth:1280,margin:"0 auto",padding:isDesk?"40px 32px":"20px 16px"}}>

        {/* Cities carousel */}
        <div style={{marginBottom:48}}>
          <div style={{textAlign:"center",marginBottom:28}}>
            <div style={{fontFamily:F,fontSize:isDesk?32:24,fontWeight:800,color:C.str}}>🇲🇦 Host Cities</div>
            <div style={{fontFamily:F,fontSize:13,color:C.mut,marginTop:6}}>6 iconic Moroccan destinations</div>
          </div>
          <div style={{position:"relative",borderRadius:20,overflow:"hidden",height:isDesk?400:260,boxShadow:C.sh}}>
            {CITIES.map((c,i)=>(
              <img key={i} src={c.img} alt={c.city}
                style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",
                  opacity:i===cityIdx?1:0,transform:i===cityIdx?"scale(1.04)":"scale(1)",
                  transition:"opacity 1.2s ease, transform 7s ease"}}/>
            ))}
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.75) 0%,transparent 55%)"}}/>
            <div style={{position:"absolute",bottom:24,left:28}}>
              <div style={{fontFamily:F,fontSize:isDesk?28:20,fontWeight:700,color:"#FFF"}}>{CITIES[cityIdx].flag} {CITIES[cityIdx].city}</div>
              <div style={{fontFamily:F,fontSize:11,color:"rgba(255,255,255,0.6)",marginTop:4,letterSpacing:2,textTransform:"uppercase"}}>Ville hôte · Maroc</div>
            </div>
            <div style={{position:"absolute",bottom:28,right:24,display:"flex",gap:6}}>
              {CITIES.map((_,i)=><div key={i} onClick={()=>setCityIdx(i)} style={{width:i===cityIdx?20:6,height:6,borderRadius:3,background:i===cityIdx?BR.gold:"rgba(255,255,255,0.35)",cursor:"pointer",transition:"all .4s"}}/>)}
            </div>
          </div>
        </div>

        {/* 3-column grid: Map / Weather+Currency / News */}
        <div style={{display:"grid",gridTemplateColumns:isDesk?"1.4fr 1fr 0.9fr":"1fr",gap:24,marginBottom:48}}>

          {/* Map */}
          <div style={{background:C.card,border:`1px solid ${C.bdr}`,borderRadius:20,padding:20,backdropFilter:"blur(16px)"}}>
            <div style={{fontFamily:F,fontSize:15,fontWeight:700,color:C.str,marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:20}}>🗺️</span> Carte des Stades
            </div>
            <SMap C={C} onSelect={s=>send(`Parle-moi du stade de ${s.city}`)} height={260}/>
          </div>

          {/* Weather + Currency */}
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div style={{background:C.card,border:`1px solid ${C.bdr}`,borderRadius:20,padding:20,backdropFilter:"blur(16px)"}}>
              <div style={{fontFamily:F,fontSize:15,fontWeight:700,color:C.str,marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:20}}>☀️</span> Météo
              </div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
                {STADIUMS.map(s=>(
                  <button key={s.city} onClick={()=>setWeatherCity(s.city)}
                    style={{padding:"3px 9px",borderRadius:20,border:`1px solid ${weatherCity===s.city?ac:C.bdr}`,
                      background:weatherCity===s.city?`${ac}18`:C.fld,color:weatherCity===s.city?ac:C.mut,
                      fontSize:10,cursor:"pointer",fontFamily:F,transition:"all .18s"}}>
                    {s.city}
                  </button>
                ))}
              </div>
              <Weather C={C} city={weatherCity}/>
            </div>
            <div style={{background:C.card,border:`1px solid ${C.bdr}`,borderRadius:20,padding:20,backdropFilter:"blur(16px)"}}>
              <div style={{fontFamily:F,fontSize:15,fontWeight:700,color:C.str,marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:20}}>💱</span> Convertisseur MAD
              </div>
              <div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap"}}>
                <input type="number" value={amt} onChange={e=>sA(e.target.value)} style={{...inpS,width:"30%",minWidth:60}}/>
                <select value={cur} onChange={e=>sCur(e.target.value)} style={{...inpS,cursor:"pointer"}}>
                  {CURRENCIES.map(c=><option key={c.c} value={c.c}>{c.s} {c.c}</option>)}
                </select>
                <span style={{color:C.mut,fontSize:16}}>→</span>
                <div style={{fontFamily:F,fontSize:20,fontWeight:700,color:BR.gold}}>{convResult} <span style={{fontSize:11,color:C.mut,fontWeight:400}}>MAD</span></div>
              </div>
            </div>
          </div>

          {/* News */}
          <div style={{background:C.card,border:`1px solid ${C.bdr}`,borderRadius:20,padding:20,backdropFilter:"blur(16px)"}}>
            <div style={{fontFamily:F,fontSize:15,fontWeight:700,color:C.str,marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:20}}>📰</span> Actualités
            </div>
            {NEWS.map((n,i)=>(
              <div key={i} onClick={()=>send(n.t)}
                style={{padding:"10px 0",borderBottom:i<NEWS.length-1?`1px solid ${C.bdr}`:"none",cursor:"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontFamily:F,fontSize:9,color:n.tc,fontWeight:600,background:`${n.tc}18`,padding:"2px 8px",borderRadius:20}}>{n.tg}</span>
                  <span style={{fontFamily:F,fontSize:9,color:C.mut}}>{n.d}</span>
                </div>
                <div style={{fontFamily:F,fontSize:12,color:C.str,lineHeight:1.4}}>{n.t}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Infos pratiques + Darija */}
        <div style={{display:"grid",gridTemplateColumns:isDesk?"1fr 1fr":"1fr",gap:24,marginBottom:48}}>
          <div style={{background:C.card,border:`1px solid ${C.bdr}`,borderRadius:20,padding:24,backdropFilter:"blur(16px)"}}>
            <div style={{fontFamily:F,fontSize:15,fontWeight:700,color:C.str,marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:20}}>ℹ️</span> Infos Pratiques
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
              {INFO_ITEMS.map((it,i)=>(
                <div key={i} style={{textAlign:"center",padding:"10px 6px",background:C.fld,borderRadius:12}}>
                  <div style={{fontSize:20,marginBottom:5}}>{it.i}</div>
                  <div style={{fontFamily:F,fontSize:13,fontWeight:700,color:C.str}}>{it.v}</div>
                  <div style={{fontFamily:F,fontSize:9,color:C.mut,marginTop:2}}>{it.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{background:C.card,border:`1px solid ${C.bdr}`,borderRadius:20,padding:24,backdropFilter:"blur(16px)"}}>
            <div style={{fontFamily:F,fontSize:15,fontWeight:700,color:C.str,marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:20}}>🗣️</span> Darija Essentiel
            </div>
            {DARIJA.map((p,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:i<DARIJA.length-1?`1px solid ${C.bdr}`:"none"}}>
                <span style={{fontFamily:F,fontSize:14,fontWeight:600,color:C.str}}>{p.d}</span>
                <span style={{fontFamily:F,fontSize:13,color:C.mut}}>{p.t[lang]||p.t.en}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI CTA banner */}
        <div style={{borderRadius:24,background:`linear-gradient(135deg,${BR.red}22,${BR.gold}11)`,border:`1px solid ${BR.red}33`,padding:isDesk?"36px 48px":"24px",textAlign:"center",marginBottom:40}}>
          <div style={{fontSize:40,marginBottom:12}}>🤖</div>
          <div style={{fontFamily:F,fontSize:isDesk?24:18,fontWeight:700,color:C.str,marginBottom:8}}>Ask MoundiGuide AI</div>
          <div style={{fontFamily:F,fontSize:14,color:C.mut,marginBottom:20}}>Your intelligent travel companion for FIFA World Cup 2030</div>
          <button onClick={()=>send("Bonjour! Comment puis-je me préparer pour le Mondial 2030?")}
            style={{padding:"12px 32px",borderRadius:12,background:`linear-gradient(135deg,${BR.red},#B50F25)`,
              border:"none",cursor:"pointer",fontFamily:F,fontWeight:600,fontSize:15,color:"#FFF",
              boxShadow:`0 8px 24px ${BR.red}44`}}>
            💬 Start Chatting
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// PAGE: TICKET
// ══════════════════════════════════════════════
function TicketPage({C,dk,F,isDesk}){
  const steps=[
    {n:"1",title:"Create FIFA Account",desc:"Register at FIFA.com with your personal details. ID verification required.",icon:"👤"},
    {n:"2",title:"Select Matches",desc:"Browse available matches and choose your preferred games and stadium.",icon:"🏟️"},
    {n:"3",title:"Choose Category",desc:"Pick from Category 1–4 based on your budget and seat preference.",icon:"🎟️"},
    {n:"4",title:"Secure Payment",desc:"Pay via FIFA secure portal. Tickets are digital — no physical tickets.",icon:"💳"},
  ];
  return(
    <div style={{minHeight:"100vh",paddingTop:68}}>

      {/* Page hero */}
      <div style={{background:`linear-gradient(135deg,#0A0F1A 0%,#1A0505 50%,#0A0F1A 100%)`,padding:isDesk?"64px 48px":"40px 20px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at center, ${BR.red}22 0%, transparent 70%)`}}/>
        <div style={{position:"relative"}}>
          <div style={{fontFamily:F,fontSize:12,fontWeight:600,color:BR.gold,letterSpacing:3,textTransform:"uppercase",marginBottom:12}}>FIFA World Cup 2030</div>
          <div style={{fontFamily:F,fontSize:isDesk?48:30,fontWeight:900,color:"#FFF",marginBottom:14}}>🎟️ Tickets</div>
          <div style={{fontFamily:F,fontSize:15,color:"rgba(255,255,255,0.65)",maxWidth:500,margin:"0 auto"}}>
            Official FIFA ticketing opens January 2029. Here's everything you need to know.
          </div>
        </div>
      </div>

      <div style={{maxWidth:1100,margin:"0 auto",padding:isDesk?"48px 32px":"24px 16px"}}>

        {/* Ticket categories */}
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{fontFamily:F,fontSize:isDesk?28:22,fontWeight:800,color:C.str}}>Ticket Categories</div>
          <div style={{fontFamily:F,fontSize:13,color:C.mut,marginTop:6}}>Prices indicatives for group stage matches</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:isDesk?"repeat(4,1fr)":"repeat(2,1fr)",gap:16,marginBottom:56}}>
          {TICKET_CATS.map((tc,i)=>(
            <div key={i} style={{background:C.card,border:`2px solid ${tc.color}33`,borderRadius:20,padding:24,backdropFilter:"blur(16px)",textAlign:"center",transition:"transform .2s,box-shadow .2s",cursor:"default"}}>
              <div style={{fontSize:32,marginBottom:10}}>{tc.icon}</div>
              <div style={{fontFamily:F,fontSize:12,fontWeight:700,color:tc.color,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{tc.cat}</div>
              <div style={{fontFamily:F,fontSize:28,fontWeight:900,color:C.str,marginBottom:8}}>{tc.price}</div>
              <div style={{fontFamily:F,fontSize:12,color:C.mut,lineHeight:1.5}}>{tc.desc}</div>
              <div style={{marginTop:16,padding:"8px 0",borderRadius:10,background:`${tc.color}18`,border:`1px solid ${tc.color}33`}}>
                <span style={{fontFamily:F,fontSize:11,fontWeight:600,color:tc.color}}>Starting price</span>
              </div>
            </div>
          ))}
        </div>

        {/* How to buy */}
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontFamily:F,fontSize:isDesk?28:22,fontWeight:800,color:C.str}}>How to Buy</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:isDesk?"repeat(4,1fr)":"repeat(2,1fr)",gap:16,marginBottom:48}}>
          {steps.map((s,i)=>(
            <div key={i} style={{background:C.card,border:`1px solid ${C.bdr}`,borderRadius:20,padding:20,backdropFilter:"blur(16px)"}}>
              <div style={{width:40,height:40,borderRadius:"50%",background:`linear-gradient(135deg,${BR.red},${BR.gold})`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F,fontSize:16,fontWeight:800,color:"#FFF",marginBottom:12}}>{s.n}</div>
              <div style={{fontSize:22,marginBottom:8}}>{s.icon}</div>
              <div style={{fontFamily:F,fontSize:13,fontWeight:700,color:C.str,marginBottom:6}}>{s.title}</div>
              <div style={{fontFamily:F,fontSize:12,color:C.mut,lineHeight:1.5}}>{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Important info */}
        <div style={{background:`linear-gradient(135deg,${BR.gold}11,${BR.red}08)`,border:`1px solid ${BR.gold}33`,borderRadius:20,padding:28,marginBottom:40}}>
          <div style={{fontFamily:F,fontSize:16,fontWeight:700,color:C.str,marginBottom:16}}>⚠️ Important Information</div>
          <div style={{display:"grid",gridTemplateColumns:isDesk?"1fr 1fr":"1fr",gap:12}}>
            {[
              "Tickets are non-transferable and linked to your FIFA ID",
              "Official sale opens January 2029 on FIFA.com",
              "Resale only via official FIFA resale platform",
              "Children under 3 enter free with a paying adult",
              "Accessible seats available in every category",
              "Digital tickets only — presented via FIFA mobile app",
            ].map((info,i)=>(
              <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                <span style={{color:BR.gold,fontSize:14,flexShrink:0}}>✦</span>
                <span style={{fontFamily:F,fontSize:13,color:C.txt,lineHeight:1.5}}>{info}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{textAlign:"center"}}>
          <a href="https://www.fifa.com/en/tournaments/mens/worldcup/2030fifaworldcup" target="_blank" rel="noopener noreferrer"
            style={{display:"inline-block",padding:"14px 36px",borderRadius:14,background:`linear-gradient(135deg,${BR.red},#B50F25)`,
              textDecoration:"none",fontFamily:F,fontWeight:700,fontSize:16,color:"#FFF",
              boxShadow:`0 10px 28px ${BR.red}44`}}>
            🌐 Visit FIFA.com for Official Tickets
          </a>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// PAGE: SCHEDULE
// ══════════════════════════════════════════════
function SchedulePage({C,dk,ac,F,send,isDesk}){
  const[phase,setPhase]=useState("all");
  const phases=[{id:"all",label:"All Matches"},{id:"G",label:"Group Stage"},{id:"8",label:"Round of 16"},{id:"Q",label:"Quarter-finals"},{id:"S",label:"Semi-finals"},{id:"F",label:"Final"}];
  const filtered=phase==="all"?MATCHES:MATCHES.filter(m=>m.ph===phase);

  return(
    <div style={{minHeight:"100vh",paddingTop:68}}>

      {/* Page hero */}
      <div style={{background:`linear-gradient(135deg,#07091A 0%,#0A1A0A 50%,#07091A 100%)`,padding:isDesk?"56px 48px":"36px 20px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at center, ${BR.green}18 0%, transparent 70%)`}}/>
        <div style={{position:"relative"}}>
          <div style={{fontFamily:F,fontSize:12,fontWeight:600,color:BR.gold,letterSpacing:3,textTransform:"uppercase",marginBottom:12}}>FIFA World Cup 2030</div>
          <div style={{fontFamily:F,fontSize:isDesk?48:30,fontWeight:900,color:"#FFF",marginBottom:14}}>📅 Match Schedule</div>
          <div style={{fontFamily:F,fontSize:15,color:"rgba(255,255,255,0.65)"}}>All matches · June – July 2030</div>
        </div>
      </div>

      <div style={{maxWidth:1200,margin:"0 auto",padding:isDesk?"40px 32px":"20px 16px"}}>

        {/* Phase filter */}
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:32,justifyContent:"center"}}>
          {phases.map(p=>(
            <button key={p.id} onClick={()=>setPhase(p.id)}
              style={{padding:"8px 18px",borderRadius:24,border:`1px solid ${phase===p.id?ac:C.bdr}`,
                background:phase===p.id?`${ac}18`:C.card,color:phase===p.id?ac:C.mut,
                fontFamily:F,fontSize:13,fontWeight:phase===p.id?600:400,cursor:"pointer",
                transition:"all .2s",backdropFilter:"blur(8px)"}}>
              {p.label}
            </button>
          ))}
        </div>

        {/* 2-column grid desktop, 1-col mobile */}
        <div style={{display:"grid",gridTemplateColumns:isDesk?"1fr 1fr":"1fr",gap:14,marginBottom:48}}>
          {filtered.map((m,i)=>(
            <div key={i}
              style={{background:C.card,border:`1px solid ${C.bdr}`,borderRadius:16,padding:"16px 20px",
                borderLeft:`4px solid ${PHASE_COLORS[m.ph]}`,backdropFilter:"blur(16px)",
                transition:"transform .2s,box-shadow .2s",cursor:"default"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <span style={{fontFamily:F,fontSize:10,fontWeight:700,color:PHASE_COLORS[m.ph],
                  background:`${PHASE_COLORS[m.ph]}18`,padding:"3px 10px",borderRadius:20}}>
                  {PHASE_LABELS[m.ph]}
                </span>
                <span style={{fontFamily:F,fontSize:11,color:C.mut}}>{m.d} · {m.tm}</span>
              </div>
              <div style={{fontFamily:F,fontSize:isDesk?16:14,fontWeight:700,color:C.str,marginBottom:6}}>
                {m.a} <span style={{color:C.mut,fontWeight:400,fontSize:13}}>vs</span> {m.b}
              </div>
              <div style={{fontFamily:F,fontSize:12,color:C.mut}}>📍 {m.c}</div>
            </div>
          ))}
        </div>

        {/* Rankings */}
        <div style={{display:"grid",gridTemplateColumns:isDesk?"1fr 1fr":"1fr",gap:24}}>
          <div style={{background:C.card,border:`1px solid ${C.bdr}`,borderRadius:20,padding:24,backdropFilter:"blur(16px)"}}>
            <div style={{fontFamily:F,fontSize:16,fontWeight:700,color:C.str,marginBottom:16}}>🏆 FIFA Rankings — 2026</div>
            {FIFA_RANKINGS.map((r)=>{
              const isHost=r.f==="🇲🇦"||r.f==="🇪🇸"||r.f==="🇵🇹";
              const medal=r.r===1?"🥇":r.r===2?"🥈":r.r===3?"🥉":null;
              return(
                <div key={r.r} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 8px",borderRadius:10,
                  marginBottom:2,background:isHost?(dk?"rgba(240,180,41,0.07)":"rgba(228,28,58,0.04)"):"transparent",
                  border:isHost?`1px solid ${BR.gold}22`:"1px solid transparent"}}>
                  <span style={{fontFamily:F,fontSize:11,fontWeight:700,color:r.r<=3?BR.gold:C.mut,width:20,textAlign:"right"}}>{medal||r.r}</span>
                  <span style={{fontSize:15}}>{r.f}</span>
                  <span style={{fontFamily:F,fontSize:12,fontWeight:isHost?700:400,color:isHost?C.str:C.txt,flex:1}}>{r.t}</span>
                  <span style={{fontFamily:F,fontSize:10,color:C.mut}}>{r.p}</span>
                  <span style={{fontSize:9,color:r.c==="up"?"#22C55E":r.c==="dn"?"#EF4444":"#666"}}>{r.c==="up"?"▲":r.c==="dn"?"▼":"•"}</span>
                </div>
              );
            })}
          </div>
          {/* News */}
          <div style={{background:C.card,border:`1px solid ${C.bdr}`,borderRadius:20,padding:24,backdropFilter:"blur(16px)"}}>
            <div style={{fontFamily:F,fontSize:16,fontWeight:700,color:C.str,marginBottom:16}}>📰 Latest News</div>
            {NEWS.map((n,i)=>(
              <div key={i} onClick={()=>send(n.t)}
                style={{padding:"12px 0",borderBottom:i<NEWS.length-1?`1px solid ${C.bdr}`:"none",cursor:"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <span style={{fontFamily:F,fontSize:9,color:n.tc,fontWeight:600,background:`${n.tc}18`,padding:"2px 8px",borderRadius:20}}>{n.tg}</span>
                  <span style={{fontFamily:F,fontSize:10,color:C.mut}}>{n.d}</span>
                </div>
                <div style={{fontFamily:F,fontSize:13,color:C.str,lineHeight:1.4}}>{n.t}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// FOOTER
// ══════════════════════════════════════════════
function Footer({C,F,setPage,dk}){
  return(
    <footer style={{background:dk?"rgba(0,0,0,0.6)":"rgba(255,255,255,0.7)",backdropFilter:"blur(16px)",borderTop:`1px solid ${C.bdr}`,padding:"32px 32px 20px"}}>
      <div style={{maxWidth:1200,margin:"0 auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:24,marginBottom:24}}>
          <div>
            <MoundiLogo size={36} textColor={dk?"#FFF":"#07091A"}/>
            <div style={{fontFamily:F,fontSize:12,color:C.mut,marginTop:10,maxWidth:280,lineHeight:1.6}}>
              Your AI-powered travel companion for the FIFA World Cup 2030 in Morocco, Spain & Portugal.
            </div>
          </div>
          <div style={{display:"flex",gap:40,flexWrap:"wrap"}}>
            <div>
              <div style={{fontFamily:F,fontSize:11,fontWeight:700,color:C.str,letterSpacing:1.5,textTransform:"uppercase",marginBottom:10}}>Navigation</div>
              {["home","ticket","schedule"].map(p=>(
                <div key={p} onClick={()=>setPage(p)}
                  style={{fontFamily:F,fontSize:13,color:C.mut,marginBottom:7,cursor:"pointer",textTransform:"capitalize",transition:"color .2s"}}>
                  {p}
                </div>
              ))}
            </div>
            <div>
              <div style={{fontFamily:F,fontSize:11,fontWeight:700,color:C.str,letterSpacing:1.5,textTransform:"uppercase",marginBottom:10}}>Host Countries</div>
              {["🇲🇦 Morocco","🇪🇸 Spain","🇵🇹 Portugal"].map((c,i)=>(
                <div key={i} style={{fontFamily:F,fontSize:13,color:C.mut,marginBottom:7}}>{c}</div>
              ))}
            </div>
          </div>
        </div>
        <div style={{height:1,background:C.bdr,marginBottom:16}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
          <div style={{fontFamily:F,fontSize:11,color:C.mut}}>© 2026 Moundi Guide · SUPMTI Rabat · All rights reserved</div>
          <div style={{display:"flex",gap:6}}>
            {[BR.red,BR.gold,BR.green,BR.blue].map((c,i)=><div key={i} style={{width:8,height:3,borderRadius:2,background:c}}/>)}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ══════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════
export default function MoundiGuide(){
  const[splash,setSplash]=useState(true);
  const[page,setPage]=useState("home");
  const[lang,setLang]=useState("fr");
  const[msgs,setMsgs]=useState([]);
  const[input,setInput]=useState("");
  const[loading,setLoading]=useState(false);
  const[showLang,setShowLang]=useState(false);
  const[themeMode,setThemeMode]=useState("system");
  const[sysDark,setSysDark]=useState(true);
  const[listening,setListening]=useState(false);
  const[isDesk,setIsDesk]=useState(typeof window!=="undefined"&&window.innerWidth>=768);
  const[chatOpen,setChatOpen]=useState(false);
  const[scrolled,setScrolled]=useState(false);
  const endRef=useRef(null);const inpRef=useRef(null);const recRef=useRef(null);

  useEffect(()=>{const mq=window.matchMedia("(prefers-color-scheme:dark)");setSysDark(mq.matches);const h=e=>setSysDark(e.matches);mq.addEventListener("change",h);return()=>mq.removeEventListener("change",h);},[]);
  useEffect(()=>{const h=()=>setIsDesk(window.innerWidth>=768);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h);},[]);
  useEffect(()=>{
    const el=document.getElementById("scroll-container");
    if(!el)return;
    const h=()=>setScrolled(el.scrollTop>60);
    el.addEventListener("scroll",h,{passive:true});
    return()=>el.removeEventListener("scroll",h);
  },[page]);
  useEffect(()=>{setScrolled(false);document.getElementById("scroll-container")?.scrollTo(0,0);},[page]);

  const dk=themeMode==="system"?sysDark:themeMode==="dark";
  const TH={
    dark:{bg:"#07091A",hdr:"rgba(7,9,26,0.92)",card:"rgba(255,255,255,0.055)",bdr:"rgba(255,255,255,0.09)",txt:"rgba(255,255,255,0.76)",str:"#FFFFFF",mut:"rgba(255,255,255,0.35)",fld:"rgba(255,255,255,0.07)",bot:"rgba(255,255,255,0.05)",bbdr:"rgba(255,255,255,0.09)",usr:`linear-gradient(135deg,${BR.red},#9E0F28)`,sh:"0 24px 64px rgba(0,0,0,0.7)",sc:"rgba(255,255,255,0.07)"},
    light:{bg:"#EDF0F7",hdr:"rgba(255,255,255,0.96)",card:"rgba(255,255,255,0.78)",bdr:"rgba(0,0,0,0.08)",txt:"rgba(0,0,0,0.70)",str:"#07091A",mut:"rgba(0,0,0,0.38)",fld:"rgba(0,0,0,0.04)",bot:"rgba(255,255,255,0.85)",bbdr:"rgba(0,0,0,0.08)",usr:`linear-gradient(135deg,${BR.red},#B5102A)`,sh:"0 16px 48px rgba(0,0,0,0.11)",sc:"rgba(0,0,0,0.06)"},
  };
  const C=dk?TH.dark:TH.light;
  const ac=dk?BR.gold:BR.red;
  const F="'Outfit'";
  const isRTL=lang==="ar";

  useEffect(()=>{setMsgs([{role:"assistant",content:WELCOME[lang]}]);},[lang]);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);
  useEffect(()=>{if(!showLang)return;const cl=()=>setShowLang(false);setTimeout(()=>document.addEventListener("click",cl),0);return()=>document.removeEventListener("click",cl);},[showLang]);

  const send=useCallback(async(text)=>{
    const t=text||input.trim();if(!t||loading)return;setInput("");setChatOpen(true);
    const nm=[...msgs,{role:"user",content:t}];setMsgs(nm);setLoading(true);
    try{const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({lang,messages:nm.map(m=>({role:m.role,content:m.content}))})});const d=await r.json();setMsgs(p=>[...p,{role:"assistant",content:d.content?.[0]?.text||d.error||"⚠️ Erreur"}]);}
    catch{setMsgs(p=>[...p,{role:"assistant",content:"⚠️ Hors-ligne"}]);}
    finally{setLoading(false);inpRef.current?.focus();}
  },[input,loading,msgs,lang]);

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
  const bgStyle=dk?{background:"radial-gradient(ellipse at 15% 0%, rgba(228,28,58,0.06) 0%, transparent 50%), radial-gradient(ellipse at 85% 100%, rgba(26,86,219,0.06) 0%, transparent 50%), #07091A"}:{background:"#EDF0F7"};

  return(
    <>
    {splash&&<Splash onDone={()=>setSplash(false)}/>}
    <div style={{height:"100vh",width:"100vw",overflow:"hidden",...bgStyle,fontFamily:F,display:"flex",flexDirection:"column"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Noto+Sans+Arabic:wght@400;600&display=swap');
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes dp{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(.7)}}
        @keyframes sp{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(228,28,58,0.45)}70%{box-shadow:0 0 0 12px rgba(228,28,58,0)}}
        @keyframes popIn{from{opacity:0;transform:scale(0.92) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:${C.sc};border-radius:4px}
        input:focus{border-color:${ac}88!important}
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
        input[type=number]{-moz-appearance:textfield}
        html,body{height:100%;width:100%}
        select option{background:${dk?"#0F1220":"#FFF"};color:${C.str}}
        a:hover{opacity:.85}
      `}</style>

      {/* Navbar — always on top */}
      <Navbar page={page} setPage={setPage} scrolled={scrolled} dk={dk} C={C}
        themeMode={themeMode} setThemeMode={setThemeMode}
        lang={lang} curLang={curLang} showLang={showLang} setShowLang={setShowLang}
        isDesk={isDesk}/>

      {/* Language overlay */}
      {showLang&&(
        <div onClick={()=>setShowLang(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(4px)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:dk?"rgba(7,9,26,0.99)":"rgba(255,255,255,0.99)",border:`1px solid ${C.bdr}`,borderRadius:20,padding:"16px 10px",minWidth:230,boxShadow:C.sh,animation:"popIn .2s ease"}}>
            <div style={{fontFamily:F,fontSize:10,fontWeight:600,color:C.mut,textAlign:"center",padding:"4px 0 12px",letterSpacing:2,textTransform:"uppercase"}}>🌍 Language</div>
            {LANGUAGES.map(l=>(
              <button key={l.code} onClick={()=>{setLang(l.code);setShowLang(false);}}
                style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 18px",background:lang===l.code?`${BR.red}10`:"transparent",border:"none",cursor:"pointer",color:lang===l.code?ac:C.txt,fontSize:13,fontFamily:F,borderRadius:10,fontWeight:lang===l.code?600:400,transition:"all .15s"}}>
                <span style={{fontSize:20}}>{l.flag}</span><span>{l.label}</span>
                {lang===l.code&&<span style={{marginLeft:"auto",color:ac}}>✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Scrollable page content */}
      <div id="scroll-container" style={{flex:1,overflowY:"auto",overflowX:"hidden"}}>
        {page==="home"    &&<HomePage    C={C} dk={dk} ac={ac} F={F} lang={lang} send={send} setPage={setPage} isDesk={isDesk}/>}
        {page==="ticket"  &&<TicketPage  C={C} dk={dk} F={F} isDesk={isDesk}/>}
        {page==="schedule"&&<SchedulePage C={C} dk={dk} ac={ac} F={F} send={send} isDesk={isDesk}/>}
        <Footer C={C} F={F} setPage={setPage} dk={dk}/>
      </div>

      {/* Floating AI Chat */}
      <ChatFloat C={C} dk={dk} lang={lang} msgs={msgs} input={input} setInput={setInput}
        loading={loading} send={send} listening={listening} toggleVoice={toggleVoice}
        chatOpen={chatOpen} setChatOpen={setChatOpen} isRTL={isRTL} ac={ac} F={F}
        endRef={endRef} inpRef={inpRef}/>
    </div>
    </>
  );
}
