// src/pages/NewsPage.jsx — MoundiGuide v3
// Thème LIGHT #F7F8FA — nouvelles fonctionnalités :
//  🔴 Breaking ticker défilant · 🔥 Trending · 📌 Favoris · 📤 Partage
//  ⏱ Temps de lecture · 12 articles · images par article · vues
// I18n : fr / en / ar (RTL) / es / pt — props ({ lang, setPage, C, F, isDesk })

import { useState, useEffect, useCallback } from "react";

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const P = {
  pageBg:"#F7F8FA", white:"#FFFFFF", dark:"#1A1F25",
  red:"#C41E3A", gold:"#D4A853", green:"#10B981", blue:"#3B82F6", purple:"#8B5CF6",
  text:"#1A1F25", muted:"#64748B", soft:"#94A3B8",
  border:"#E8ECF0", borderSoft:"#EEF0F3", surface:"#FAFAFA",
};

const CAT_COLORS = {
  Infrastructure:P.green, "Équipes":P.red, Teams:P.red, "الفرق":P.red, Equipos:P.red, Equipas:P.red,
  Billets:P.gold, Tickets:P.gold, "التذاكر":P.gold, Entradas:P.gold, Bilhetes:P.gold,
  "Fan Zones":P.purple, "مناطق المشجعين":P.purple, "Zonas de Aficionados":P.purple, "Zonas de Adeptos":P.purple,
  Transport:P.blue, "النقل":P.blue, Transporte:P.blue,
  Stades:P.red, Stadiums:P.red, "الملاعب":P.red, Estadios:P.red, "Estádios":P.red,
  "Culture":P.gold,
};

// ─── I18N ─────────────────────────────────────────────────────────────────────
const T = {
  fr:{ filters:["Tout","Infrastructure","Équipes","Billets","Fan Zones","Transport","Stades","Culture"],
    all:"Tout", heroTag:"À LA UNE", top:"À la une", agenda:"Matchs à venir",
    today:"Aujourd'hui", tomorrow:"Demain", latest:"Dernières", trending:"Tendances",
    saved:"Favoris", read:"Lire →", breaking:"DERNIÈRE MINUTE",
    loading:"Chargement des actualités...", offline:"Mode hors-ligne — sources indisponibles.",
    updated:"Mis à jour", refresh:"Rafraîchir", autoref:"Rafraîchissement auto. toutes les 5 min",
    minRead:"min de lecture", views:"vues", copied:"Lien copié !", share:"Partager", save:"Sauvegarder", unsave:"Retirer",
    ago:(s)=> s<3600?`Il y a ${Math.floor(s/60)} min`:s<86400?`Il y a ${Math.floor(s/3600)}h`:`Il y a ${Math.floor(s/86400)}j` },
  en:{ filters:["All","Infrastructure","Teams","Tickets","Fan Zones","Transport","Stadiums","Culture"],
    all:"All", heroTag:"FEATURED", top:"Top Stories", agenda:"Upcoming Matches",
    today:"Today", tomorrow:"Tomorrow", latest:"Latest", trending:"Trending",
    saved:"Saved", read:"Read →", breaking:"BREAKING",
    loading:"Loading news...", offline:"Offline mode — sources unavailable.",
    updated:"Updated", refresh:"Refresh", autoref:"Auto-refresh every 5 min",
    minRead:"min read", views:"views", copied:"Link copied!", share:"Share", save:"Save", unsave:"Remove",
    ago:(s)=> s<3600?`${Math.floor(s/60)}m ago`:s<86400?`${Math.floor(s/3600)}h ago`:`${Math.floor(s/86400)}d ago` },
  ar:{ filters:["الكل","البنية التحتية","الفرق","التذاكر","مناطق المشجعين","النقل","الملاعب","الثقافة"],
    all:"الكل", heroTag:"الأبرز", top:"أبرز الأخبار", agenda:"المباريات القادمة",
    today:"اليوم", tomorrow:"غداً", latest:"آخر الأخبار", trending:"الأكثر تداولاً",
    saved:"المحفوظات", read:"← اقرأ", breaking:"عاجل",
    loading:"جارٍ تحميل الأخبار...", offline:"وضع غير متصل — المصادر غير متاحة.",
    updated:"آخر تحديث", refresh:"تحديث", autoref:"تحديث تلقائي كل 5 دقائق",
    minRead:"دقائق قراءة", views:"مشاهدة", copied:"تم نسخ الرابط!", share:"مشاركة", save:"حفظ", unsave:"إزالة",
    ago:(s)=> s<3600?`منذ ${Math.floor(s/60)} دقيقة`:s<86400?`منذ ${Math.floor(s/3600)} ساعة`:`منذ ${Math.floor(s/86400)} يوم` },
  es:{ filters:["Todo","Infraestructura","Equipos","Entradas","Zonas de Aficionados","Transporte","Estadios","Cultura"],
    all:"Todo", heroTag:"DESTACADO", top:"Lo Más Leído", agenda:"Próximos Partidos",
    today:"Hoy", tomorrow:"Mañana", latest:"Últimas", trending:"Tendencias",
    saved:"Guardados", read:"Leer →", breaking:"ÚLTIMA HORA",
    loading:"Cargando noticias...", offline:"Modo sin conexión.",
    updated:"Actualizado", refresh:"Actualizar", autoref:"Actualización auto. cada 5 min",
    minRead:"min de lectura", views:"vistas", copied:"¡Enlace copiado!", share:"Compartir", save:"Guardar", unsave:"Quitar",
    ago:(s)=> s<3600?`Hace ${Math.floor(s/60)} min`:s<86400?`Hace ${Math.floor(s/3600)}h`:`Hace ${Math.floor(s/86400)}d` },
  pt:{ filters:["Tudo","Infraestrutura","Equipas","Bilhetes","Zonas de Adeptos","Transporte","Estádios","Cultura"],
    all:"Tudo", heroTag:"DESTAQUE", top:"Mais Lidas", agenda:"Próximos Jogos",
    today:"Hoje", tomorrow:"Amanhã", latest:"Últimas", trending:"Tendências",
    saved:"Guardados", read:"Ler →", breaking:"ÚLTIMA HORA",
    loading:"A carregar notícias...", offline:"Modo offline.",
    updated:"Atualizado", refresh:"Atualizar", autoref:"Atualização auto. a cada 5 min",
    minRead:"min de leitura", views:"visualizações", copied:"Link copiado!", share:"Partilhar", save:"Guardar", unsave:"Remover",
    ago:(s)=> s<3600?`Há ${Math.floor(s/60)} min`:s<86400?`Há ${Math.floor(s/3600)}h`:`Há ${Math.floor(s/86400)}d` },
};

// ─── BREAKING TICKER ──────────────────────────────────────────────────────────
const BREAKING = [
  "🏟️ Stade de Casablanca inauguré — 93 000 places, record africain",
  "⚽ Tirage au sort des groupes le 15 décembre 2029 à Rabat",
  "🎫 Phase 2 de la billetterie ouverte sur FIFA.com",
  "🚄 Al-Boraq : nouvelles lignes Casablanca–Marrakech confirmées",
  "🌍 5 millions de visiteurs attendus au Maroc pour le Mondial",
];

// ─── RSS SOURCES ──────────────────────────────────────────────────────────────
const SOURCES = [
  { name:"BBC Sport", flag:"🇬🇧", rss:"https://feeds.bbci.co.uk/sport/football/rss.xml", color:P.red  },
  { name:"Goal.com",  flag:"⚽",  rss:"https://www.goal.com/feeds/en/news",               color:P.gold },
  { name:"FIFA News", flag:"🏆",  rss:"https://www.fifa.com/rss/news",                    color:P.green },
];

// ─── 12 MOCK ARTICLES ─────────────────────────────────────────────────────────
const MOCK = [
  { id:"m0", category:"Infrastructure",
    title:"Le Maroc inaugure le Stade de Casablanca — 93 000 places",
    desc:"Le plus grand stade d'Afrique ouvre ses portes. Pelouse hybride, toit rétractable, 100% énergie solaire. Il accueillera la finale du Mondial 2030.",
    link:"#", pub:new Date(Date.now()-1*3600000).toISOString(),
    img:"https://flagcdn.com/w640/ma.png", views:12400, mins:4,
    src:"FIFA News", flag:"🏆", color:P.green },
  { id:"m1", category:"Équipes",
    title:"FIFA dévoile le calendrier complet de la Coupe du Monde 2030",
    desc:"104 matchs répartis sur 3 pays et 16 villes. Le match d'ouverture aura lieu à Casablanca, la finale au Stade Santiago Bernabéu.",
    link:"#", pub:new Date(Date.now()-2*3600000).toISOString(),
    img:"https://flagcdn.com/w640/ar.png", views:9800, mins:3,
    src:"Goal.com", flag:"⚽", color:P.gold },
  { id:"m2", category:"Billets",
    title:"Vente des billets : phase 2 ouverte pour les résidents marocains",
    desc:"Tarifs préférentiels pour les résidents : à partir de 150 MAD pour les matchs de groupes. Demandes sur FIFA.com jusqu'au 30 juin.",
    link:"#", pub:new Date(Date.now()-4*3600000).toISOString(),
    img:"https://flagcdn.com/w320/ma.png", views:21000, mins:2,
    src:"FIFA News", flag:"🏆", color:P.green },
  { id:"m3", category:"Fan Zones",
    title:"Marrakech : fan zone géante sur Jemaa el-Fna — 50 000 supporters",
    desc:"Écrans géants, concerts, cuisine locale. La célèbre place devient le cœur battant des supporters pendant tout le tournoi.",
    link:"#", pub:new Date(Date.now()-6*3600000).toISOString(),
    img:"https://flagcdn.com/w640/ma.png", views:7600, mins:3,
    src:"BBC Sport", flag:"🇬🇧", color:P.red },
  { id:"m4", category:"Transport",
    title:"Al-Boraq double sa fréquence — billets de match = tarif réduit",
    desc:"Le TGV marocain reliera Casablanca, Rabat, Tanger et Marrakech avec un départ toutes les 30 minutes les jours de match.",
    link:"#", pub:new Date(Date.now()-9*3600000).toISOString(),
    img:"https://flagcdn.com/w640/ma.png", views:5400, mins:2,
    src:"BBC Sport", flag:"🇬🇧", color:P.red },
  { id:"m5", category:"Stades",
    title:"Espagne : Bernabéu et Camp Nou confirmés pour le Mondial 2030",
    desc:"Six stades espagnols retenus. Le Bernabéu accueillera la finale, le Camp Nou une demi-finale.",
    link:"#", pub:new Date(Date.now()-12*3600000).toISOString(),
    img:"https://flagcdn.com/w640/es.png", views:8900, mins:3,
    src:"Goal.com", flag:"⚽", color:P.gold },
  { id:"m6", category:"Équipes",
    title:"Le Maroc annonce son centre d'entraînement à Ifrane",
    desc:"Les Lions de l'Atlas prépareront le tournoi en altitude, dans des installations flambant neuves au cœur du Moyen Atlas.",
    link:"#", pub:new Date(Date.now()-15*3600000).toISOString(),
    img:"https://flagcdn.com/w640/ma.png", views:15200, mins:4,
    src:"FIFA News", flag:"🏆", color:P.green },
  { id:"m7", category:"Culture",
    title:"Phrasebook officiel : 50 phrases en darija pour les visiteurs",
    desc:"L'Office du Tourisme publie un guide gratuit : commander un thé, négocier un taxi, demander son chemin — avec phonétique.",
    link:"#", pub:new Date(Date.now()-18*3600000).toISOString(),
    img:"https://flagcdn.com/w320/ma.png", views:11300, mins:5,
    src:"BBC Sport", flag:"🇬🇧", color:P.red },
  { id:"m8", category:"Infrastructure",
    title:"Aéroport Mohammed V : nouveau terminal dédié aux supporters",
    desc:"Capacité doublée, files dédiées par nationalité, comptoirs multilingues et navettes directes vers les stades.",
    link:"#", pub:new Date(Date.now()-22*3600000).toISOString(),
    img:"https://flagcdn.com/w640/ma.png", views:6700, mins:3,
    src:"FIFA News", flag:"🏆", color:P.green },
  { id:"m9", category:"Fan Zones",
    title:"YallaVamos : 20 000 bénévoles recherchés pour le Mondial",
    desc:"Le comité d'organisation lance le recrutement. Accueil, traduction, orientation — candidatures ouvertes aux 18-70 ans.",
    link:"#", pub:new Date(Date.now()-26*3600000).toISOString(),
    img:"https://flagcdn.com/w320/ma.png", views:18900, mins:2,
    src:"Goal.com", flag:"⚽", color:P.gold },
  { id:"m10", category:"Transport",
    title:"Plan de mobilité : navettes gratuites pour les 6 villes hôtes",
    desc:"Détenteurs de billets : transport urbain gratuit le jour du match. Tramways renforcés à Casablanca et Rabat.",
    link:"#", pub:new Date(Date.now()-30*3600000).toISOString(),
    img:"https://flagcdn.com/w640/ma.png", views:4300, mins:3,
    src:"BBC Sport", flag:"🇬🇧", color:P.red },
  { id:"m11", category:"Stades",
    title:"Portugal : l'Estádio da Luz prêt à 100%, Porto en finition",
    desc:"Quatre stades portugais validés par la FIFA. Lisbonne accueillera deux huitièmes de finale et un quart.",
    link:"#", pub:new Date(Date.now()-36*3600000).toISOString(),
    img:"https://flagcdn.com/w640/pt.png", views:7100, mins:3,
    src:"Goal.com", flag:"⚽", color:P.gold },
];

const AGENDA = {
  today:[
    { time:"18:00", flags:"🇫🇷 vs 🇸🇳", label:"France vs Sénégal", venue:"Grand Stade · Casablanca" },
    { time:"21:00", flags:"🇧🇷 vs 🇲🇽", label:"Brésil vs Mexique", venue:"Stade de Rabat" },
  ],
  tomorrow:[
    { time:"17:00", flags:"🇪🇸 vs 🇲🇦", label:"Espagne vs Maroc", venue:"Santiago Bernabéu · Madrid" },
    { time:"20:00", flags:"🇵🇹 vs 🇬🇭", label:"Portugal vs Ghana", venue:"Estádio da Luz · Lisbonne" },
  ],
};

// ─── UTILS ────────────────────────────────────────────────────────────────────
const strip = (h)=>(h||"").replace(/<[^>]*>/g,"").slice(0,150)+"…";
const fmtViews = (v)=> v>=1000 ? `${(v/1000).toFixed(1).replace(".0","")}k` : v;

async function fetchSrc(src){
  const r = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(src.rss)}&count=8`);
  const d = await r.json();
  if(d.status!=="ok") throw new Error();
  return d.items.map((it,i)=>({
    id:`${src.name}-${i}`, category:"Actualité",
    title:it.title, desc:strip(it.description||it.content||""),
    link:it.link, pub:it.pubDate,
    img:it.enclosure?.link||it.thumbnail||"",
    views:Math.floor(Math.random()*15000)+1000, mins:Math.floor(Math.random()*4)+2,
    src:src.name, flag:src.flag, color:src.color,
  }));
}

// ─── PLACEHOLDER pour images cassées ──────────────────────────────────────────
const onImgError = (e, h=190) => {
  e.target.style.display="none";
  const p = e.target.parentElement;
  if(!p) return;
  p.style.cssText += `;background:linear-gradient(135deg,#E8ECF0,#F7F8FA);display:flex;align-items:center;justify-content:center;height:${h}px;min-height:${h}px;max-height:${h}px;font-size:30px`;
  if(!p.querySelector(".ph")) { const s=document.createElement("span"); s.className="ph"; s.textContent="⚽"; p.appendChild(s); }
};

// ─── SEC LABEL ────────────────────────────────────────────────────────────────
function SecLabel({ text, right }){
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
      <div style={{width:18,height:2,background:P.red,flexShrink:0}}/>
      <span style={{fontSize:9,fontWeight:800,color:P.soft,letterSpacing:"2px",textTransform:"uppercase",whiteSpace:"nowrap"}}>{text}</span>
      <div style={{flex:1,height:1,background:P.border}}/>
      {right}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function NewsPage({ lang="fr", setPage, C, F, isDesk }){
  const t = T[lang]||T.fr;
  const isRTL = lang==="ar";

  const [articles,setArticles] = useState([]);
  const [loading,setLoading]   = useState(true);
  const [offline,setOffline]   = useState(false);
  const [lastUpd,setLastUpd]   = useState(null);
  const [filter,setFilter]     = useState(t.all);
  const [hov,setHov]           = useState(null);
  const [saved,setSaved]       = useState(()=>{ 
    try{ return JSON.parse(localStorage.getItem("mg_news_saved")||"[]"); }catch{ return []; }
  });
  const [toast,setToast]       = useState("");
  const [showSaved,setShowSaved] = useState(false);

  useEffect(()=>{ setFilter(t.all); },[lang]);
  useEffect(()=>{ try{ localStorage.setItem("mg_news_saved",JSON.stringify(saved)); }catch{} },[saved]);

  const load = useCallback(async ()=>{
    setLoading(true);
    try{
      const res = await Promise.allSettled(SOURCES.map(fetchSrc));
      const all = res.filter(r=>r.status==="fulfilled").flatMap(r=>r.value);
      if(!all.length) throw new Error();
      all.sort((a,b)=>new Date(b.pub)-new Date(a.pub));
      setArticles(all); setOffline(false);
    }catch{
      setArticles(MOCK); setOffline(true);
    }finally{ setLoading(false); setLastUpd(new Date()); }
  },[]);

  useEffect(()=>{ load(); const iv=setInterval(load,5*60*1000); return ()=>clearInterval(iv); },[load]);

  const ago = (pub)=> t.ago((Date.now()-new Date(pub))/1000);

  const toggleSave = (id,e)=>{
    e.stopPropagation();
    setSaved(s=> s.includes(id) ? s.filter(x=>x!==id) : [...s,id]);
  };

  const shareArticle = async (a,e)=>{
    e.stopPropagation();
    const url = a.link!=="#" ? a.link : window.location.href;
    try{
      if(navigator.share){ await navigator.share({title:a.title,url}); }
      else{ await navigator.clipboard.writeText(url); setToast(t.copied); setTimeout(()=>setToast(""),2000); }
    }catch{}
  };

  const base = showSaved ? articles.filter(a=>saved.includes(a.id)) : articles;
  const filtered = filter===t.all ? base : base.filter(a=>a.category===filter);
  const hero    = filtered[0];
  const stories = filtered.slice(1,5);
  const aside   = filtered.slice(5,10);
  const trending = [...articles].sort((a,b)=>(b.views||0)-(a.views||0)).slice(0,5);

  const catColor = (c)=> CAT_COLORS[c] || P.muted;

  // ── styles ──
  const page = { minHeight:"100vh", background:P.pageBg, color:P.text,
                 fontFamily:"'Inter','Arial',sans-serif", direction:isRTL?"rtl":"ltr" };

  if(loading) return (
    <div style={page}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"60vh",gap:16}}>
        <div style={{width:34,height:34,borderRadius:"50%",border:`3px solid ${P.border}`,borderTop:`3px solid ${P.red}`,animation:"spin .7s linear infinite"}}/>
        <p style={{color:P.soft,fontSize:13}}>{t.loading}</p>
      </div>
    </div>
  );

  return (
    <div style={page}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{box-shadow:0 0 0 2px rgba(196,30,58,.3)}50%{box-shadow:0 0 0 5px rgba(196,30,58,.07)}}
        @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        ::-webkit-scrollbar{display:none}
        .tickerwrap:hover .tickertrack{animation-play-state:paused}
      `}</style>

      {/* ── 🔴 BREAKING TICKER ── */}
      <div className="tickerwrap" style={{background:P.dark,display:"flex",alignItems:"center",overflow:"hidden",height:34}}>
        <div style={{background:P.red,color:P.white,fontSize:10,fontWeight:800,letterSpacing:"1px",
                     padding:"0 14px",height:"100%",display:"flex",alignItems:"center",
                     textTransform:"uppercase",flexShrink:0,zIndex:2}}>
          {t.breaking}
        </div>
        <div style={{flex:1,overflow:"hidden",position:"relative"}}>
          <div className="tickertrack" style={{display:"inline-flex",whiteSpace:"nowrap",
               animation:"ticker 40s linear infinite",gap:0}}>
            {[...BREAKING,...BREAKING].map((b,i)=>(
              <span key={i} style={{color:"#E2E8F0",fontSize:12,padding:"0 28px",lineHeight:"34px"}}>{b}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── FILTER BAR ── */}
      <div style={{background:P.white,borderBottom:`1px solid ${P.border}`,display:"flex",alignItems:"center",
                   overflowX:"auto",padding:"0 24px",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
        {t.filters.map(f=>(
          <button key={f} onClick={()=>{setFilter(f);setShowSaved(false);}}
            style={{padding:"11px 14px",background:"transparent",border:"none",
                    color:(!showSaved&&filter===f)?P.red:P.soft,fontSize:11,fontWeight:(!showSaved&&filter===f)?700:600,
                    letterSpacing:".5px",textTransform:"uppercase",cursor:"pointer",whiteSpace:"nowrap",
                    borderBottom:`2px solid ${(!showSaved&&filter===f)?P.red:"transparent"}`,transition:"all .15s",fontFamily:"inherit"}}>
            {f}
          </button>
        ))}
        {/* Favoris toggle */}
        <button onClick={()=>setShowSaved(s=>!s)}
          style={{padding:"11px 14px",background:"transparent",border:"none",
                  color:showSaved?P.red:P.soft,fontSize:11,fontWeight:showSaved?700:600,
                  letterSpacing:".5px",textTransform:"uppercase",cursor:"pointer",whiteSpace:"nowrap",
                  borderBottom:`2px solid ${showSaved?P.red:"transparent"}`,transition:"all .15s",fontFamily:"inherit",
                  display:"flex",alignItems:"center",gap:5}}>
          📌 {t.saved}{saved.length>0&&<span style={{background:P.red,color:P.white,borderRadius:8,fontSize:9,padding:"1px 6px",fontWeight:800}}>{saved.length}</span>}
        </button>
        <div style={{marginInlineStart:"auto",display:"flex",alignItems:"center",gap:10,flexShrink:0,paddingInlineStart:12}}>
          {lastUpd&&<span style={{fontSize:11,color:P.soft}}>{t.updated} {lastUpd.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>}
          <button onClick={load}
            style={{border:`1px solid ${P.border}`,background:P.white,borderRadius:6,padding:"5px 12px",
                    fontSize:11,color:P.muted,cursor:"pointer",fontFamily:"inherit"}}>
            {t.refresh}
          </button>
        </div>
      </div>

      {/* offline hint */}
      {offline&&(
        <div style={{textAlign:"end",padding:"4px 24px",fontSize:11,color:P.soft,fontStyle:"italic"}}>
          ⚠ {t.offline}
        </div>
      )}

      {/* ── HERO ── */}
      {hero&&(
        <div onClick={()=>hero.link!=="#"&&window.open(hero.link,"_blank","noopener")}
          onMouseEnter={e=>{const i=e.currentTarget.querySelector("img");if(i)i.style.transform="scale(1.03)";}}
          onMouseLeave={e=>{const i=e.currentTarget.querySelector("img");if(i)i.style.transform="scale(1)";}}
          style={{position:"relative",width:"100%",height:340,overflow:"hidden",cursor:"pointer"}}
          role="article" aria-label={hero.title}>
          <img src={hero.img} alt="" onError={e=>onImgError(e,340)}
            style={{width:"100%",height:"100%",objectFit:"cover",display:"block",filter:"brightness(.55)",transition:"transform .5s"}}/>
          <div style={{position:"absolute",inset:0,
               background:"linear-gradient(180deg,rgba(247,248,250,0) 0%,rgba(247,248,250,.15) 50%,rgba(247,248,250,.97) 100%)"}}/>
          <div style={{position:"absolute",top:0,[isRTL?"right":"left"]:0,width:4,height:"100%",background:P.red}}/>
          <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"0 28px 22px"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,flexWrap:"wrap"}}>
              <span style={{background:P.red,color:P.white,fontSize:9,fontWeight:800,letterSpacing:"1.5px",
                            padding:"3px 9px",textTransform:"uppercase"}}>{hero.flag} {t.heroTag}</span>
              <span style={{background:catColor(hero.category),color:P.white,fontSize:9,fontWeight:800,
                            letterSpacing:"1px",padding:"3px 9px",textTransform:"uppercase"}}>{hero.category}</span>
            </div>
            <h1 style={{fontSize:26,fontWeight:900,color:P.dark,lineHeight:1.25,maxWidth:640,letterSpacing:"-.3px",marginBottom:8}}>
              {hero.title}
            </h1>
            <div style={{display:"flex",alignItems:"center",gap:10,fontSize:11,color:P.muted,flexWrap:"wrap"}}>
              <span style={{color:hero.color,fontWeight:700}}>{hero.flag} {hero.src}</span>
              <span>·</span><span>{ago(hero.pub)}</span>
              <span>·</span><span>⏱ {hero.mins} {t.minRead}</span>
              <span>·</span><span>👁 {fmtViews(hero.views)} {t.views}</span>
              <button onClick={(e)=>toggleSave(hero.id,e)} aria-label={saved.includes(hero.id)?t.unsave:t.save}
                style={{border:"none",background:"transparent",cursor:"pointer",fontSize:14,
                        color:saved.includes(hero.id)?P.red:P.soft}}>
                {saved.includes(hero.id)?"📌":"📍"}
              </button>
              <button onClick={(e)=>shareArticle(hero,e)} aria-label={t.share}
                style={{border:"none",background:"transparent",cursor:"pointer",fontSize:13,color:P.soft}}>
                📤
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN 2-COL ── */}
      <div style={{display:"grid",gridTemplateColumns:isDesk!==false?"1fr 288px":"1fr",gap:20,
                   padding:"20px 24px 40px",maxWidth:1200,margin:"0 auto"}}>

        {/* LEFT */}
        <div>
          <SecLabel text={showSaved?`📌 ${t.saved}`:t.top}/>
          {stories.length===0&&!hero?(
            <p style={{color:P.soft,fontSize:13,padding:"30px 0",textAlign:"center"}}>—</p>
          ):(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gridTemplateRows:"auto auto auto",gap:10}}>

            {/* BIG CARD */}
            {stories[0]&&(()=>{ const a=stories[0]; const h=hov===a.id; return (
              <div key={a.id} onClick={()=>a.link!=="#"&&window.open(a.link,"_blank","noopener")}
                onMouseEnter={()=>setHov(a.id)} onMouseLeave={()=>setHov(null)}
                style={{gridRow:"span 3",background:P.white,overflow:"hidden",cursor:"pointer",borderRadius:4,
                        border:`1px solid ${h?P.red+"44":P.border}`,transition:"all .2s",
                        transform:h?"translateY(-2px)":"none",
                        boxShadow:h?"0 8px 28px rgba(0,0,0,.1)":"0 1px 4px rgba(0,0,0,.04)",
                        display:"flex",flexDirection:"column",animation:"slideUp .3s ease"}}>
                <div style={{overflow:"hidden",height:190,position:"relative"}}>
                  <img src={a.img} alt="" onError={e=>onImgError(e,190)}
                    style={{width:"100%",height:190,objectFit:"cover",display:"block",
                            transition:"transform .4s",transform:h?"scale(1.04)":"scale(1)"}}/>
                  <span style={{position:"absolute",top:8,[isRTL?"right":"left"]:8,
                                background:catColor(a.category),color:P.white,fontSize:8,fontWeight:800,
                                letterSpacing:"1px",padding:"2px 8px",textTransform:"uppercase"}}>{a.category}</span>
                </div>
                <div style={{padding:"13px 14px 14px",flex:1,display:"flex",flexDirection:"column"}}>
                  <span style={{fontSize:9,fontWeight:700,color:a.color,letterSpacing:".8px",
                                textTransform:"uppercase",marginBottom:5}}>{a.flag} {a.src}</span>
                  <h3 style={{fontSize:15,fontWeight:800,color:P.dark,lineHeight:1.35,margin:"4px 0",flex:1}}>{a.title}</h3>
                  <p style={{fontSize:12,color:P.muted,lineHeight:1.6,display:"-webkit-box",
                             WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden",marginBottom:10}}>{a.desc}</p>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:10,color:P.soft}}>
                    <span>🕐 {ago(a.pub)} · ⏱ {a.mins} {t.minRead}</span>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <button onClick={(e)=>toggleSave(a.id,e)}
                        style={{border:"none",background:"transparent",cursor:"pointer",fontSize:13,
                                color:saved.includes(a.id)?P.red:P.soft}}>
                        {saved.includes(a.id)?"📌":"📍"}
                      </button>
                      <button onClick={(e)=>shareArticle(a,e)}
                        style={{border:"none",background:"transparent",cursor:"pointer",fontSize:12,color:P.soft}}>📤</button>
                      <span style={{color:P.red,fontWeight:700,fontSize:10}}>{t.read}</span>
                    </div>
                  </div>
                </div>
              </div>
            );})()}

            {/* 3 SMALL CARDS */}
            {stories.slice(1).map(a=>{ const h=hov===a.id; return (
              <div key={a.id} onClick={()=>a.link!=="#"&&window.open(a.link,"_blank","noopener")}
                onMouseEnter={()=>setHov(a.id)} onMouseLeave={()=>setHov(null)}
                style={{display:"flex",gap:11,alignItems:"flex-start",background:h?P.surface:P.white,
                        padding:11,borderRadius:4,border:`1px solid ${h?P.red+"33":P.border}`,
                        cursor:"pointer",transition:"all .2s",transform:h?"translateX(-1px)":"none",
                        animation:"slideUp .3s ease"}}>
                <div style={{width:74,height:58,flexShrink:0,overflow:"hidden",borderRadius:2,position:"relative"}}>
                  <img src={a.img} alt="" onError={e=>onImgError(e,58)}
                    style={{width:74,height:58,objectFit:"cover",display:"block"}}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                    <span style={{fontSize:8,fontWeight:800,color:P.white,background:catColor(a.category),
                                  letterSpacing:".8px",textTransform:"uppercase",padding:"1px 6px",borderRadius:2}}>{a.category}</span>
                    <span style={{fontSize:9,color:P.soft}}>👁 {fmtViews(a.views)}</span>
                  </div>
                  <h3 style={{fontSize:12,fontWeight:700,color:P.dark,lineHeight:1.35,
                              display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",
                              overflow:"hidden",marginBottom:5}}>{a.title}</h3>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <span style={{fontSize:10,color:P.soft}}>🕐 {ago(a.pub)}</span>
                    <button onClick={(e)=>toggleSave(a.id,e)}
                      style={{border:"none",background:"transparent",cursor:"pointer",fontSize:12,
                              color:saved.includes(a.id)?P.red:P.soft}}>
                      {saved.includes(a.id)?"📌":"📍"}
                    </button>
                  </div>
                </div>
              </div>
            );})}
          </div>
          )}
        </div>

        {/* SIDEBAR */}
        <div style={{display:"flex",flexDirection:"column"}}>

          {/* 🔥 TRENDING */}
          <SecLabel text={`🔥 ${t.trending}`}/>
          <div style={{marginBottom:20}}>
            {trending.map((a,i)=>{ const h=hov===`tr${a.id}`; return (
              <div key={a.id} onClick={()=>a.link!=="#"&&window.open(a.link,"_blank","noopener")}
                onMouseEnter={()=>setHov(`tr${a.id}`)} onMouseLeave={()=>setHov(null)}
                style={{display:"flex",gap:10,padding:"8px 0",borderBottom:`1px solid ${P.borderSoft}`,
                        cursor:"pointer",opacity:h?.75:1,transition:"opacity .15s",alignItems:"flex-start"}}>
                <span style={{fontSize:20,fontWeight:900,color:i<3?P.red:P.border,
                              fontStyle:"italic",lineHeight:1,minWidth:24,textAlign:"center"}}>{i+1}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:11,fontWeight:700,color:P.dark,lineHeight:1.4,
                               display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",
                               overflow:"hidden",marginBottom:2}}>{a.title}</div>
                  <span style={{fontSize:10,color:P.soft}}>👁 {fmtViews(a.views)} {t.views}</span>
                </div>
              </div>
            );})}
          </div>

          {/* AGENDA */}
          <SecLabel text={t.agenda}/>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:9,fontWeight:800,letterSpacing:"2px",textTransform:"uppercase",
                         color:P.red,paddingBottom:5,marginBottom:2,borderBottom:`1px solid ${P.border}`}}>
              {t.today} · {new Date().toLocaleDateString([],{day:"numeric",month:"long"})}
            </div>
            {AGENDA.today.map((ev,i)=>(
              <div key={i} style={{display:"flex",gap:10,padding:"9px 0",borderBottom:`1px solid ${P.borderSoft}`,alignItems:"flex-start"}}>
                <span style={{fontSize:11,fontWeight:700,color:P.muted,minWidth:38,paddingTop:1}}>{ev.time}</span>
                <span style={{fontSize:13,whiteSpace:"nowrap",paddingTop:0}}>{ev.flags}</span>
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:P.dark,lineHeight:1.3}}>{ev.label}</div>
                  <div style={{fontSize:10,color:P.soft,marginTop:1}}>{ev.venue}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{marginBottom:20}}>
            <div style={{fontSize:9,fontWeight:800,letterSpacing:"2px",textTransform:"uppercase",
                         color:P.red,paddingBottom:5,marginBottom:2,borderBottom:`1px solid ${P.border}`}}>
              {t.tomorrow}
            </div>
            {AGENDA.tomorrow.map((ev,i)=>(
              <div key={i} style={{display:"flex",gap:10,padding:"9px 0",borderBottom:`1px solid ${P.borderSoft}`,alignItems:"flex-start"}}>
                <span style={{fontSize:11,fontWeight:700,color:P.muted,minWidth:38,paddingTop:1}}>{ev.time}</span>
                <span style={{fontSize:13,whiteSpace:"nowrap"}}>{ev.flags}</span>
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:P.dark,lineHeight:1.3}}>{ev.label}</div>
                  <div style={{fontSize:10,color:P.soft,marginTop:1}}>{ev.venue}</div>
                </div>
              </div>
            ))}
          </div>

          {/* LATEST */}
          <SecLabel text={t.latest}/>
          {aside.map(a=>{ const h=hov===`as${a.id}`; return (
            <div key={a.id} onClick={()=>a.link!=="#"&&window.open(a.link,"_blank","noopener")}
              onMouseEnter={()=>setHov(`as${a.id}`)} onMouseLeave={()=>setHov(null)}
              style={{display:"flex",gap:10,padding:"9px 0",borderBottom:`1px solid ${P.borderSoft}`,
                      cursor:"pointer",opacity:h?.72:1,transition:"opacity .15s"}}>
              <div style={{width:56,height:44,flexShrink:0,overflow:"hidden",borderRadius:2}}>
                <img src={a.img} alt="" onError={e=>onImgError(e,44)}
                  style={{width:56,height:44,objectFit:"cover",display:"block"}}/>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:11,fontWeight:700,color:P.dark,lineHeight:1.4,
                             display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",
                             overflow:"hidden",marginBottom:2}}>{a.title}</div>
                <div style={{fontSize:10,color:P.soft}}>🕐 {ago(a.pub)} · ⏱ {a.mins} {t.minRead}</div>
              </div>
            </div>
          );})}
        </div>
      </div>

      {/* TOAST */}
      {toast&&(
        <div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",
                     background:P.dark,color:P.white,fontSize:12,fontWeight:600,
                     padding:"10px 20px",borderRadius:8,zIndex:1000,
                     boxShadow:"0 8px 24px rgba(0,0,0,.25)",animation:"slideUp .25s ease"}}>
          ✓ {toast}
        </div>
      )}

      {/* FOOTER */}
      <div style={{borderTop:`1px solid ${P.border}`,background:P.white,padding:"11px 24px",
                   display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:10,color:P.soft}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:6}}>
          <span style={{display:"inline-block",width:5,height:5,borderRadius:"50%",
                        background:P.red,animation:"pulse 1.5s infinite"}}/>
          {t.autoref}
        </div>
        <div style={{display:"flex",gap:14}}>
          {SOURCES.map(s=>(
            <span key={s.name} style={{color:s.color,fontWeight:700,fontSize:10}}>{s.flag} {s.name}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
