import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Calculate total score using the official Cybernix Nexus scoring formula
function calculateScore(params: {
  easy: number;
  medium: number;
  hard: number;
  cfSolved: number;
  ccRating: number | null;
  streakDays: number;
}): number {
  const lcPoints = (params.easy * 10 + params.medium * 30 + params.hard * 75) * 1.5;
  const cfPoints = Math.max(0, params.cfSolved) * 35 * 1.75;
  const ccPoints = params.ccRating ? Math.max(0, params.ccRating - 1000) * 0.5 * 1.25 : 0;
  const streakMultiplier = Math.min(1.6, 1.0 + Math.max(0, params.streakDays) * 0.01);
  return Math.round((lcPoints + cfPoints + ccPoints) * streakMultiplier);
}

async function main() {
  console.log('🌱 Starting Cybernix Nexus database seeding...');

  // 1. Identify existing real developer accounts (preserve user if already logged in)
  const existingDevUser = await prisma.user.findFirst({
    where: { email: 'dsatyaki956@gmail.com' },
  });

  // Clean up previous dummy data (except the dev user)
  console.log('🧹 Cleaning up old dummy records...');
  await prisma.contestRegistration.deleteMany({});
  await prisma.contest.deleteMany({});
  await prisma.editorialComment.deleteMany({});
  await prisma.editorialLike.deleteMany({});
  await prisma.editorial.deleteMany({});
  await prisma.monthlyAchievement.deleteMany({});
  await prisma.dailySnapshot.deleteMany({});
  await prisma.syncJob.deleteMany({});
  await prisma.studentStats.deleteMany({});

  // Delete students and users created by seed (emails containing @nsec.ac.in or test users)
  await prisma.student.deleteMany({
    where: {
      user: {
        email: {
          contains: '@nsec.ac.in',
        },
      },
    },
  });

  await prisma.user.deleteMany({
    where: {
      email: {
        contains: '@nsec.ac.in',
      },
    },
  });

  // Also clean old test users
  await prisma.student.deleteMany({
    where: {
      user: {
        email: {
          in: ['123@gmail.com', '12322@gmail.com'],
        },
      },
    },
  });

  await prisma.user.deleteMany({
    where: {
      email: {
        in: ['123@gmail.com', '12322@gmail.com'],
      },
    },
  });

  console.log('👥 Seeding student profiles across NSEC departments...');

  // Student Seed Definitions
  const studentSeeds = [
    {
      isDev: true,
      email: 'dsatyaki956@gmail.com',
      name: 'Satyaki Das',
      username: 'satyaki',
      bio: 'Full-stack & Systems Engineer @ NSEC | Building Cybernix Nexus | Grandmaster on CF',
      rollNumber: 'NSEC/22/CSE/001',
      department: 'CSE',
      graduationYear: 2026,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      leetcode: 'satyaki7',
      codeforces: 'paulzrm',
      codechef: 'paulzrm_cc',
      github: 'Satyaki7',
      linkedin: 'satyaki-das-nsec',
      streakDays: 45,
      lcEasy: 210,
      lcMedium: 340,
      lcHard: 95,
      lcRating: 2180,
      cfRating: 2479,
      cfMaxRating: 2479,
      cfRank: 'grandmaster',
      cfMaxRank: 'grandmaster',
      cfSolved: 1115,
      cfContribution: 116,
      ccRating: 2150,
      ccStars: '5★',
      ccGlobalRank: '420',
      ccSolved: 310,
    },
    {
      email: 'debargha.roy@nsec.ac.in',
      name: 'Debargha Roy',
      username: 'debargharoy',
      bio: 'IT Senior @ NSEC | Candidate Master | Graph Algorithms & Combinatorics Enthusiast',
      rollNumber: 'NSEC/21/IT/014',
      department: 'IT',
      graduationYear: 2025,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      leetcode: 'debargha_cf',
      codeforces: 'debargha_r',
      codechef: 'debargha_cc',
      github: 'debargha-roy',
      linkedin: 'debargha-roy-nsec',
      streakDays: 38,
      lcEasy: 180,
      lcMedium: 290,
      lcHard: 65,
      lcRating: 2010,
      cfRating: 1940,
      cfMaxRating: 2015,
      cfRank: 'candidate master',
      cfMaxRank: 'candidate master',
      cfSolved: 840,
      cfContribution: 48,
      ccRating: 1980,
      ccStars: '4★',
      ccGlobalRank: '1150',
      ccSolved: 240,
    },
    {
      email: 'ananya.sengupta@nsec.ac.in',
      name: 'Ananya Sengupta',
      username: 'ananya_sg',
      bio: 'ECE Pre-final @ NSEC | Hardware + Algorithms | LeetCode Knight & CF Specialist',
      rollNumber: 'NSEC/22/ECE/028',
      department: 'ECE',
      graduationYear: 2026,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      leetcode: 'ananya_algo',
      codeforces: 'ananya_sg',
      codechef: 'ananya_chef',
      github: 'ananya-sengupta',
      linkedin: 'ananya-sengupta-ece',
      streakDays: 32,
      lcEasy: 160,
      lcMedium: 240,
      lcHard: 45,
      lcRating: 1920,
      cfRating: 1580,
      cfMaxRating: 1640,
      cfRank: 'specialist',
      cfMaxRank: 'specialist',
      cfSolved: 520,
      cfContribution: 22,
      ccRating: 1820,
      ccStars: '4★',
      ccGlobalRank: '2800',
      ccSolved: 190,
    },
    {
      email: 'pritam.mukherjee@nsec.ac.in',
      name: 'Pritam Mukherjee',
      username: 'pritam_ai',
      bio: 'AI&DS 2nd Year @ NSEC | Neural Networks & Number Theory | Daily problem solver',
      rollNumber: 'NSEC/23/AIDS/007',
      department: 'AI&DS',
      graduationYear: 2027,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      leetcode: 'pritam_mukh',
      codeforces: 'pritam_nsec',
      codechef: 'pritam_ds',
      github: 'pritam-mukherjee',
      linkedin: 'pritam-mukherjee-aids',
      streakDays: 29,
      lcEasy: 140,
      lcMedium: 190,
      lcHard: 30,
      lcRating: 1840,
      cfRating: 1490,
      cfMaxRating: 1540,
      cfRank: 'specialist',
      cfMaxRank: 'specialist',
      cfSolved: 410,
      cfContribution: 15,
      ccRating: 1740,
      ccStars: '3★',
      ccGlobalRank: '4200',
      ccSolved: 160,
    },
    {
      email: 'sneha.ghosh@nsec.ac.in',
      name: 'Sneha Ghosh',
      username: 'sneha_codes',
      bio: 'CSE 2nd Year @ NSEC | Dynamic Programming fanatic | Open Source contributor',
      rollNumber: 'NSEC/23/CSE/052',
      department: 'CSE',
      graduationYear: 2027,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      leetcode: 'sneha_ghosh',
      codeforces: 'sneha_g',
      codechef: 'sneha_cc',
      github: 'sneha-ghosh',
      linkedin: 'sneha-ghosh-cse',
      streakDays: 25,
      lcEasy: 130,
      lcMedium: 180,
      lcHard: 28,
      lcRating: 1780,
      cfRating: 1420,
      cfMaxRating: 1470,
      cfRank: 'specialist',
      cfMaxRank: 'specialist',
      cfSolved: 380,
      cfContribution: 12,
      ccRating: 1690,
      ccStars: '3★',
      ccGlobalRank: '5100',
      ccSolved: 140,
    },
    {
      email: 'rohit.banerjee@nsec.ac.in',
      name: 'Rohit Banerjee',
      username: 'rohit_ee',
      bio: 'EE 3rd Year @ NSEC | Embedded Systems & Algorithms | Bridging Hardware and CP',
      rollNumber: 'NSEC/22/EE/019',
      department: 'EE',
      graduationYear: 2026,
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      leetcode: 'rohit_ee_cp',
      codeforces: 'rohit_b',
      codechef: 'rohit_ee',
      github: 'rohit-banerjee',
      linkedin: 'rohit-banerjee-ee',
      streakDays: 20,
      lcEasy: 110,
      lcMedium: 140,
      lcHard: 20,
      lcRating: 1680,
      cfRating: 1380,
      cfMaxRating: 1420,
      cfRank: 'pupil',
      cfMaxRank: 'specialist',
      cfSolved: 310,
      cfContribution: 8,
      ccRating: 1620,
      ccStars: '3★',
      ccGlobalRank: '6900',
      ccSolved: 120,
    },
    {
      email: 'soumyadeep.das@nsec.ac.in',
      name: 'Soumyadeep Das',
      username: 'soumyadeep_me',
      bio: 'Mechanical Engineering Senior @ NSEC | Robotics & CP | Fast C++ programmer',
      rollNumber: 'NSEC/21/ME/005',
      department: 'ME',
      graduationYear: 2025,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      leetcode: 'soumya_me',
      codeforces: 'soumya_das',
      codechef: 'soumya_chef',
      github: 'soumyadeep-das',
      linkedin: 'soumyadeep-das-me',
      streakDays: 18,
      lcEasy: 105,
      lcMedium: 130,
      lcHard: 18,
      lcRating: 1640,
      cfRating: 1340,
      cfMaxRating: 1380,
      cfRank: 'pupil',
      cfMaxRank: 'pupil',
      cfSolved: 280,
      cfContribution: 6,
      ccRating: 1580,
      ccStars: '3★',
      ccGlobalRank: '7500',
      ccSolved: 110,
    },
    {
      email: 'ishita.mukherjee@nsec.ac.in',
      name: 'Ishita Mukherjee',
      username: 'ishita_m',
      bio: 'CSE Final Year @ NSEC | Software Engineer Intern | Trees, Trie & Backtracking',
      rollNumber: 'NSEC/21/CSE/033',
      department: 'CSE',
      graduationYear: 2025,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      leetcode: 'ishita_mukherjee',
      codeforces: 'ishita_cse',
      codechef: 'ishita_cc',
      github: 'ishita-mukherjee',
      linkedin: 'ishita-mukherjee-cse',
      streakDays: 22,
      lcEasy: 150,
      lcMedium: 210,
      lcHard: 38,
      lcRating: 1860,
      cfRating: 1520,
      cfMaxRating: 1590,
      cfRank: 'specialist',
      cfMaxRank: 'specialist',
      cfSolved: 440,
      cfContribution: 16,
      ccRating: 1770,
      ccStars: '3★',
      ccGlobalRank: '3800',
      ccSolved: 175,
    },
    {
      email: 'aditya.ghosh@nsec.ac.in',
      name: 'Aditya Ghosh',
      username: 'aditya_g',
      bio: 'IT 3rd Year @ NSEC | Distributed systems & competitive coding | Codeforces Pupil',
      rollNumber: 'NSEC/22/IT/041',
      department: 'IT',
      graduationYear: 2026,
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      leetcode: 'aditya_it',
      codeforces: 'aditya_nsec',
      codechef: 'aditya_chef',
      github: 'aditya-ghosh',
      linkedin: 'aditya-ghosh-it',
      streakDays: 16,
      lcEasy: 120,
      lcMedium: 160,
      lcHard: 24,
      lcRating: 1710,
      cfRating: 1390,
      cfMaxRating: 1440,
      cfRank: 'pupil',
      cfMaxRank: 'specialist',
      cfSolved: 320,
      cfContribution: 9,
      ccRating: 1630,
      ccStars: '3★',
      ccGlobalRank: '6200',
      ccSolved: 130,
    },
    {
      email: 'poulami.sen@nsec.ac.in',
      name: 'Poulami Sen',
      username: 'poulami_sen',
      bio: 'ECE 3rd Year @ NSEC | Signal Processing & Algorithmic Problem Solving',
      rollNumber: 'NSEC/22/ECE/045',
      department: 'ECE',
      graduationYear: 2026,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      leetcode: 'poulami_s',
      codeforces: 'poulami_ece',
      codechef: 'poulami_chef',
      github: 'poulami-sen',
      linkedin: 'poulami-sen-ece',
      streakDays: 14,
      lcEasy: 95,
      lcMedium: 120,
      lcHard: 15,
      lcRating: 1600,
      cfRating: 1280,
      cfMaxRating: 1320,
      cfRank: 'pupil',
      cfMaxRank: 'pupil',
      cfSolved: 240,
      cfContribution: 5,
      ccRating: 1520,
      ccStars: '2★',
      ccGlobalRank: '9200',
      ccSolved: 90,
    },
    {
      email: 'arghya.das@nsec.ac.in',
      name: 'Arghya Das',
      username: 'arghya_das',
      bio: 'IT 2nd Year @ NSEC | Web3, Rust & Algorithmic Practice | Striving for Specialist',
      rollNumber: 'NSEC/23/IT/018',
      department: 'IT',
      graduationYear: 2027,
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
      leetcode: 'arghya_d',
      codeforces: 'arghya_it',
      codechef: 'arghya_chef',
      github: 'arghya-das',
      linkedin: 'arghya-das-it',
      streakDays: 12,
      lcEasy: 85,
      lcMedium: 95,
      lcHard: 12,
      lcRating: 1540,
      cfRating: 1240,
      cfMaxRating: 1290,
      cfRank: 'pupil',
      cfMaxRank: 'pupil',
      cfSolved: 190,
      cfContribution: 4,
      ccRating: 1480,
      ccStars: '2★',
      ccGlobalRank: '11000',
      ccSolved: 75,
    },
    {
      email: 'tanmoy.paul@nsec.ac.in',
      name: 'Tanmoy Paul',
      username: 'tanmoy_p',
      bio: 'AI&DS 3rd Year @ NSEC | Machine Learning, Statistics & Competitive Programming',
      rollNumber: 'NSEC/22/AIDS/023',
      department: 'AI&DS',
      graduationYear: 2026,
      avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
      leetcode: 'tanmoy_p',
      codeforces: 'tanmoy_aids',
      codechef: 'tanmoy_chef',
      github: 'tanmoy-paul',
      linkedin: 'tanmoy-paul-aids',
      streakDays: 11,
      lcEasy: 80,
      lcMedium: 90,
      lcHard: 10,
      lcRating: 1510,
      cfRating: 1210,
      cfMaxRating: 1260,
      cfRank: 'pupil',
      cfMaxRank: 'pupil',
      cfSolved: 180,
      cfContribution: 3,
      ccRating: 1450,
      ccStars: '2★',
      ccGlobalRank: '12500',
      ccSolved: 70,
    },
    {
      email: 'ankita.bhattacharya@nsec.ac.in',
      name: 'Ankita Bhattacharya',
      username: 'ankita_b',
      bio: 'CSE 3rd Year @ NSEC | Cloud computing & LeetCode Grinder | Python & C++',
      rollNumber: 'NSEC/22/CSE/064',
      department: 'CSE',
      graduationYear: 2026,
      avatar: 'https://images.unsplash.com/photo-1534751516642-a171edd2521d?w=150&auto=format&fit=crop&q=80',
      leetcode: 'ankita_b',
      codeforces: 'ankita_cse',
      codechef: 'ankita_chef',
      github: 'ankita-bhattacharya',
      linkedin: 'ankita-bhattacharya-cse',
      streakDays: 10,
      lcEasy: 75,
      lcMedium: 80,
      lcHard: 8,
      lcRating: 1480,
      cfRating: 1190,
      cfMaxRating: 1220,
      cfRank: 'newbie',
      cfMaxRank: 'pupil',
      cfSolved: 150,
      cfContribution: 2,
      ccRating: 1410,
      ccStars: '2★',
      ccGlobalRank: '14000',
      ccSolved: 60,
    },
    {
      email: 'riya.chakraborty@nsec.ac.in',
      name: 'Riya Chakraborty',
      username: 'riya_c',
      bio: 'CSE 1st Year @ NSEC | Just starting algorithmic journey | Cybernix Phoenix Club',
      rollNumber: 'NSEC/24/CSE/102',
      department: 'CSE',
      graduationYear: 2028,
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
      leetcode: 'riya_freshman',
      codeforces: 'riya_c',
      codechef: 'riya_chef',
      github: 'riya-chakraborty',
      linkedin: 'riya-chakraborty-cse',
      streakDays: 7,
      lcEasy: 45,
      lcMedium: 25,
      lcHard: 2,
      lcRating: 1350,
      cfRating: 1050,
      cfMaxRating: 1080,
      cfRank: 'newbie',
      cfMaxRank: 'newbie',
      cfSolved: 65,
      cfContribution: 1,
      ccRating: 1320,
      ccStars: '1★',
      ccGlobalRank: '22000',
      ccSolved: 35,
    },
    {
      email: 'subham.saha@nsec.ac.in',
      name: 'Subham Saha',
      username: 'subham_s',
      bio: 'AI&DS 1st Year @ NSEC | Math Olympiad background | Exploring graphs & combinatorics',
      rollNumber: 'NSEC/24/AIDS/045',
      department: 'AI&DS',
      graduationYear: 2028,
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      leetcode: 'subham_saha',
      codeforces: 'subham_nsec',
      codechef: 'subham_cc',
      github: 'subham-saha',
      linkedin: 'subham-saha-aids',
      streakDays: 6,
      lcEasy: 40,
      lcMedium: 20,
      lcHard: 2,
      lcRating: 1320,
      cfRating: 1020,
      cfMaxRating: 1050,
      cfRank: 'newbie',
      cfMaxRank: 'newbie',
      cfSolved: 55,
      cfContribution: 0,
      ccRating: 1290,
      ccStars: '1★',
      ccGlobalRank: '25000',
      ccSolved: 30,
    },
    {
      email: 'megha.kundu@nsec.ac.in',
      name: 'Megha Kundu',
      username: 'megha_k',
      bio: 'ECE 2nd Year @ NSEC | Microcontrollers & Array Manipulations | Regular contest solver',
      rollNumber: 'NSEC/23/ECE/078',
      department: 'ECE',
      graduationYear: 2027,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      leetcode: 'megha_kundu',
      codeforces: 'megha_ece',
      codechef: 'megha_chef',
      github: 'megha-kundu',
      linkedin: 'megha-kundu-ece',
      streakDays: 5,
      lcEasy: 35,
      lcMedium: 15,
      lcHard: 1,
      lcRating: 1280,
      cfRating: 980,
      cfMaxRating: 1010,
      cfRank: 'newbie',
      cfMaxRank: 'newbie',
      cfSolved: 45,
      cfContribution: 0,
      ccRating: 1250,
      ccStars: '1★',
      ccGlobalRank: '28000',
      ccSolved: 25,
    },
    {
      email: 'rajdeep.das@nsec.ac.in',
      name: 'Rajdeep Das',
      username: 'rajdeep_ee',
      bio: 'EE 1st Year @ NSEC | Electrical circuits & introductory coding | Python enthusiast',
      rollNumber: 'NSEC/24/EE/032',
      department: 'EE',
      graduationYear: 2028,
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      leetcode: 'rajdeep_ee',
      codeforces: 'rajdeep_nsec',
      codechef: 'rajdeep_cc',
      github: 'rajdeep-das',
      linkedin: 'rajdeep-das-ee',
      streakDays: 4,
      lcEasy: 28,
      lcMedium: 10,
      lcHard: 0,
      lcRating: 1220,
      cfRating: 920,
      cfMaxRating: 950,
      cfRank: 'newbie',
      cfMaxRank: 'newbie',
      cfSolved: 35,
      cfContribution: 0,
      ccRating: 1190,
      ccStars: '1★',
      ccGlobalRank: '32000',
      ccSolved: 20,
    },
    {
      email: 'saptarshi.guha@nsec.ac.in',
      name: 'Saptarshi Guha',
      username: 'saptarshi_me',
      bio: 'ME 2nd Year @ NSEC | SolidWorks + C++ | Aspiring CAD & simulation programmer',
      rollNumber: 'NSEC/23/ME/027',
      department: 'ME',
      graduationYear: 2027,
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
      leetcode: 'saptarshi_me',
      codeforces: 'saptarshi_g',
      codechef: 'saptarshi_cc',
      github: 'saptarshi-guha',
      linkedin: 'saptarshi-guha-me',
      streakDays: 3,
      lcEasy: 22,
      lcMedium: 8,
      lcHard: 0,
      lcRating: 1180,
      cfRating: 880,
      cfMaxRating: 910,
      cfRank: 'newbie',
      cfMaxRank: 'newbie',
      cfSolved: 28,
      cfContribution: 0,
      ccRating: 1140,
      ccStars: '1★',
      ccGlobalRank: '36000',
      ccSolved: 15,
    },
    {
      email: 'swarnali.sarkar@nsec.ac.in',
      name: 'Swarnali Sarkar',
      username: 'swarnali_s',
      bio: 'IT 1st Year @ NSEC | Passionate about algorithms and data structures | C++ learner',
      rollNumber: 'NSEC/24/IT/062',
      department: 'IT',
      graduationYear: 2028,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      leetcode: 'swarnali_it',
      codeforces: 'swarnali_nsec',
      codechef: 'swarnali_chef',
      github: 'swarnali-sarkar',
      linkedin: 'swarnali-sarkar-it',
      streakDays: 3,
      lcEasy: 18,
      lcMedium: 5,
      lcHard: 0,
      lcRating: 1150,
      cfRating: 840,
      cfMaxRating: 870,
      cfRank: 'newbie',
      cfMaxRank: 'newbie',
      cfSolved: 22,
      cfContribution: 0,
      ccRating: 1100,
      ccStars: '1★',
      ccGlobalRank: '40000',
      ccSolved: 12,
    },
    {
      email: 'abhirup.dey@nsec.ac.in',
      name: 'Abhirup Dey',
      username: 'abhirup_dey',
      bio: 'ECE Final Year @ NSEC | VLSI & Graph Theory | Competitive coder & peer mentor',
      rollNumber: 'NSEC/21/ECE/012',
      department: 'ECE',
      graduationYear: 2025,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      leetcode: 'abhirup_dey',
      codeforces: 'abhirup_ece',
      codechef: 'abhirup_chef',
      github: 'abhirup-dey',
      linkedin: 'abhirup-dey-ece',
      streakDays: 17,
      lcEasy: 115,
      lcMedium: 145,
      lcHard: 22,
      lcRating: 1690,
      cfRating: 1360,
      cfMaxRating: 1410,
      cfRank: 'pupil',
      cfMaxRank: 'pupil',
      cfSolved: 300,
      cfContribution: 7,
      ccRating: 1610,
      ccStars: '3★',
      ccGlobalRank: '7100',
      ccSolved: 115,
    },
  ];

  // Pre-calculate scores and prepare students
  const preparedStudents = studentSeeds.map((seed) => {
    const totalScore = calculateScore({
      easy: seed.lcEasy,
      medium: seed.lcMedium,
      hard: seed.lcHard,
      cfSolved: seed.cfSolved,
      ccRating: seed.ccRating,
      streakDays: seed.streakDays,
    });
    return {
      ...seed,
      totalScore,
      lcSolved: seed.lcEasy + seed.lcMedium + seed.lcHard,
    };
  });

  // Sort descending by totalScore
  preparedStudents.sort((a, b) => b.totalScore - a.totalScore);

  // Group by department for department rankings
  const deptCounters: Record<string, number> = {};

  const createdStudents = [];

  for (let rankIndex = 0; rankIndex < preparedStudents.length; rankIndex++) {
    const s = preparedStudents[rankIndex];
    const overallRank = rankIndex + 1;
    deptCounters[s.department] = (deptCounters[s.department] || 0) + 1;
    const departmentRank = deptCounters[s.department];

    // Find or create user
    let user;
    if (s.isDev && existingDevUser) {
      user = await prisma.user.update({
        where: { id: existingDevUser.id },
        data: {
          name: s.name,
          image: s.avatar,
        },
      });
    } else {
      user = await prisma.user.upsert({
        where: { email: s.email },
        create: {
          email: s.email,
          name: s.name,
          image: s.avatar,
        },
        update: {
          name: s.name,
          image: s.avatar,
        },
      });
    }

    // Upsert Student
    const student = await prisma.student.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        name: s.name,
        username: s.username,
        bio: s.bio,
        rollNumber: s.rollNumber,
        department: s.department,
        graduationYear: s.graduationYear,
        leetcode: s.leetcode,
        codeforces: s.codeforces,
        codechef: s.codechef,
        github: s.github,
        linkedin: s.linkedin,
        profileComplete: true,
        lastSyncedAt: new Date(),
      },
      update: {
        name: s.name,
        username: s.username,
        bio: s.bio,
        rollNumber: s.rollNumber,
        department: s.department,
        graduationYear: s.graduationYear,
        leetcode: s.leetcode,
        codeforces: s.codeforces,
        codechef: s.codechef,
        github: s.github,
        linkedin: s.linkedin,
        profileComplete: true,
        lastSyncedAt: new Date(),
      },
    });

    // Upsert StudentStats
    await prisma.studentStats.upsert({
      where: { studentId: student.id },
      create: {
        studentId: student.id,
        leetcodeSolved: s.lcSolved,
        leetcodeEasySolved: s.lcEasy,
        leetcodeMediumSolved: s.lcMedium,
        leetcodeHardSolved: s.lcHard,
        leetcodeRating: s.lcRating,
        codeforcesRating: s.cfRating,
        codeforcesMaxRating: s.cfMaxRating,
        codeforcesRank: s.cfRank,
        codeforcesMaxRank: s.cfMaxRank,
        codeforcesSolved: s.cfSolved,
        codeforcesAvatar: s.avatar,
        codeforcesContribution: s.cfContribution,
        codechefRating: s.ccRating,
        codechefStars: s.ccStars,
        codechefGlobalRank: s.ccGlobalRank,
        codechefSolved: s.ccSolved,
        totalScore: s.totalScore,
        ranking: overallRank,
        departmentRanking: departmentRank,
      },
      update: {
        leetcodeSolved: s.lcSolved,
        leetcodeEasySolved: s.lcEasy,
        leetcodeMediumSolved: s.lcMedium,
        leetcodeHardSolved: s.lcHard,
        leetcodeRating: s.lcRating,
        codeforcesRating: s.cfRating,
        codeforcesMaxRating: s.cfMaxRating,
        codeforcesRank: s.cfRank,
        codeforcesMaxRank: s.cfMaxRank,
        codeforcesSolved: s.cfSolved,
        codeforcesAvatar: s.avatar,
        codeforcesContribution: s.cfContribution,
        codechefRating: s.ccRating,
        codechefStars: s.ccStars,
        codechefGlobalRank: s.ccGlobalRank,
        codechefSolved: s.ccSolved,
        totalScore: s.totalScore,
        ranking: overallRank,
        departmentRanking: departmentRank,
      },
    });

    createdStudents.push({ ...student, seedData: s, totalScore: s.totalScore });
  }

  console.log(`✅ Seeded ${createdStudents.length} students with stats and rankings.`);

  // 2. Seed Daily Snapshots for the past 21 days (for top 6 students to drive velocity graphs)
  console.log('📈 Generating 21 days of DailySnapshots for velocity chart...');
  const now = new Date();
  const topStudents = createdStudents.slice(0, 6);

  for (const student of topStudents) {
    const isTopStudent = student.seedData.username === 'satyaki';
    for (let dayOffset = 20; dayOffset >= 0; dayOffset--) {
      const snapDate = new Date();
      snapDate.setUTCDate(now.getUTCDate() - dayOffset);
      snapDate.setUTCHours(0, 0, 0, 0);

      // Realistic activity variation
      const baseLCSolved = isTopStudent ? 3 + ((dayOffset * 3) % 4) : 1 + (dayOffset % 3);
      const baseCFSolved = isTopStudent ? 2 + ((dayOffset * 2) % 3) : (dayOffset % 2);
      const dailyScore = baseLCSolved * 15 + baseCFSolved * 35;

      await prisma.dailySnapshot.upsert({
        where: {
          studentId_date: {
            studentId: student.id,
            date: snapDate,
          },
        },
        create: {
          studentId: student.id,
          date: snapDate,
          leetcodeSolved: baseLCSolved,
          codeforcesSolved: baseCFSolved,
          codechefRating: student.seedData.ccRating || 0,
          codechefSolved: Math.max(0, Math.round((student.seedData.ccSolved || 0) / 20)),
          totalScore: dailyScore,
        },
        update: {
          leetcodeSolved: baseLCSolved,
          codeforcesSolved: baseCFSolved,
          codechefRating: student.seedData.ccRating || 0,
          totalScore: dailyScore,
        },
      });
    }

    // Add a completed SyncJob for realism
    await prisma.syncJob.create({
      data: {
        studentId: student.id,
        status: 'SUCCESS',
        startedAt: new Date(Date.now() - 3600000),
        finishedAt: new Date(),
      },
    });
  }

  // 3. Seed Monthly Achievements
  console.log('🏆 Seeding Monthly Achievements...');
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  const topPerformer = createdStudents[0];
  const secondPerformer = createdStudents[1];
  const thirdPerformer = createdStudents[2];
  const freshmanPerformer = createdStudents.find((s) => s.seedData.graduationYear === 2028) || createdStudents[5];

  const monthlyAchievementsData = [
    {
      category: 'Problem solver of the month',
      title: 'Problem Solver of the Month',
      month: currentMonth,
      year: currentYear,
      studentId: topPerformer.id,
      department: topPerformer.department,
      scoreOrMetric: '145 Problems Solved',
      badgeIcon: '⚡',
      isManual: false,
    },
    {
      category: 'CP Champion of the month',
      title: 'Highest Rated Algorithmic Star',
      month: currentMonth,
      year: currentYear,
      studentId: topPerformer.id,
      department: topPerformer.department,
      scoreOrMetric: '2479 CF Grandmaster',
      badgeIcon: '🏆',
      isManual: false,
    },
    {
      category: 'Department of the month',
      title: 'Inter-Department Champion',
      month: currentMonth,
      year: currentYear,
      studentId: null,
      department: 'CSE',
      scoreOrMetric: '22,450 Avg CP Score',
      badgeIcon: '🏛️',
      isManual: false,
    },
    {
      category: 'Beginner of the month',
      title: 'Rising Freshman Prodigy',
      month: currentMonth,
      year: currentYear,
      studentId: freshmanPerformer.id,
      department: freshmanPerformer.department,
      scoreOrMetric: '+3,400 Score Growth',
      badgeIcon: '🌟',
      isManual: false,
    },
    // Previous Month Achievements
    {
      category: 'Problem solver of the month',
      title: 'Problem Solver of the Month',
      month: prevMonth,
      year: prevMonthYear,
      studentId: secondPerformer.id,
      department: secondPerformer.department,
      scoreOrMetric: '128 Problems Solved',
      badgeIcon: '⚡',
      isManual: false,
    },
    {
      category: 'CP Champion of the month',
      title: 'Highest Rated Algorithmic Star',
      month: prevMonth,
      year: prevMonthYear,
      studentId: topPerformer.id,
      department: topPerformer.department,
      scoreOrMetric: '2479 CF Rating',
      badgeIcon: '🏆',
      isManual: false,
    },
    {
      category: 'Department of the month',
      title: 'Inter-Department Champion',
      month: prevMonth,
      year: prevMonthYear,
      studentId: null,
      department: 'IT',
      scoreOrMetric: '19,800 Avg CP Score',
      badgeIcon: '🏛️',
      isManual: false,
    },
  ];

  for (const ach of monthlyAchievementsData) {
    await prisma.monthlyAchievement.create({ data: ach });
  }

  // 4. Seed Rich Community Editorials
  console.log('✍️ Seeding community editorials, code solutions & peer discussions...');
  const editorialSeeds = [
    {
      title: 'LeetCode 42: Trapping Rain Water (Two Pointers & Monotonic Stack)',
      problemUrl: 'https://leetcode.com/problems/trapping-rain-water/',
      platform: 'LeetCode',
      difficulty: 'Hard',
      tags: ['Two Pointers', 'Stack', 'Dynamic Programming'],
      summary: 'Detailed derivation of both the O(N) auxiliary array approach and the constant O(1) space two-pointer optimal solution.',
      content: `### Intuition and Architectural Breakdown
The goal is to calculate how much rain water can be trapped after raining given an elevation map represented by an array.

At any index \`i\`, the water trapped above that bar is strictly determined by:
\`\`\`
water[i] = max(0, min(max_left[i], max_right[i]) - height[i])
\`\`\`

### Approach 1: Two Pointers (Optimal)
Instead of storing \`max_left\` and \`max_right\` arrays in \`O(N)\` extra space, notice that we only need the smaller of the two maximums. If \`left_max < right_max\`, the water level at the current left pointer is bounded solely by \`left_max\`. We can increment \`left\`; otherwise, we decrement \`right\`.

### Complexity
- **Time Complexity:** \`O(N)\` single pass.
- **Space Complexity:** \`O(1)\` auxiliary memory.`,
      codeSnippet: `class Solution {
public:
    int trap(vector<int>& height) {
        int n = height.size();
        if (n <= 2) return 0;

        int left = 0, right = n - 1;
        int leftMax = 0, rightMax = 0;
        int trappedWater = 0;

        while (left < right) {
            if (height[left] <= height[right]) {
                if (height[left] >= leftMax) {
                    leftMax = height[left];
                } else {
                    trappedWater += leftMax - height[left];
                }
                left++;
            } else {
                if (height[right] >= rightMax) {
                    rightMax = height[right];
                } else {
                    trappedWater += rightMax - height[right];
                }
                right--;
            }
        }
        return trappedWater;
    }
};`,
      codeLanguage: 'cpp',
      authorIndex: 0, // Satyaki Das
      comments: [
        {
          authorIndex: 1, // Debargha Roy
          content: 'The two-pointer explanation is super clean. The monotonic stack variant is also great when dealing with 2D histograms.',
        },
        {
          authorIndex: 2, // Ananya Sengupta
          content: 'Tested this on LC Weekly mock test and got 0ms runtime. Thanks for the write-up!',
        },
      ],
    },
    {
      title: 'Codeforces 1985F: Final Boss (Binary Search on Answer)',
      problemUrl: 'https://codeforces.com/contest/1985/problem/F',
      platform: 'Codeforces',
      difficulty: 'Medium',
      tags: ['Binary Search', 'Greedy', 'Math'],
      summary: 'Binary searching over total turn count to deterministically evaluate total boss damage output within O(N log(maxTurn)).',
      content: `### Problem Overview
We have an enemy boss with health \`h\`. We have \`n\` attacks, where each attack \`i\` deals damage \`a[i]\` and has a cooldown of \`c[i]\` turns. In turn 1, all attacks are ready. Once attack \`i\` is used at turn \`t\`, it is next available at \`t + c[i]\`.

### Key Insight
Notice the monotonicity: as turns increase, total damage dealt monotonically increases!
Thus, we can binary search over the number of turns \`turns\` in range \`[1, 4 * 10^{10}]\`.

For a fixed number of \`turns\`, attack \`i\` can be triggered:
\`\`\`
1 + (turns - 1) / c[i]
\`\`\`
times. Summing \`count * a[i]\` across all attacks gives total damage in \`O(N)\`.`,
      codeSnippet: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

void solve() {
    ll h;
    int n;
    if (!(cin >> h >> n)) return;
    vector<ll> a(n), c(n);
    for (int i = 0; i < n; ++i) cin >> a[i];
    for (int i = 0; i < n; ++i) cin >> c[i];

    auto canDefeat = [&](ll turns) -> bool {
        ll totalDamage = 0;
        for (int i = 0; i < n; ++i) {
            ll uses = 1 + (turns - 1) / c[i];
            totalDamage += uses * a[i];
            if (totalDamage >= h) return true;
        }
        return totalDamage >= h;
    };

    ll low = 1, high = 4e11, ans = high;
    while (low <= high) {
        ll mid = low + (high - low) / 2;
        if (canDefeat(mid)) {
            ans = mid;
            high = mid - 1;
        } else {
            low = mid + 1;
        }
    }
    cout << ans << "\\n";
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int t;
    if (cin >> t) {
        while (t--) solve();
    }
    return 0;
}`,
      codeLanguage: 'cpp',
      authorIndex: 1, // Debargha Roy
      comments: [
        {
          authorIndex: 3, // Pritam Mukherjee
          content: 'The upper bound of 4e11 is crucial to prevent integer overflow in C++! Good catch checking intermediate totalDamage >= h inside the loop.',
        },
      ],
    },
    {
      title: 'LeetCode 200: Number of Islands (Optimal BFS vs Disjoint Set Union)',
      problemUrl: 'https://leetcode.com/problems/number-of-islands/',
      platform: 'LeetCode',
      difficulty: 'Medium',
      tags: ['Graph', 'BFS', 'DFS', 'Union-Find'],
      summary: 'Comparative analysis of iterative queue-based BFS vs Disjoint Set (Union-Find) with path compression.',
      content: `### Problem Description
Given an \`m x n\` 2D binary grid \`grid\` which represents a map of \`'1'\`s (land) and \`'0'\`s (water), return the number of islands.

### Approach 1: BFS with In-place Marking
Traverse each cell \`(r, c)\`. If \`grid[r][c] == '1'\`, we increment our island counter and kick off a BFS that marks all connected \`'1'\`s as \`'0'\` (or \`'2'\` to avoid mutation).

\`\`\`text
Time Complexity: O(M * N)
Space Complexity: O(min(M, N)) for the BFS queue width
\`\`\``,
      codeSnippet: `class Solution:
    def numIslands(self, grid: list[list[str]]) -> int:
        if not grid:
            return 0
        
        rows, cols = len(grid), len(grid[0])
        islands = 0
        from collections import deque

        def bfs(r: int, c: int):
            queue = deque([(r, c)])
            grid[r][c] = '0'
            directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]
            while queue:
                cr, cc = queue.popleft()
                for dr, dc in directions:
                    nr, nc = cr + dr, cc + dc
                    if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == '1':
                        grid[nr][nc] = '0'
                        queue.append((nr, nc))

        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == '1':
                    islands += 1
                    bfs(r, c)
                    
        return islands`,
      codeLanguage: 'python',
      authorIndex: 2, // Ananya Sengupta
      comments: [
        {
          authorIndex: 0,
          content: 'Great Python implementation. In-place marking avoids visited set hash table overhead.',
        },
      ],
    },
    {
      title: 'CodeChef START135: Longest Subsequence with Bitmask Dynamic Programming',
      problemUrl: 'https://www.codechef.com',
      platform: 'CodeChef',
      difficulty: 'Hard',
      tags: ['DP', 'Bitmask', 'Optimization'],
      summary: 'State-space compression using 30-bit bitmasks to achieve sub-quadratic transition time.',
      content: `### Problem Analysis
We need to find the maximum length subsequence where bitwise AND conditions hold across contiguous transitions.

### Bitmask Dynamic Programming
Let \`dp[mask]\` represent the maximum length of a valid subsequence ending with a value whose most significant bits match \`mask\`.
By tracking the most recent occurrences across 30 bit positions, we reduce the transition from \`O(N^2)\` to \`O(N * 30)\`.`,
      codeSnippet: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    if (!(cin >> n)) return 0;
    vector<int> a(n);
    for (int &x : a) cin >> x;

    vector<int> bitDp(32, 0);
    int maxLen = 0;

    for (int num : a) {
        int best = 1;
        for (int b = 0; b < 30; ++b) {
            if ((num >> b) & 1) {
                best = max(best, bitDp[b] + 1);
            }
        }
        for (int b = 0; b < 30; ++b) {
            if ((num >> b) & 1) {
                bitDp[b] = max(bitDp[b], best);
            }
        }
        maxLen = max(maxLen, best);
    }

    cout << maxLen << "\\n";
    return 0;
}`,
      codeLanguage: 'cpp',
      authorIndex: 0, // Satyaki Das
      comments: [
        {
          authorIndex: 4, // Sneha Ghosh
          content: 'BitDp tracking per bit position is such an elegant technique! Solved my TLE issue.',
        },
      ],
    },
    {
      title: 'Codeforces 1999E: Triple Operations (Greedy Prefix Breakdown)',
      problemUrl: 'https://codeforces.com/contest/1999/problem/E',
      platform: 'Codeforces',
      difficulty: 'Easy',
      tags: ['Math', 'Greedy', 'Constructive'],
      summary: 'Optimizing division by 3 operations using prefix sums and precomputed logarithmic tiers.',
      content: `### Problem Concept
Given a range \`[l, r]\`, we can pick any pair \`(x, y)\` and perform:
- \`x = floor(x / 3)\`
- \`y = y * 3\`
Find the minimum operations to make all numbers in \`[l, r]\` zero.

### Mathematical Formulation
To zero out \`x\`, it takes \`f(x) = floor(log3(x)) + 1\` operations.
The optimal greedy strategy is to zero out the smallest element \`l\` first and dump the multiplier onto \`l + 1\`.
After \`l\` is zero, all other numbers in \`[l+1, r]\` can simply be zeroed out in \`f(k)\` steps.

Total steps:
\`\`\`text
2 * f(l) + sum_{k = l+1}^r f(k)
\`\`\`
We can precompute prefix sums of \`f(k)\` up to \`2 * 10^5\` in \`O(M)\` once!`,
      codeSnippet: `#include <bits/stdc++.h>
using namespace std;

const int MAXN = 200005;
int f[MAXN];
long long pref[MAXN];

void precompute() {
    f[0] = 0;
    for (int i = 1; i < MAXN; ++i) {
        f[i] = f[i / 3] + 1;
        pref[i] = pref[i - 1] + f[i];
    }
}

void solve() {
    int l, r;
    cin >> l >> r;
    long long ans = 2LL * f[l] + (pref[r] - pref[l]);
    cout << ans << "\\n";
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    precompute();
    int t;
    if (cin >> t) {
        while (t--) solve();
    }
    return 0;
}`,
      codeLanguage: 'cpp',
      authorIndex: 4, // Sneha Ghosh
      comments: [
        {
          authorIndex: 7, // Ishita Mukherjee
          content: 'Clean prefix sum solution for Codeforces Div. 4 rounds.',
        },
      ],
    },
    {
      title: 'LeetCode 1: Two Sum (Hash Map O(N) Canonical Architecture)',
      problemUrl: 'https://leetcode.com/problems/two-sum/',
      platform: 'LeetCode',
      difficulty: 'Easy',
      tags: ['Arrays', 'Hash Table'],
      summary: 'The classic single-pass hash map pattern for pair search with zero duplicate index collisions.',
      content: `### Problem
Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

### Optimal Single Pass Hash Map
We maintain a hash table of \`{value: index}\`. As we iterate through \`nums\`:
1. Check if \`target - num\` is in the map.
2. If yes, return \`[map[target - num], current_index]\`.
3. If no, insert \`num\` into the map.`,
      codeSnippet: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[0];
    }
}`,
      codeLanguage: 'java',
      authorIndex: 3, // Pritam Mukherjee
      comments: [
        {
          authorIndex: 5,
          content: 'The single pass pattern is foundational for 3Sum and 4Sum reductions!',
        },
      ],
    },
  ];

  for (const edData of editorialSeeds) {
    const author = createdStudents[edData.authorIndex] || createdStudents[0];
    const createdEd = await prisma.editorial.create({
      data: {
        title: edData.title,
        problemUrl: edData.problemUrl,
        platform: edData.platform,
        difficulty: edData.difficulty,
        tags: edData.tags,
        summary: edData.summary,
        content: edData.content,
        codeSnippet: edData.codeSnippet,
        codeLanguage: edData.codeLanguage,
        authorId: author.id,
      },
    });

    // Add Likes from several peers
    const likers = createdStudents.slice(0, 5);
    for (const liker of likers) {
      if (liker.id !== author.id) {
        await prisma.editorialLike.create({
          data: {
            editorialId: createdEd.id,
            studentId: liker.id,
          },
        });
      }
    }

    // Add Comments
    for (const c of edData.comments) {
      const commentAuthor = createdStudents[c.authorIndex] || createdStudents[1];
      await prisma.editorialComment.create({
        data: {
          editorialId: createdEd.id,
          authorId: commentAuthor.id,
          content: c.content,
        },
      });
    }
  }

  // 5. Seed Contests & Registrations
  console.log('⚔️ Seeding internal and external contests & student registrations...');
  const contestSeeds = [
    {
      title: "NSEC Phoenix Coding Arena: Winter Championship '26",
      platform: 'NSEC Internal',
      startTime: new Date(Date.now() + 86400000 * 2), // 2 days from now
      duration: '3 hours',
      registeredCount: 42,
      isInternal: true,
      url: '/contests',
      description: 'Annual flagship competitive programming championship for all NSEC departments. ICPC scoring format.',
      badge: 'Championship 🏆',
      ratedFor: 'All NSEC Departments',
      externalId: 'nsec-winter-2026',
    },
    {
      title: 'NSEC Inter-Departmental Clash: CSE vs IT vs ECE',
      platform: 'NSEC Internal',
      startTime: new Date(Date.now() + 86400000 * 5), // 5 days from now
      duration: '2.5 hours',
      registeredCount: 38,
      isInternal: true,
      url: '/contests',
      description: 'Departmental pride battle! Department average score multiplier awarded to top 3 winning engineering branches.',
      badge: 'Inter-Dept ⚔️',
      ratedFor: 'B.Tech All Years',
      externalId: 'nsec-dept-clash-26',
    },
    {
      title: 'Codeforces Round 975 (Div. 2)',
      platform: 'Codeforces',
      startTime: new Date(Date.now() + 86400000 * 3), // 3 days from now
      duration: '2 hours',
      registeredCount: 3420,
      isInternal: false,
      url: 'https://codeforces.com/contests',
      description: 'Official Codeforces rated contest for Division 2 participants (< 2100 rating).',
      badge: 'Rated Div. 2',
      ratedFor: 'Div. 2 (< 2100)',
      externalId: 'cf-975',
    },
    {
      title: 'LeetCode Biweekly Contest 142',
      platform: 'LeetCode',
      startTime: new Date(Date.now() + 86400000 * 4), // 4 days from now
      duration: '1.5 hours',
      registeredCount: 8200,
      isInternal: false,
      url: 'https://leetcode.com/contest',
      description: '4 Algorithmic challenges from Easy to Hard. Official LeetCode contest rating changes apply.',
      badge: 'LeetCode Rated',
      ratedFor: 'All Users',
      externalId: 'lc-biweekly-142',
    },
    {
      title: 'CodeChef Starters 160 (Rated for All)',
      platform: 'CodeChef',
      startTime: new Date(Date.now() + 86400000 * 6), // 6 days from now
      duration: '2 hours',
      registeredCount: 4100,
      isInternal: false,
      url: 'https://www.codechef.com',
      description: 'Weekly rated contest for Division 2, 3 and 4 coders.',
      badge: 'Starters 🌟',
      ratedFor: 'Div. 2, 3 & 4',
      externalId: 'cc-starters-160',
    },
  ];

  for (const cData of contestSeeds) {
    const contest = await prisma.contest.create({
      data: cData,
    });

    // Register top students for the internal championship
    const registrants = createdStudents.slice(0, 8);
    for (const regStudent of registrants) {
      await prisma.contestRegistration.create({
        data: {
          contestId: contest.id,
          studentId: regStudent.id,
        },
      });
    }
  }

  console.log('✨ Cybernix Nexus dummy seed data successfully created!');
  console.log('📊 Summary:');
  console.log(`   - Students: ${createdStudents.length} across 6 departments (CSE, IT, ECE, AI&DS, EE, ME)`);
  console.log(`   - Snapshots: 21 historical days per top student for velocity graphs`);
  console.log(`   - Editorials: ${editorialSeeds.length} comprehensive solutions with comments and likes`);
  console.log(`   - Contests: ${contestSeeds.length} internal and external contests with registrations`);
  console.log(`   - Monthly Achievements: ${monthlyAchievementsData.length} records`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
