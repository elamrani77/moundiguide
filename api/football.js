const HEADERS = {
  "x-rapidapi-host": "v3.football.api-sports.io",
  "x-rapidapi-key": process.env.RAPIDAPI_KEY,
};
const BASE   = "https://v3.football.api-sports.io";
const LEAGUE = 1;      // FIFA World Cup
const SEASON = 2026;

export default async function handler(req, res) {
  const { type, team } = req.query;

  let url;
  switch (type) {
    case "fixtures":
      url = `${BASE}/fixtures?league=${LEAGUE}&season=${SEASON}`;
      break;
    case "live":
      url = `${BASE}/fixtures?league=${LEAGUE}&season=${SEASON}&live=all`;
      break;
    case "today": {
      const today = new Date().toISOString().split("T")[0];
      url = `${BASE}/fixtures?league=${LEAGUE}&season=${SEASON}&date=${today}`;
      break;
    }
    case "standings":
      url = `${BASE}/standings?league=${LEAGUE}&season=${SEASON}`;
      break;
    case "team":
      url = `${BASE}/fixtures?league=${LEAGUE}&season=${SEASON}&team=${encodeURIComponent(team || "")}`;
      break;
    case "next":
      // Only WC 2026 fixtures — league=1 season=2026
      url = `${BASE}/fixtures?league=1&season=2026&status=NS&next=48`;
      break;
    default:
      url = `${BASE}/fixtures?league=${LEAGUE}&season=${SEASON}&status=NS&next=20`;
  }

  try {
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
    const response = await fetch(url, { headers: HEADERS });
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message, response: [] });
  }
}
