export interface LeetCodeFetchResult {
  solved: number;
  easy: number;
  medium: number;
  hard: number;
  rating: number | null;
  submissionCalendar?: Record<string, number>;
}

export interface CodeforcesFetchResult {
  rating: number | null;
  maxRating: number | null;
  rank: string | null;
  maxRank: string | null;
  solved: number;
  avatar: string | null;
  contribution: number | null;
  dailySubmissions?: Record<string, number>;
}

export interface GfgFetchResult {
  score: number | null;
}

export interface CodechefFetchResult {
  rating: number | null;
}

export interface PlatformStatsResult {
  leetcodeSolved: number;
  leetcodeEasySolved: number;
  leetcodeMediumSolved: number;
  leetcodeHardSolved: number;
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
