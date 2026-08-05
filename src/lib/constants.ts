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
    GFG: 1.0,
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
  { topic: 'Arrays', count: 415, color: 'bg-tomato-jam' },
  { topic: 'Dynamic Programming', count: 154, color: 'bg-pine-teal' },
  { topic: 'String', count: 143, color: 'bg-golden-sand' },
  { topic: 'HashMap and Set', count: 138, color: 'bg-onyx' },
  { topic: 'Trees', count: 96, color: 'bg-tomato-jam' },
  { topic: 'DFS', count: 85, color: 'bg-pine-teal' },
  { topic: 'Sorting', count: 84, color: 'bg-golden-sand' },
  { topic: 'BFS', count: 79, color: 'bg-onyx' },
  { topic: 'Greedy Algorithms', count: 79, color: 'bg-tomato-jam' },
  { topic: 'Math', count: 79, color: 'bg-pine-teal' },
];

export const CURRENT_USER: UserProfile = {
  id: 'usr-001',
  name: 'Test',
  username: 'test_user',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  email: 'test@nsec.ac.in',
  bio: "Competitive Programmer & Full-Stack Developer | CSE '26 @ NSEC | Dept Rank #1",
  department: 'CSE',
  year: '3rd Year',
  collegeRank: 3,
  deptRank: 1,
  level: 48,
  tier: 'Flame',
  cpScore: 21450,
  nextTierScore: 26500,
  currentStreak: 34,
  maxStreak: 45,
  contestWinRate: 78.4,
  solvedByDifficulty: {
    easy: 286,
    medium: 528,
    hard: 125,
    total: 939,
  },
  platforms: [
    {
      platform: 'Codeforces',
      handle: 'test_cf',
      rating: 1740,
      solvedCount: 192,
      weight: 1.75,
      profileUrl: 'https://codeforces.com',
    },
    {
      platform: 'LeetCode',
      handle: 'test_lc',
      rating: 1985,
      solvedCount: 520,
      weight: 1.5,
      profileUrl: 'https://leetcode.com',
    },
    {
      platform: 'CodeChef',
      handle: 'test_cc',
      rating: 1820,
      solvedCount: 127,
      weight: 1.25,
      profileUrl: 'https://codechef.com',
    },
    {
      platform: 'HackerRank',
      handle: 'test_hr',
      rating: 2100,
      solvedCount: 165,
      weight: 1.0,
      profileUrl: 'https://hackerrank.com',
    },
    {
      platform: 'GFG',
      handle: 'test_gfg',
      rating: 1650,
      solvedCount: 35,
      weight: 1.0,
      profileUrl: 'https://geeksforgeeks.org',
    },
  ],
  dsaTopics: DSA_TOPICS,
  badges: [
    {
      id: 'bdg-1',
      title: '30-Day Flame Streak',
      description: 'Solved at least 1 problem for 30 consecutive days.',
      icon: '🔥',
      category: 'streak',
      unlockedAt: '2 days ago',
    },
    {
      id: 'bdg-2',
      title: 'Flame Tier Unlocked',
      description: 'Reached Level 26+ and unlocked FLAMIRO mascot.',
      icon: '🦅',
      category: 'tier',
      unlockedAt: '2 weeks ago',
    },
    {
      id: 'bdg-3',
      title: 'CSE Dept Champion',
      description: '#1 ranked programmer in Computer Science & Engineering.',
      icon: '👑',
      category: 'dept',
      unlockedAt: '1 month ago',
    },
    {
      id: 'bdg-4',
      title: 'Editorial Author',
      description: 'Published 5+ high-rating problem tutorials for juniors.',
      icon: '✍️',
      category: 'contribution',
      unlockedAt: '3 days ago',
    },
  ],
  recentActivities: [
    {
      id: 'act-1',
      title: 'Solved "Dynamic Programming on Trees - III" (Codeforces 1900)',
      type: 'solve',
      platform: 'Codeforces',
      timestamp: '2 hours ago',
      pointsEarned: 131,
    },
    {
      id: 'act-2',
      title: 'Maintained 34-Day Streak (+1.34x Daily Multiplier Bonus)',
      type: 'streak',
      timestamp: '5 hours ago',
      pointsEarned: 45,
    },
    {
      id: 'act-3',
      title: 'Accepted Solution: "Minimum Cost to Cut a Stick" (LeetCode Hard)',
      type: 'solve',
      platform: 'LeetCode',
      timestamp: 'Yesterday',
      pointsEarned: 112,
    },
    {
      id: 'act-4',
      title: 'Ranked #4 in NSEC Internal Sprint League #12',
      type: 'contest',
      timestamp: '3 days ago',
      pointsEarned: 350,
    },
  ],
};

export const LEADERBOARD_USERS: UserProfile[] = [
  {
    ...CURRENT_USER,
    id: 'usr-003',
    name: 'Satyaki Das',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    department: 'CSE',
    collegeRank: 1,
    deptRank: 1,
    level: 64,
    tier: 'Phoenix',
    cpScore: 38400,
    currentStreak: 58,
    solvedByDifficulty: { easy: 310, medium: 640, hard: 215, total: 1165 },
  },
  {
    ...CURRENT_USER,
    id: 'usr-002',
    name: 'Rupam Ghosh',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    department: 'IT',
    collegeRank: 2,
    deptRank: 1,
    level: 59,
    tier: 'Phoenix',
    cpScore: 33200,
    currentStreak: 42,
    solvedByDifficulty: { easy: 290, medium: 580, hard: 180, total: 1050 },
  },
  {
    ...CURRENT_USER, // Test is #3
    collegeRank: 3,
    deptRank: 2,
  },
  {
    ...CURRENT_USER,
    id: 'usr-004',
    name: 'Maniratna Sharma',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    department: 'AI&DS',
    collegeRank: 4,
    deptRank: 1,
    level: 44,
    tier: 'Flame',
    cpScore: 19800,
    currentStreak: 29,
    solvedByDifficulty: { easy: 240, medium: 460, hard: 95, total: 795 },
  },
  {
    ...CURRENT_USER,
    id: 'usr-005',
    name: 'Soumita Roy',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    department: 'ECE',
    collegeRank: 5,
    deptRank: 1,
    level: 39,
    tier: 'Flame',
    cpScore: 16400,
    currentStreak: 21,
    solvedByDifficulty: { easy: 220, medium: 390, hard: 70, total: 680 },
  },
  {
    ...CURRENT_USER,
    id: 'usr-006',
    name: 'Saurya Bhattacharya',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    department: 'CSE',
    collegeRank: 6,
    deptRank: 3,
    level: 35,
    tier: 'Flame',
    cpScore: 14200,
    currentStreak: 18,
    solvedByDifficulty: { easy: 200, medium: 340, hard: 55, total: 595 },
  },
  {
    ...CURRENT_USER,
    id: 'usr-007',
    name: 'Debargho Mukherjee',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    department: 'IT',
    collegeRank: 7,
    deptRank: 2,
    level: 32,
    tier: 'Flame',
    cpScore: 12500,
    currentStreak: 15,
    solvedByDifficulty: { easy: 190, medium: 310, hard: 45, total: 545 },
  },
  {
    ...CURRENT_USER,
    id: 'usr-008',
    name: 'Siddharth Singh',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    department: 'EE',
    collegeRank: 8,
    deptRank: 1,
    level: 28,
    tier: 'Flame',
    cpScore: 10400,
    currentStreak: 12,
    solvedByDifficulty: { easy: 180, medium: 260, hard: 35, total: 475 },
  },
  {
    ...CURRENT_USER,
    id: 'usr-009',
    name: 'Ananya Chakraborty',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    department: 'AI&DS',
    collegeRank: 9,
    deptRank: 2,
    level: 24,
    tier: 'Ember',
    cpScore: 8900,
    currentStreak: 9,
    solvedByDifficulty: { easy: 160, medium: 230, hard: 28, total: 418 },
  },
  {
    ...CURRENT_USER,
    id: 'usr-010',
    name: 'Priyanshu Banerjee',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    department: 'ME',
    collegeRank: 10,
    deptRank: 1,
    level: 19,
    tier: 'Ember',
    cpScore: 6800,
    currentStreak: 7,
    solvedByDifficulty: { easy: 140, medium: 180, hard: 18, total: 338 },
  },
];

export const DEPARTMENT_STATS: DepartmentStat[] = [
  {
    name: 'CSE',
    rank: 1,
    averageRating: 1845,
    totalSolved: 14850,
    topCoderName: 'Satyaki Das',
    topCoderScore: 38400,
    seasonalMultiplier: 2.0,
    activeStudentsCount: 142,
  },
  {
    name: 'IT',
    rank: 2,
    averageRating: 1780,
    totalSolved: 11200,
    topCoderName: 'Rupam Ghosh',
    topCoderScore: 33200,
    seasonalMultiplier: 1.75,
    activeStudentsCount: 98,
  },
  {
    name: 'ECE',
    rank: 3,
    averageRating: 1690,
    totalSolved: 8450,
    topCoderName: 'Soumita Roy',
    topCoderScore: 16400,
    seasonalMultiplier: 1.5,
    activeStudentsCount: 76,
  },
  {
    name: 'AI&DS',
    rank: 4,
    averageRating: 1650,
    totalSolved: 7300,
    topCoderName: 'Maniratna Sharma',
    topCoderScore: 19800,
    seasonalMultiplier: 1.25,
    activeStudentsCount: 65,
  },
  {
    name: 'EE',
    rank: 5,
    averageRating: 1580,
    totalSolved: 5120,
    topCoderName: 'Siddharth Singh',
    topCoderScore: 10400,
    seasonalMultiplier: 1.25,
    activeStudentsCount: 48,
  },
  {
    name: 'ME',
    rank: 6,
    averageRating: 1510,
    totalSolved: 3400,
    topCoderName: 'Priyanshu Banerjee',
    topCoderScore: 6800,
    seasonalMultiplier: 1.25,
    activeStudentsCount: 34,
  },
];

export const MONTHLY_ACHIEVEMENTS: MonthlyAchievement[] = [
  {
    category: 'Beginner of the month',
    title: 'Beginner of the Month',
    winnerName: 'Aarav Sen (1st Yr)',
    winnerDept: 'CSE',
    winnerAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    scoreOrMetric: '+820 CP Growth this month',
    badgeIcon: '🌟',
  },
  {
    category: 'Problem solver of the month',
    title: 'Problem Solver of the Month',
    winnerName: 'Satyaki Das',
    winnerDept: 'CSE',
    winnerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    scoreOrMetric: '118 Problems Solved in July',
    badgeIcon: '⚡',
  },
  {
    category: 'LeetCode Champ',
    title: 'LeetCode Champ of the Month',
    winnerName: 'Satyaki Bose',
    winnerDept: 'CSE',
    winnerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    scoreOrMetric: 'Top 1.2% in Weekly Contest 408',
    badgeIcon: '🏆',
  },
  {
    category: 'Active contributor',
    title: 'Active Editorial Contributor',
    winnerName: 'Soumita Roy',
    winnerDept: 'ECE',
    winnerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    scoreOrMetric: '8 Detailed Tutorials published',
    badgeIcon: '📖',
  },
  {
    category: 'Dept of the month',
    title: 'Department of the Month',
    winnerName: 'CSE Department',
    winnerDept: 'CSE',
    winnerAvatar: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=150&auto=format&fit=crop&q=80',
    scoreOrMetric: '2.0x Multiplier Unlocked (#1 Average CP)',
    badgeIcon: '🔥',
  },
  {
    category: 'Contest warrior',
    title: 'Contest Warrior',
    winnerName: 'Rupam Ghosh',
    winnerDept: 'IT',
    winnerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    scoreOrMetric: '100% Attendance in 12 Matches',
    badgeIcon: '⚔️',
  },
];

export const FAKE_EDITORIALS: Editorial[] = [
  {
    id: 'edit-101',
    title: 'Dynamic Programming on Trees: Solving "Subtree Sums with Constraints" (Codeforces 1900)',
    problemUrl: 'https://codeforces.com',
    platform: 'Codeforces',
    difficulty: 'Hard',
    authorName: 'Satyaki Das',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    authorDept: 'CSE',
    authorLevel: 64,
    authorTier: 'Phoenix',
    tags: ['Dynamic Programming', 'Trees', 'DFS', 'Codeforces'],
    summary: 'A step-by-step breakdown on how to root the tree arbitrarily, maintain dp[u][0] and dp[u][1], and handle edge constraints in O(N) time.',
    content: `### Problem Overview
When dealing with tree DP where node selection depends on adjacent parent-child edges, naive O(N^2) transitions fail for N = 200,000.

### Step-by-Step Approach
1. **Rooting the Tree:** Root at arbitrary node 1.
2. **State Definition:** Let \`dp[u][0]\` be the max score in subtree \`u\` if edge to parent is not chosen, and \`dp[u][1]\` if it is chosen.
3. **Transition Rules:** 
   - For each child \`v\`, \`dp[u][0] += max(dp[v][0], dp[v][1])\`.
   - To transition \`dp[u][1]\`, pick at most one child edge to match.

### Complexity
- **Time Complexity:** O(N) single DFS traversal.
- **Space Complexity:** O(N) for recursion stack and DP table.`,
    codeSnippet: `void dfs(int u, int p) {
    dp[u][0] = 0;
    dp[u][1] = val[u];
    for (int v : adj[u]) {
        if (v == p) continue;
        dfs(v, u);
        dp[u][0] += max(dp[v][0], dp[v][1]);
    }
    // Optimize child transitions
    for (int v : adj[u]) {
        if (v == p) continue;
        dp[u][1] = max(dp[u][1], val[u] + dp[u][0] - max(dp[v][0], dp[v][1]) + dp[v][0]);
    }
}`,
    codeLanguage: 'cpp',
    likesCount: 142,
    commentsCount: 18,
    publishedAt: '2 days ago',
    comments: [
      {
        id: 'c-1',
        authorName: 'Arpan Ghosh',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        authorDept: 'CSE',
        content: 'This explanation of child transition optimization finally made it click for me! Great tutorial.',
        createdAt: '1 day ago',
        likes: 12,
      },
      {
        id: 'c-2',
        authorName: 'Saurya Bhattacharya',
        authorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
        authorDept: 'CSE',
        content: 'Can we also solve this using heavy-light decomposition for queries?',
        createdAt: '18 hours ago',
        likes: 4,
      },
    ],
  },
  {
    id: 'edit-102',
    title: 'Optimal Segment Tree Lazy Propagation for LeetCode Weekly Hard (Q4)',
    problemUrl: 'https://leetcode.com',
    platform: 'LeetCode',
    difficulty: 'Hard',
    authorName: 'Subhajit Paul',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    authorDept: 'CSE',
    authorLevel: 48,
    authorTier: 'Flame',
    tags: ['Segment Tree', 'Lazy Propagation', 'Range Queries', 'LeetCode'],
    summary: 'How to implement a clean 0-indexed iterative/recursive segment tree with range add and range minimum queries in O(log N).',
    content: `### Why Naive Updates TLE
In Q4 of this week's contest, we have up to 10^5 range additions and range queries. Using standard array loops gives O(N * Q) = 10^10 operations.

### Lazy Propagation Core Idea
Instead of updating every leaf node immediately, we store pending updates in a \`lazy[]\` array and push them down only when visiting child nodes.`,
    codeSnippet: `class SegmentTree {
private:
    vector<long long> tree, lazy;
    int n;

    void push(int node, int l, int r) {
        if (lazy[node] != 0) {
            tree[node] += lazy[node];
            if (l != r) {
                lazy[2 * node] += lazy[node];
                lazy[2 * node + 1] += lazy[node];
            }
            lazy[node] = 0;
        }
    }
public:
    // Standard updateRange & query methods...
};`,
    codeLanguage: 'cpp',
    likesCount: 98,
    commentsCount: 11,
    publishedAt: '4 days ago',
    comments: [
      {
        id: 'c-3',
        authorName: 'Rupam Ghosh',
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        authorDept: 'IT',
        content: 'Super clean C++ class template! I used this in the virtual contest and got AC first try.',
        createdAt: '3 days ago',
        likes: 8,
      },
    ],
  },
  {
    id: 'edit-103',
    title: 'Mastering Bitmask DP: "Travelling Salesman with Time Windows" (CodeChef Div1)',
    problemUrl: 'https://codechef.com',
    platform: 'CodeChef',
    difficulty: 'Medium',
    authorName: 'Soumita Roy',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    authorDept: 'ECE',
    authorLevel: 39,
    authorTier: 'Flame',
    tags: ['Bitmask DP', 'Graphs', 'CodeChef'],
    summary: 'Understanding state representation mask (2^N) and current city to solve TSP variations in O(N^2 * 2^N).',
    content: `### State Representation
We represent visited cities as an integer bitmask where the i-th bit is 1 if city i has been visited.

### Transitions
From state \`(mask, u)\`, we try all unvisited neighbors \`v\` where \`(mask & (1 << v)) == 0\`, checking if arrival time satisfies the time window.`,
    codeSnippet: `int solve(int mask, int u, int time_so_far) {
    if (mask == (1 << n) - 1) return dist[u][0];
    if (dp[mask][u] != -1) return dp[mask][u];
    
    int ans = 1e9;
    for (int v = 0; v < n; v++) {
        if (!(mask & (1 << v))) {
            ans = min(ans, dist[u][v] + solve(mask | (1 << v), v, time_so_far + dist[u][v]));
        }
    }
    return dp[mask][u] = ans;
}`,
    codeLanguage: 'cpp',
    likesCount: 84,
    commentsCount: 7,
    publishedAt: '1 week ago',
    comments: [],
  },
  {
    id: 'edit-104',
    title: 'Graph BFS Shortest Path with Grid Obstacles — Step by Step (GFG Practice)',
    problemUrl: 'https://geeksforgeeks.org',
    platform: 'GFG',
    difficulty: 'Easy',
    authorName: 'Maniratna Sharma',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    authorDept: 'AI&DS',
    authorLevel: 44,
    authorTier: 'Flame',
    tags: ['BFS', 'Grid', 'Shortest Path', 'GFG'],
    summary: 'A beginner-friendly guide for 1st & 2nd years on how BFS guarantees the shortest path on unweighted grids without Dijkstra.',
    content: `### Why BFS over DFS?
On unweighted grids, Breadth-First Search explores cells level-by-level (distance 1, then distance 2), guaranteeing the shortest path immediately upon reaching target.`,
    codeSnippet: `int dx[] = {-1, 1, 0, 0};
int dy[] = {0, 0, -1, 1};

int bfs(vector<vector<int>>& grid, int sx, int sy, int tx, int ty) {
    queue<pair<int, int>> q;
    vector<vector<int>> dist(grid.size(), vector<int>(grid[0].size(), -1));
    
    q.push({sx, sy});
    dist[sx][sy] = 0;
    
    while (!q.empty()) {
        auto [x, y] = q.front(); q.pop();
        if (x == tx && y == ty) return dist[x][y];
        
        for (int d = 0; d < 4; d++) {
            int nx = x + dx[d], ny = y + dy[d];
            if (nx >= 0 && nx < grid.size() && ny >= 0 && ny < grid[0].size() 
                && grid[nx][ny] == 0 && dist[nx][ny] == -1) {
                dist[nx][ny] = dist[x][y] + 1;
                q.push({nx, ny});
            }
        }
    }
    return -1;
}`,
    codeLanguage: 'cpp',
    likesCount: 65,
    commentsCount: 5,
    publishedAt: '1 week ago',
    comments: [],
  },
];

export const FAKE_CONTESTS: Contest[] = [
  {
    id: 'cnt-1',
    title: 'NSEC Avahan Cup 2026 — Inter-Department Algorithm Battle',
    platform: 'NSEC Internal',
    startTime: '2026-08-10T14:00:00Z',
    duration: '3 hours',
    registeredCount: 218,
    isInternal: true,
    url: '#',
    description: 'Our flagship college coding championship! Top 3 departments win seasonal 2.0x CP multiplier.',
  },
  {
    id: 'cnt-2',
    title: 'Codeforces Round #965 (Div. 2 & Div. 1)',
    platform: 'Codeforces',
    startTime: '2026-08-06T14:35:00Z',
    duration: '2 hours 15 mins',
    registeredCount: 1420,
    url: 'https://codeforces.com',
    description: 'Official Codeforces rating round. CP weight multiplier: 1.75x.',
  },
  {
    id: 'cnt-3',
    title: 'LeetCode Weekly Contest 410',
    platform: 'LeetCode',
    startTime: '2026-08-09T02:30:00Z',
    duration: '1 hour 30 mins',
    registeredCount: 3100,
    url: 'https://leetcode.com',
    description: 'Weekly algorithmic challenge. Solved problems count towards your 1.5x LeetCode CP weight.',
  },
  {
    id: 'cnt-4',
    title: 'CodeChef Starters 146 (Rated for All)',
    platform: 'CodeChef',
    startTime: '2026-08-12T14:30:00Z',
    duration: '2 hours',
    registeredCount: 890,
    url: 'https://codechef.com',
    description: 'CodeChef Wednesday contest. CP weight multiplier: 1.25x.',
  },
];

// Interactive graph dummy data for bento dashboard
export const WEEKLY_VELOCITY_DATA = {
  thisWeek: {
    label: 'This Week',
    change: '+24%',
    leetcode: [12, 18, 15, 24, 28, 35, 42],
    codeforces: [5, 10, 8, 15, 12, 20, 25],
    maxVal: 45,
  },
  lastWeek: {
    label: 'Last Week',
    change: '+18%',
    leetcode: [10, 14, 12, 18, 22, 25, 34],
    codeforces: [4, 8, 7, 10, 11, 15, 18],
    maxVal: 40,
  },
  twoWeeksAgo: {
    label: '2 Weeks Ago',
    change: '+12%',
    leetcode: [8, 12, 10, 15, 18, 20, 28],
    codeforces: [3, 5, 5, 8, 9, 12, 14],
    maxVal: 35,
  },
};

export const SEASON_PROGRESS_METRICS = [
  {
    id: 'tier_progress',
    label: 'Level 51 Phoenix Tier',
    percentage: 81,
    current: 21450,
    target: 26500,
    unit: 'pts',
    color: '#0f172a',
    subtitle: '+20% compared to last month*',
    description: 'Level 48 Flame • 2.0x CSE Bonus',
  },
  {
    id: 'monthly_solves',
    label: 'Monthly Solved Target',
    percentage: 120,
    current: 120,
    target: 100,
    unit: 'solves',
    color: '#10b981',
    subtitle: 'Exceeded target by 20 solves!',
    description: 'Target: 100 accepted solutions',
  },
  {
    id: 'rating_goal',
    label: 'Codeforces Rating Goal',
    percentage: 88,
    current: 1750,
    target: 2000,
    unit: 'rating',
    color: '#f59e0b',
    subtitle: '250 rating needed for Candidate Master',
    description: 'Current Division: Master (Div. 2)',
  },
];

export const SYNCED_PLATFORM_PROFILES = [
  {
    id: 'plat-1',
    name: 'Codeforces',
    rating: 1750,
    solvedCount: 245,
    weight: 1.75,
    badge: 'Master',
    percentage: 75,
    color: '#f97316',
    handle: 'rudra_nsec',
    url: 'https://codeforces.com',
    milestone: 'Reached Div 1 qualification; solved 125 hard DP problems',
  },
  {
    id: 'plat-2',
    name: 'LeetCode',
    rating: 1920,
    solvedCount: 412,
    weight: 1.5,
    badge: 'Knight',
    percentage: 85,
    color: '#f59e0b',
    handle: 'rudra_pratap',
    url: 'https://leetcode.com',
    milestone: 'Daily challenge streak 34 days; contest ranking top 2%',
  },
  {
    id: 'plat-3',
    name: 'CodeChef',
    rating: 1840,
    solvedCount: 180,
    weight: 1.25,
    badge: '4★ Div 2',
    percentage: 70,
    color: '#10b981',
    handle: 'rudra_nsec',
    url: 'https://codechef.com',
    milestone: 'Starters 140 Rank #14; 2.0x CSE department winner',
  },
  {
    id: 'plat-4',
    name: 'GeeksForGeeks',
    rating: 1650,
    solvedCount: 102,
    weight: 1.0,
    badge: '5 Star',
    percentage: 60,
    color: '#3b82f6',
    handle: 'rudra_gfg',
    url: 'https://geeksforgeeks.org',
    milestone: 'POTD 30 days completed; top 5% NSEC GFG ranking',
  },
  {
    id: 'plat-5',
    name: 'HackerRank',
    rating: 1500,
    solvedCount: 60,
    weight: 1.0,
    badge: 'Gold',
    percentage: 50,
    color: '#8b5cf6',
    handle: 'rudra_hr',
    url: 'https://hackerrank.com',
    milestone: 'Problem Solving (Advanced) Certificate verified',
  },
];

export const CODOLIO_STATS = {
  name: 'Debjit Sarkar',
  handle: 'rudra_nsec',
  bio: "Competitive Programmer & Full-Stack Developer | CSE '26 @ NSEC | Dept Rank #1",
  location: 'Kolkata, India',
  college: 'Netaji Subhash Engineering College (NSEC)',
  questionsSolved: 1232,
  activeDays: 468,
  contestsAttended: 16,
  contestBreakdown: {
    codeChef: 6,
    codeForces: 10,
  },
  globalRank: 4622,
  profileViews: 17279,
  profileVisibility: 'Public',
  questionDistribution: {
    fundamentals: {
      total: 174,
      gfgBasic: 9,
      hackerRank: 165,
    },
    dsa: {
      total: 939,
      easy: 286,
      medium: 528,
      hard: 125,
    },
    cp: {
      total: 119,
      codeChef: 27,
      codeForces: 92,
    },
  },
  contestRankings: {
    codeChef: {
      rating: 1718,
      maxRating: 1754,
      stars: '4★',
    },
    codeForces: {
      rank: 'Pupil',
      rating: 1375,
      maxRating: 1443,
    },
  },
  ratingHistory: [
    { month: 'Jan', rating: 1200 },
    { month: 'Mar', rating: 1350 },
    { month: 'May', rating: 1420 },
    { month: 'Jul', rating: 1580 },
    { month: 'Sep 2020', rating: 1718, contest: 'September Challenge 2020 Division 2', rank: 423 },
    { month: 'Nov', rating: 1690 },
    { month: 'Dec', rating: 1754 },
  ],
  verifiedPlatforms: [
    { name: 'GeeksForGeeks', active: true, color: 'text-emerald-600' },
    { name: 'CodeChef', active: true, color: 'text-amber-700' },
    { name: 'CodeForces', active: true, color: 'text-blue-600' },
    { name: 'InterviewBit', active: true, color: 'text-teal-600' },
    { name: 'CodeStudio', active: true, color: 'text-orange-600' },
    { name: 'HackerRank', active: true, color: 'text-emerald-500' },
    { name: 'LeetCode', active: true, color: 'text-amber-500' },
  ],
  awards: [
    { title: 'C ****', subtitle: 'CodeChef 4★', icon: 'C', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    { title: '5★', subtitle: 'Problem Solving', icon: '★', bg: 'bg-amber-100 text-amber-800 border-amber-300' },
    { title: 'Problem Solving', subtitle: 'Master', icon: '🧩', bg: 'bg-orange-100 text-orange-800 border-orange-300' },
    { title: 'GFG Badge', subtitle: 'Top 1%', icon: '🌿', bg: 'bg-teal-100 text-teal-800 border-teal-300' },
  ],
};

