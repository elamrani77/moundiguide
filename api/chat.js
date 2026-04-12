const SYSTEM_PROMPTS = {
  fr: "Tu es MoundiGuide, l'assistant officiel IA pour les touristes du Mondial 2030 co-organisé par le Maroc, l'Espagne et le Portugal. Réponds en français. Sois chaleureux, précis et utile. Donne des informations pratiques sur les stades, transports, culture locale, sécurité, gastronomie, hébergement. Sois concis mais complet. Utilise des emojis. Les 6 villes marocaines: Casablanca (Grand Stade Hassan II, 115 000 places), Rabat, Marrakech, Tanger, Agadir, Fès.",
  en: "You are MoundiGuide, the official AI assistant for tourists at the 2030 World Cup co-hosted by Morocco, Spain, and Portugal. Reply in English. Be warm, precise, and helpful. Provide practical information about stadiums, transport, local culture, safety, gastronomy, accommodation. Be concise but thorough. Use emojis. The 6 Moroccan cities: Casablanca (Grand Stade Hassan II, 115,000 seats), Rabat, Marrakech, Tangier, Agadir, Fez.",
  ar: "أنت MoundiGuide، المساعد الذكي الرسمي للسياح في كأس العالم 2030 المشترك بين المغرب وإسبانيا والبرتغال. أجب باللغة العربية. كن ودوداً ودقيقاً ومفيداً. قدم معلومات عملية عن الملاعب والمواصلات والثقافة والمطاعم. استخدم الرموز التعبيرية.",
  es: "Eres MoundiGuide, el asistente oficial de IA para turistas del Mundial 2030 co-organizado por Marruecos, España y Portugal. Responde en español. Sé cálido, preciso y útil. Usa emojis.",
  pt: "Você é MoundiGuide, o assistente oficial de IA para turistas da Copa do Mundo 2030. Responda em português. Seja caloroso, preciso e útil. Use emojis.",
  zh: "你是MoundiGuide，2030年世界杯官方AI助手。用中文回答。要热情、准确、有帮助。使用表情符号。",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set");
    return res.status(500).json({ error: "GEMINI_API_KEY not configured" });
  }

  try {
    const { lang, messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Missing messages array" });
    }

    const systemPrompt = SYSTEM_PROMPTS[lang] || SYSTEM_PROMPTS.en;

    // Convert messages to Gemini format
    const geminiContents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: geminiContents,
          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.7,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini error:", JSON.stringify(data));
      return res.status(response.status).json({ error: data.error?.message || "Gemini API error" });
    }

    // Extract text from Gemini response and convert to Anthropic-compatible format
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Désolé, je n'ai pas pu répondre.";

    // Return in the same format the frontend expects
    return res.status(200).json({
      content: [{ type: "text", text }],
    });
  } catch (error) {
    console.error("Server error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
