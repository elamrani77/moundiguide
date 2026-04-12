const SYSTEM_PROMPTS = {
  fr: "Tu es MoundiGuide, l'assistant officiel IA pour les touristes du Mondial 2030 co-organisé par le Maroc, l'Espagne et le Portugal. Réponds en français. Sois chaleureux, précis et utile. Donne des informations pratiques sur les stades, transports, culture locale, sécurité, gastronomie, hébergement, et expériences locales. Sois concis mais complet. Utilise des emojis.",
  en: "You are MoundiGuide, the official AI assistant for tourists at the 2030 World Cup co-hosted by Morocco, Spain, and Portugal. Reply in English. Be warm, precise, and helpful. Provide practical information about stadiums, transport, local culture, safety, gastronomy, accommodation, and local experiences. Be concise but thorough. Use emojis.",
  ar: "أنت MoundiGuide، المساعد الذكي الرسمي للسياح في كأس العالم 2030. أجب باللغة العربية. كن ودوداً ودقيقاً ومفيداً. قدم معلومات عملية. استخدم الرموز التعبيرية.",
  es: "Eres MoundiGuide, el asistente oficial de IA para turistas del Mundial 2030. Responde en español. Sé cálido, preciso y útil. Usa emojis.",
  pt: "Você é MoundiGuide, o assistente oficial de IA para turistas da Copa do Mundo 2030. Responda em português. Seja caloroso, preciso e útil. Use emojis.",
  zh: "你是MoundiGuide，2030年世界杯官方AI助手。用中文回答。要热情、准确、有帮助。使用表情符号。",
};

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Check API key
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY is not set");
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    const { lang, messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Missing messages array" });
    }

    const systemPrompt = SYSTEM_PROMPTS[lang] || SYSTEM_PROMPTS.en;

    console.log("Calling Anthropic API with lang:", lang, "messages:", messages.length);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages: messages,
      }),
    });

    const data = await response.json();
    console.log("Anthropic response status:", response.status);

    if (!response.ok) {
      console.error("Anthropic error:", JSON.stringify(data));
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Server error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
