import { useEffect, useState } from 'react';

/**
 * Hook to fetch and cache CodeChef stats for a student
 */

interface CodeChefStats {
  rating: number | null;
  solved: number;
  stars: string | null;
  globalRank: string | null;
  failCount?: number;
  lastError?: string | null;
}

interface UseCodeChefStatsOptions {
  studentId?: string;
  autoFetch?: boolean;
}

export function useCodeChefStats(options: UseCodeChefStatsOptions = {}) {
  const { studentId, autoFetch = true } = options;
  
  const [stats, setStats] = useState<CodeChefStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async (id: string) => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/student/${id}/stats?platform=codechef`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch CodeChef stats: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.codechef) {
        setStats(data.codechef);
      } else {
        setStats({
          rating: null,
          solved: 0,
          stars: null,
          globalRank: null,
        });
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      console.error('[useCodeChefStats]', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch && studentId) {
      fetchStats(studentId);
    }
  }, [studentId, autoFetch]);

  return { stats, isLoading, error, refetch: () => studentId && fetchStats(studentId) };
}

/**
 * Hook to fetch CodeChef stats for multiple students (for leaderboards)
 */
export function useCodeChefStatsMultiple(studentIds: string[] = []) {
  const [statsByStudent, setStatsByStudent] = useState<Record<string, CodeChefStats>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (studentIds.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch in parallel with Promise.all
      const results = await Promise.allSettled(
        studentIds.map(id =>
          fetch(`/api/student/${id}/stats?platform=codechef`).then(r => r.json())
        )
      );

      const stats: Record<string, CodeChefStats> = {};

      results.forEach((result, idx) => {
        const studentId = studentIds[idx];
        
        if (result.status === 'fulfilled' && result.value.success && result.value.codechef) {
          stats[studentId] = result.value.codechef;
        } else {
          stats[studentId] = {
            rating: null,
            solved: 0,
            stars: null,
            globalRank: null,
          };
        }
      });

      setStatsByStudent(stats);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      console.error('[useCodeChefStatsMultiple]', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (studentIds.length > 0) {
      fetchStats();
    }
  }, [studentIds.join(',')]); // Join to create stable dependency

  return { statsByStudent, isLoading, error };
}
