import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════
// DATA
// ═══════════════════════════════════════

const LANGUAGES = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ar", label: "العربية", flag: "🇲🇦" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
];

const QUICK_TOPICS = {
  fr: ["🏟️ Stades", "🚇 Transport", "🍜 Restaurants", "🏨 Hôtels", "🚑 Urgences", "🕌 Culture", "☀️ Météo"],
  en: ["🏟️ Stadiums", "🚇 Transport", "🍜 Food", "🏨 Hotels", "🚑 Emergency", "🕌 Culture", "☀️ Weather"],
  ar: ["🏟️ ملاعب", "🚇 نقل", "🍜 مطاعم", "🏨 فنادق", "🚑 طوارئ", "🕌 ثقافة", "☀️ طقس"],
  es: ["🏟️ Estadios", "🚇 Transporte", "🍜 Comida", "🏨 Hoteles", "🚑 Urgencias", "🕌 Cultura", "☀️ Clima"],
  pt: ["🏟️ Estádios", "🚇 Transporte", "🍜 Comida", "🏨 Hotéis", "🚑 Urgências", "🕌 Cultura", "☀️ Tempo"],
  zh: ["🏟️ 球场", "🚇 交通", "🍜 美食", "🏨 酒店", "🚑 急救", "🕌 文化", "☀️ 天气"],
};

const PLACEHOLDERS = {
  fr: "Posez votre question sur le Mondial 2030...",
  en: "Ask anything about the 2030 World Cup...",
  ar: "...اسأل عن كأس العالم 2030",
  es: "Pregunta sobre el Mundial 2030...",
  pt: "Pergunte sobre a Copa 2030...",
  zh: "询问2030世界杯相关问题...",
};

const SYSTEM_PROMPTS = {
  fr: `Tu es MoundiGuide, l'assistant officiel IA pour les touristes du Mondial 2030 co-organisé par le Maroc, l'Espagne et le Portugal. Réponds en français. Sois chaleureux, précis et utile. Donne des informations pratiques sur les stades, transports, culture locale, sécurité, gastronomie, hébergement. Sois concis mais complet. Utilise des emojis. Formate tes réponses avec des sections claires. Les 6 villes marocaines: Casablanca (Grand Stade Hassan II, 115 000 places), Rabat (Complexe Moulay Abdallah), Marrakech (Grand Stade de Marrakech), Tanger (Grand Stade de Tanger), Agadir (Stade d'Agadir), Fès (Nouveau Stade de Fès).`,
  en: `You are MoundiGuide, the official AI assistant for tourists at the 2030 World Cup co-hosted by Morocco, Spain, and Portugal. Reply in English. Be warm, precise, and helpful. Provide practical information about stadiums, transport, local culture, safety, gastronomy, accommodation. Be concise but thorough. Use emojis. Format with clear sections. The 6 Moroccan cities: Casablanca (Grand Stade Hassan II, 115,000 seats), Rabat, Marrakech, Tangier, Agadir, Fez.`,
  ar: `أنت MoundiGuide، المساعد الذكي الرسمي للسياح في كأس العالم 2030 المشترك بين المغرب وإسبانيا والبرتغال. أجب باللغة العربية. كن ودوداً ودقيقاً ومفيداً. قدم معلومات عملية عن الملاعب والمواصلات والثقافة والمطاعم. استخدم الرموز التعبيرية.`,
  es: `Eres MoundiGuide, el asistente oficial de IA para turistas del Mundial 2030. Responde en español. Sé cálido, preciso y útil. Usa emojis y formato claro.`,
  pt: `Você é MoundiGuide, o assistente oficial de IA para turistas da Copa do Mundo 2030. Responda em português. Seja caloroso, preciso e útil. Use emojis.`,
  zh: `你是MoundiGuide，2030年世界杯官方AI助手。用中文回答。要热情、准确、有帮助。使用表情符号。`,
};

const WELCOME_MESSAGES = {
  fr: "Bienvenue ! 🌍⚽ Je suis MoundiGuide, votre assistant pour le Mondial 2030.\n\nPosez-moi vos questions sur les stades, transports, culture ou restaurants au Maroc, Espagne et Portugal !",
  en: "Welcome! 🌍⚽ I'm MoundiGuide, your 2030 World Cup assistant.\n\nAsk me about stadiums, transport, culture or restaurants in Morocco, Spain & Portugal!",
  ar: "مرحباً! 🌍⚽ أنا MoundiGuide، مساعدكم لكأس العالم 2030.\n\nاسألوني عن الملاعب والنقل والثقافة أو المطاعم!",
  es: "¡Bienvenido! 🌍⚽ Soy MoundiGuide, tu asistente del Mundial 2030.\n\n¡Pregúntame sobre estadios, transporte, cultura o restaurantes!",
  pt: "Bem-vindo! 🌍⚽ Sou MoundiGuide, seu assistente da Copa 2030.\n\nPergunte-me sobre estádios, transporte, cultura ou restaurantes!",
  zh: "欢迎！🌍⚽ 我是MoundiGuide，您的2030世界杯助手。\n\n问我关于球场、交通、文化或餐厅的问题！",
};

const INFO_DATA = {
  fr: { title: "Infos pratiques", items: [
    { icon: "🚨", label: "Police", value: "19" },{ icon: "🚑", label: "SAMU", value: "15" },
    { icon: "🚒", label: "Pompiers", value: "15" },{ icon: "💱", label: "Monnaie", value: "Dirham (MAD)" },
    { icon: "🔌", label: "Électricité", value: "220V / Type C,E" },{ icon: "🕐", label: "Fuseau", value: "GMT+1" },
    { icon: "📱", label: "Indicatif", value: "+212" },{ icon: "💧", label: "Eau", value: "Bouteille recommandée" },
  ]},
  en: { title: "Practical info", items: [
    { icon: "🚨", label: "Police", value: "19" },{ icon: "🚑", label: "Ambulance", value: "15" },
    { icon: "🚒", label: "Fire", value: "15" },{ icon: "💱", label: "Currency", value: "Dirham (MAD)" },
    { icon: "🔌", label: "Power", value: "220V / Type C,E" },{ icon: "🕐", label: "Timezone", value: "GMT+1" },
    { icon: "📱", label: "Dial code", value: "+212" },{ icon: "💧", label: "Water", value: "Bottled recommended" },
  ]},
  ar: { title: "معلومات عملية", items: [
    { icon: "🚨", label: "الشرطة", value: "19" },{ icon: "🚑", label: "الإسعاف", value: "15" },
    { icon: "🚒", label: "الحريق", value: "15" },{ icon: "💱", label: "العملة", value: "درهم (MAD)" },
    { icon: "🔌", label: "الكهرباء", value: "220V" },{ icon: "🕐", label: "التوقيت", value: "GMT+1" },
    { icon: "📱", label: "الرمز", value: "+212" },{ icon: "💧", label: "الماء", value: "زجاجة أفضل" },
  ]},
};

const STADIUMS = [
  { city: "Casablanca", name: "Grand Stade Hassan II", capacity: "115 000", lat: 33.5731, lng: -7.5898 },
  { city: "Rabat", name: "Complexe Moulay Abdallah", capacity: "52 000", lat: 33.9558, lng: -6.8628 },
  { city: "Marrakech", name: "Grand Stade de Marrakech", capacity: "45 000", lat: 31.6225, lng: -8.0109 },
  { city: "Tanger", name: "Grand Stade de Tanger", capacity: "65 000", lat: 35.7356, lng: -5.8340 },
  { city: "Agadir", name: "Stade d'Agadir", capacity: "45 000", lat: 30.3800, lng: -9.5300 },
  { city: "Fès", name: "Nouveau Stade de Fès", capacity: "50 000", lat: 34.0181, lng: -5.0078 },
];

const CURRENCIES = [
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "GBP", symbol: "£", label: "British Pound" },
  { code: "BRL", symbol: "R$", label: "Real" },
  { code: "JPY", symbol: "¥", label: "Yen" },
  { code: "CNY", symbol: "¥", label: "Yuan" },
];

const BRAND = { red: "#C41E3A", green: "#00823C", blue: "#1A56DB", gold: "#F5A623" };

const THEMES = {
  dark: {
    bg: "linear-gradient(165deg, #0C1117 0%, #0D1A12 35%, #0C1320 65%, #0C1117 100%)",
    headerBg: "rgba(0,0,0,0.6)", tabBg: "rgba(0,0,0,0.3)", inputBg: "rgba(0,0,0,0.4)",
    card: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.08)",
    text: "rgba(255,255,255,0.88)", textStrong: "#FFFFFF", muted: "rgba(255,255,255,0.45)",
    inputField: "rgba(255,255,255,0.05)", inputBorder: "rgba(255,255,255,0.08)", inputText: "#FFFFFF",
    botBubble: "rgba(255,255,255,0.04)", botBubbleBorder: "rgba(255,255,255,0.08)", botText: "rgba(255,255,255,0.88)",
    userBubble: `linear-gradient(135deg, ${BRAND.red}, #A01830)`, userText: "#FFFFFF",
    dropdown: "rgba(12,17,23,0.98)", langActive: "rgba(245,166,35,0.1)", tabActive: "rgba(245,166,35,0.08)",
    shadow: "0 16px 48px rgba(0,0,0,0.5)", scrollThumb: "rgba(255,255,255,0.1)",
  },
  light: {
    bg: "linear-gradient(165deg, #F8F9FA 0%, #EFF6EE 35%, #EBF0F7 65%, #F8F9FA 100%)",
    headerBg: "rgba(255,255,255,0.9)", tabBg: "rgba(255,255,255,0.7)", inputBg: "rgba(255,255,255,0.9)",
    card: "rgba(0,0,0,0.03)", border: "rgba(0,0,0,0.08)",
    text: "rgba(0,0,0,0.8)", textStrong: "#111111", muted: "rgba(0,0,0,0.45)",
    inputField: "rgba(0,0,0,0.03)", inputBorder: "rgba(0,0,0,0.1)", inputText: "#111111",
    botBubble: "rgba(0,0,0,0.03)", botBubbleBorder: "rgba(0,0,0,0.08)", botText: "rgba(0,0,0,0.8)",
    userBubble: `linear-gradient(135deg, ${BRAND.red}, #E02040)`, userText: "#FFFFFF",
    dropdown: "rgba(255,255,255,0.99)", langActive: "rgba(196,30,58,0.06)", tabActive: "rgba(196,30,58,0.06)",
    shadow: "0 16px 48px rgba(0,0,0,0.1)", scrollThumb: "rgba(0,0,0,0.1)",
  },
};

// ═══════════════════════════════════════
// SIMPLE MARKDOWN RENDERER
// ═══════════════════════════════════════
function renderMarkdown(text) {
  if (!text) return text;
  const lines = text.split("\n");
  return lines.map((line, i) => {
    let content = line
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>");
    if (line.startsWith("### ")) return <div key={i} style={{ fontWeight: 600, marginTop: 8, marginBottom: 4 }} dangerouslySetInnerHTML={{ __html: content.slice(4) }} />;
    if (line.startsWith("## ")) return <div key={i} style={{ fontWeight: 600, fontSize: 15, marginTop: 10, marginBottom: 4 }} dangerouslySetInnerHTML={{ __html: content.slice(3) }} />;
    if (line.startsWith("- ") || line.startsWith("• ")) return <div key={i} style={{ paddingLeft: 12, marginBottom: 2 }} dangerouslySetInnerHTML={{ __html: "• " + content.slice(2) }} />;
    if (line.trim() === "") return <div key={i} style={{ height: 8 }} />;
    return <div key={i} dangerouslySetInnerHTML={{ __html: content }} />;
  });
}

// ═══════════════════════════════════════
// CURRENCY CONVERTER COMPONENT
// ═══════════════════════════════════════
function CurrencyConverter({ T, isRTL }) {
  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState("EUR");
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/MAD")
      .then(r => r.json())
      .then(data => { setRates(data.rates); setLoading(false); })
      .catch(() => {
        setRates({ EUR: 0.091, USD: 0.099, GBP: 0.078, BRL: 0.57, JPY: 14.8, CNY: 0.72 });
        setLoading(false);
      });
  }, []);

  const convert = () => {
    if (!rates || !amount) return "—";
    const rateFromCurrency = rates[from];
    if (!rateFromCurrency) return "—";
    const madAmount = parseFloat(amount) / rateFromCurrency;
    return Math.round(madAmount).toLocaleString();
  };

  const selectStyle = {
    padding: "8px 10px", borderRadius: 8, border: `1px solid ${T.border}`,
    background: T.inputField, color: T.textStrong, fontSize: 13,
    fontFamily: "'Outfit', sans-serif", cursor: "pointer", width: "100%",
  };

  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, marginTop: 12 }}>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600, color: BRAND.gold, marginBottom: 12 }}>
        💱 {isRTL ? "محول العملات" : "Convertisseur de devises"}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
          style={{ ...selectStyle, width: "35%", MozAppearance: "textfield" }} />
        <select value={from} onChange={e => setFrom(e.target.value)} style={{ ...selectStyle, width: "35%" }}>
          {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}
        </select>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: T.muted, width: "8%", textAlign: "center" }}>→</div>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600, color: T.textStrong, width: "22%" }}>MAD</div>
      </div>
      <div style={{
        background: T.tabActive, borderRadius: 8, padding: "12px 14px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: T.muted }}>
          {amount} {from} =
        </span>
        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 700, color: BRAND.gold }}>
          {loading ? "..." : convert()} <span style={{ fontSize: 13, fontWeight: 400 }}>MAD</span>
        </span>
      </div>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 9, color: T.muted, marginTop: 6, textAlign: "center" }}>
        {isRTL ? "أسعار محدثة تلقائياً" : "Taux mis à jour automatiquement — open.er-api.com"}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// MAP COMPONENT (Leaflet via CDN)
// ═══════════════════════════════════════
function StadiumMap({ T, onSelectStadium }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (mapInstanceRef.current) return;
    if (!window.L) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(link);
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
      script.onload = () => initMap();
      document.head.appendChild(script);
    } else {
      initMap();
    }

    function initMap() {
      if (!mapRef.current || mapInstanceRef.current) return;
      const map = window.L.map(mapRef.current, { zoomControl: false }).setView([32.5, -6.5], 5.5);
      window.L.control.zoom({ position: "bottomright" }).addTo(map);
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OSM",
        maxZoom: 18,
      }).addTo(map);

      const icon = window.L.divIcon({
        className: "",
        html: `<div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,${BRAND.red},${BRAND.green});display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 3px 12px rgba(0,0,0,0.4);border:2px solid white;cursor:pointer">⚽</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      STADIUMS.forEach(s => {
        const marker = window.L.marker([s.lat, s.lng], { icon }).addTo(map);
        marker.bindPopup(`<div style="font-family:Outfit,sans-serif;min-width:160px"><strong style="font-size:14px">${s.city}</strong><br><span style="font-size:11px;color:#666">${s.name}</span><br><span style="font-size:12px;color:${BRAND.red};font-weight:600">🏟️ ${s.capacity} places</span></div>`);
        marker.on("click", () => onSelectStadium && onSelectStadium(s));
      });

      mapInstanceRef.current = map;
      setTimeout(() => map.invalidateSize(), 200);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return <div ref={mapRef} style={{ width: "100%", height: 300, borderRadius: 10, overflow: "hidden", border: `1px solid ${T.border}` }} />;
}

// ═══════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════
export default function MoundiGuide() {
  const [lang, setLang] = useState("fr");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [themeMode, setThemeMode] = useState("system");
  const [systemDark, setSystemDark] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(mq.matches);
    const h = (e) => setSystemDark(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  const isDark = themeMode === "system" ? systemDark : themeMode === "dark";
  const T = isDark ? THEMES.dark : THEMES.light;
  const accent = isDark ? BRAND.gold : BRAND.red;

  const cycleTheme = () => {
    const o = ["system", "light", "dark"];
    setThemeMode(o[(o.indexOf(themeMode) + 1) % 3]);
  };

  useEffect(() => {
    setMessages([{ role: "assistant", content: WELCOME_MESSAGES[lang] }]);
  }, [lang]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close lang menu when clicking outside
  useEffect(() => {
    if (!showLangMenu) return;
    const close = () => setShowLangMenu(false);
    setTimeout(() => document.addEventListener("click", close), 0);
    return () => document.removeEventListener("click", close);
  }, [showLangMenu]);

  const sendMessage = useCallback(async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");
    setActiveTab("chat");
    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang, messages: newMessages.map(m => ({ role: m.role, content: m.content })) }),
      });
      const data = await response.json();
      const reply = data.content?.[0]?.text || data.error || "⚠️ Erreur. Réessayez.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Connexion échouée." }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [input, loading, messages, lang]);

  const currentLang = LANGUAGES.find(l => l.code === lang);
  const isRTL = lang === "ar";
  const info = INFO_DATA[lang] || INFO_DATA.en;

  const TABS = [
    { id: "chat", label: lang === "ar" ? "محادثة" : "Chat", icon: "💬" },
    { id: "map", label: lang === "ar" ? "خريطة" : lang === "es" ? "Mapa" : lang === "pt" ? "Mapa" : lang === "zh" ? "地图" : "Carte", icon: "🗺️" },
    { id: "info", label: lang === "ar" ? "معلومات" : "Infos", icon: "ℹ️" },
    { id: "stadiums", label: lang === "ar" ? "ملاعب" : lang === "es" ? "Estadios" : lang === "pt" ? "Estádios" : lang === "zh" ? "球场" : "Stades", icon: "🏟️" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Segoe UI', system-ui, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", transition: "background 0.3s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Noto+Sans+Arabic:wght@400;600&display=swap');
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes dotPulse{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes arcSpin{to{transform:rotate(360deg)}}
        .msg-e{animation:fadeIn .25s ease both}
        .tb:hover{opacity:.8}
        .sb:hover:not(:disabled){opacity:.9;transform:scale(1.03)}
        textarea:focus{outline:none;border-color:${accent}!important}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${T.scrollThumb};border-radius:3px}
        *{box-sizing:border-box;margin:0;padding:0}
        input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none}
        input[type=number]{-moz-appearance:textfield}
      `}</style>

      <div style={{ width: "100%", maxWidth: 520, display: "flex", flexDirection: "column", height: "100vh", position: "relative" }}>

        {/* ═══ HEADER ═══ */}
        <div style={{
          padding: "12px 16px 8px", background: T.headerBg, backdropFilter: "blur(24px)",
          borderBottom: `1px solid ${T.border}`, flexShrink: 0, position: "relative", zIndex: 50,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ position: "relative", width: 36, height: 36 }}>
                <svg width="36" height="36" viewBox="0 0 38 38" style={{ animation: "arcSpin 20s linear infinite" }}>
                  <circle cx="19" cy="19" r="16" fill="none" stroke={BRAND.red} strokeWidth="2.5" strokeDasharray="12 88" />
                  <circle cx="19" cy="19" r="16" fill="none" stroke={BRAND.green} strokeWidth="2.5" strokeDasharray="12 88" strokeDashoffset="-25" />
                  <circle cx="19" cy="19" r="16" fill="none" stroke={BRAND.blue} strokeWidth="2.5" strokeDasharray="12 88" strokeDashoffset="-50" />
                  <circle cx="19" cy="19" r="16" fill="none" stroke={BRAND.gold} strokeWidth="2.5" strokeDasharray="12 88" strokeDashoffset="-75" />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>⚽</div>
              </div>
              <div>
                <div style={{ fontFamily: "'Outfit'", fontWeight: 700, fontSize: 18, lineHeight: 1 }}>
                  <span style={{ color: BRAND.red }}>M</span><span style={{ color: T.textStrong }}>oundi</span>
                  <span style={{ color: BRAND.green }}>G</span><span style={{ color: T.textStrong }}>uide</span>
                </div>
                <div style={{ fontFamily: "'Outfit'", fontSize: 8, color: T.muted, letterSpacing: 2, textTransform: "uppercase", marginTop: 1 }}>YallaVamos 2030</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button onClick={cycleTheme} title={themeMode} style={{
                width: 30, height: 30, borderRadius: 8, border: `1px solid ${T.border}`,
                background: T.card, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, position: "relative",
              }}>
                {isDark ? "☀️" : "🌙"}
                {themeMode === "system" && <div style={{ position: "absolute", bottom: -1, right: -1, width: 7, height: 7, borderRadius: 4, background: BRAND.green, border: `1.5px solid ${isDark ? "#0C1117" : "#F8F9FA"}` }} />}
              </button>
              <div style={{ position: "relative" }}>
                <button onClick={(e) => { e.stopPropagation(); setShowLangMenu(!showLangMenu); }} style={{
                  background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: "4px 10px",
                  cursor: "pointer", color: T.textStrong, fontSize: 11, fontWeight: 500,
                  display: "flex", alignItems: "center", gap: 4, fontFamily: "'Outfit'",
                }}>
                  <span style={{ fontSize: 13 }}>{currentLang.flag}</span>
                  <span>{currentLang.label}</span>
                  <span style={{ opacity: 0.4, fontSize: 7 }}>▼</span>
                </button>
                {showLangMenu && (
                  <div onClick={e => e.stopPropagation()} style={{
                    position: "absolute", right: 0, top: "calc(100% + 6px)",
                    background: T.dropdown, backdropFilter: "blur(20px)",
                    border: `1px solid ${T.border}`, borderRadius: 10,
                    overflow: "hidden", zIndex: 9999, minWidth: 145,
                    boxShadow: T.shadow, animation: "fadeIn 0.15s ease both",
                  }}>
                    {LANGUAGES.map(l => (
                      <button key={l.code} onClick={() => { setLang(l.code); setShowLangMenu(false); }} style={{
                        display: "flex", alignItems: "center", gap: 7, width: "100%", padding: "8px 12px",
                        background: lang === l.code ? T.langActive : "transparent",
                        border: "none", cursor: "pointer", color: lang === l.code ? accent : T.text,
                        fontSize: 12, textAlign: "left", fontFamily: "'Outfit'",
                      }}>
                        <span style={{ fontSize: 14 }}>{l.flag}</span><span>{l.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", height: 2.5, marginTop: 8, borderRadius: 2, overflow: "hidden" }}>
            {[BRAND.red, BRAND.gold, BRAND.green, BRAND.blue].map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}
          </div>
        </div>

        {/* ═══ TABS ═══ */}
        <div style={{ display: "flex", background: T.tabBg, backdropFilter: "blur(12px)", borderBottom: `1px solid ${T.border}`, flexShrink: 0, position: "relative", zIndex: 10 }}>
          {TABS.map(tab => (
            <button key={tab.id} className="tb" onClick={() => setActiveTab(tab.id)} style={{
              flex: 1, padding: "9px 0", border: "none", cursor: "pointer",
              background: activeTab === tab.id ? T.tabActive : "transparent",
              borderBottom: activeTab === tab.id ? `2px solid ${accent}` : "2px solid transparent",
              color: activeTab === tab.id ? accent : T.muted,
              fontSize: 11, fontWeight: 500, fontFamily: "'Outfit'",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 4, transition: "all 0.15s",
            }}>
              <span style={{ fontSize: 12 }}>{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>

        {/* ═══ CONTENT ═══ */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>

          {/* CHAT */}
          {activeTab === "chat" && (
            <div style={{ flex: 1, padding: "14px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
              {messages.map((msg, i) => (
                <div key={i} className="msg-e" style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", direction: isRTL ? "rtl" : "ltr" }}>
                  {msg.role === "assistant" && (
                    <div style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, background: `linear-gradient(135deg, ${BRAND.red}, ${BRAND.green})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, marginRight: isRTL ? 0 : 6, marginLeft: isRTL ? 6 : 0, marginTop: 2 }}>⚽</div>
                  )}
                  <div style={{
                    maxWidth: "82%", padding: "10px 13px",
                    borderRadius: msg.role === "user" ? "14px 14px 3px 14px" : "14px 14px 14px 3px",
                    background: msg.role === "user" ? T.userBubble : T.botBubble,
                    border: msg.role === "user" ? "none" : `1px solid ${T.botBubbleBorder}`,
                    color: msg.role === "user" ? T.userText : T.botText,
                    fontSize: 13, lineHeight: 1.55,
                    fontFamily: isRTL ? "'Noto Sans Arabic'" : "'Outfit'", fontWeight: 300,
                    textAlign: isRTL ? "right" : "left",
                  }}>
                    {msg.role === "assistant" ? renderMarkdown(msg.content) : msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="msg-e" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: `linear-gradient(135deg, ${BRAND.red}, ${BRAND.green})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>⚽</div>
                  <div style={{ padding: "10px 13px", borderRadius: "14px 14px 14px 3px", background: T.botBubble, border: `1px solid ${T.botBubbleBorder}`, display: "flex", gap: 4 }}>
                    {[0, .15, .3].map((d, i) => <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: accent, animation: `dotPulse 1s ease-in-out infinite`, animationDelay: `${d}s` }} />)}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* MAP */}
          {activeTab === "map" && (
            <div style={{ padding: "14px 12px", animation: "fadeIn 0.3s ease" }}>
              <div style={{ fontFamily: "'Outfit'", fontSize: 15, fontWeight: 600, color: T.textStrong, marginBottom: 10 }}>
                🗺️ {isRTL ? "خريطة الملاعب" : lang === "es" ? "Mapa de estadios" : "Carte des stades"}
              </div>
              <StadiumMap T={T} onSelectStadium={(s) => sendMessage(
                lang === "ar" ? `أخبرني عن ملعب ${s.city}` :
                lang === "es" ? `Háblame del estadio de ${s.city}` :
                `Parle-moi du stade de ${s.city}, accès, restaurants et hôtels à proximité`
              )} />
              <div style={{ fontFamily: "'Outfit'", fontSize: 10, color: T.muted, marginTop: 8, textAlign: "center" }}>
                {isRTL ? "انقر على ملعب للحصول على معلومات" : "Cliquez sur un stade pour obtenir des informations"}
              </div>
            </div>
          )}

          {/* INFO */}
          {activeTab === "info" && (
            <div style={{ padding: "14px 12px", animation: "fadeIn 0.3s ease" }}>
              <div style={{ fontFamily: "'Outfit'", fontSize: 15, fontWeight: 600, color: T.textStrong, marginBottom: 12, direction: isRTL ? "rtl" : "ltr" }}>{info.title}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                {info.items.map((item, i) => (
                  <div key={i} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 10, direction: isRTL ? "rtl" : "ltr" }}>
                    <div style={{ fontSize: 16, marginBottom: 3 }}>{item.icon}</div>
                    <div style={{ fontFamily: "'Outfit'", fontSize: 9, color: T.muted, textTransform: "uppercase", letterSpacing: .5 }}>{item.label}</div>
                    <div style={{ fontFamily: "'Outfit'", fontSize: 13, fontWeight: 600, color: T.textStrong, marginTop: 1 }}>{item.value}</div>
                  </div>
                ))}
              </div>
              <CurrencyConverter T={T} isRTL={isRTL} />
              {/* Darija phrases */}
              <div style={{ marginTop: 14, background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 14 }}>
                <div style={{ fontFamily: "'Outfit'", fontSize: 13, fontWeight: 600, color: accent, marginBottom: 10 }}>
                  🗣️ {isRTL ? "عبارات بالدارجة" : "Phrases en Darija"}
                </div>
                {[
                  { d: "Salam", t: lang==="ar"?"مرحبا":lang==="es"?"Hola":"Bonjour" },
                  { d: "Beshhal?", t: lang==="ar"?"بكم؟":lang==="es"?"¿Cuánto?":"Combien ?" },
                  { d: "Shukran", t: lang==="ar"?"شكرا":lang==="es"?"Gracias":"Merci" },
                  { d: "La, shukran", t: lang==="ar"?"لا شكرا":lang==="es"?"No, gracias":"Non, merci" },
                  { d: "Fin kayn...?", t: lang==="ar"?"فين كاين؟":lang==="es"?"¿Dónde está?":"Où est...?" },
                  { d: "Mezyan", t: lang==="ar"?"مزيان / جيد":lang==="es"?"Bien":"Bien / Cool" },
                ].map((p, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < 5 ? `1px solid ${T.border}` : "none" }}>
                    <span style={{ fontFamily: "'Outfit'", fontSize: 13, fontWeight: 500, color: T.textStrong }}>{p.d}</span>
                    <span style={{ fontFamily: "'Outfit'", fontSize: 12, color: T.muted }}>{p.t}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STADIUMS */}
          {activeTab === "stadiums" && (
            <div style={{ padding: "14px 12px", animation: "fadeIn 0.3s ease" }}>
              <div style={{ fontFamily: "'Outfit'", fontSize: 15, fontWeight: 600, color: T.textStrong, marginBottom: 3 }}>
                🇲🇦 {isRTL ? "ملاعب المغرب" : "Stades du Maroc"}
              </div>
              <div style={{ fontFamily: "'Outfit'", fontSize: 10, color: T.muted, marginBottom: 12 }}>
                6 {isRTL ? "مدن مستضيفة" : "villes hôtes"} — {isRTL ? "انقر للتفاصيل" : "Cliquez pour les détails"}
              </div>
              {STADIUMS.map((s, i) => (
                <button key={i} className="tb" onClick={() => sendMessage(
                  lang === "ar" ? `أخبرني عن ملعب ${s.city}` :
                  `Parle-moi du stade de ${s.city}, accès, restaurants et hôtels à proximité`
                )} style={{
                  background: T.card, border: `1px solid ${T.border}`, borderRadius: 10,
                  padding: "11px 12px", cursor: "pointer", textAlign: "left", width: "100%",
                  display: "flex", alignItems: "center", gap: 10, marginBottom: 7,
                  borderLeft: `3px solid ${[BRAND.red, BRAND.green, BRAND.gold, BRAND.blue, BRAND.red, BRAND.green][i]}`,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Outfit'", fontSize: 13, fontWeight: 600, color: T.textStrong }}>{s.city}</div>
                    <div style={{ fontFamily: "'Outfit'", fontSize: 10, color: T.muted, marginTop: 1 }}>{s.name}</div>
                  </div>
                  <div style={{ fontFamily: "'Outfit'", fontSize: 10, fontWeight: 600, color: isDark ? BRAND.gold : BRAND.red, background: T.tabActive, padding: "2px 7px", borderRadius: 5 }}>
                    {s.capacity}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ═══ QUICK TOPICS ═══ */}
        <div style={{ padding: "5px 12px", display: "flex", gap: 5, overflowX: "auto", flexShrink: 0, scrollbarWidth: "none", borderTop: `1px solid ${T.border}` }}>
          {QUICK_TOPICS[lang].map((topic, i) => (
            <button key={i} className="tb" onClick={() => sendMessage(topic)} style={{
              whiteSpace: "nowrap", padding: "4px 9px", background: T.card, border: `1px solid ${T.border}`,
              borderRadius: 14, color: T.muted, fontSize: 10, cursor: "pointer",
              fontFamily: isRTL ? "'Noto Sans Arabic'" : "'Outfit'", fontWeight: 400,
            }}>{topic}</button>
          ))}
        </div>

        {/* ═══ INPUT ═══ */}
        <div style={{ padding: "8px 12px 12px", background: T.inputBg, backdropFilter: "blur(24px)", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 7, alignItems: "flex-end" }}>
            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder={PLACEHOLDERS[lang]} rows={1} dir={isRTL ? "rtl" : "ltr"}
              style={{
                flex: 1, resize: "none", padding: "9px 11px", background: T.inputField,
                border: `1px solid ${T.inputBorder}`, borderRadius: 10, color: T.inputText,
                fontSize: 13, fontFamily: isRTL ? "'Noto Sans Arabic'" : "'Outfit'",
                fontWeight: 300, lineHeight: 1.5, transition: "border-color .2s",
              }} />
            <button className="sb" onClick={() => sendMessage()} disabled={!input.trim() || loading} style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              background: input.trim() && !loading ? `linear-gradient(135deg, ${BRAND.red}, ${BRAND.green})` : T.card,
              border: input.trim() && !loading ? "none" : `1px solid ${T.border}`,
              cursor: input.trim() && !loading ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15, transition: "all .2s", color: input.trim() && !loading ? "white" : T.muted,
            }}>
              {loading ? <div style={{ width: 14, height: 14, border: `2px solid ${T.border}`, borderTopColor: accent, borderRadius: "50%", animation: "spin .6s linear infinite" }} /> : "➤"}
            </button>
          </div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 5, marginTop: 6 }}>
            {[BRAND.red, BRAND.gold, BRAND.green, BRAND.blue].map((c, i) => <div key={i} style={{ width: 7, height: 2.5, borderRadius: 2, background: c }} />)}
            <span style={{ fontFamily: "'Outfit'", fontSize: 8, color: T.muted, letterSpacing: 1.5, marginLeft: 4 }}>YALLAVAMOS 2030</span>
          </div>
        </div>
      </div>
    </div>
  );
}
