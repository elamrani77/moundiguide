import { useState, useEffect, useRef } from "react";
import { getLiveFixtures } from "../services/footballApi";

export function useLiveScores(pollInterval = 60000) {
  const [fixtures, setFixtures] = useState([]);
  const [latestGoal, setLatestGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const prevGoalsRef = useRef({});

  const fetchData = async () => {
    try {
      const live = await getLiveFixtures();
      setFixtures(live);

      // Check for new goals — live is already normalized
      for (const fix of live) {
        const totalGoals = (fix.homeGoals || 0) + (fix.awayGoals || 0);
        const prev = prevGoalsRef.current[fix.id] || 0;

        if (totalGoals > prev) {
          setLatestGoal({
            home: fix.home,
            away: fix.away,
            homeGoals: fix.homeGoals,
            awayGoals: fix.awayGoals,
            minute: fix.minute,
            timestamp: Date.now()
          });
        }
        prevGoalsRef.current[fix.id] = totalGoals;
      }
    } catch (err) {
      console.error("Football API error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const t = setInterval(fetchData, pollInterval);
    return () => clearInterval(t);
  }, [pollInterval]);

  return { fixtures, latestGoal, loading };
}
