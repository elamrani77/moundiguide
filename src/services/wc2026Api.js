const BASE = "/api/football";

// In-memory cache: { [url]: { data, ts } }
const cache = {};

async function fetchWithCache(url, ttlMs = 60000) {
  const now = Date.now();
  if (cache[url] && now - cache[url].ts < ttlMs) {
    return cache[url].data;
  }
  try {
    const res = await fetch(url);
    if (!res.ok) return { response: [] };
    const data = await res.json();
    cache[url] = { data, ts: now };
    return data;
  } catch {
    return { response: [] };
  }
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

const WC2026_SCHEDULE = [
  { home:'Mexico', away:'South Africa', date:'2026-06-11', group:'A' },
  { home:'Canada', away:'Bosnia and Herzegovina', date:'2026-06-12', group:'B' },
  { home:'USA', away:'Paraguay', date:'2026-06-12', group:'D' },
  { home:'Brazil', away:'Haiti', date:'2026-06-13', group:'C' },
  { home:'Morocco', away:'Scotland', date:'2026-06-13', group:'C' },
  { home:'Germany', away:'Curacao', date:'2026-06-14', group:'E' },
  { home:'Spain', away:'Cape Verde', date:'2026-06-15', group:'H' },
  { home:'France', away:'Senegal', date:'2026-06-16', group:'I' },
  { home:'Argentina', away:'Algeria', date:'2026-06-16', group:'J' },
  { home:'Portugal', away:'DR Congo', date:'2026-06-17', group:'K' },
  { home:'England', away:'Croatia', date:'2026-06-17', group:'L' },
  { home:'Netherlands', away:'Tunisia', date:'2026-06-17', group:'F' },
  { home:'Belgium', away:'Italy', date:'2026-06-18', group:'G' },
  { home:'Uruguay', away:'Saudi Arabia', date:'2026-06-18', group:'H' },
  { home:'Japan', away:'Ecuador', date:'2026-06-19', group:'F' },
  { home:'Brazil', away:'Scotland', date:'2026-06-19', group:'C' },
  { home:'Morocco', away:'Haiti', date:'2026-06-24', group:'C' },
  { home:'Argentina', away:'Austria', date:'2026-06-22', group:'J' },
  { home:'Jordan', away:'Argentina', date:'2026-06-27', group:'J' },
];

export async function getNextMatch(teamName) {
  // First try API
  try {
    const data = await fetchWithCache('/api/football?type=next', 300000);
    const fixtures = data?.response || [];
    if (fixtures.length > 0) {
      const sorted = fixtures
        .filter(f => f.fixture?.date)
        .sort((a, b) => new Date(a.fixture.date) - new Date(b.fixture.date));

      if (teamName) {
        const found = sorted.find(f =>
          f.teams?.home?.name?.toLowerCase().includes(teamName.toLowerCase()) ||
          f.teams?.away?.name?.toLowerCase().includes(teamName.toLowerCase())
        );
        if (found) return found;
      }
      return sorted[0];
    }
  } catch { /* fallback below */ }

  // Fallback to static WC 2026 schedule
  const now = new Date();
  const upcoming = WC2026_SCHEDULE
    .filter(m => new Date(m.date) >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (teamName) {
    const match = upcoming.find(m =>
      m.home.toLowerCase().includes(teamName.toLowerCase()) ||
      m.away.toLowerCase().includes(teamName.toLowerCase()) ||
      teamName.toLowerCase().includes(m.home.toLowerCase()) ||
      teamName.toLowerCase().includes(m.away.toLowerCase())
    );
    if (match) {
      return {
        fixture: { date: match.date + 'T20:00:00Z' },
        teams: {
          home: { name: match.home },
          away: { name: match.away },
        }
      };
    }
  }
  return upcoming[0] ? {
    fixture: { date: upcoming[0].date + 'T20:00:00Z' },
    teams: { home: { name: upcoming[0].home }, away: { name: upcoming[0].away } }
  } : null;
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
    "Scotland": "gb-sct", "Norway": "no", "Haiti": "ht", "Paraguay": "py",
    "Turkey": "tr", "Austria": "at", "Switzerland": "ch", "Czechia": "cz",
    "Sweden": "se", "Iran": "ir", "New Zealand": "nz", "Egypt": "eg",
    "Cape Verde": "cv", "Jordan": "jo", "Algeria": "dz", "Uzbekistan": "uz",
    "Congo DR": "cd", "Bosnia": "ba", "Bosnia and Herzegovina": "ba",
    "Panama": "pa", "Iraq": "iq", "South Africa": "za", "Curacao": "cw",
    "Chile": "cl", "Peru": "pe", "Serbia": "rs", "Denmark": "dk",
    "Poland": "pl", "Wales": "gb-wls", "Nigeria": "ng", "Cameroon": "cm",
    "Ivory Coast": "ci", "Costa Rica": "cr", "Jamaica": "jm",
  };
  return map[name] || "xx";
}
