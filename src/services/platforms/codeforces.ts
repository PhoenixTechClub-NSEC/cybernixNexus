import { CodeforcesFetchResult } from './types';

const CF_USER_INFO_ENDPOINT = 'https://codeforces.com/api/user.info';
const CF_USER_STATUS_ENDPOINT = 'https://codeforces.com/api/user.status';

export async function fetchCodeforcesStats(handle: string): Promise<CodeforcesFetchResult> {
  if (!handle || !handle.trim()) {
    return { rating: null, maxRating: null, rank: null, maxRank: null, solved: 0, avatar: null, contribution: null };
  }

  const trimmedHandle = handle.trim();

  try {
    // Fetch user info (rating, maxRating, rank, maxRank, avatar, contribution)
    const infoUrl = `${CF_USER_INFO_ENDPOINT}?handles=${encodeURIComponent(trimmedHandle)}`;
    const infoResponse = await fetch(infoUrl, {
      method: 'GET',
      headers: { 'User-Agent': 'CybernixNexus-PlatformFetcher/1.0' },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 3600 },
    });

    if (!infoResponse.ok) {
      throw new Error(`Codeforces API returned status ${infoResponse.status}`);
    }

    const infoJson = await infoResponse.json();

    if (infoJson.status !== 'OK' || !infoJson.result || infoJson.result.length === 0) {
      throw new Error(`Codeforces handle "${trimmedHandle}" not found or API error: ${infoJson.comment || ''}`);
    }

    const user = infoJson.result[0];
    const rating = user.rating ?? null;
    const maxRating = user.maxRating ?? null;
    const rank = user.rank ?? null;
    const maxRank = user.maxRank ?? null;
    const avatar = user.titlePhoto || user.avatar || null;
    const contribution = user.contribution ?? null;

    // Fetch user submission status to count unique solved problems
    const statusUrl = `${CF_USER_STATUS_ENDPOINT}?handle=${encodeURIComponent(trimmedHandle)}`;
    const statusResponse = await fetch(statusUrl, {
      method: 'GET',
      headers: { 'User-Agent': 'CybernixNexus-PlatformFetcher/1.0' },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 3600 },
    });

    if (!statusResponse.ok) {
      throw new Error(`Codeforces status API returned status ${statusResponse.status}`);
    }

    const statusJson = await statusResponse.json();
    if (statusJson.status !== 'OK' || !Array.isArray(statusJson.result)) {
      throw new Error(`Codeforces status API error: ${statusJson.comment || 'Invalid response format'}`);
    }

    const solvedSet = new Set<string>();
    const dailySubmissions: Record<string, number> = {};

    for (const sub of statusJson.result) {
      if (sub.verdict === 'OK' && sub.problem) {
        const p = sub.problem;
        const problemKey = p.contestId
          ? `${p.contestId}-${p.index}`
          : (p.problemsetName ? `${p.problemsetName}-${p.index}` : `${p.name || p.index}`);
        solvedSet.add(problemKey);

        if (sub.creationTimeSeconds) {
          const dateStr = new Date(sub.creationTimeSeconds * 1000).toISOString().split('T')[0];
          dailySubmissions[dateStr] = (dailySubmissions[dateStr] || 0) + 1;
        }
      }
    }
    const solved = solvedSet.size;

    return { rating, maxRating, rank, maxRank, solved, avatar, contribution, dailySubmissions };
  } catch (error: any) {
    console.error(`[Codeforces Fetch Error] Handle: ${handle} - ${error.message}`);
    throw error;
  }
}
