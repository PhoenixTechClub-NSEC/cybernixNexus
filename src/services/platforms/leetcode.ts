import { LeetCodeFetchResult } from './types';

const LEETCODE_GRAPHQL_ENDPOINT = 'https://leetcode.com/graphql';

const USER_PROFILE_QUERY = `
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      username
      submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
        }
      }
    }
    userContestRanking(username: $username) {
      rating
    }
  }
`;

export async function fetchLeetCodeStats(username: string): Promise<LeetCodeFetchResult> {
  if (!username || !username.trim()) {
    return { solved: 0, rating: null };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(LEETCODE_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'CybernixNexus-PlatformFetcher/1.0',
      },
      body: JSON.stringify({
        query: USER_PROFILE_QUERY,
        variables: { username: username.trim() },
      }),
      signal: controller.signal,
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`LeetCode API returned status ${response.status}`);
    }

    const json = await response.json();

    if (json.errors || !json.data?.matchedUser) {
      throw new Error(`LeetCode user "${username}" not found or API error`);
    }

    const acSubmissions = json.data.matchedUser.submitStatsGlobal?.acSubmissionNum || [];
    const allStats = acSubmissions.find(
      (item: { difficulty: string; count: number }) => item.difficulty === 'All'
    );
    const solved = allStats ? allStats.count : 0;

    const rawRating = json.data.userContestRanking?.rating;
    const rating = rawRating ? Math.round(rawRating) : null;

    return { solved, rating };
  } catch (error: any) {
    console.error(`[LeetCode Fetch Error] Username: ${username} - ${error.message}`);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
