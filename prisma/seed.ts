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
        totalScore: 26400,
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
        totalScore: 24800,
      },
    },
    {
      name: 'Swati Saha',
      email: 'swati@nsec.ac.in',
      rollNumber: '10800121008',
      department: 'ECE',
      graduationYear: 2026,
      leetcode: 'swati_lc',
      codeforces: 'swati_cf',
      gfg: 'swati_gfg',
      codechef: 'swati_cc',
      stats: {
        leetcodeSolved: 360,
        leetcodeRating: 1660,
        codeforcesRating: 1580,
        codeforcesMaxRating: 1620,
        codeforcesRank: 'specialist',
        codeforcesMaxRank: 'specialist',
        codeforcesSolved: 180,
        gfgScore: 290,
        codechefRating: 1620,
        totalScore: 19600,
      },
    },
    {
      name: 'Arka Dutta',
      email: 'arka@nsec.ac.in',
      rollNumber: '10800121009',
      department: 'AI&DS',
      graduationYear: 2025,
      leetcode: 'arka_lc',
      codeforces: 'arka_cf',
      gfg: 'arka_gfg',
      codechef: 'arka_cc',
      stats: {
        leetcodeSolved: 345,
        leetcodeRating: 1630,
        codeforcesRating: 1550,
        codeforcesMaxRating: 1590,
        codeforcesRank: 'specialist',
        codeforcesMaxRank: 'specialist',
        codeforcesSolved: 175,
        gfgScore: 280,
        codechefRating: 1600,
        totalScore: 18500,
      },
    },
    {
      name: 'Devjit Samanta',
      email: 'devjit@nsec.ac.in',
      rollNumber: '10800121010',
      department: 'CSE',
      graduationYear: 2024,
      leetcode: 'devjit_lc',
      codeforces: 'devjit_cf',
      gfg: 'devjit_gfg',
      codechef: 'devjit_cc',
      stats: {
        leetcodeSolved: 330,
        leetcodeRating: 1600,
        codeforcesRating: 1520,
        codeforcesMaxRating: 1560,
        codeforcesRank: 'specialist',
        codeforcesMaxRank: 'specialist',
        codeforcesSolved: 165,
        gfgScore: 270,
        codechefRating: 1580,
        totalScore: 17400,
      },
    },
    {
      name: 'Ishita Chakraborty',
      email: 'ishita@nsec.ac.in',
      rollNumber: '10800121011',
      department: 'IT',
      graduationYear: 2026,
      leetcode: 'ishita_lc',
      codeforces: 'ishita_cf',
      gfg: 'ishita_gfg',
      codechef: 'ishita_cc',
      stats: {
        leetcodeSolved: 315,
        leetcodeRating: 1580,
        codeforcesRating: 1500,
        codeforcesMaxRating: 1540,
        codeforcesRank: 'specialist',
        codeforcesMaxRank: 'specialist',
        codeforcesSolved: 155,
        gfgScore: 260,
        codechefRating: 1550,
        totalScore: 16300,
      },
    },
    {
      name: 'Subhajit Dey',
      email: 'subhajit@nsec.ac.in',
      rollNumber: '10800121012',
      department: 'EE',
      graduationYear: 2026,
      leetcode: 'subhajit_lc',
      codeforces: 'subhajit_cf',
      gfg: 'subhajit_gfg',
      codechef: 'subhajit_cc',
      stats: {
        leetcodeSolved: 300,
        leetcodeRating: 1550,
        codeforcesRating: 1480,
        codeforcesMaxRating: 1510,
        codeforcesRank: 'specialist',
        codeforcesMaxRank: 'specialist',
        codeforcesSolved: 145,
        gfgScore: 250,
        codechefRating: 1530,
        totalScore: 15200,
      },
    },
    {
      name: 'Poulomi Das',
      email: 'poulomi@nsec.ac.in',
      rollNumber: '10800121013',
      department: 'CSE',
      graduationYear: 2025,
      leetcode: 'poulomi_lc',
      codeforces: 'poulomi_cf',
      gfg: 'poulomi_gfg',
      codechef: 'poulomi_cc',
      stats: {
        leetcodeSolved: 285,
        leetcodeRating: 1530,
        codeforcesRating: 1450,
        codeforcesMaxRating: 1490,
        codeforcesRank: 'specialist',
        codeforcesMaxRank: 'specialist',
        codeforcesSolved: 140,
        gfgScore: 240,
        codechefRating: 1510,
        totalScore: 14300,
      },
    },
    {
      name: 'Ritika Das',
      email: 'ritika@nsec.ac.in',
      rollNumber: '10800121032',
      department: 'CSE',
      graduationYear: 2026,
      leetcode: 'ritika_lc',
      codeforces: 'ritika_cf',
      gfg: 'ritika_gfg',
      codechef: 'ritika_cc',
      stats: {
        leetcodeSolved: 90,
        leetcodeRating: 1150,
        codeforcesRating: 1070,
        codeforcesMaxRating: 1110,
        codeforcesRank: 'newbie',
        codeforcesMaxRank: 'newbie',
        codeforcesSolved: 45,
        gfgScore: 50,
        codechefRating: 1130,
        totalScore: 2680,
      },
    },
    {
      name: 'Sourav Kole',
      email: 'sourav@nsec.ac.in',
      rollNumber: '10800121033',
      department: 'IT',
      graduationYear: 2025,
      leetcode: 'sourav_lc',
      codeforces: 'sourav_cf',
      gfg: 'sourav_gfg',
      codechef: 'sourav_cc',
      stats: {
        leetcodeSolved: 80,
        leetcodeRating: 1130,
        codeforcesRating: 1050,
        codeforcesMaxRating: 1090,
        codeforcesRank: 'newbie',
        codeforcesMaxRank: 'newbie',
        codeforcesSolved: 40,
        gfgScore: 40,
        codechefRating: 1110,
        totalScore: 2200,
      },
    },
    {
      name: 'Payel Mallick',
      email: 'payel@nsec.ac.in',
      rollNumber: '10800121034',
      department: 'AI&DS',
      graduationYear: 2027,
      leetcode: 'payel_lc',
      codeforces: 'payel_cf',
      gfg: 'payel_gfg',
      codechef: 'payel_cc',
      stats: {
        leetcodeSolved: 70,
        leetcodeRating: 1110,
        codeforcesRating: 1030,
        codeforcesMaxRating: 1070,
        codeforcesRank: 'newbie',
        codeforcesMaxRank: 'newbie',
        codeforcesSolved: 35,
        gfgScore: 30,
        codechefRating: 1090,
        totalScore: 1750,
      },
    },
    {
      name: 'Niladri Nandi',
      email: 'niladri@nsec.ac.in',
      rollNumber: '10800121035',
      department: 'EE',
      graduationYear: 2026,
      leetcode: 'niladri_lc',
      codeforces: 'niladri_cf',
      gfg: 'niladri_gfg',
      codechef: 'niladri_cc',
      stats: {
        leetcodeSolved: 60,
        leetcodeRating: 1090,
        codeforcesRating: 1010,
        codeforcesMaxRating: 1050,
        codeforcesRank: 'newbie',
        codeforcesMaxRank: 'newbie',
        codeforcesSolved: 30,
        gfgScore: 20,
        codechefRating: 1070,
        totalScore: 1250,
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

  // 4. Recalculate global and department rankings across all students
  console.log('⚡ Recalculating student rankings and department standings...');
  const allStats = await prisma.studentStats.findMany({
    orderBy: { totalScore: 'desc' },
    include: { student: { select: { department: true } } },
  });

  if (allStats.length > 0) {
    const overallRankMap = new Map<string, number>();
    allStats.forEach((stat, index) => overallRankMap.set(stat.id, index + 1));

    const deptGroups = new Map<string, typeof allStats>();
    allStats.forEach((stat) => {
      const dept = stat.student?.department || 'DEFAULT';
      if (!deptGroups.has(dept)) deptGroups.set(dept, []);
      deptGroups.get(dept)!.push(stat);
    });

    const deptRankMap = new Map<string, number>();
    deptGroups.forEach((deptStats) => {
      const sortedDept = [...deptStats].sort((a, b) => b.totalScore - a.totalScore);
      sortedDept.forEach((stat, index) => deptRankMap.set(stat.id, index + 1));
    });

    await Promise.all(
      allStats.map((stat) =>
        prisma.studentStats.update({
          where: { id: stat.id },
          data: {
            ranking: overallRankMap.get(stat.id) || 1,
            departmentRanking: deptRankMap.get(stat.id) || 1,
          },
        })
      )
    );
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
