import { CodeforcesFetchResult } from './types';

const CODEFORCES_USER_INFO_ENDPOINT = 'https://codeforces.com/api/user.info';

export async function fetchCodeforcesStats(handle: string): Promise<CodeforcesFetchResult> {
  if (!handle || !handle.trim()) {
    return { rating: null, maxRating: null };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const url = `${CODEFORCES_USER_INFO_ENDPOINT}?handles=${encodeURIComponent(handle.trim())}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'CybernixNexus-PlatformFetcher/1.0',
      },
      signal: controller.signal,
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`Codeforces API returned status ${response.status}`);
    }

    const json = await response.json();

    if (json.status !== 'OK' || !json.result || json.result.length === 0) {
      throw new Error(`Codeforces handle "${handle}" not found or API error: ${json.comment || ''}`);
    }

    const user = json.result[0];
    const rating = user.rating ?? null;
    const maxRating = user.maxRating ?? null;

    return { rating, maxRating };
  } catch (error: any) {
    console.error(`[Codeforces Fetch Error] Handle: ${handle} - ${error.message}`);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
