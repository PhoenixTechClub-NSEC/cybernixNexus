export interface LeetCodeFetchResult {
  solved: number;
  rating: number | null;
}

export interface CodeforcesFetchResult {
  rating: number | null;
  maxRating: number | null;
  rank: string | null;
  maxRank: string | null;
  solved: number;
  avatar: string | null;
  contribution: number | null;
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
  codeforcesRank: string | null;
  codeforcesMaxRank: string | null;
  codeforcesSolved: number;
  codeforcesAvatar: string | null;
  codeforcesContribution: number | null;
  gfgScore: number | null;
  codechefRating: number | null;
  totalScore: number;
  ranking: number | null;
  departmentRanking: number | null;
  syncJobId?: string;
  errors: Record<string, string>;
}
