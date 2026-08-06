import { CodeforcesFetchResult } from './types';

const CF_USER_INFO_ENDPOINT = 'https://codeforces.com/api/user.info';
const CF_USER_STATUS_ENDPOINT = 'https://codeforces.com/api/user.status';

export async function fetchCodeforcesStats(handle: string): Promise<CodeforcesFetchResult> {
  if (!handle || !handle.trim()) {
    return { rating: null, maxRating: null, rank: null, maxRank: null, solved: 0, avatar: null, contribution: null };
  }

  const trimmedHandle = handle.trim();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    // Fetch user info (rating, maxRating, rank, maxRank, avatar, contribution)
    const infoUrl = `${CF_USER_INFO_ENDPOINT}?handles=${encodeURIComponent(trimmedHandle)}`;
    const infoResponse = await fetch(infoUrl, {
      method: 'GET',
      headers: { 'User-Agent': 'CybernixNexus-PlatformFetcher/1.0' },
      signal: controller.signal,
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
    let solved = 0;
    try {
      const statusUrl = `${CF_USER_STATUS_ENDPOINT}?handle=${encodeURIComponent(trimmedHandle)}&from=1&count=10000`;
      const statusResponse = await fetch(statusUrl, {
        method: 'GET',
        headers: { 'User-Agent': 'CybernixNexus-PlatformFetcher/1.0' },
        next: { revalidate: 3600 },
      });

      if (statusResponse.ok) {
        const statusJson = await statusResponse.json();
        if (statusJson.status === 'OK' && Array.isArray(statusJson.result)) {
          const solvedSet = new Set<string>();
          for (const sub of statusJson.result) {
            if (sub.verdict === 'OK' && sub.problem) {
              solvedSet.add(`${sub.problem.contestId}-${sub.problem.index}`);
            }
          }
          solved = solvedSet.size;
        }
      }
    } catch {
      // Non-fatal: solved count defaults to 0
    }

    return { rating, maxRating, rank, maxRank, solved, avatar, contribution };
  } catch (error: any) {
    console.error(`[Codeforces Fetch Error] Handle: ${handle} - ${error.message}`);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
