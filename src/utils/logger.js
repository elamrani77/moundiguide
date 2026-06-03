const isDev = import.meta.env.DEV;

const log = async (level, category, message, metadata = {}, userId = null) => {
  if (isDev) {
    const emoji = level === "error" ? "🔴" : level === "warn" ? "🟡" : "🟢";
    console.log(`${emoji} [${category}] ${message}`, metadata);
  }
  try {
    const { supabase } = await import("../supabase.js");
    await supabase.from("logs").insert({ level, category, message, user_id: userId, metadata });
  } catch (e) {
    if (isDev) console.error("Logger failed:", e);
  }
};

export const logger = {
  info:  (category, message, meta, userId) => log("info",  category, message, meta, userId),
  warn:  (category, message, meta, userId) => log("warn",  category, message, meta, userId),
  error: (category, message, meta, userId) => log("error", category, message, meta, userId),
};

export default logger;
