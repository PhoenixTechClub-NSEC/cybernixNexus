import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Cybernix Nexus Database...');

  // Hash a default password for test users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create Initial Users & Students
  const initialStudentsData = [
    {
      name: 'Satyaki Das',
      email: 'satyaki@nsec.ac.in',
      rollNumber: '10800121001',
      department: 'CSE',
      graduationYear: 2026,
      leetcode: 'satyaki_lc',
      codeforces: 'satyaki_cf',
      gfg: 'satyaki_gfg',
      codechef: 'satyaki_cc',
      stats: {
        leetcodeSolved: 530,
        leetcodeRating: 1985,
        codeforcesRating: 1840,
        codeforcesMaxRating: 1910,
        codeforcesRank: 'candidate master',
        codeforcesMaxRank: 'candidate master',
        codeforcesSolved: 320,
        gfgScore: 450,
        codechefRating: 1890,
        totalScore: 38400,
      },
    },
    {
      name: 'Rupam Ghosh',
      email: 'rupam@nsec.ac.in',
      rollNumber: '10800121002',
      department: 'IT',
      graduationYear: 2026,
      leetcode: 'rupam_lc',
      codeforces: 'rupam_cf',
      gfg: 'rupam_gfg',
      codechef: 'rupam_cc',
      stats: {
        leetcodeSolved: 480,
        leetcodeRating: 1850,
        codeforcesRating: 1780,
        codeforcesMaxRating: 1820,
        codeforcesRank: 'expert',
        codeforcesMaxRank: 'expert',
        codeforcesSolved: 280,
        gfgScore: 380,
        codechefRating: 1790,
        totalScore: 33200,
      },
    },
    {
      name: 'Soumita Roy',
      email: 'soumita@nsec.ac.in',
      rollNumber: '10800121003',
      department: 'ECE',
      graduationYear: 2026,
      leetcode: 'soumita_lc',
      codeforces: 'soumita_cf',
      gfg: 'soumita_gfg',
      codechef: 'soumita_cc',
      stats: {
        leetcodeSolved: 390,
        leetcodeRating: 1720,
        codeforcesRating: 1650,
        codeforcesMaxRating: 1690,
        codeforcesRank: 'specialist',
        codeforcesMaxRank: 'specialist',
        codeforcesSolved: 210,
        gfgScore: 310,
        codechefRating: 1680,
        totalScore: 16400,
      },
    },
    {
      name: 'Maniratna Sharma',
      email: 'maniratna@nsec.ac.in',
      rollNumber: '10800121004',
      department: 'AI&DS',
      graduationYear: 2026,
      leetcode: 'maniratna_lc',
      codeforces: 'maniratna_cf',
      gfg: 'maniratna_gfg',
      codechef: 'maniratna_cc',
      stats: {
        leetcodeSolved: 420,
        leetcodeRating: 1760,
        codeforcesRating: 1690,
        codeforcesMaxRating: 1740,
        codeforcesRank: 'expert',
        codeforcesMaxRank: 'expert',
        codeforcesSolved: 230,
        gfgScore: 340,
        codechefRating: 1710,
        totalScore: 19800,
      },
    },
    {
      name: 'Siddharth Singh',
      email: 'siddharth@nsec.ac.in',
      rollNumber: '10800121005',
      department: 'EE',
      graduationYear: 2026,
      leetcode: 'siddharth_lc',
      codeforces: 'siddharth_cf',
      gfg: 'siddharth_gfg',
      codechef: 'siddharth_cc',
      stats: {
        leetcodeSolved: 260,
        leetcodeRating: 1540,
        codeforcesRating: 1480,
        codeforcesMaxRating: 1520,
        codeforcesRank: 'specialist',
        codeforcesMaxRank: 'specialist',
        codeforcesSolved: 140,
        gfgScore: 220,
        codechefRating: 1560,
        totalScore: 10400,
      },
    },
  ];

  const createdStudents = [];

  for (const sData of initialStudentsData) {
    const user = await prisma.user.upsert({
      where: { email: sData.email },
      update: { name: sData.name },
      create: {
        email: sData.email,
        name: sData.name,
        password: hashedPassword,
      },
    });

    const student = await prisma.student.upsert({
      where: { userId: user.id },
      update: {
        name: sData.name,
        rollNumber: sData.rollNumber,
        department: sData.department,
        graduationYear: sData.graduationYear,
        leetcode: sData.leetcode,
        codeforces: sData.codeforces,
        gfg: sData.gfg,
        codechef: sData.codechef,
        profileComplete: true,
      },
      create: {
        userId: user.id,
        name: sData.name,
        rollNumber: sData.rollNumber,
        department: sData.department,
        graduationYear: sData.graduationYear,
        leetcode: sData.leetcode,
        codeforces: sData.codeforces,
        gfg: sData.gfg,
        codechef: sData.codechef,
        profileComplete: true,
      },
    });

    await prisma.studentStats.upsert({
      where: { studentId: student.id },
      update: sData.stats,
      create: {
        studentId: student.id,
        ...sData.stats,
      },
    });

    createdStudents.push(student);
  }

  // 2. Generate Daily Snapshots for the past 21 days for velocity graph calculation
  console.log('📈 Generating 21-day historical DailySnapshots...');
  const today = new Date();
  for (let i = 20; i >= 0; i--) {
    const snapshotDate = new Date(today);
    snapshotDate.setDate(today.getDate() - i);
    snapshotDate.setHours(0, 0, 0, 0);

    for (const student of createdStudents) {
      // Simulate incremental progression over 21 days
      const baseLeetcode = 200 + Math.floor(i * 3) + (student.name.length * 15);
      const baseCodeforces = 100 + Math.floor(i * 2) + (student.name.length * 8);

      await prisma.dailySnapshot.upsert({
        where: {
          studentId_date: {
            studentId: student.id,
            date: snapshotDate,
          },
        },
        update: {
          leetcodeSolved: baseLeetcode,
          codeforcesSolved: baseCodeforces,
          totalScore: baseLeetcode * 15 + baseCodeforces * 30,
        },
        create: {
          studentId: student.id,
          date: snapshotDate,
          leetcodeSolved: baseLeetcode,
          codeforcesSolved: baseCodeforces,
          gfgScore: 150,
          codechefRating: 1600,
          totalScore: baseLeetcode * 15 + baseCodeforces * 30,
        },
      });
    }
  }

  // 3. Seed Monthly Achievements
  console.log('🏆 Seeding Monthly Achievements...');
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const achievements = [
    {
      category: 'Beginner of the month',
      title: 'Beginner of the Month',
      department: 'CSE',
      scoreOrMetric: '+820 CP Growth this month',
      badgeIcon: '🌟',
      studentId: createdStudents[0]?.id || null,
    },
    {
      category: 'Problem solver of the month',
      title: 'Problem Solver of the Month',
      department: 'CSE',
      scoreOrMetric: '118 Problems Solved',
      badgeIcon: '⚡',
      studentId: createdStudents[0]?.id || null,
    },
    {
      category: 'LeetCode Champ',
      title: 'LeetCode Champ of the Month',
      department: 'IT',
      scoreOrMetric: 'Top 1.2% in Weekly Contest',
      badgeIcon: '🏆',
      studentId: createdStudents[1]?.id || null,
    },
    {
      category: 'Dept of the month',
      title: 'Department of the Month',
      department: 'CSE',
      scoreOrMetric: '2.0x Multiplier Unlocked (#1 Average CP)',
      badgeIcon: '🔥',
      studentId: null,
    },
  ];

  for (const item of achievements) {
    await prisma.monthlyAchievement.create({
      data: {
        category: item.category,
        title: item.title,
        month: currentMonth,
        year: currentYear,
        studentId: item.studentId,
        department: item.department,
        scoreOrMetric: item.scoreOrMetric,
        badgeIcon: item.badgeIcon,
        isManual: true,
      },
    });
  }

  console.log('✅ Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
