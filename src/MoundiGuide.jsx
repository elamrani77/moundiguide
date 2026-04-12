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
  fr: ["🏟️ Stades & Matchs", "🚇 Transports", "🍜 Restauration", "🏨 Hébergement", "🚑 Urgences", "💱 Change & Paiement"],
  en: ["🏟️ Stadiums & Matches", "🚇 Transport", "🍜 Food & Drink", "🏨 Accommodation", "🚑 Emergencies", "💱 Currency & Payment"],
  ar: ["🏟️ الملاعب والمباريات", "🚇 المواصلات", "🍜 الطعام والشراب", "🏨 الإقامة", "🚑 الطوارئ", "💱 العملة والدفع"],
  es: ["🏟️ Estadios & Partidos", "🚇 Transporte", "🍜 Comida & Bebida", "🏨 Alojamiento", "🚑 Emergencias", "💱 Moneda & Pago"],
  pt: ["🏟️ Estádios & Jogos", "🚇 Transporte", "🍜 Comida & Bebida", "🏨 Hospedagem", "🚑 Emergências", "💱 Moeda & Pagamento"],
  zh: ["🏟️ 体育场 & 比赛", "🚇 交通出行", "🍜 餐饮美食", "🏨 住宿", "🚑 紧急情况", "💱 货币 & 支付"],
};

const PLACEHOLDERS = {
  fr: "Posez votre question sur le Mondial 2030...",
  en: "Ask anything about the 2030 World Cup...",
  ar: "اسأل عن كأس العالم 2030...",
  es: "Pregunta sobre el Mundial 2030...",
  pt: "Pergunte sobre a Copa do Mundo 2030...",
  zh: "询问2030年世界杯相关问题...",
};

const SYSTEM_PROMPTS = {
  fr: `Tu es MoundiGuide, l'assistant officiel IA pour les touristes du Mondial 2030 co-organisé par le Maroc, l'Espagne et le Portugal. Réponds en français. Sois chaleureux, précis et utile. Donne des informations pratiques sur les stades, transports, culture locale, sécurité, gastronomie, hébergement, et expériences locales. Le Mondial 2030 se déroule dans 3 pays: Maroc, Espagne, Portugal. Sois concis mais complet. Utilise des emojis pour rendre les réponses vivantes.`,
  en: `You are MoundiGuide, the official AI assistant for tourists at the 2030 World Cup co-hosted by Morocco, Spain, and Portugal. Reply in English. Be warm, precise, and helpful. Provide practical information about stadiums, transport, local culture, safety, gastronomy, accommodation, and local experiences. The 2030 World Cup takes place across 3 countries: Morocco, Spain, Portugal. Be concise but thorough. Use emojis to make responses lively.`,
  ar: `أنت MoundiGuide، المساعد الذكي الرسمي للسياح في كأس العالم 2030 المشترك بين المغرب وإسبانيا والبرتغال. أجب باللغة العربية. كن ودوداً ودقيقاً ومفيداً. قدم معلومات عملية حول الملاعب والمواصلات والثقافة المحلية والأمان والمأكولات والإقامة والتجارب المحلية. استخدم الرموز التعبيرية لجعل الإجابات حيوية.`,
  es: `Eres MoundiGuide, el asistente oficial de IA para turistas del Mundial 2030 co-organizado por Marruecos, España y Portugal. Responde en español. Sé cálido, preciso y útil. Proporciona información práctica sobre estadios, transporte, cultura local, seguridad, gastronomía, alojamiento y experiencias locales. Usa emojis para hacer las respuestas más vivas.`,
  pt: `Você é MoundiGuide, o assistente oficial de IA para turistas da Copa do Mundo 2030 co-organizada por Marrocos, Espanha e Portugal. Responda em português. Seja caloroso, preciso e útil. Forneça informações práticas sobre estádios, transporte, cultura local, segurança, gastronomia, hospedagem e experiências locais. Use emojis para tornar as respostas mais animadas.`,
  zh: `你是MoundiGuide，2030年世界杯官方AI助手，该届世界杯由摩洛哥、西班牙和葡萄牙联合举办。用中文回答。要热情、准确、有帮助。提供关于体育场、交通、当地文化、安全、美食、住宿和当地体验的实用信息。使用表情符号让回答更生动。`,
};

const WELCOME_MESSAGES = {
  fr: "Bienvenue au Mondial 2030 ! 🌍⚽ Je suis MoundiGuide, votre assistant de voyage personnel. Comment puis-je vous aider aujourd'hui ?",
  en: "Welcome to the 2030 World Cup! 🌍⚽ I'm MoundiGuide, your personal travel assistant. How can I help you today?",
  ar: "مرحباً بكم في كأس العالم 2030! 🌍⚽ أنا MoundiGuide، مساعدك السياحي الشخصي. كيف يمكنني مساعدتك اليوم؟",
  es: "¡Bienvenido al Mundial 2030! 🌍⚽ Soy MoundiGuide, tu asistente de viaje personal. ¿Cómo puedo ayudarte hoy?",
  pt: "Bem-vindo à Copa do Mundo 2030! 🌍⚽ Sou MoundiGuide, seu assistente de viagem pessoal. Como posso ajudá-lo hoje?",
  zh: "欢迎来到2030年世界杯！🌍⚽ 我是MoundiGuide，您的私人旅行助手。今天我能帮您什么？",
};

export default function MoundiGuide() {
  const [lang, setLang] = useState("fr");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
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

    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const apiMessages = newMessages.map((m) => ({ role: m.role, content: m.content }));
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang,
          messages: apiMessages,
        }),
      });
      const data = await response.json();
      const reply = data.content?.[0]?.text || "...";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "⚠️ Erreur de connexion. Veuillez réessayer." }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const currentLang = LANGUAGES.find((l) => l.code === lang);
  const isRTL = lang === "ar";

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0a0a 0%, #0d1a0d 40%, #0a1420 100%)",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "0",
    }}>
      {/* Animated background blobs */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div style={{
          position: "absolute", top: "-20%", left: "-10%", width: "50vw", height: "50vw",
          background: "radial-gradient(circle, rgba(196,30,58,0.12) 0%, transparent 70%)",
          borderRadius: "50%", animation: "blob1 12s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", bottom: "-20%", right: "-10%", width: "45vw", height: "45vw",
          background: "radial-gradient(circle, rgba(0,130,60,0.12) 0%, transparent 70%)",
          borderRadius: "50%", animation: "blob2 15s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", top: "30%", right: "20%", width: "30vw", height: "30vw",
          background: "radial-gradient(circle, rgba(255,200,0,0.06) 0%, transparent 70%)",
          borderRadius: "50%", animation: "blob3 10s ease-in-out infinite",
        }} />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Noto+Sans+Arabic:wght@400;600&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes blob1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(5%,8%) scale(1.1)} }
        @keyframes blob2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-5%,-8%) scale(1.08)} }
        @keyframes blob3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(3%,-5%) scale(1.05)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes ballBounce {
          0%,100%{transform:translateY(0) scale(1)}
          40%{transform:translateY(-10px) scale(0.95)}
          60%{transform:translateY(-4px) scale(1.02)}
        }
        .msg-bubble { animation: fadeUp 0.35s ease both; }
        .quick-btn:hover { transform: translateY(-2px); background: rgba(255,255,255,0.1) !important; border-color: rgba(255,200,0,0.4) !important; }
        .send-btn:hover:not(:disabled) { background: #e6c200 !important; transform: scale(1.05); }
        .lang-pill:hover { background: rgba(255,255,255,0.12) !important; }
        textarea:focus { outline: none; border-color: rgba(255,200,0,0.5) !important; box-shadow: 0 0 0 2px rgba(255,200,0,0.1); }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 680, display: "flex", flexDirection: "column", height: "100vh", position: "relative", zIndex: 1 }}>

        {/* HEADER */}
        <div style={{
          padding: "18px 20px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(20px)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Logo */}
            <div style={{ position: "relative", width: 44, height: 44 }}>
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                background: "linear-gradient(135deg, #c41e3a, #00823c)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, boxShadow: "0 4px 20px rgba(196,30,58,0.4)",
                animation: "ballBounce 3s ease-in-out infinite",
              }}>⚽</div>
            </div>
            <div>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 26, letterSpacing: 2,
                background: "linear-gradient(90deg, #fff 0%, #ffd700 50%, #c41e3a 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                lineHeight: 1,
              }}>MoundiGuide</div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", marginTop: 1 }}>
                World Cup 2030 · MA · ES · PT
              </div>
            </div>
          </div>

          {/* Language Selector */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="lang-pill"
              style={{
                background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 20, padding: "7px 14px", cursor: "pointer",
                color: "white", fontSize: 13, fontWeight: 500,
                display: "flex", alignItems: "center", gap: 7, transition: "all 0.2s",
              }}
            >
              <span style={{ fontSize: 16 }}>{currentLang.flag}</span>
              <span>{currentLang.label}</span>
              <span style={{ opacity: 0.5, fontSize: 10 }}>▼</span>
            </button>
            {showLangMenu && (
              <div style={{
                position: "absolute", right: 0, top: "calc(100% + 8px)",
                background: "rgba(15,15,15,0.95)", backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12,
                overflow: "hidden", zIndex: 100, minWidth: 160,
                boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                animation: "fadeUp 0.2s ease both",
              }}>
                {LANGUAGES.map((l) => (
                  <button key={l.code} onClick={() => { setLang(l.code); setShowLangMenu(false); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      width: "100%", padding: "10px 16px", background: lang === l.code ? "rgba(255,200,0,0.1)" : "transparent",
                      border: "none", cursor: "pointer", color: lang === l.code ? "#ffd700" : "rgba(255,255,255,0.8)",
                      fontSize: 13, textAlign: "left", transition: "background 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                    onMouseLeave={e => e.currentTarget.style.background = lang === l.code ? "rgba(255,200,0,0.1)" : "transparent"}
                  >
                    <span style={{ fontSize: 18 }}>{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* FLAGS STRIPE */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 0,
          background: "rgba(0,0,0,0.2)", padding: "6px 0",
          flexShrink: 0,
        }}>
          {["🇲🇦", "⚽", "🇪🇸", "⚽", "🇵🇹"].map((item, i) => (
            <span key={i} style={{ fontSize: i % 2 === 1 ? 10 : 20, padding: "0 8px", opacity: i % 2 === 1 ? 0.3 : 0.9 }}>{item}</span>
          ))}
        </div>

        {/* MESSAGES */}
        <div style={{
          flex: 1, overflowY: "auto", padding: "20px 16px",
          display: "flex", flexDirection: "column", gap: 12,
        }}>
          {messages.map((msg, i) => (
            <div key={i} className="msg-bubble" style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              direction: isRTL ? "rtl" : "ltr",
            }}>
              {msg.role === "assistant" && (
                <div style={{
                  width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg, #c41e3a, #00823c)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, marginRight: 8, marginTop: 2,
                  boxShadow: "0 2px 8px rgba(196,30,58,0.3)",
                }}>⚽</div>
              )}
              <div style={{
                maxWidth: "78%", padding: "11px 15px",
                borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                background: msg.role === "user"
                  ? "linear-gradient(135deg, rgba(196,30,58,0.8), rgba(180,20,45,0.9))"
                  : "rgba(255,255,255,0.06)",
                border: msg.role === "user" ? "none" : "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.92)",
                fontSize: isRTL ? 14 : 13.5, lineHeight: 1.65,
                fontFamily: isRTL ? "'Noto Sans Arabic', sans-serif" : "'DM Sans', sans-serif",
                backdropFilter: "blur(10px)",
                textAlign: isRTL ? "right" : "left",
              }}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="msg-bubble" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 30, height: 30, borderRadius: "50%",
                background: "linear-gradient(135deg, #c41e3a, #00823c)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
              }}>⚽</div>
              <div style={{
                padding: "12px 16px", borderRadius: "18px 18px 18px 4px",
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                display: "flex", gap: 5, alignItems: "center",
              }}>
                {[0, 0.2, 0.4].map((d, i) => (
                  <div key={i} style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: "#ffd700", animation: `pulse 1.2s ease-in-out infinite`,
                    animationDelay: `${d}s`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* QUICK TOPICS */}
        <div style={{
          padding: "8px 16px 6px",
          display: "flex", gap: 7, overflowX: "auto", flexShrink: 0,
          scrollbarWidth: "none",
        }}>
          {QUICK_TOPICS[lang].map((topic, i) => (
            <button key={i} className="quick-btn" onClick={() => sendMessage(topic)}
              style={{
                whiteSpace: "nowrap", padding: "6px 12px",
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 20, color: "rgba(255,255,255,0.75)", fontSize: 11.5,
                cursor: "pointer", transition: "all 0.2s",
                fontFamily: isRTL ? "'Noto Sans Arabic', sans-serif" : "'DM Sans', sans-serif",
              }}
            >{topic}</button>
          ))}
        </div>

        {/* INPUT */}
        <div style={{
          padding: "10px 14px 16px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(0,0,0,0.3)", backdropFilter: "blur(20px)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder={PLACEHOLDERS[lang]}
              rows={1}
              dir={isRTL ? "rtl" : "ltr"}
              style={{
                flex: 1, resize: "none", padding: "11px 14px",
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 14, color: "white", fontSize: 13.5,
                fontFamily: isRTL ? "'Noto Sans Arabic', sans-serif" : "'DM Sans', sans-serif",
                transition: "border-color 0.2s, box-shadow 0.2s",
                lineHeight: 1.5,
              }}
            />
            <button
              className="send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: input.trim() && !loading ? "#ffd700" : "rgba(255,255,255,0.1)",
                border: "none", cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, transition: "all 0.2s",
                boxShadow: input.trim() && !loading ? "0 4px 16px rgba(255,215,0,0.3)" : "none",
              }}
            >
              {loading
                ? <div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                : "➤"}
            </button>
          </div>
          <div style={{ textAlign: "center", marginTop: 8, color: "rgba(255,255,255,0.2)", fontSize: 10, letterSpacing: 0.8 }}>
            MONDIAL 2030 · MAROC · ESPAGNE · PORTUGAL
          </div>
        </div>
      </div>
    </div>
  );
}
