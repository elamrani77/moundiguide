import { useState, useEffect, useRef } from "react";

const LANGUAGES = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ar", label: "العربية", flag: "🇲🇦" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
];

const QUICK_TOPICS = {
  fr: ["🏟️ Stades", "🚇 Transport", "🍜 Restaurants", "🏨 Hôtels", "🚑 Urgences", "🕌 Culture"],
  en: ["🏟️ Stadiums", "🚇 Transport", "🍜 Food", "🏨 Hotels", "🚑 Emergency", "🕌 Culture"],
  ar: ["🏟️ ملاعب", "🚇 نقل", "🍜 مطاعم", "🏨 فنادق", "🚑 طوارئ", "🕌 ثقافة"],
  es: ["🏟️ Estadios", "🚇 Transporte", "🍜 Comida", "🏨 Hoteles", "🚑 Urgencias", "🕌 Cultura"],
  pt: ["🏟️ Estádios", "🚇 Transporte", "🍜 Comida", "🏨 Hotéis", "🚑 Urgências", "🕌 Cultura"],
  zh: ["🏟️ 球场", "🚇 交通", "🍜 美食", "🏨 酒店", "🚑 急救", "🕌 文化"],
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
  fr: `Tu es MoundiGuide, l'assistant officiel IA pour les touristes du Mondial 2030 co-organisé par le Maroc, l'Espagne et le Portugal. Réponds en français. Sois chaleureux, précis et utile. Donne des informations pratiques sur les stades, transports, culture locale, sécurité, gastronomie, hébergement. Sois concis mais complet. Utilise des emojis pour rendre les réponses vivantes. Les 6 villes marocaines: Casablanca (Grand Stade Hassan II, 115 000 places), Rabat (Complexe Moulay Abdallah), Marrakech (Grand Stade de Marrakech), Tanger (Grand Stade de Tanger), Agadir (Stade d'Agadir), Fès (Nouveau Stade de Fès).`,
  en: `You are MoundiGuide, the official AI assistant for tourists at the 2030 World Cup co-hosted by Morocco, Spain, and Portugal. Reply in English. Be warm, precise, and helpful. Provide practical information about stadiums, transport, local culture, safety, gastronomy, accommodation. Be concise but thorough. Use emojis. The 6 Moroccan cities: Casablanca (Grand Stade Hassan II, 115,000 seats), Rabat, Marrakech, Tangier, Agadir, Fez.`,
  ar: `أنت MoundiGuide، المساعد الذكي الرسمي للسياح في كأس العالم 2030 المشترك بين المغرب وإسبانيا والبرتغال. أجب باللغة العربية. كن ودوداً ودقيقاً ومفيداً. قدم معلومات عملية. استخدم الرموز التعبيرية.`,
  es: `Eres MoundiGuide, el asistente oficial de IA para turistas del Mundial 2030 co-organizado por Marruecos, España y Portugal. Responde en español. Sé cálido, preciso y útil. Usa emojis.`,
  pt: `Você é MoundiGuide, o assistente oficial de IA para turistas da Copa do Mundo 2030. Responda em português. Seja caloroso, preciso e útil. Use emojis.`,
  zh: `你是MoundiGuide，2030年世界杯官方AI助手。用中文回答。要热情、准确、有帮助。使用表情符号。`,
};

const WELCOME_MESSAGES = {
  fr: "Bienvenue ! 🌍⚽ Je suis MoundiGuide, votre assistant pour le Mondial 2030. Posez-moi vos questions sur les stades, transports, culture ou restaurants au Maroc, Espagne et Portugal !",
  en: "Welcome! 🌍⚽ I'm MoundiGuide, your 2030 World Cup assistant. Ask me about stadiums, transport, culture or restaurants in Morocco, Spain & Portugal!",
  ar: "مرحباً! 🌍⚽ أنا MoundiGuide، مساعدكم لكأس العالم 2030. اسألوني عن الملاعب والنقل والثقافة أو المطاعم!",
  es: "¡Bienvenido! 🌍⚽ Soy MoundiGuide, tu asistente del Mundial 2030. ¡Pregúntame sobre estadios, transporte, cultura o restaurantes!",
  pt: "Bem-vindo! 🌍⚽ Sou MoundiGuide, seu assistente da Copa 2030. Pergunte-me sobre estádios, transporte, cultura ou restaurantes!",
  zh: "欢迎！🌍⚽ 我是MoundiGuide，您的2030世界杯助手。问我关于球场、交通、文化或餐厅的问题！",
};

const INFO_DATA = {
  fr: {
    title: "Infos pratiques",
    items: [
      { icon: "🚨", label: "Police", value: "19" },
      { icon: "🚑", label: "SAMU", value: "15" },
      { icon: "🚒", label: "Pompiers", value: "15" },
      { icon: "💱", label: "Monnaie", value: "1€ ≈ 11 MAD" },
      { icon: "🔌", label: "Électricité", value: "220V / Type C,E" },
      { icon: "🕐", label: "Fuseau", value: "GMT+1" },
      { icon: "📱", label: "Indicatif", value: "+212" },
      { icon: "💧", label: "Eau", value: "Bouteille recommandée" },
    ],
  },
  en: {
    title: "Practical info",
    items: [
      { icon: "🚨", label: "Police", value: "19" },
      { icon: "🚑", label: "Ambulance", value: "15" },
      { icon: "🚒", label: "Fire", value: "15" },
      { icon: "💱", label: "Currency", value: "1€ ≈ 11 MAD" },
      { icon: "🔌", label: "Power", value: "220V / Type C,E" },
      { icon: "🕐", label: "Timezone", value: "GMT+1" },
      { icon: "📱", label: "Dial code", value: "+212" },
      { icon: "💧", label: "Water", value: "Bottled recommended" },
    ],
  },
  ar: {
    title: "معلومات عملية",
    items: [
      { icon: "🚨", label: "الشرطة", value: "19" },
      { icon: "🚑", label: "الإسعاف", value: "15" },
      { icon: "🚒", label: "الحريق", value: "15" },
      { icon: "💱", label: "العملة", value: "1€ ≈ 11 MAD" },
      { icon: "🔌", label: "الكهرباء", value: "220V" },
      { icon: "🕐", label: "التوقيت", value: "GMT+1" },
      { icon: "📱", label: "الرمز", value: "+212" },
      { icon: "💧", label: "الماء", value: "زجاجة أفضل" },
    ],
  },
};

const STADIUMS = [
  { city: "Casablanca", name: "Grand Stade Hassan II", capacity: "115 000" },
  { city: "Rabat", name: "Complexe Moulay Abdallah", capacity: "52 000" },
  { city: "Marrakech", name: "Grand Stade de Marrakech", capacity: "45 000" },
  { city: "Tanger", name: "Grand Stade de Tanger", capacity: "65 000" },
  { city: "Agadir", name: "Stade d'Agadir", capacity: "45 000" },
  { city: "Fès", name: "Nouveau Stade de Fès", capacity: "50 000" },
];

// YallaVamos 2030 official colors
const C = {
  red: "#C41E3A",
  green: "#00823C",
  blue: "#1A56DB",
  gold: "#F5A623",
  dark: "#0C1117",
  card: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.08)",
  text: "rgba(255,255,255,0.88)",
  muted: "rgba(255,255,255,0.45)",
};

export default function MoundiGuide() {
  const [lang, setLang] = useState("fr");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("chat"); // chat | info | stadiums
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setMessages([{ role: "assistant", content: WELCOME_MESSAGES[lang] }]);
  }, [lang]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");
    setActiveTab("chat");

    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const apiMessages = newMessages.map((m) => ({ role: m.role, content: m.content }));
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang, messages: apiMessages }),
      });
      const data = await response.json();
      const reply = data.content?.[0]?.text || "⚠️ Erreur. Réessayez.";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "⚠️ Connexion échouée. Vérifiez votre réseau." }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const currentLang = LANGUAGES.find((l) => l.code === lang);
  const isRTL = lang === "ar";
  const info = INFO_DATA[lang] || INFO_DATA.en;

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(165deg, ${C.dark} 0%, #0D1A12 35%, #0C1320 65%, ${C.dark} 100%)`,
      fontFamily: "'Segoe UI', 'Helvetica Neue', system-ui, sans-serif",
      display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Noto+Sans+Arabic:wght@400;600&display=swap');
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes dotPulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes arcRotate { to{transform:rotate(360deg)} }
        .msg-enter { animation: fadeIn 0.3s ease both; }
        .topic-btn { transition: all 0.2s; }
        .topic-btn:hover { background: rgba(255,255,255,0.08) !important; transform: translateY(-1px); }
        .send-btn:hover:not(:disabled) { opacity: 0.9; transform: scale(1.03); }
        .tab-btn { transition: all 0.2s; }
        .tab-btn:hover { background: rgba(255,255,255,0.06) !important; }
        textarea:focus { outline: none; border-color: ${C.gold} !important; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 520, display: "flex", flexDirection: "column", height: "100vh", position: "relative" }}>

        {/* ═══ HEADER ═══ */}
        <div style={{
          padding: "14px 16px 10px",
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(24px)",
          borderBottom: `1px solid ${C.border}`,
          flexShrink: 0,
        }}>
          {/* Top row: Logo + Lang */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Animated arc logo */}
              <div style={{ position: "relative", width: 38, height: 38 }}>
                <svg width="38" height="38" viewBox="0 0 38 38" style={{ animation: "arcRotate 20s linear infinite" }}>
                  <circle cx="19" cy="19" r="16" fill="none" stroke={C.red} strokeWidth="3" strokeDasharray="12 88" />
                  <circle cx="19" cy="19" r="16" fill="none" stroke={C.green} strokeWidth="3" strokeDasharray="12 88" strokeDashoffset="-25" />
                  <circle cx="19" cy="19" r="16" fill="none" stroke={C.blue} strokeWidth="3" strokeDasharray="12 88" strokeDashoffset="-50" />
                  <circle cx="19" cy="19" r="16" fill="none" stroke={C.gold} strokeWidth="3" strokeDasharray="12 88" strokeDashoffset="-75" />
                </svg>
                <div style={{
                  position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16,
                }}>⚽</div>
              </div>
              <div>
                <div style={{
                  fontFamily: "'Outfit', sans-serif", fontWeight: 700,
                  fontSize: 20, letterSpacing: 0.5, color: "white", lineHeight: 1,
                }}>
                  <span style={{ color: C.red }}>M</span>
                  <span style={{ color: "white" }}>oundi</span>
                  <span style={{ color: C.green }}>G</span>
                  <span style={{ color: "white" }}>uide</span>
                </div>
                <div style={{
                  fontFamily: "'Outfit', sans-serif", fontSize: 9, fontWeight: 400,
                  color: C.muted, letterSpacing: 2, textTransform: "uppercase", marginTop: 2,
                }}>YallaVamos 2030</div>
              </div>
            </div>

            {/* Lang pill */}
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowLangMenu(!showLangMenu)} style={{
                background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 20, padding: "5px 12px", cursor: "pointer",
                color: "white", fontSize: 12, fontWeight: 500,
                display: "flex", alignItems: "center", gap: 5,
                fontFamily: "'Outfit', sans-serif",
              }}>
                <span style={{ fontSize: 14 }}>{currentLang.flag}</span>
                <span>{currentLang.label}</span>
                <span style={{ opacity: 0.4, fontSize: 8 }}>▼</span>
              </button>
              {showLangMenu && (
                <div style={{
                  position: "absolute", right: 0, top: "calc(100% + 6px)",
                  background: "rgba(12,17,23,0.97)", backdropFilter: "blur(20px)",
                  border: `1px solid ${C.border}`, borderRadius: 10,
                  overflow: "hidden", zIndex: 100, minWidth: 150,
                  boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
                  animation: "fadeIn 0.15s ease both",
                }}>
                  {LANGUAGES.map((l) => (
                    <button key={l.code} onClick={() => { setLang(l.code); setShowLangMenu(false); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        width: "100%", padding: "9px 14px",
                        background: lang === l.code ? "rgba(245,166,35,0.1)" : "transparent",
                        border: "none", cursor: "pointer",
                        color: lang === l.code ? C.gold : C.text,
                        fontSize: 12, textAlign: "left",
                        fontFamily: "'Outfit', sans-serif",
                      }}
                    >
                      <span style={{ fontSize: 15 }}>{l.flag}</span>
                      <span>{l.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Color bar - YallaVamos identity */}
          <div style={{ display: "flex", height: 3, marginTop: 10, borderRadius: 2, overflow: "hidden" }}>
            <div style={{ flex: 1, background: C.red }} />
            <div style={{ flex: 1, background: C.gold }} />
            <div style={{ flex: 1, background: C.green }} />
            <div style={{ flex: 1, background: C.blue }} />
          </div>
        </div>

        {/* ═══ TAB NAVIGATION ═══ */}
        <div style={{
          display: "flex", background: "rgba(0,0,0,0.3)",
          borderBottom: `1px solid ${C.border}`, flexShrink: 0,
        }}>
          {[
            { id: "chat", label: lang === "ar" ? "محادثة" : lang === "es" ? "Chat" : lang === "pt" ? "Chat" : lang === "zh" ? "聊天" : "Chat", icon: "💬" },
            { id: "info", label: lang === "ar" ? "معلومات" : lang === "es" ? "Info" : lang === "pt" ? "Info" : lang === "zh" ? "信息" : "Infos", icon: "ℹ️" },
            { id: "stadiums", label: lang === "ar" ? "ملاعب" : lang === "es" ? "Estadios" : lang === "pt" ? "Estádios" : lang === "zh" ? "球场" : "Stades", icon: "🏟️" },
          ].map(tab => (
            <button key={tab.id} className="tab-btn" onClick={() => setActiveTab(tab.id)} style={{
              flex: 1, padding: "10px 0", border: "none", cursor: "pointer",
              background: activeTab === tab.id ? "rgba(245,166,35,0.08)" : "transparent",
              borderBottom: activeTab === tab.id ? `2px solid ${C.gold}` : "2px solid transparent",
              color: activeTab === tab.id ? C.gold : C.muted,
              fontSize: 12, fontWeight: 500, fontFamily: "'Outfit', sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
            }}>
              <span style={{ fontSize: 13 }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ═══ CONTENT AREA ═══ */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>

          {/* ─── CHAT TAB ─── */}
          {activeTab === "chat" && (
            <div style={{ flex: 1, padding: "16px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
              {messages.map((msg, i) => (
                <div key={i} className="msg-enter" style={{
                  display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  direction: isRTL ? "rtl" : "ltr",
                }}>
                  {msg.role === "assistant" && (
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                      background: `linear-gradient(135deg, ${C.red}, ${C.green})`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, marginRight: isRTL ? 0 : 7, marginLeft: isRTL ? 7 : 0, marginTop: 2,
                    }}>⚽</div>
                  )}
                  <div style={{
                    maxWidth: "80%", padding: "10px 14px",
                    borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: msg.role === "user"
                      ? `linear-gradient(135deg, ${C.red}, #A01830)`
                      : C.card,
                    border: msg.role === "user" ? "none" : `1px solid ${C.border}`,
                    color: C.text, fontSize: 13, lineHeight: 1.6,
                    fontFamily: isRTL ? "'Noto Sans Arabic', sans-serif" : "'Outfit', sans-serif",
                    fontWeight: 300,
                    textAlign: isRTL ? "right" : "left",
                    whiteSpace: "pre-wrap",
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="msg-enter" style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: `linear-gradient(135deg, ${C.red}, ${C.green})`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
                  }}>⚽</div>
                  <div style={{
                    padding: "10px 14px", borderRadius: "16px 16px 16px 4px",
                    background: C.card, border: `1px solid ${C.border}`,
                    display: "flex", gap: 4,
                  }}>
                    {[0, 0.15, 0.3].map((d, i) => (
                      <div key={i} style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: C.gold, animation: `dotPulse 1s ease-in-out infinite`,
                        animationDelay: `${d}s`,
                      }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* ─── INFO TAB ─── */}
          {activeTab === "info" && (
            <div style={{ padding: "16px 14px", animation: "fadeIn 0.3s ease" }}>
              <div style={{
                fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 600,
                color: "white", marginBottom: 14,
                direction: isRTL ? "rtl" : "ltr",
              }}>{info.title}</div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {info.items.map((item, i) => (
                  <div key={i} style={{
                    background: C.card, border: `1px solid ${C.border}`,
                    borderRadius: 10, padding: "12px",
                    direction: isRTL ? "rtl" : "ltr",
                  }}>
                    <div style={{ fontSize: 18, marginBottom: 4 }}>{item.icon}</div>
                    <div style={{
                      fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 400,
                      color: C.muted, textTransform: "uppercase", letterSpacing: 0.5,
                    }}>{item.label}</div>
                    <div style={{
                      fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600,
                      color: "white", marginTop: 2,
                    }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Useful phrases */}
              <div style={{
                marginTop: 16, background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 10, padding: "14px",
              }}>
                <div style={{
                  fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600,
                  color: C.gold, marginBottom: 10,
                }}>🗣️ {lang === "ar" ? "عبارات بالدارجة" : lang === "es" ? "Frases en Darija" : lang === "pt" ? "Frases em Darija" : lang === "zh" ? "达里贾常用语" : "Phrases en Darija"}</div>
                {[
                  { darija: "Salam", trans: lang === "ar" ? "مرحبا" : lang === "es" ? "Hola" : lang === "pt" ? "Olá" : lang === "zh" ? "你好" : "Bonjour" },
                  { darija: "Beshhal?", trans: lang === "ar" ? "بكم؟" : lang === "es" ? "¿Cuánto cuesta?" : lang === "pt" ? "Quanto custa?" : lang === "zh" ? "多少钱？" : "Combien ?" },
                  { darija: "Shukran", trans: lang === "ar" ? "شكرا" : lang === "es" ? "Gracias" : lang === "pt" ? "Obrigado" : lang === "zh" ? "谢谢" : "Merci" },
                  { darija: "La, shukran", trans: lang === "ar" ? "لا، شكرا" : lang === "es" ? "No, gracias" : lang === "pt" ? "Não, obrigado" : lang === "zh" ? "不用了，谢谢" : "Non, merci" },
                  { darija: "Fin kayn...?", trans: lang === "ar" ? "فين كاين...؟" : lang === "es" ? "¿Dónde está...?" : lang === "pt" ? "Onde fica...?" : lang === "zh" ? "...在哪里？" : "Où est...?" },
                ].map((p, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "7px 0",
                    borderBottom: i < 4 ? `1px solid ${C.border}` : "none",
                    direction: isRTL ? "rtl" : "ltr",
                  }}>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 500, color: "white" }}>{p.darija}</span>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: C.muted }}>{p.trans}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── STADIUMS TAB ─── */}
          {activeTab === "stadiums" && (
            <div style={{ padding: "16px 14px", animation: "fadeIn 0.3s ease" }}>
              <div style={{
                fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 600,
                color: "white", marginBottom: 4,
              }}>🇲🇦 {lang === "ar" ? "ملاعب المغرب" : lang === "es" ? "Estadios de Marruecos" : lang === "pt" ? "Estádios de Marrocos" : lang === "zh" ? "摩洛哥球场" : "Stades du Maroc"}</div>
              <div style={{
                fontFamily: "'Outfit', sans-serif", fontSize: 11, color: C.muted, marginBottom: 14,
              }}>6 {lang === "ar" ? "مدن مستضيفة" : lang === "es" ? "ciudades anfitrionas" : lang === "pt" ? "cidades-sede" : lang === "zh" ? "个主办城市" : "villes hôtes"}</div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {STADIUMS.map((s, i) => (
                  <button key={i} className="topic-btn" onClick={() => sendMessage(
                    lang === "ar" ? `أخبرني عن ملعب ${s.city}` :
                    lang === "es" ? `Háblame del estadio de ${s.city}` :
                    lang === "pt" ? `Fale-me do estádio de ${s.city}` :
                    lang === "zh" ? `告诉我关于${s.city}球场的信息` :
                    `Parle-moi du stade de ${s.city}, comment y accéder, les restaurants et hôtels à proximité`
                  )} style={{
                    background: C.card, border: `1px solid ${C.border}`,
                    borderRadius: 10, padding: "12px 14px", cursor: "pointer",
                    textAlign: "left", display: "flex", alignItems: "center", gap: 12,
                    borderLeft: `3px solid ${[C.red, C.green, C.gold, C.blue, C.red, C.green][i]}`,
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600, color: "white",
                      }}>{s.city}</div>
                      <div style={{
                        fontFamily: "'Outfit', sans-serif", fontSize: 11, color: C.muted, marginTop: 2,
                      }}>{s.name}</div>
                    </div>
                    <div style={{
                      fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600,
                      color: C.gold, background: "rgba(245,166,35,0.1)",
                      padding: "3px 8px", borderRadius: 6,
                    }}>{s.capacity}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ═══ QUICK TOPICS ═══ */}
        <div style={{
          padding: "6px 14px", display: "flex", gap: 6,
          overflowX: "auto", flexShrink: 0,
          scrollbarWidth: "none",
          borderTop: `1px solid ${C.border}`,
        }}>
          {QUICK_TOPICS[lang].map((topic, i) => (
            <button key={i} className="topic-btn" onClick={() => sendMessage(topic)} style={{
              whiteSpace: "nowrap", padding: "5px 10px",
              background: C.card, border: `1px solid ${C.border}`,
              borderRadius: 16, color: C.muted, fontSize: 11,
              cursor: "pointer", fontFamily: isRTL ? "'Noto Sans Arabic', sans-serif" : "'Outfit', sans-serif",
              fontWeight: 400,
            }}>{topic}</button>
          ))}
        </div>

        {/* ═══ INPUT ═══ */}
        <div style={{
          padding: "10px 14px 14px",
          background: "rgba(0,0,0,0.4)", backdropFilter: "blur(24px)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder={PLACEHOLDERS[lang]}
              rows={1}
              dir={isRTL ? "rtl" : "ltr"}
              style={{
                flex: 1, resize: "none", padding: "10px 12px",
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${C.border}`,
                borderRadius: 12, color: "white", fontSize: 13,
                fontFamily: isRTL ? "'Noto Sans Arabic', sans-serif" : "'Outfit', sans-serif",
                fontWeight: 300, lineHeight: 1.5,
                transition: "border-color 0.2s",
              }}
            />
            <button
              className="send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: input.trim() && !loading
                  ? `linear-gradient(135deg, ${C.red}, ${C.green})`
                  : "rgba(255,255,255,0.06)",
                border: "none",
                cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, transition: "all 0.2s", color: "white",
              }}
            >
              {loading
                ? <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                : "➤"}
            </button>
          </div>
          {/* Footer bar */}
          <div style={{
            display: "flex", justifyContent: "center", alignItems: "center", gap: 6,
            marginTop: 8,
          }}>
            <div style={{ width: 8, height: 3, borderRadius: 2, background: C.red }} />
            <div style={{ width: 8, height: 3, borderRadius: 2, background: C.gold }} />
            <div style={{ width: 8, height: 3, borderRadius: 2, background: C.green }} />
            <div style={{ width: 8, height: 3, borderRadius: 2, background: C.blue }} />
            <span style={{
              fontFamily: "'Outfit', sans-serif", fontSize: 9, color: C.muted,
              letterSpacing: 1.5, marginLeft: 6,
            }}>YALLAVAMOS 2030</span>
          </div>
        </div>
      </div>
    </div>
  );
}
