import { CodechefFetchResult } from './types';

const CODECHEF_API_PRIMARY = 'https://codechef-api.vercel.app/handle';

export async function fetchCodechefStats(username: string): Promise<CodechefFetchResult> {
  if (!username || !username.trim()) {
    return { rating: null };
  }

  const cleanUsername = username.trim();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const url = `${CODECHEF_API_PRIMARY}/${encodeURIComponent(cleanUsername)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'CybernixNexus-PlatformFetcher/1.0',
      },
      signal: controller.signal,
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`CodeChef API returned status ${response.status}`);
    }

    const json = await response.json();
    const rawRating = json.currentRating ?? json.rating ?? null;
    if (rawRating !== null && rawRating !== undefined) {
      return { rating: typeof rawRating === 'number' ? rawRating : parseInt(String(rawRating), 10) || null };
    }

    throw new Error(`CodeChef rating not found for username "${cleanUsername}"`);
  } catch (error: any) {
    console.error(`[CodeChef Fetch Error] Username: ${cleanUsername} - ${error.message}`);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
