export interface LeetCodeFetchResult {
  solved: number;
  rating: number | null;
}

export interface CodeforcesFetchResult {
  rating: number | null;
  maxRating: number | null;
}

export interface GfgFetchResult {
  score: number | null;
}

export interface CodechefFetchResult {
  rating: number | null;
}

export interface PlatformStatsResult {
  leetcodeSolved: number;
  leetcodeRating: number | null;
  codeforcesRating: number | null;
  codeforcesMaxRating: number | null;
  gfgScore: number | null;
  codechefRating: number | null;
  totalScore: number;
  errors: Record<string, string>;
}
