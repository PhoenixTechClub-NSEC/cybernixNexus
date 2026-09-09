import {
  UserProfile,
  LevelTierInfo,
  DepartmentStat,
  Editorial,
  Contest,
  MonthlyAchievement,
  DSATopicStat,
} from '@/types';

export const FORMULA_INFO = {
  formula: 'total Score = Σ Bq × Wp × Mdept × Mstreak',
  levelFormula: 'CP Score Required(L) = 50 × (L - 1)^1.6',
  basePoints: {
    Easy: 10,
    Medium: 30,
    Hard: 75,
  },
  platformWeights: {
    Codeforces: 1.75,
    LeetCode: 1.5,
    CodeChef: 1.25,
    HackerRank: 1.0,
  },
  departmentMultipliers: {
    '#1dept': 2.0,
    '#2dept': 1.75,
    '#3dept': 1.5,
    '#rest': 1.25,
  },
  streakBonus: '+0.01x per day (Caps at 1.60x for 60-day streak)',
};

export const LEVEL_TIERS: LevelTierInfo[] = [
  {
    levelRange: 'Level 1–10',
    minLevel: 1,
    maxLevel: 10,
    minPoints: 0,
    tierName: 'Spark',
    mascotName: 'Spark',
    description: 'Instant unlock on signup. The journey of a thousand solves begins here.',
    color: 'text-pine-teal',
    bgLight: 'bg-golden-sand/15 border-pine-teal/30',
    badgeBg: 'bg-pine-teal text-white',
  },
  {
    levelRange: 'Level 11–25',
    minLevel: 11,
    maxLevel: 25,
    minPoints: 2000,
    tierName: 'Ember',
    mascotName: 'FLAMCHI',
    description: 'The Ember Chick. Unlocks around ~40 Medium LeetCode / 15 Hard Codeforces problems.',
    color: 'text-pine-teal',
    bgLight: 'bg-golden-sand/15 border-pine-teal/40',
    badgeBg: 'bg-pine-teal text-white',
  },
  {
    levelRange: 'Level 26–50',
    minLevel: 26,
    maxLevel: 50,
    minPoints: 9200,
    tierName: 'Flame',
    mascotName: 'FLAMIRO',
    description: 'The Flame Bird. Its body burns brighter as it grows (~150 Medium/Hard + 30-day streak).',
    color: 'text-tomato-jam',
    bgLight: 'bg-golden-sand/15 border-tomato-jam/40',
    badgeBg: 'bg-tomato-jam text-white',
  },
  {
    levelRange: 'Level 51–75',
    minLevel: 51,
    maxLevel: 75,
    minPoints: 26500,
    tierName: 'Phoenix',
    mascotName: 'PYRAVIAN',
    description: 'The Inferno Phoenix. ~350+ Hard tasks + Codeforces Candidate Master/Grandmaster.',
    color: 'text-tomato-jam',
    bgLight: 'bg-golden-sand/15 border-tomato-jam/50',
    badgeBg: 'bg-gradient-to-r from-tomato-jam to-pine-teal text-white',
  },
  {
    levelRange: 'Level 76+',
    minLevel: 76,
    maxLevel: 100,
    minPoints: 55500,
    tierName: 'Ascendant',
    mascotName: 'ASCENDANT PHOENIX',
    description: 'Legendary status. Its wings light up the darkest skies and bring hope.',
    color: 'text-tomato-jam',
    bgLight: 'bg-golden-sand/15 border-tomato-jam/60',
    badgeBg: 'bg-gradient-to-r from-tomato-jam via-onyx to-pine-teal text-white',
  },
];

export const DSA_TOPICS: DSATopicStat[] = [
  { topic: 'Arrays', count: 0, color: 'bg-tomato-jam' },
  { topic: 'Dynamic Programming', count: 0, color: 'bg-pine-teal' },
  { topic: 'String', count: 0, color: 'bg-golden-sand' },
  { topic: 'HashMap and Set', count: 0, color: 'bg-onyx' },
  { topic: 'Trees', count: 0, color: 'bg-tomato-jam' },
  { topic: 'DFS', count: 0, color: 'bg-pine-teal' },
  { topic: 'Sorting', count: 0, color: 'bg-golden-sand' },
  { topic: 'BFS', count: 0, color: 'bg-onyx' },
  { topic: 'Greedy Algorithms', count: 0, color: 'bg-tomato-jam' },
  { topic: 'Math', count: 0, color: 'bg-pine-teal' },
];

export const CURRENT_USER: UserProfile = {
  id: '',
  name: 'Student Programmer',
  username: 'student',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  email: '',
  bio: 'Competitive Programmer @ NSEC',
  department: 'CSE',
  year: '1st Year',
  collegeRank: 0,
  deptRank: 0,
  level: 1,
  tier: 'Spark',
  cpScore: 0,
  nextTierScore: 2000,
  currentStreak: 0,
  maxStreak: 0,
  contestWinRate: 0,
  solvedByDifficulty: {
    easy: 0,
    medium: 0,
    hard: 0,
    total: 0,
  },
  platforms: [],
  badges: [],
  dsaTopics: [],
  recentActivities: [],
};

export const LEADERBOARD_USERS: UserProfile[] = [];
export const DEPARTMENT_STATS: DepartmentStat[] = [];
export const MONTHLY_ACHIEVEMENTS: MonthlyAchievement[] = [];
export const FAKE_EDITORIALS: Editorial[] = [];
export const FAKE_CONTESTS: Contest[] = [];
export const SEASON_PROGRESS_METRICS: any[] = [];
export const SYNCED_PLATFORM_PROFILES: any[] = [];

// Clean initial structure for velocity graph before user activity is recorded
export const WEEKLY_VELOCITY_DATA = {
  thisWeek: {
    label: 'This Week',
    change: '0%',
    leetcode: [0, 0, 0, 0, 0, 0, 0],
    codeforces: [0, 0, 0, 0, 0, 0, 0],
    maxVal: 10,
  },
  lastWeek: {
    label: 'Last Week',
    change: '0%',
    leetcode: [0, 0, 0, 0, 0, 0, 0],
    codeforces: [0, 0, 0, 0, 0, 0, 0],
    maxVal: 10,
  },
  twoWeeksAgo: {
    label: '2 Weeks Ago',
    change: '0%',
    leetcode: [0, 0, 0, 0, 0, 0, 0],
    codeforces: [0, 0, 0, 0, 0, 0, 0],
    maxVal: 10,
  },
};
