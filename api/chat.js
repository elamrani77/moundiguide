const SYSTEM_PROMPTS = {
  fr: "Tu es MoundiGuide, assistant IA du Mondial 2030 (Maroc, Espagne, Portugal). RÈGLE ABSOLUE: Réponds en MAXIMUM 3 phrases courtes. Pas de listes longues. Si complexe, donne l'essentiel et dis 'Voulez-vous plus de détails?'. Utilise 1-2 emojis max. Villes marocaines: Casablanca, Rabat, Marrakech, Tanger, Agadir, Fès.",
  en: "You are MoundiGuide, 2030 World Cup AI assistant (Morocco, Spain, Portugal). ABSOLUTE RULE: Reply in MAX 3 short sentences. No long lists. If complex, give essentials and say 'Want more details?'. Use 1-2 emojis max.",
  ar: "أنت MoundiGuide مساعد كأس العالم 2030. قاعدة: أجب في 3 جمل قصيرة كحد أقصى. استخدم رمز تعبيري واحد.",
  es: "Eres MoundiGuide, asistente del Mundial 2030. REGLA: Máximo 3 frases cortas. Si es complejo, da lo esencial. 1-2 emojis.",
  pt: "Você é MoundiGuide, assistente Copa 2030. REGRA: Máximo 3 frases curtas. Se complexo, dê o essencial. 1-2 emojis.",
  zh: "你是MoundiGuide，2030世界杯助手。规则：最多3句短话。复杂问题给要点。1-2个表情。",
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY not configured" });
  try {
    const { lang, messages } = req.body;
    if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: "Missing messages" });
    const systemPrompt = SYSTEM_PROMPTS[lang] || SYSTEM_PROMPTS.en;
    const geminiContents = messages.map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system_instruction: { parts: [{ text: systemPrompt }] }, contents: geminiContents, generationConfig: { maxOutputTokens: 300, temperature: 0.7 } }) }
    );
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message || "API error" });
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Désolé, réessayez.";
    return res.status(200).json({ content: [{ type: "text", text }] });
  } catch (error) { return res.status(500).json({ error: error.message }); }
}
