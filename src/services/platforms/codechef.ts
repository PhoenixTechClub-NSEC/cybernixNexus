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
  let solved = 0;

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
    const ratingMatch = html.match(/(?:rating[:\s"']*)?(\d{3,4})\??(?:\s|<|$)/i);
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

  // Parse solved count - multiple strategies
  // Strategy 1: Regex match on "Fully Solved (N)"
  let fullySolvedMatch = html.match(/Fully Solved\s*\((\d+)\)/i);
  if (fullySolvedMatch && fullySolvedMatch[1]) {
    solved = parseInt(fullySolvedMatch[1], 10);
  }

  // Strategy 2: Look for "fully" in headings or divs
  if (solved === 0) {
    const headings = $('h5, h4, h3, div, span').filter((_, elem) => {
      return /Fully Solved/i.test($(elem).text());
    });
    
    for (let i = 0; i < headings.length; i++) {
      const text = $(headings[i]).text();
      const match = text.match(/\((\d+)\)/);
      if (match && match[1]) {
        solved = parseInt(match[1], 10);
        break;
      }
    }
  }

  // Strategy 3: Look for submission stats in common HTML patterns
  if (solved === 0) {
    const statsMatch = html.match(/(?:solved|submitted).*?(\d+)/i);
    if (statsMatch && statsMatch[1]) {
      const potential = parseInt(statsMatch[1], 10);
      if (potential > 0 && potential < 5000) {
        solved = potential;
      }
    }
  }

  const isValid = rating !== null || solved > 0;

  return { rating, stars, globalRank, solved, isValid };
}

/**
 * Fetch CodeChef stats with retry logic and improved error handling
 */
export async function fetchCodechefStats(username: string, retryCount = 0): Promise<CodechefFetchResult> {
  if (!username || !username.trim()) {
    return { rating: null, stars: null, globalRank: null, solved: 0 };
  }

  const cleanUsername = username.trim().toLowerCase();
  const url = `https://www.codechef.com/users/${encodeURIComponent(cleanUsername)}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CODECHEF_TIMEOUT);

    let response;
    try {
      response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': CODECHEF_USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        signal: controller.signal,
        next: { revalidate: 3600 },
      });
    } finally {
      clearTimeout(timeoutId);
    }

    // Handle HTTP errors
    if (!response.ok) {
      if (response.status === 404) {
        // User not found - don't retry
        console.warn(`[CodeChef] User "${cleanUsername}" not found (404)`);
        return { rating: null, stars: null, globalRank: null, solved: 0 };
      }

      if (response.status === 429 && retryCount < MAX_RETRIES) {
        // Rate limited - retry with exponential backoff
        console.warn(`[CodeChef] Rate limited for "${cleanUsername}", retrying... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        await new Promise(r => setTimeout(r, RETRY_DELAY_MS * Math.pow(2, retryCount)));
        return fetchCodechefStats(username, retryCount + 1);
      }

      throw new Error(`CodeChef API returned status ${response.status} ${response.statusText}`);
    }

    const html = await response.text();

    // Check if HTML is valid and contains expected content
    if (!html || html.length < 1000) {
      throw new Error('Received empty or truncated response from CodeChef');
    }

    // Check if page is an error page
    if (html.includes('page not found') || html.includes('404')) {
      console.warn(`[CodeChef] User "${cleanUsername}" profile not accessible`);
      return { rating: null, stars: null, globalRank: null, solved: 0 };
    }

    // Parse the HTML
    const parsed = parseCodechefHtml(html);

    if (!parsed.isValid) {
      if (retryCount < MAX_RETRIES) {
        console.warn(`[CodeChef] Could not extract stats for "${cleanUsername}", retrying... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        await new Promise(r => setTimeout(r, RETRY_DELAY_MS * Math.pow(2, retryCount)));
        return fetchCodechefStats(username, retryCount + 1);
      }

      // After retries, log but return partial data if any
      console.warn(`[CodeChef] Failed to extract complete stats for "${cleanUsername}" after ${MAX_RETRIES + 1} attempts`);
    }

    return {
      rating: parsed.rating,
      stars: parsed.stars,
      globalRank: parsed.globalRank,
      solved: parsed.solved,
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error(`[CodeChef Fetch Error] Username: ${username} - Request timeout (${CODECHEF_TIMEOUT}ms)`);
    } else {
      console.error(`[CodeChef Fetch Error] Username: ${username} - ${error.message}`);
    }

    // Retry on network errors
    if (retryCount < MAX_RETRIES && !url.includes('404')) {
      console.warn(`[CodeChef] Network error for "${username}", retrying... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await new Promise(r => setTimeout(r, RETRY_DELAY_MS * Math.pow(2, retryCount)));
      return fetchCodechefStats(username, retryCount + 1);
    }

    // Return empty stats after retries exhausted
    return { rating: null, stars: null, globalRank: null, solved: 0 };
  }
}
