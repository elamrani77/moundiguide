const API_SPORTS_KEY = import.meta.env.VITE_FOOTBALL_API_KEY;
const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;

// PRIMARY: api-sports.io
async function getLiveFromApiSports() {
  const res = await fetch("https://v3.football.api-sports.io/fixtures?live=all", {
    headers: { "x-apisports-key": API_SPORTS_KEY }
  });
  const data = await res.json();
  if (data.errors && Object.keys(data.errors).length > 0) throw new Error("API Sports error");
  return (data.response || []).map(f => ({
    id: f.fixture.id,
    home: f.teams.home.name,
    away: f.teams.away.name,
    homeLogo: f.teams.home.logo,
    awayLogo: f.teams.away.logo,
    homeGoals: f.goals.home ?? 0,
    awayGoals: f.goals.away ?? 0,
    minute: f.fixture.status.elapsed,
    status: f.fixture.status.short,
    league: f.league.name,
    leagueLogo: f.league.logo,
  }));
}

// FALLBACK: RapidAPI Free Live Football
async function getLiveFromRapidApi() {
  const res = await fetch("https://free-api-live-football-data.p.rapidapi.com/football-current-live", {
    headers: {
      "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com",
      "x-rapidapi-key": RAPIDAPI_KEY
    }
  });
  const data = await res.json();
  const matches = data.response?.live || [];
  return matches.map(f => ({
    id: f.id,
    home: f.home?.name || "",
    away: f.away?.name || "",
    homeLogo: f.home?.logo || "",
    awayLogo: f.away?.logo || "",
    homeGoals: f.score?.home ?? 0,
    awayGoals: f.score?.away ?? 0,
    minute: f.minute || 0,
    status: f.status || "1H",
    league: f.league?.name || "",
    leagueLogo: f.league?.logo || "",
  }));
}

// MAIN: try primary, fallback to secondary
export async function getLiveFixtures() {
  try {
    const results = await getLiveFromApiSports();
    if (results.length >= 0) return results;
    throw new Error("Empty");
  } catch (e) {
    console.warn("API Sports failed, trying RapidAPI:", e.message);
    try {
      return await getLiveFromRapidApi();
    } catch (e2) {
      console.error("Both APIs failed:", e2.message);
      return [];
    }
  }
}

// Today fixtures — use API Sports primary
export async function getTodayFixtures() {
  const today = new Date().toISOString().split('T')[0];
  try {
    const res = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}`, {
      headers: { "x-apisports-key": API_SPORTS_KEY }
    });
    const data = await res.json();
    return (data.response || []).map(f => ({
      id: f.fixture.id,
      home: f.teams.home.name,
      away: f.teams.away.name,
      homeGoals: f.goals.home ?? "-",
      awayGoals: f.goals.away ?? "-",
      minute: f.fixture.status.elapsed,
      status: f.fixture.status.short,
      league: f.league.name,
      time: f.fixture.date,
    }));
  } catch(e) {
    return [];
  }
}
