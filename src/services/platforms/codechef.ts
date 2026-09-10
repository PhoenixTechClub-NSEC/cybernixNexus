import * as cheerio from 'cheerio';
import { CodechefFetchResult } from './types';

export async function fetchCodechefStats(username: string): Promise<CodechefFetchResult> {
  if (!username || !username.trim()) {
    return { rating: null, stars: null, globalRank: null, solved: 0 };
  }

  const cleanUsername = username.trim();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const url = `https://www.codechef.com/users/${encodeURIComponent(cleanUsername)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      signal: controller.signal,
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`CodeChef profile returned status ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    let rating: number | null = null;
    const ratingText = $('.rating-number').first().text().trim();
    if (ratingText) {
      const parsedRating = parseInt(ratingText, 10);
      if (!isNaN(parsedRating)) {
        rating = parsedRating;
      }
    }

    const stars = $('.rating-star').first().text().trim() || null;
    const globalRank = $('.rating-ranks strong').first().text().trim() || null;

    let solved = 0;
    const fullySolvedMatch = html.match(/Fully Solved \s*\((\d+)\)/i);
    if (fullySolvedMatch && fullySolvedMatch[1]) {
      solved = parseInt(fullySolvedMatch[1], 10);
    } else {
      const solvedText = $('h5:contains("Fully Solved")').text();
      const match2 = solvedText.match(/\((\d+)\)/);
      if (match2 && match2[1]) {
        solved = parseInt(match2[1], 10);
      }
    }

    if (rating !== null || solved > 0) {
      return { rating, stars, globalRank, solved };
    }

    throw new Error(`CodeChef rating and solved count not found for username "${cleanUsername}"`);
  } catch (error: any) {
    console.error(`[CodeChef Fetch Error] Username: ${cleanUsername} - ${error.message}`);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
