import { useState, useEffect, useCallback } from "react";
import { F } from "../constants.js";

// ── Palette — light theme only, never use C prop for colors ──────────────────
const P = {
  bg:"#F7F8FA", w:"#FFFFFF", br:"#E8ECF0",
  tx:"#1A1F25", mu:"#64748B", so:"#94A3B8",
  re:"#C41E3A", go:"#D4A853", gn:"#10B981",
};

// ── Translations ─────────────────────────────────────────────────────────────
const NT = {
  fr:{all:"Tout",upd:"Mis à jour",ref:"Rafraîchir",offl:"Mode hors-ligne — sources indisponibles.",feat:"À LA UNE",more:"Lire →",empty:"Aucun article dans cette catégorie.",auto:"Rafraîchissement auto. toutes les 5 min",top:"À la une",agenda:"Matchs à venir",latest:"Dernières nouvelles",src:"Sources",today:"Aujourd'hui",tmw:"Demain"},
  en:{all:"All",upd:"Updated",ref:"Refresh",offl:"Offline — sources unavailable.",feat:"FEATURED",more:"Read →",empty:"No articles in this category.",auto:"Auto-refresh every 5 min",top:"Featured",agenda:"Upcoming Matches",latest:"Latest News",src:"Sources",today:"Today",tmw:"Tomorrow"},
  ar:{all:"الكل",upd:"تحديث",ref:"تحديث",offl:"غير متصل — المصادر غير متاحة.",feat:"الأبرز",more:"اقرأ ←",empty:"لا توجد مقالات في هذه الفئة.",auto:"تحديث تلقائي كل 5 دقائق",top:"الأبرز",agenda:"المباريات القادمة",latest:"آخر الأخبار",src:"المصادر",today:"اليوم",tmw:"غداً"},
  es:{all:"Todo",upd:"Actualizado",ref:"Actualizar",offl:"Sin conexión — fuentes no disponibles.",feat:"DESTACADO",more:"Leer →",empty:"Sin artículos en esta categoría.",auto:"Actualización automática cada 5 min",top:"Destacado",agenda:"Próximos Partidos",latest:"Últimas Noticias",src:"Fuentes",today:"Hoy",tmw:"Mañana"},
  pt:{all:"Tudo",upd:"Atualizado",ref:"Atualizar",offl:"Offline — fontes indisponíveis.",feat:"DESTAQUE",more:"Ler →",empty:"Sem artigos nesta categoria.",auto:"Atualização automática a cada 5 min",top:"Destaque",agenda:"Próximos Jogos",latest:"Últimas Notícias",src:"Fontes",today:"Hoje",tmw:"Amanhã"},
  zh:{all:"全部",upd:"更新",ref:"刷新",offl:"离线模式 — 无法连接来源。",feat:"置顶",more:"阅读 →",empty:"此分类暂无文章。",auto:"每5分钟自动刷新",top:"置顶",agenda:"即将到来的比赛",latest:"最新新闻",src:"来源",today:"今天",tmw:"明天"},
};

// ── Category filter tabs ──────────────────────────────────────────────────────
const CATS = {
  fr:["Tout","Infrastructure","Équipes","Billets","Fan Zones","Transport","Stades"],
  en:["All","Infrastructure","Teams","Tickets","Fan Zones","Transport","Stadiums"],
  ar:["الكل","البنية التحتية","الفرق","التذاكر","مناطق المشجعين","النقل","الملاعب"],
  es:["Todo","Infraestructura","Equipos","Entradas","Zonas Fan","Transporte","Estadios"],
  pt:["Tudo","Infraestrutura","Equipas","Bilhetes","Zonas Fan","Transporte","Estádios"],
  zh:["全部","基础设施","球队","门票","球迷区","交通","体育场"],
};
const CTAGS = [null,"Infra","FIFA","Billets","Bénévol.","Transport",null];
const tl = (tag, cats) => { const i = CTAGS.indexOf(tag); return i > -1 ? cats[i] : tag; };

// ── RSS sources ───────────────────────────────────────────────────────────────
const R2J = "https://api.rss2json.com/v1/api.json?rss_url=";
const SOURCES = [
  { name:"BBC Sport", rss:"https://feeds.bbci.co.uk/sport/football/rss.xml" },
  { name:"Goal.com",  rss:"https://www.goal.com/feeds/en/news" },
  { name:"FIFA.com",  rss:"https://www.fifa.com/en/news.rss" },
];

// ── Static agenda ─────────────────────────────────────────────────────────────
const AGENDA = [
  { g:"today",    t:"18:00", hf:"🇫🇷", af:"🇸🇳", h:"France",   a:"Sénégal", v:"Barcelone" },
  { g:"today",    t:"21:00", hf:"🇧🇷", af:"🇲🇽", h:"Brésil",   a:"Mexique",  v:"Madrid" },
  { g:"tomorrow", t:"17:00", hf:"🇪🇸", af:"🇲🇦", h:"Espagne",  a:"Maroc",    v:"Rabat" },
  { g:"tomorrow", t:"21:00", hf:"🇵🇹", af:"🇬🇭", h:"Portugal", a:"Ghana",    v:"Lisbonne" },
];

// ── Mock articles (WC 2030 themed fallback) ───────────────────────────────────
const MOCK = [
  { id:"m0", title:"Le Maroc inaugure le Stade de Casablanca — 93 000 places",       tag:"Infra",     tc:"#C41E3A", date:"12 juin", src:"MoundiGuide", thumb:"https://flagcdn.com/w640/ma.png" },
  { id:"m1", title:"FIFA dévoile le calendrier complet de la Coupe du Monde 2030",   tag:"FIFA",      tc:"#10B981", date:"11 juin", src:"FIFA.com",    thumb:"https://flagcdn.com/w640/ar.png" },
  { id:"m2", title:"Vente des billets : phase 2 ouverte pour les 8 stades marocains",tag:"Billets",   tc:"#D4A853", date:"10 juin", src:"BBC Sport",   thumb:"https://flagcdn.com/w320/ma.png" },
  { id:"m3", title:"Les fan zones de Marrakech accueilleront 40 000 supporters",     tag:"Bénévol.",  tc:"#1A56DB", date:"10 juin", src:"Goal.com",    thumb:"https://flagcdn.com/w640/ma.png" },
  { id:"m4", title:"Liaison ferroviaire Casablanca–Rabat prête pour le Mondial",     tag:"Transport", tc:"#7C3AED", date:"9 juin",  src:"MoundiGuide", thumb:"https://flagcdn.com/w640/ma.png" },
  { id:"m5", title:"Benzema et Mbappé confirmés dans leurs sélections pour 2030",    tag:"FIFA",      tc:"#10B981", date:"9 juin",  src:"BBC Sport",   thumb:"https://flagcdn.com/w640/es.png" },
];

// ── SecLabel ──────────────────────────────────────────────────────────────────
function SecLabel({ label, font }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
      <div style={{ width:18, height:3, background:P.re, borderRadius:2, flexShrink:0 }} />
      <span style={{ fontFamily:font, fontSize:10, fontWeight:800, color:P.re, letterSpacing:2.5, textTransform:"uppercase" }}>
        {label}
      </span>
      <div style={{ flex:1, height:1, background:P.br }} />
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function NewsPage({ lang, setPage, C, F: Fp, isDesk }) {
  const font = Fp || F;
  const T    = NT[lang] || NT.fr;
  const rtl  = lang === "ar";
  const cats = CATS[lang] || CATS.fr;
  const navH = isDesk ? 64 : 52;

  const [cat,     setCat    ] = useState(0);
  const [arts,    setArts   ] = useState(MOCK);
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(false);
  const [upd,     setUpd    ] = useState(null);

  const doFetch = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${R2J}${encodeURIComponent(SOURCES[0].rss)}&count=20`);
      const json = await res.json();
      if (json.status === "ok" && json.items?.length) {
        setArts(json.items.slice(0, 12).map((it, i) => ({
          id:    `r${i}`,
          title: it.title?.replace(/&amp;/g, "&").replace(/&quot;/g, '"').trim() || "",
          tag:   "FIFA", tc: P.re,
          date:  new Date(it.pubDate).toLocaleDateString("fr-FR", { day:"numeric", month:"short" }),
          src:   SOURCES[0].name,
          thumb: it.thumbnail || it.enclosure?.link || null,
          link:  it.link || null,
        })));
        setOffline(false);
      } else throw 0;
    } catch {
      setArts(MOCK);
      setOffline(true);
    }
    setLoading(false);
    setUpd(new Date().toLocaleTimeString(rtl ? "ar" : "fr-FR", { hour:"2-digit", minute:"2-digit" }));
  }, [rtl]);

  useEffect(() => {
    doFetch();
    const id = setInterval(doFetch, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [doFetch]);

  const filtered = cat === 0 ? arts : CTAGS[cat] ? arts.filter(a => a.tag === CTAGS[cat]) : [];
  const big    = filtered[0] || null;
  const small  = filtered.slice(1, 4);
  const aside  = arts.slice(0, 6);
  const heroSrc = big?.thumb || "/MARRAKECH-CITY.webp";

  // Inline hover helpers (can't use CSS :hover with inline styles)
  const lift  = e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,.09)"; };
  const drop  = e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; };
  const dim   = e => { e.currentTarget.style.opacity = ".72"; };
  const undim = e => { e.currentTarget.style.opacity = "1"; };

  return (
    <div style={{ minHeight:"100dvh", background:P.bg, fontFamily:font, paddingTop:navH, direction:rtl?"rtl":"ltr", overflowX:"hidden" }}>

      {/* ── Filter bar ── */}
      <div style={{ background:P.w, borderBottom:`1px solid ${P.br}`, boxShadow:"0 1px 4px rgba(0,0,0,.04)", position:"sticky", top:navH, zIndex:100, overflowX:"auto", scrollbarWidth:"none" }}>
        <div style={{ display:"flex", alignItems:"center", maxWidth:1040, margin:"0 auto", padding:"0 24px" }}>
          {cats.map((lb, i) => (
            <button key={i} onClick={() => setCat(i)} style={{
              background:"none", border:"none", cursor:"pointer",
              fontFamily:font, fontSize:13, fontWeight:cat===i ? 700 : 400,
              color:cat===i ? P.re : P.mu,
              padding:"11px 14px", whiteSpace:"nowrap", flexShrink:0,
              borderBottom:cat===i ? `2px solid ${P.re}` : "2px solid transparent",
              transition:"color .15s, border-color .15s",
            }}>
              {lb}
            </button>
          ))}
          <div style={{ [rtl?"marginRight":"marginLeft"]:"auto", display:"flex", alignItems:"center", gap:8, padding:"0 4px", flexShrink:0 }}>
            {upd && <span style={{ fontFamily:font, fontSize:11, color:P.so, whiteSpace:"nowrap" }}>{T.upd} {upd}</span>}
            <button onClick={doFetch} disabled={loading} style={{
              background:"none", border:`1px solid ${P.br}`, borderRadius:6,
              padding:"4px 10px", cursor:loading?"default":"pointer",
              fontFamily:font, fontSize:11, color:loading ? P.so : P.mu,
            }}>
              {loading ? "⟳" : T.ref}
            </button>
          </div>
        </div>
      </div>

      {/* ── Offline notice ── */}
      {offline && (
        <div style={{ textAlign:"right", padding:"4px 24px" }}>
          <span style={{ fontFamily:font, fontSize:11, color:P.so, fontStyle:"italic" }}>⚠ {T.offl}</span>
        </div>
      )}

      {/* ── Hero ── */}
      {big && (
        <div style={{ position:"relative", height:360, overflow:"hidden" }}>
          <img
            src={heroSrc} alt={big.title}
            style={{ width:"100%", height:"100%", objectFit:"cover", filter:"brightness(.55)", display:"block" }}
            onError={e => { e.target.src = "/MARRAKECH-CITY.webp"; }}
          />
          {/* gradient fades to page bg — NOT black */}
          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"62%", background:`linear-gradient(to bottom, transparent, ${P.bg})` }} />
          {/* red left stripe */}
          <div style={{ position:"absolute", [rtl?"right":"left"]:0, top:0, bottom:0, width:4, background:P.re }} />
          {/* title on the light gradient area */}
          <div style={{ position:"absolute", bottom:0, [rtl?"right":"left"]:0, [rtl?"left":"right"]:0, padding:isDesk ? "0 32px 22px" : "0 20px 18px" }}>
            <span style={{ display:"inline-block", background:`${P.re}18`, color:P.re, fontFamily:font, fontSize:9, fontWeight:800, letterSpacing:1.8, textTransform:"uppercase", padding:"3px 10px", borderRadius:20, marginBottom:8 }}>
              {T.feat}
            </span>
            <h2 style={{ fontFamily:font, fontSize:isDesk?22:17, fontWeight:800, color:P.tx, margin:"0 0 6px", lineHeight:1.3, maxWidth:isDesk?700:"100%" }}>
              {big.title}
            </h2>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontFamily:font, fontSize:11, color:P.mu }}>{big.src} · {big.date}</span>
              <span style={{ fontFamily:font, fontSize:12, color:P.re, fontWeight:600 }}>{T.more}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Main grid ── */}
      <div style={{ maxWidth:1040, margin:"0 auto", padding:isDesk ? "20px 24px 0" : "16px 16px 0", display:"grid", gridTemplateColumns:isDesk ? "1fr 288px" : "1fr", gap:20 }}>

        {/* LEFT: stories ─── */}
        <div>
          <SecLabel label={T.top} font={font} />
          {filtered.length === 0 ? (
            <div style={{ textAlign:"center", padding:"48px 0", fontFamily:font, fontSize:14, color:P.so }}>{T.empty}</div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:isDesk ? "repeat(2,1fr)" : "1fr", gap:12 }}>

              {/* Big card — spans 3 rows on desktop */}
              {big && (
                <div onMouseEnter={lift} onMouseLeave={drop} style={{ gridRow:isDesk?"1/span 3":"auto", background:P.w, borderRadius:4, border:`1px solid ${P.br}`, overflow:"hidden", cursor:"pointer", transition:"transform .2s, box-shadow .2s" }}>
                  <div style={{ height:190, position:"relative", overflow:"hidden", background:`linear-gradient(135deg,${big.tc}28,${big.tc}55)` }}>
                    {big.thumb && <img src={big.thumb} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} onError={e=>{e.target.style.display="none";const p=e.target.parentElement;p.style.height="190px";p.style.minHeight="190px";p.style.maxHeight="190px";p.style.background="linear-gradient(135deg,#E8ECF0,#F7F8FA)";p.style.display="flex";p.style.alignItems="center";p.style.justifyContent="center";p.style.fontSize="32px";p.innerHTML="<span>⚽</span>";}} />}
                    <div style={{ position:"absolute", [rtl?"right":"left"]:0, top:0, bottom:0, width:3, background:big.tc }} />
                  </div>
                  <div style={{ padding:"14px 16px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
                      <span style={{ background:`${big.tc}18`, color:big.tc, fontFamily:font, fontSize:9, fontWeight:700, letterSpacing:1.2, textTransform:"uppercase", padding:"2px 8px", borderRadius:20 }}>
                        {tl(big.tag, cats)}
                      </span>
                      <span style={{ fontFamily:font, fontSize:11, color:P.so }}>{big.date}</span>
                    </div>
                    <p style={{ fontFamily:font, fontSize:15, fontWeight:700, color:P.tx, margin:"0 0 10px", lineHeight:1.4 }}>{big.title}</p>
                    <span style={{ fontFamily:font, fontSize:12, color:P.re, fontWeight:600 }}>{T.more}</span>
                  </div>
                </div>
              )}

              {/* Small cards — 74×58 thumbnail rows */}
              {small.map(it => (
                <div key={it.id} onMouseEnter={lift} onMouseLeave={drop} style={{ background:P.w, borderRadius:4, border:`1px solid ${P.br}`, display:"flex", gap:10, padding:"10px", cursor:"pointer", overflow:"hidden", transition:"transform .2s, box-shadow .2s" }}>
                  <div style={{ width:74, height:58, borderRadius:4, flexShrink:0, overflow:"hidden", background:`linear-gradient(135deg,${it.tc}22,${it.tc}50)` }}>
                    {it.thumb && <img src={it.thumb} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} onError={e=>{e.target.style.display="none";const p=e.target.parentElement;p.style.background="linear-gradient(135deg,#E8ECF0,#F7F8FA)";p.style.display="flex";p.style.alignItems="center";p.style.justifyContent="center";p.style.fontSize="32px";p.innerHTML="<span>⚽</span>";}} />}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <span style={{ background:`${it.tc}18`, color:it.tc, fontFamily:font, fontSize:9, fontWeight:700, letterSpacing:1, textTransform:"uppercase", padding:"2px 7px", borderRadius:12 }}>
                      {tl(it.tag, cats)}
                    </span>
                    <p style={{ fontFamily:font, fontSize:12, fontWeight:600, color:P.tx, margin:"5px 0 3px", lineHeight:1.35, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
                      {it.title}
                    </p>
                    <span style={{ fontFamily:font, fontSize:10, color:P.so }}>{it.date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: agenda + latest (desktop only) ─── */}
        {isDesk && (
          <div style={{ display:"flex", flexDirection:"column", gap:24 }}>

            {/* Agenda */}
            <div>
              <SecLabel label={T.agenda} font={font} />
              <div style={{ background:P.w, borderRadius:4, border:`1px solid ${P.br}`, overflow:"hidden" }}>
                {["today","tomorrow"].map(grp => {
                  const items = AGENDA.filter(a => a.g === grp);
                  if (!items.length) return null;
                  return (
                    <div key={grp}>
                      <div style={{ padding:"7px 14px 5px", fontFamily:font, fontSize:10, fontWeight:700, color:P.so, letterSpacing:1.5, textTransform:"uppercase", background:P.bg, borderBottom:`1px solid ${P.br}` }}>
                        {grp === "today" ? T.today : T.tmw}
                      </div>
                      {items.map((m, i) => (
                        <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderBottom:i < items.length-1 ? `1px solid #EEF0F3` : "none" }}>
                          <span style={{ fontFamily:font, fontSize:11, color:P.mu, flexShrink:0, minWidth:42, fontWeight:600 }}>{m.t}</span>
                          <div style={{ flex:1 }}>
                            <div style={{ fontFamily:font, fontSize:12, fontWeight:700, color:P.tx }}>{m.hf} {m.h} — {m.af} {m.a}</div>
                            <div style={{ fontFamily:font, fontSize:10, color:P.so }}>{m.v}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Latest news */}
            <div>
              <SecLabel label={T.latest} font={font} />
              {aside.map((it, i) => (
                <div key={it.id} onMouseEnter={dim} onMouseLeave={undim} style={{ display:"flex", gap:10, padding:"10px 0", borderBottom:i < aside.length-1 ? `1px solid ${P.br}` : "none", cursor:"pointer", transition:"opacity .15s" }}>
                  <div style={{ width:56, height:44, borderRadius:4, flexShrink:0, overflow:"hidden", background:`linear-gradient(135deg,${it.tc}22,${it.tc}50)` }}>
                    {it.thumb && <img src={it.thumb} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} onError={e=>{e.target.style.display="none";const p=e.target.parentElement;p.style.background="linear-gradient(135deg,#E8ECF0,#F7F8FA)";p.style.display="flex";p.style.alignItems="center";p.style.justifyContent="center";p.style.fontSize="32px";p.innerHTML="<span>⚽</span>";}} />}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontFamily:font, fontSize:12, fontWeight:600, color:P.tx, margin:"0 0 3px", lineHeight:1.35, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
                      {it.title}
                    </p>
                    <span style={{ fontFamily:font, fontSize:10, color:P.so }}>{it.src} · {it.date}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div style={{ maxWidth:1040, margin:"24px auto 0", padding:isDesk ? "14px 24px 32px" : "12px 16px 24px", background:P.w, borderTop:`1px solid ${P.br}`, display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:P.re, animation:"blink 1.4s ease-in-out infinite", flexShrink:0 }} />
          <span style={{ fontFamily:font, fontSize:11, color:P.mu }}>{T.auto}</span>
        </div>
        <div style={{ [rtl?"marginRight":"marginLeft"]:"auto", display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
          <span style={{ fontFamily:font, fontSize:10, color:P.so }}>{T.src}:</span>
          {SOURCES.map((s, i) => (
            <span key={i} style={{ fontFamily:font, fontSize:10, color:P.mu, fontWeight:500 }}>
              {s.name}{i < SOURCES.length-1 ? " ·" : ""}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}
