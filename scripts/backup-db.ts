import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

/**
 * Cybernix Nexus - PostgreSQL / Prisma Database Backup Utility
 *
 * Reads DATABASE_URL from .env, sanitizes parameters for pg_dump / libpq compatibility,
 * and saves backups to ./backup/backup_<timestamp>.sql (and optional JSON export).
 */

function loadEnvFile(envPath: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!fs.existsSync(envPath)) return result;

  const content = fs.readFileSync(envPath, 'utf-8');
  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) continue;

    const key = line.slice(0, eqIndex).trim();
    let val = line.slice(eqIndex + 1).trim();

    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    result[key] = val;
  }
  return result;
}

// 1. Resolve environment variables
const projectRoot = path.resolve(__dirname, '..');
const envFile = path.join(projectRoot, '.env');
const parsedEnv = loadEnvFile(envFile);

const dbUrlString = process.env.DATABASE_URL || parsedEnv.DATABASE_URL || parsedEnv.PRISMA_DATABASE_URL;

if (!dbUrlString) {
  console.error('❌ Error: DATABASE_URL not found in environment or .env file.');
  process.exit(1);
}

// Ensure ./backup directory exists
const backupDir = path.join(projectRoot, 'backup');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const now = new Date();
const timestamp = now.toISOString().replace(/[:.]/g, '-');
const sqlFile = path.join(backupDir, `backup_${timestamp}.sql`);
const jsonFile = path.join(backupDir, `backup_${timestamp}.json`);

console.log('🔄 Cybernix Nexus Database Backup');
console.log(`📁 Backup Destination: ${backupDir}`);
console.log(`🕒 Timestamp: ${now.toLocaleString()}`);

// Sanitize URL for pg_dump (PostgreSQL libpq doesn't recognize Prisma-specific query params)
function getSanitizedDbUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);

    // Map Prisma-specific or non-libpq values
    if (parsed.hostname.includes('prisma.io')) {
      parsed.searchParams.set('sslmode', 'require');
    } else if (parsed.searchParams.get('sslmode') === 'false') {
      parsed.searchParams.set('sslmode', 'disable');
    } else if (!parsed.searchParams.has('sslmode') && parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1') {
      parsed.searchParams.set('sslmode', 'require');
    }

    // Keep only standard libpq params
    const allowedParams = new Set([
      'sslmode',
      'connect_timeout',
      'sslrootcert',
      'sslcert',
      'sslkey',
      'application_name',
      'target_session_attrs',
    ]);

    for (const key of Array.from(parsed.searchParams.keys())) {
      if (!allowedParams.has(key)) {
        parsed.searchParams.delete(key);
      }
    }

    return parsed.toString();
  } catch {
    return rawUrl;
  }
}

// Execute pg_dump
function runPgDump(): boolean {
  console.log('\n📦 Attempting pg_dump SQL backup...');
  const sanitizedUrl = getSanitizedDbUrl(dbUrlString);

  // Check if pg_dump is available
  const versionCheck = spawnSync('pg_dump', ['--version'], { encoding: 'utf-8' });
  if (versionCheck.error || versionCheck.status !== 0) {
    console.warn('⚠️  pg_dump command is not available on this machine.');
    return false;
  }

  const dumpResult = spawnSync(
    'pg_dump',
    ['--clean', '--if-exists', '--no-owner', '--no-privileges', sanitizedUrl, '-f', sqlFile],
    { encoding: 'utf-8' }
  );

  if (dumpResult.status === 0 && fs.existsSync(sqlFile) && fs.statSync(sqlFile).size > 0) {
    const sizeKB = (fs.statSync(sqlFile).size / 1024).toFixed(2);
    console.log(`✅ SQL Backup successful!`);
    console.log(`   File: ${sqlFile} (${sizeKB} KB)`);
    return true;
  } else {
    const errorOutput = dumpResult.stderr || dumpResult.stdout || 'Unknown error';
    console.warn(`⚠️  pg_dump failed:\n${errorOutput.trim()}`);
    if (fs.existsSync(sqlFile) && fs.statSync(sqlFile).size === 0) {
      fs.unlinkSync(sqlFile);
    }
    return false;
  }
}

// Fallback: Export data using Prisma Client
async function runPrismaDataExport(): Promise<boolean> {
  console.log('\n📦 Attempting Prisma Client JSON table export fallback...');
  const prisma = new PrismaClient();

  try {
    const [
      users,
      accounts,
      sessions,
      students,
      stats,
      syncJobs,
      snapshots,
      achievements,
      editorials,
      comments,
      likes,
      contests,
      contestRegistrations,
    ] = await Promise.all([
      prisma.user.findMany(),
      prisma.account.findMany(),
      prisma.session.findMany(),
      prisma.student.findMany(),
      prisma.studentStats.findMany(),
      prisma.syncJob.findMany(),
      prisma.dailySnapshot.findMany(),
      prisma.monthlyAchievement.findMany(),
      prisma.editorial.findMany(),
      prisma.editorialComment.findMany(),
      prisma.editorialLike.findMany(),
      prisma.contest.findMany(),
      prisma.contestRegistration.findMany(),
    ]);

    const backupData = {
      exportedAt: now.toISOString(),
      counts: {
        users: users.length,
        accounts: accounts.length,
        sessions: sessions.length,
        students: students.length,
        studentStats: stats.length,
        syncJobs: syncJobs.length,
        dailySnapshots: snapshots.length,
        monthlyAchievements: achievements.length,
        editorials: editorials.length,
        editorialComments: comments.length,
        editorialLikes: likes.length,
        contests: contests.length,
        contestRegistrations: contestRegistrations.length,
      },
      data: {
        users,
        accounts,
        sessions,
        students,
        stats,
        syncJobs,
        snapshots,
        achievements,
        editorials,
        comments,
        likes,
        contests,
        contestRegistrations,
      },
    };

    fs.writeFileSync(jsonFile, JSON.stringify(backupData, null, 2), 'utf-8');
    const sizeKB = (fs.statSync(jsonFile).size / 1024).toFixed(2);
    console.log(`✅ Prisma JSON Export successful!`);
    console.log(`   File: ${jsonFile} (${sizeKB} KB)`);
    console.log(`   Exported summary:`, JSON.stringify(backupData.counts, null, 2));
    return true;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`❌ Prisma Export failed:\n${message.trim()}`);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const pgDumpOk = runPgDump();

  if (process.argv.includes('--json') || !pgDumpOk) {
    const prismaOk = await runPrismaDataExport();

    if (!pgDumpOk && !prismaOk) {
      console.error('\n❌ Backup failed with both pg_dump and Prisma Client.');
      console.error('Note: If your Prisma Database has reached its plan limit (e.g. planLimitReached on db.prisma.io),');
      console.error('Prisma Cloud denies all inbound network connections until the workspace limit is upgraded or reset in Prisma Console.');
      process.exit(1);
    }
  }

  console.log('\n🎉 Backup process finished.');
}

main().catch((err) => {
  console.error('Fatal error during backup:', err);
  process.exit(1);
});
