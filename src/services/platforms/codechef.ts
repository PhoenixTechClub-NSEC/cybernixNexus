import { setTimeout as delay } from 'node:timers/promises';
import * as cheerio from 'cheerio';
import { CodechefFetchResult } from './types';

const CODECHEF_TIMEOUT = 8000; // 8 seconds
const CODECHEF_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

interface CodechefParsingResult {
  rating: number | null;
  stars: string | null;
  globalRank: string | null;
  solved: number;
  isValid: boolean;
}

/**
 * Parse CodeChef HTML response to extract stats
 * Uses multiple parsing strategies to be resilient to DOM structure changes
 */
function parseCodechefHtml(html: string): CodechefParsingResult {
  const $ = cheerio.load(html);
  
  let rating: number | null = null;
  let stars: string | null = null;
  let globalRank: string | null = null;
  let solved: number | null = null;

  // Parse rating - try multiple selectors for resilience
  const ratingSelectors = [
    '.rating-number',
    '[data-testid="rating-number"]',
    '.cc_hth_rating',
    'span[class*="rating"]',
    '.rating',
  ];

  for (const selector of ratingSelectors) {
    const elems = $(selector);
    for (let i = 0; i < elems.length; i++) {
      const ratingText = $(elems[i]).text().trim();
      const match = ratingText.match(/^(\d{3,4})/);
      if (match && match[1]) {
        const parsed = parseInt(match[1], 10);
        if (!isNaN(parsed) && parsed >= 200) {
          rating = parsed;
          break;
        }
      }
    }
    if (rating !== null) break;
  }

  // If rating still not found, try extracting from page content
  if (!rating) {
    const ratingMatch = html.match(/\brating["']?\s*:\s*["']?(\d{3,4})\b/i);
    if (ratingMatch && ratingMatch[1]) {
      const parsed = parseInt(ratingMatch[1], 10);
      if (parsed >= 300 && parsed <= 9999) {
        rating = parsed;
      }
    }
  }

  // Parse stars
  const starSelectors = ['.rating-star', '[data-testid="rating-star"]', 'span[class*="star"]'];
  for (const selector of starSelectors) {
    const starText = $(selector).first().text().trim();
    if (starText) {
      stars = starText;
      break;
    }
  }

  // Parse global rank
  const rankSelectors = [
    '.rating-ranks strong',
    '[data-testid="global-rank"]',
    'span[class*="rank"]',
  ];
  for (const selector of rankSelectors) {
    const rankText = $(selector).first().text().trim();
    if (rankText && /^\d+/.test(rankText)) {
      globalRank = rankText;
      break;
    }
  }

  // A displayed zero is a valid count for a new profile.
  const solvedLabel = $('h2, h3, h4, h5, h6, span')
    .toArray()
    .map((element) => $(element).text().trim())
    .find((label) => /^(?:Fully Solved|Total Problems Solved)\s*[:(]?\s*\d/i.test(label));
  const solvedMatch = solvedLabel?.match(/\d+/) ?? html.match(/Fully Solved\s*\((\d+)\)/i);
  if (solvedMatch) {
    solved = Number(solvedMatch[1] ?? solvedMatch[0]);
  }

  return { rating, stars, globalRank, solved: solved ?? 0, isValid: rating !== null || solved !== null };
}

/**
 * Fetch CodeChef stats and report failures so callers can preserve saved stats.
 */
export async function fetchCodechefStats(username: string): Promise<CodechefFetchResult> {
  if (!username.trim()) {
    return { rating: null, stars: null, globalRank: null, solved: 0 };
  }

  const cleanUsername = username.trim().toLowerCase();
  const url = `https://www.codechef.com/users/${encodeURIComponent(cleanUsername)}`;
  const signal = AbortSignal.timeout(CODECHEF_TIMEOUT);

  for (let attempt = 0; ; attempt++) {
    let notFound = false;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': CODECHEF_USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        signal,
        next: { revalidate: 3600 },
      });

      notFound = response.status === 404;
      if (notFound) {
        throw new Error(`CodeChef user "${cleanUsername}" was not found`);
      }

      if (response.ok) {
        const parsed = parseCodechefHtml(await response.text());
        if (parsed.isValid) {
          const { rating, stars, globalRank, solved } = parsed;
          return { rating, stars, globalRank, solved };
        }
        throw new Error(`Could not extract CodeChef stats for "${cleanUsername}"`);
      }

      throw new Error(`CodeChef returned HTTP ${response.status}`);
    } catch (error) {
      if (notFound || attempt >= MAX_RETRIES || signal.aborted) throw error;
      await delay(RETRY_DELAY_MS * 2 ** attempt, undefined, { signal });
    }
  }
}
