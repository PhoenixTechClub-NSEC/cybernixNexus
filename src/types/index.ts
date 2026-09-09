export type TierName = 'Spark' | 'Ember' | 'Flame' | 'Phoenix' | 'Ascendant';

export type Department = 'CSE' | 'IT' | 'ECE' | 'AI&DS' | 'EE' | 'ME';

export type PlatformName = 'Codeforces' | 'LeetCode' | 'CodeChef' | 'HackerRank';

export interface LevelTierInfo {
  levelRange: string;
  minLevel: number;
  maxLevel: number;
  minPoints: number;
  tierName: TierName;
  mascotName: string;
  description: string;
  color: string;
  bgLight: string;
  badgeBg: string;
}

export interface PlatformStat {
  platform: PlatformName;
  handle: string;
  rating: number;
  solvedCount: number;
  weight: number;
  profileUrl?: string;
}

export interface DSATopicStat {
  topic: string;
  count: number;
  color?: string;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'tier' | 'streak' | 'contest' | 'dept' | 'contribution';
  unlockedAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  email: string;
  bio: string;
  department: Department;
  year: string;
  rollNumber?: string;
  graduationYear?: number;
  github?: string;
  linkedin?: string;
  collegeRank: number;
  deptRank: number;
  level: number;
  tier: TierName;
  cpScore: number;
  nextTierScore: number;
  currentStreak: number;
  maxStreak: number;
  contestWinRate: number;
  solvedByDifficulty: {
    easy: number;
    medium: number;
    hard: number;
    total: number;
  };
  platforms: PlatformStat[];
  dsaTopics: DSATopicStat[];
  badges: AchievementBadge[];
  recentActivities: {
    id: string;
    title: string;
    type: 'solve' | 'contest' | 'streak' | 'level_up';
    platform?: PlatformName;
    timestamp: string;
    pointsEarned: number;
  }[];
}

export interface DepartmentStat {
  name: Department;
  rank: number;
  averageRating: number;
  totalSolved: number;
  topCoderName: string;
  topCoderScore: number;
  seasonalMultiplier: number;
  activeStudentsCount: number;
}

export interface EditorialComment {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorDept: Department;
  content: string;
  createdAt: string;
  likes: number;
}

export interface Editorial {
  id: string;
  title: string;
  problemUrl: string;
  platform: PlatformName;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  authorName: string;
  authorAvatar: string;
  authorDept: Department;
  authorLevel: number;
  authorTier: TierName;
  tags: string[];
  summary: string;
  content: string;
  codeSnippet: string;
  codeLanguage: string;
  likesCount: number;
  commentsCount: number;
  comments: EditorialComment[];
  publishedAt: string;
}

export interface Contest {
  id: string;
  title: string;
  platform: PlatformName | 'NSEC Internal';
  startTime: string;
  duration: string;
  registeredCount: number;
  isInternal?: boolean;
  url: string;
  description?: string;
}

export interface MonthlyAchievement {
  category: string;
  title: string;
  winnerName: string;
  winnerDept: Department;
  winnerAvatar: string;
  scoreOrMetric: string;
  badgeIcon: string;
}
