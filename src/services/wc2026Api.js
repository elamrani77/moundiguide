const BASE = "/api/football";

// In-memory cache: { [url]: { data, ts } }
const cache = {};

async function fetchWithCache(url, ttlMs = 60000) {
  const now = Date.now();
  if (cache[url] && now - cache[url].ts < ttlMs) {
    return cache[url].data;
  }
  const res  = await fetch(url);
  const data = await res.json();
  cache[url] = { data, ts: now };
  return data;
}

export async function getLiveMatches() {
  const data = await fetchWithCache(`${BASE}?type=live`, 30000);
  return data?.response || [];
}

export async function getTodayMatches() {
  const data = await fetchWithCache(`${BASE}?type=today`, 300000);
  return data?.response || [];
}

export async function getAllFixtures() {
  const data = await fetchWithCache(`${BASE}?type=fixtures`, 3600000);
  return data?.response || [];
}

export async function getStandings() {
  const data = await fetchWithCache(`${BASE}?type=standings`, 300000);
  return data?.response || [];
}

export async function getNextMatches() {
  const data = await fetchWithCache(`${BASE}?type=next`, 300000);
  return data?.response || [];
}

// Normalize a raw API fixture into a flat display object
export function formatFixture(fixture) {
  return {
    id:        fixture.fixture?.id,
    date:      fixture.fixture?.date,
    status:    fixture.fixture?.status?.short,   // NS | 1H | HT | 2H | ET | PEN | FT
    elapsed:   fixture.fixture?.status?.elapsed,
    homeTeam:  fixture.teams?.home?.name,
    awayTeam:  fixture.teams?.away?.name,
    homeScore: fixture.goals?.home,
    awayScore: fixture.goals?.away,
    venue:     fixture.fixture?.venue?.name,
    city:      fixture.fixture?.venue?.city,
    round:     fixture.league?.round,
  };
}

// Map API team name → flagcdn ISO code
export function getTeamIsoFromName(name) {
  const map = {
    "Morocco": "ma", "Spain": "es", "Portugal": "pt", "France": "fr",
    "Argentina": "ar", "Brazil": "br", "Germany": "de", "England": "gb-eng",
    "Netherlands": "nl", "Belgium": "be", "Croatia": "hr", "Italy": "it",
    "USA": "us", "United States": "us", "Mexico": "mx", "Japan": "jp",
    "Senegal": "sn", "Canada": "ca", "Australia": "au",
    "South Korea": "kr", "Korea Republic": "kr",
    "Saudi Arabia": "sa", "Qatar": "qa", "Tunisia": "tn",
    "Ghana": "gh", "Ecuador": "ec", "Uruguay": "uy", "Colombia": "co",
  };
  return map[name] || "xx";
}
