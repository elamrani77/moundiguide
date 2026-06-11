import { useState } from "react";
import { NEWS, F } from "../constants.js";

// ── Local translations (self-contained, no TRANSLATIONS dependency) ───────────
const NT = {
  fr: {
    page_title:    "Actualités",
    page_subtitle: "Coupe du Monde FIFA 2030 · Maroc · Espagne · Portugal",
    updated_at:    "Mis à jour",
    refresh_btn:   "Rafraîchir",
    loading_text:  "Chargement des actualités...",
    offline_banner:"Actualités en mode hors-ligne — connexion aux sources indisponible.",
    featured_label:"À LA UNE",
    read_more:     "Lire →",
    empty_state:   "Aucun article dans cette catégorie.",
    auto_refresh:  "Rafraîchissement automatique toutes les 5 min",
    breaking:      "EN DIRECT",
    art_one:       "article",
    art_many:      "articles",
  },
  en: {
    page_title:    "News",
    page_subtitle: "FIFA World Cup 2030 · Morocco · Spain · Portugal",
    updated_at:    "Updated",
    refresh_btn:   "Refresh",
    loading_text:  "Loading news...",
    offline_banner:"Offline mode — sources unavailable.",
    featured_label:"FEATURED",
    read_more:     "Read →",
    empty_state:   "No articles in this category.",
    auto_refresh:  "Auto-refresh every 5 min",
    breaking:      "LIVE",
    art_one:       "article",
    art_many:      "articles",
  },
  ar: {
    page_title:    "الأخبار",
    page_subtitle: "كأس العالم FIFA 2030 · المغرب · إسبانيا · البرتغال",
    updated_at:    "آخر تحديث",
    refresh_btn:   "تحديث",
    loading_text:  "جارٍ تحميل الأخبار...",
    offline_banner:"وضع غير متصل — المصادر غير متاحة.",
    featured_label:"الأبرز",
    read_more:     "اقرأ ←",
    empty_state:   "لا توجد مقالات في هذه الفئة.",
    auto_refresh:  "تحديث تلقائي كل 5 دقائق",
    breaking:      "مباشر",
    art_one:       "مقال",
    art_many:      "مقالات",
  },
  es: {
    page_title:    "Noticias",
    page_subtitle: "Copa del Mundo FIFA 2030 · Marruecos · España · Portugal",
    updated_at:    "Actualizado",
    refresh_btn:   "Actualizar",
    loading_text:  "Cargando noticias...",
    offline_banner:"Modo sin conexión — fuentes no disponibles.",
    featured_label:"DESTACADO",
    read_more:     "Leer →",
    empty_state:   "No hay artículos en esta categoría.",
    auto_refresh:  "Actualización automática cada 5 min",
    breaking:      "EN DIRECTO",
    art_one:       "artículo",
    art_many:      "artículos",
  },
  pt: {
    page_title:    "Notícias",
    page_subtitle: "Copa do Mundo FIFA 2030 · Marrocos · Espanha · Portugal",
    updated_at:    "Atualizado",
    refresh_btn:   "Atualizar",
    loading_text:  "A carregar notícias...",
    offline_banner:"Modo offline — fontes indisponíveis.",
    featured_label:"DESTAQUE",
    read_more:     "Ler →",
    empty_state:   "Sem artigos nesta categoria.",
    auto_refresh:  "Atualização automática a cada 5 min",
    breaking:      "AO VIVO",
    art_one:       "artigo",
    art_many:      "artigos",
  },
  zh: {
    page_title:    "新闻",
    page_subtitle: "FIFA 2030世界杯 · 摩洛哥 · 西班牙 · 葡萄牙",
    updated_at:    "更新于",
    refresh_btn:   "刷新",
    loading_text:  "正在加载新闻...",
    offline_banner:"离线模式 — 无法连接来源。",
    featured_label:"置顶",
    read_more:     "阅读 →",
    empty_state:   "此分类暂无文章。",
    auto_refresh:  "每5分钟自动刷新",
    breaking:      "直播",
    art_one:       "篇文章",
    art_many:      "篇文章",
  },
};

// ── Category tabs: labels + mapping to NEWS tg filter keys ────────────────────
// Index: 0=all 1=Infra 2=Teams 3=Tickets 4=FanZones 5=Transport 6=Stadiums
const CATEGORIES = {
  fr: ["Tout",  "Infrastructure", "Équipes",  "Billets",  "Fan Zones",              "Transport", "Stades"],
  en: ["All",   "Infrastructure", "Teams",    "Tickets",  "Fan Zones",              "Transport", "Stadiums"],
  ar: ["الكل",  "البنية التحتية", "الفرق",   "التذاكر",  "مناطق المشجعين",         "النقل",     "الملاعب"],
  es: ["Todo",  "Infraestructura","Equipos",  "Entradas", "Zonas de Aficionados",   "Transporte","Estadios"],
  pt: ["Tudo",  "Infraestrutura", "Equipas",  "Bilhetes", "Zonas de Adeptos",       "Transporte","Estádios"],
  zh: ["全部",  "基础设施",        "球队",     "门票",      "球迷区",                 "交通",       "体育场"],
};

// Maps each category index to the NEWS item tg value used for filtering.
// null = category exists but no matching articles yet (shows empty_state).
const CAT_TAG_KEYS = [null, "Infra", "FIFA", "Billets", "Bénévol.", "Transport", null];

// Also used to show translated tag labels on each news card
function buildTagLabel(tg, catLabels) {
  const idx = CAT_TAG_KEYS.indexOf(tg);
  return idx > -1 ? catLabels[idx] : tg;
}

export default function NewsPage({ lang, setPage, C, F: Fprop, isDesk }) {
  const font   = Fprop || F;
  const T      = NT[lang] || NT.fr;
  const isRTL  = lang === "ar";
  const cats   = CATEGORIES[lang] || CATEGORIES.fr;

  const [activeCat, setActiveCat] = useState(0); // index into cats / CAT_TAG_KEYS

  const filtered = activeCat === 0
    ? NEWS
    : CAT_TAG_KEYS[activeCat]
      ? NEWS.filter(n => n.tg === CAT_TAG_KEYS[activeCat])
      : [];

  return (
    <div style={{
      minHeight: "100dvh",
      background: "#121414",
      fontFamily: font,
      paddingTop: isDesk ? 80 : 68,
      paddingBottom: 80,
      overflowX: "hidden",
      direction: isRTL ? "rtl" : "ltr",
    }}>

      {/* ── Header ── */}
      <div style={{
        background: "linear-gradient(135deg,#C41E3A 0%,#8B0000 50%,#1a0606 100%)",
        padding: isDesk ? "44px 48px 36px" : "28px 20px 24px",
      }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{
              width: 7, height: 7, borderRadius: "50%", background: "#FFF",
              animation: "blink 1.2s ease-in-out infinite",
            }}/>
            <span style={{
              fontFamily: font, fontSize: 10, fontWeight: 800,
              color: "rgba(255,255,255,0.75)", letterSpacing: 2.5,
              textTransform: "uppercase",
            }}>
              {T.breaking}
            </span>
          </div>
          <h1 style={{
            fontFamily: font, fontSize: isDesk ? 34 : 24,
            fontWeight: 800, color: "#FFF",
            margin: "0 0 6px", lineHeight: 1.15,
          }}>
            {T.page_title}
          </h1>
          <p style={{
            fontFamily: font, fontSize: 13,
            color: "rgba(255,255,255,0.6)", margin: 0,
          }}>
            {T.page_subtitle}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1040, margin: "0 auto", padding: isDesk ? "0 48px" : "0 16px" }}>

        {/* ── Category filter tabs ── */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "20px 0 4px" }}>
          {cats.map((label, idx) => (
            <button key={idx}
              onClick={() => setActiveCat(idx)}
              style={{
                padding: "6px 18px", borderRadius: 20,
                border: activeCat === idx ? "none" : "1px solid rgba(255,255,255,0.12)",
                background: activeCat === idx ? "#C41E3A" : "transparent",
                color: activeCat === idx ? "#FFF" : "rgba(255,255,255,0.5)",
                fontFamily: font, fontSize: 12, fontWeight: activeCat === idx ? 700 : 400,
                cursor: "pointer", transition: "all .18s",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Article count ── */}
        <div style={{
          fontFamily: font, fontSize: 11, color: "rgba(255,255,255,0.3)",
          marginBottom: 14, marginTop: 10, letterSpacing: 0.5,
        }}>
          {filtered.length} {filtered.length === 1 ? T.art_one : T.art_many}
        </div>

        {/* ── Empty state ── */}
        {filtered.length === 0 && (
          <div style={{
            textAlign: "center", padding: "48px 20px",
            fontFamily: font, fontSize: 14, color: "rgba(255,255,255,0.35)",
            lineHeight: 1.6,
          }}>
            {T.empty_state}
          </div>
        )}

        {/* ── News grid ── */}
        {filtered.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: isDesk ? "repeat(2,1fr)" : "1fr",
            gap: 14,
          }}>
            {filtered.map((item, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16,
                padding: "18px 20px",
                position: "relative",
                overflow: "hidden",
              }}>
                {/* Accent bar — flips side for RTL */}
                <div style={{
                  position: "absolute",
                  [isRTL ? "right" : "left"]: 0,
                  top: 0, bottom: 0, width: 3,
                  background: item.tc,
                  borderRadius: isRTL ? "0 16px 16px 0" : "16px 0 0 16px",
                }}/>

                {/* Meta row */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                  <span style={{
                    background: `${item.tc}22`, color: item.tc,
                    fontFamily: font, fontSize: 10, fontWeight: 700,
                    letterSpacing: 1.2, textTransform: "uppercase",
                    padding: "3px 10px", borderRadius: 20,
                  }}>
                    {buildTagLabel(item.tg, cats)}
                  </span>
                  <span style={{ fontFamily: font, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                    {item.d}
                  </span>
                  {i === 0 && activeCat === 0 && (
                    <span style={{
                      [isRTL ? "marginRight" : "marginLeft"]: "auto",
                      background: "#C41E3A", color: "#FFF",
                      fontFamily: font, fontSize: 9, fontWeight: 800,
                      padding: "2px 8px", borderRadius: 12,
                      letterSpacing: 1.5, textTransform: "uppercase",
                    }}>
                      {T.featured_label}
                    </span>
                  )}
                </div>

                {/* Title */}
                <p style={{
                  fontFamily: font, fontSize: isDesk ? 15 : 14,
                  fontWeight: 600, color: "rgba(255,255,255,0.92)",
                  margin: 0, lineHeight: 1.45,
                }}>
                  {item.t}
                </p>

                <div style={{
                  display: "flex",
                  justifyContent: isRTL ? "flex-start" : "flex-end",
                  marginTop: 14,
                }}>
                  <span style={{ fontFamily: font, fontSize: 11, color: `${item.tc}99`, fontWeight: 500 }}>
                    {T.read_more}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Auto-refresh notice ── */}
        <div style={{
          marginTop: 28,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 12, padding: "16px 20px",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: "rgba(196,30,58,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18,
          }}>🔔</div>
          <div style={{ fontFamily: font, fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>
            {T.auto_refresh}
          </div>
        </div>

      </div>
    </div>
  );
}
