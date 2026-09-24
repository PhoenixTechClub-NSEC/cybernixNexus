import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

/**
 * Cybernix Nexus - Database Restore / Feeder Script
 *
 * Reads CSV backups from ./backup (or specified directory) and seeds the PostgreSQL database
 * in correct relational order using Prisma Client.
 */

// Simple RFC-compliant CSV parser supporting quoted values with commas and newlines
function parseCSV(content: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentVal);
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentVal);
      if (currentRow.some((c) => c.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }

  if (currentVal.length > 0 || currentRow.length > 0) {
    currentRow.push(currentVal);
    if (currentRow.some((c) => c.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

function parseCSVFile(filePath: string): Record<string, string>[] {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  const rows = parseCSV(raw);
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((row) => {
    const record: Record<string, string> = {};
    headers.forEach((h, index) => {
      record[h] = row[index] !== undefined ? row[index] : '';
    });
    return record;
  });
}

function toNullableString(val?: string): string | null {
  if (!val || val.trim() === '') return null;
  return val.trim();
}

function toNullableInt(val?: string): number | null {
  if (!val || val.trim() === '') return null;
  const num = parseInt(val.trim(), 10);
  return isNaN(num) ? null : num;
}

function toInt(val?: string, fallback = 0): number {
  if (!val || val.trim() === '') return fallback;
  const num = parseInt(val.trim(), 10);
  return isNaN(num) ? fallback : num;
}

function toNullableDate(val?: string): Date | null {
  if (!val || val.trim() === '') return null;
  const d = new Date(val.trim());
  return isNaN(d.getTime()) ? null : d;
}

function toDate(val?: string, fallback = new Date()): Date {
  if (!val || val.trim() === '') return fallback;
  const d = new Date(val.trim());
  return isNaN(d.getTime()) ? fallback : d;
}

function toBoolean(val?: string): boolean {
  if (!val) return false;
  return val.trim().toLowerCase() === 'true';
}

async function chunkAndExecute<T>(
  items: T[],
  chunkSize: number,
  fn: (chunk: T[]) => Promise<any>
) {
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    await fn(chunk);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const backupDirArg = args.find((a) => !a.startsWith('--'));
  const projectRoot = path.resolve(__dirname, '..');
  const backupDir = backupDirArg ? path.resolve(backupDirArg) : path.join(projectRoot, 'backup');

  console.log('🚀 Cybernix Nexus - Database Restore');
  console.log(`📂 Source Directory: ${backupDir}`);

  if (!fs.existsSync(backupDir)) {
    console.error(`❌ Backup directory not found at: ${backupDir}`);
    process.exit(1);
  }

  const prisma = new PrismaClient();

  try {
    await prisma.$connect();
    console.log('✅ Connected to database.');

    // 1. Restore Users
    const userFile = path.join(backupDir, 'User.csv');
    const userRecords = parseCSVFile(userFile);
    if (userRecords.length > 0) {
      console.log(`👤 Restoring ${userRecords.length} Users...`);
      const usersData = userRecords.map((r) => ({
        id: r.id,
        name: toNullableString(r.name),
        email: toNullableString(r.email),
        emailVerified: toNullableDate(r.emailVerified),
        image: toNullableString(r.image),
        password: toNullableString(r.password),
        createdAt: toDate(r.createdAt),
        updatedAt: toDate(r.updatedAt),
      }));

      await chunkAndExecute(usersData, 100, async (chunk) => {
        await prisma.user.createMany({
          data: chunk,
          skipDuplicates: true,
        });
      });
      console.log(`✅ Users restored.`);
    }

    // 2. Restore Accounts
    const accountFile = path.join(backupDir, 'Account.csv');
    const accountRecords = parseCSVFile(accountFile);
    if (accountRecords.length > 0) {
      console.log(`🔑 Restoring ${accountRecords.length} Accounts...`);
      const accountsData = accountRecords.map((r) => ({
        id: r.id,
        userId: r.userId,
        type: r.type,
        provider: r.provider,
        providerAccountId: r.providerAccountId,
        refresh_token: toNullableString(r.refresh_token),
        access_token: toNullableString(r.access_token),
        expires_at: toNullableInt(r.expires_at),
        token_type: toNullableString(r.token_type),
        scope: toNullableString(r.scope),
        id_token: toNullableString(r.id_token),
        session_state: toNullableString(r.session_state),
      }));

      await chunkAndExecute(accountsData, 100, async (chunk) => {
        await prisma.account.createMany({
          data: chunk,
          skipDuplicates: true,
        });
      });
      console.log(`✅ Accounts restored.`);
    }

    // 3. Restore Students
    const studentFile = path.join(backupDir, 'Student.csv');
    const studentRecords = parseCSVFile(studentFile);
    if (studentRecords.length > 0) {
      console.log(`🎓 Restoring ${studentRecords.length} Students...`);
      const studentsData = studentRecords.map((r) => ({
        id: r.id,
        userId: r.userId,
        name: r.name,
        username: toNullableString(r.username),
        bio: toNullableString(r.bio),
        rollNumber: toNullableString(r.rollNumber),
        department: r.department || 'Unknown',
        graduationYear: toInt(r.graduationYear, new Date().getFullYear()),
        leetcode: toNullableString(r.leetcode),
        codeforces: toNullableString(r.codeforces),
        codechef: toNullableString(r.codechef),
        github: toNullableString(r.github),
        linkedin: toNullableString(r.linkedin),
        profileComplete: toBoolean(r.profileComplete),
        lastSyncedAt: toNullableDate(r.lastSyncedAt),
        createdAt: toDate(r.createdAt),
        updatedAt: toDate(r.updatedAt),
      }));

      await chunkAndExecute(studentsData, 100, async (chunk) => {
        await prisma.student.createMany({
          data: chunk,
          skipDuplicates: true,
        });
      });
      console.log(`✅ Students restored.`);
    }

    // 4. Restore StudentStats
    const statsFile = path.join(backupDir, 'StudentStats.csv');
    const statsRecords = parseCSVFile(statsFile);
    if (statsRecords.length > 0) {
      console.log(`📊 Restoring ${statsRecords.length} StudentStats...`);
      const statsData = statsRecords.map((r) => ({
        id: r.id,
        studentId: r.studentId,
        leetcodeSolved: toInt(r.leetcodeSolved, 0),
        leetcodeEasySolved: toInt(r.leetcodeEasySolved, 0),
        leetcodeMediumSolved: toInt(r.leetcodeMediumSolved, 0),
        leetcodeHardSolved: toInt(r.leetcodeHardSolved, 0),
        leetcodeRating: toNullableInt(r.leetcodeRating),
        codeforcesRating: toNullableInt(r.codeforcesRating),
        codeforcesMaxRating: toNullableInt(r.codeforcesMaxRating),
        codeforcesRank: toNullableString(r.codeforcesRank),
        codeforcesMaxRank: toNullableString(r.codeforcesMaxRank),
        codeforcesSolved: toInt(r.codeforcesSolved, 0),
        codeforcesAvatar: toNullableString(r.codeforcesAvatar),
        codeforcesContribution: toNullableInt(r.codeforcesContribution),
        codechefRating: toNullableInt(r.codechefRating),
        codechefStars: toNullableString(r.codechefStars),
        codechefGlobalRank: toNullableString(r.codechefGlobalRank),
        codechefSolved: toInt(r.codechefSolved, 0),
        codechefFailCount: toInt(r.codechefFailCount, 0),
        codechefLastError: toNullableString(r.codechefLastError),
        totalScore: toInt(r.totalScore, 0),
        ranking: toNullableInt(r.ranking),
        departmentRanking: toNullableInt(r.departmentRanking),
        lastSyncError: toNullableString(r.lastSyncError),
        consecutiveFailures: toInt(r.consecutiveFailures, 0),
        createdAt: toDate(r.createdAt),
        updatedAt: toDate(r.updatedAt),
      }));

      await chunkAndExecute(statsData, 100, async (chunk) => {
        await prisma.studentStats.createMany({
          data: chunk,
          skipDuplicates: true,
        });
      });
      console.log(`✅ StudentStats restored.`);
    }

    // 5. Restore DailySnapshots
    const snapshotFile = path.join(backupDir, 'DailySnapshot.csv');
    const snapshotRecords = parseCSVFile(snapshotFile);
    if (snapshotRecords.length > 0) {
      console.log(`📈 Restoring ${snapshotRecords.length} DailySnapshots...`);
      const snapshotData = snapshotRecords.map((r) => ({
        id: r.id,
        studentId: r.studentId,
        date: toDate(r.date),
        leetcodeSolved: toInt(r.leetcodeSolved, 0),
        codeforcesSolved: toInt(r.codeforcesSolved, 0),
        codechefRating: toInt(r.codechefRating, 0),
        codechefSolved: toInt(r.codechefSolved, 0),
        totalScore: toInt(r.totalScore, 0),
        createdAt: toDate(r.createdAt),
      }));

      await chunkAndExecute(snapshotData, 150, async (chunk) => {
        await prisma.dailySnapshot.createMany({
          data: chunk,
          skipDuplicates: true,
        });
      });
      console.log(`✅ DailySnapshots restored.`);
    }

    // 6. Restore VerificationTokens
    const tokenFile = path.join(backupDir, 'VerificationToken.csv');
    const tokenRecords = parseCSVFile(tokenFile);
    if (tokenRecords.length > 0) {
      console.log(`🔐 Restoring ${tokenRecords.length} VerificationTokens...`);
      const tokensData = tokenRecords.map((r) => ({
        identifier: r.identifier,
        token: r.token,
        expires: toDate(r.expires),
      }));

      await chunkAndExecute(tokensData, 100, async (chunk) => {
        await prisma.verificationToken.createMany({
          data: chunk,
          skipDuplicates: true,
        });
      });
      console.log(`✅ VerificationTokens restored.`);
    }

    console.log('\n🎉 All backup data has been successfully fed into the database!');
  } catch (error) {
    console.error('❌ Restore failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
