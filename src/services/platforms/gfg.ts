import { GfgFetchResult } from './types';

const GFG_API_PRIMARY = 'https://geeks-for-geeks-api.vercel.app/user';

export async function fetchGfgStats(handle: string): Promise<GfgFetchResult> {
  if (!handle || !handle.trim()) {
    return { score: null };
  }

  const cleanHandle = handle.trim();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const url = `${GFG_API_PRIMARY}/${encodeURIComponent(cleanHandle)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'CybernixNexus-PlatformFetcher/1.0',
      },
      signal: controller.signal,
      next: { revalidate: 3600 },
    });

    if (response.ok) {
      const json = await response.json();
      const score = json.overallScore ?? json.codingScore ?? json.score ?? null;
      if (score !== null && score !== undefined) {
        return { score: typeof score === 'number' ? score : parseInt(String(score), 10) || null };
      }
    }

    // Fallback parsing or return null if user score not directly reachable
    return { score: null };
  } catch (error: any) {
    console.error(`[GFG Fetch Error] Handle: ${cleanHandle} - ${error.message}`);
    return { score: null };
  } finally {
    clearTimeout(timeoutId);
  }
}
