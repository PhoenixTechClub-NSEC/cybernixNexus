import fs from 'fs';
import path from 'path';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import prisma from '../src/lib/prisma';

/**
 * Cybernix Nexus - Internal Event & Contest Administration CLI
 *
 * Provides a hybrid CLI interface (interactive menu or direct subcommands)
 * for managing internal events, tracking registrations, controlling automatic
 * registration deadlines, manually reopening registrations, generating 12-char
 * participant IDs, and exporting rosters to CSV & JSON for event coordinators.
 */

const projectRoot = path.resolve(__dirname, '..');
const exportsDir = path.join(projectRoot, 'exports');

function ensureExportsDir() {
  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true });
  }
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
}

function formatDeadlineStatus(deadline: Date | null): string {
  if (!deadline) return 'No Deadline (Open)';
  const now = new Date();
  if (now > deadline) {
    return `CLOSED (Ended ${deadline.toLocaleDateString()} ${deadline.toLocaleTimeString()})`;
  }
  const diffHours = Math.round((deadline.getTime() - now.getTime()) / (1000 * 60 * 60));
  if (diffHours < 24) {
    return `OPEN (~${diffHours}h left, ends ${deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
  }
  const diffDays = Math.round(diffHours / 24);
  return `OPEN (~${diffDays}d left, ends ${deadline.toLocaleDateString()})`;
}

export async function listContests() {
  const contests = await prisma.contest.findMany({
    orderBy: { startTime: 'desc' },
    include: {
      _count: {
        select: { registrations: true },
      },
    },
  });

  console.log('\n============================= ALL CONTESTS =============================');
  if (contests.length === 0) {
    console.log('No contests found in database.');
    return contests;
  }

  const tableData = contests.map((c) => ({
    ID: c.id,
    Title: c.title,
    Platform: c.platform,
    Date: new Date(c.startTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
    Venue: c.venue || 'N/A',
    Capacity: `${c._count.registrations}/${c.maxParticipants ?? 50}`,
    HostedInternal: c.hostedInternal ? 'Yes (Nexus)' : 'No (External)',
    RegDeadline: formatDeadlineStatus(c.registrationDeadline),
    Status: c.status,
  }));

  console.table(tableData);
  return contests;
}

export async function viewContest(contestId: string) {
  const contest = await prisma.contest.findUnique({
    where: { id: contestId },
    include: {
      registrations: {
        include: {
          student: {
            include: { user: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!contest) {
    console.error(`Contest not found with ID: ${contestId}`);
    return null;
  }

  console.log('\n======================== CONTEST DETAILS ========================');
  console.log(`Title:                 ${contest.title}`);
  console.log(`ID:                    ${contest.id}`);
  console.log(`Platform:              ${contest.platform}`);
  console.log(`Date & Time:           ${contest.startTime.toISOString()} (${new Date(contest.startTime).toLocaleString()})`);
  console.log(`Duration:              ${contest.duration}`);
  console.log(`Venue:                 ${contest.venue || 'N/A'}`);
  console.log(`Prize:                 ${contest.prize || 'N/A'}`);
  console.log(`Max Participants:      ${contest.maxParticipants ?? 50}`);
  console.log(`Total Registered:      ${contest.registrations.length}`);
  console.log(`Spots Left:            ${Math.max(0, (contest.maxParticipants ?? 50) - contest.registrations.length)}`);
  console.log(`Registration Deadline: ${contest.registrationDeadline ? `${contest.registrationDeadline.toISOString()} (${new Date(contest.registrationDeadline).toLocaleString()})` : 'None (Unlimited)'}`);
  console.log(`Registration Status:   ${formatDeadlineStatus(contest.registrationDeadline)}`);
  console.log(`Hosted Internal:       ${contest.hostedInternal ? 'Yes' : 'No (External Platform)'}`);
  console.log(`External Arena URL:    ${contest.url || 'None'}`);
  console.log(`Display Users:         ${contest.displayRegisteredUsers ? 'Enabled' : 'Disabled'}`);
  console.log(`Contest Status:        ${contest.status}`);

  console.log('\n---------------------- REGISTERED PARTICIPANTS ----------------------');
  if (contest.registrations.length === 0) {
    console.log('No participants have registered yet.');
  } else {
    const participantTable = contest.registrations.map((r, idx) => ({
      '#': idx + 1,
      'Participant ID': r.participantId || 'N/A',
      'Username': r.student.username || r.student.user.email?.split('@')[0] || 'N/A',
      'Full Name': r.fullName || r.student.name,
      'Student ID': r.studentIdNumber || r.student.rollNumber || 'N/A',
      'Year': r.academicYear || `${r.student.graduationYear}` || 'N/A',
      'Email': r.email || r.student.user.email || 'N/A',
      'Phone': r.phoneNumber || 'N/A',
      'Registered At': new Date(r.createdAt).toLocaleString(),
    }));
    console.table(participantTable);
  }

  return contest;
}

export async function updateRegistrationDeadline(contestId: string, deadline: Date | null) {
  const contest = await prisma.contest.findUnique({
    where: { id: contestId },
    select: { id: true, title: true, registrationDeadline: true },
  });

  if (!contest) {
    console.error(`Contest not found with ID: ${contestId}`);
    return null;
  }

  const updated = await prisma.contest.update({
    where: { id: contestId },
    data: { registrationDeadline: deadline },
  });

  console.log(`\nRegistration deadline updated for '${updated.title}'!`);
  if (deadline) {
    console.log(`New Deadline: ${deadline.toISOString()} (${new Date(deadline).toLocaleString()})`);
    console.log(`Status:       ${formatDeadlineStatus(deadline)}`);
  } else {
    console.log('Registration deadline removed. Registrations are open indefinitely.');
  }

  return updated;
}

export async function createContest(data: {
  title: string;
  platform?: string;
  startTime: Date;
  duration?: string;
  maxParticipants?: number;
  venue?: string;
  prize?: string;
  isInternal?: boolean;
  hostedInternal?: boolean;
  url?: string;
  displayRegisteredUsers?: boolean;
  registrationDeadline?: Date | null;
  badge?: string;
  description?: string;
}) {
  const newContest = await prisma.contest.create({
    data: {
      title: data.title,
      platform: data.platform || 'NSEC Internal',
      startTime: data.startTime,
      duration: data.duration || '3 hours',
      maxParticipants: data.maxParticipants ?? 50,
      venue: data.venue || 'APC Hall',
      prize: data.prize || 'TBD',
      isInternal: data.isInternal ?? true,
      hostedInternal: data.hostedInternal ?? false,
      url: data.url || 'https://www.hackerrank.com/demo-contest-1793994250',
      displayRegisteredUsers: data.displayRegisteredUsers ?? true,
      registrationDeadline: data.registrationDeadline ?? new Date(data.startTime.getTime() - 24 * 60 * 60 * 1000),
      badge: data.badge || 'Flagship Internal Contest',
      description: data.description || 'Cybernix Nexus premier internal coding contest.',
    },
  });

  console.log(`Contest created successfully! ID: ${newContest.id}`);
  return newContest;
}

export async function seedDimaagEMaqsad() {
  const existing = await prisma.contest.findFirst({
    where: { title: 'Dimaag-e-Maqsad' },
  });

  // Tentative contest start: Nov 27, 2026, 10:00 UTC (3:30 PM IST)
  const tentativeDate = new Date('2026-11-27T10:00:00.000Z');
  // Automatic registration deadline: Nov 26, 2026, 18:29:00 UTC (11:59 PM IST)
  const defaultDeadline = new Date('2026-11-26T18:29:00.000Z');

  if (existing) {
    console.log(`'Dimaag-e-Maqsad' already exists with ID: ${existing.id}`);
    if (!existing.registrationDeadline) {
      await prisma.contest.update({
        where: { id: existing.id },
        data: { registrationDeadline: defaultDeadline },
      });
      console.log(`Configured registration deadline for '${existing.title}': ${defaultDeadline.toISOString()}`);
    }
    return existing;
  }

  const created = await createContest({
    title: 'Dimaag-e-Maqsad',
    platform: 'NSEC Internal',
    startTime: tentativeDate,
    duration: '3 hours',
    maxParticipants: 50,
    venue: 'APC Hall',
    prize: 'TBD',
    isInternal: true,
    hostedInternal: false,
    url: 'https://www.hackerrank.com/demo-contest-1793994250',
    displayRegisteredUsers: true,
    registrationDeadline: defaultDeadline,
    badge: '🏆 Internal Flagship',
    description: 'Cybernix Nexus premier internal coding contest "Dimaag-e-Maqsad". Top coders compete for glory, leaderboard dominance, and exclusive prizes.',
  });

  console.log(`Seeded 'Dimaag-e-Maqsad' successfully! ID: ${created.id}`);
  return created;
}

export async function deleteContest(contestId: string) {
  const contest = await prisma.contest.findUnique({
    where: { id: contestId },
    select: { title: true, id: true },
  });

  if (!contest) {
    console.error(`Contest not found with ID: ${contestId}`);
    return false;
  }

  await prisma.contest.delete({
    where: { id: contestId },
  });

  console.log(`Contest '${contest.title}' (${contest.id}) deleted successfully.`);
  return true;
}

export async function exportRegistrations(contestId: string, format: 'csv' | 'json' | 'all' = 'all') {
  ensureExportsDir();

  const contest = await prisma.contest.findUnique({
    where: { id: contestId },
    include: {
      registrations: {
        include: {
          student: {
            include: { user: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!contest) {
    console.error(`Contest not found with ID: ${contestId}`);
    return null;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const baseName = `${sanitizeFileName(contest.title)}_${contest.id.slice(-6)}_${timestamp}`;
  const exportedFiles: string[] = [];

  const records = contest.registrations.map((r, idx) => ({
    serialNumber: idx + 1,
    participantId: r.participantId || 'N/A',
    username: r.student.username || r.student.user.email?.split('@')[0] || 'N/A',
    fullName: r.fullName || r.student.name,
    studentIdNumber: r.studentIdNumber || r.student.rollNumber || 'N/A',
    academicYear: r.academicYear || `${r.student.graduationYear}` || 'N/A',
    email: r.email || r.student.user.email || 'N/A',
    phoneNumber: r.phoneNumber || 'N/A',
    registeredAt: r.createdAt.toISOString(),
    status: r.status,
  }));

  if (format === 'csv' || format === 'all') {
    const csvHeader = [
      'Sl No',
      'Participant ID',
      'Username',
      'Full Name',
      'Student ID / Roll',
      'Academic Year',
      'Email',
      'Phone Number',
      'Registered At',
      'Status',
    ].join(',');

    const csvRows = records.map((rec) => {
      const escape = (val: string) => `"${val.replace(/"/g, '""')}"`;
      return [
        rec.serialNumber,
        escape(rec.participantId),
        escape(rec.username),
        escape(rec.fullName),
        escape(rec.studentIdNumber),
        escape(rec.academicYear),
        escape(rec.email),
        escape(rec.phoneNumber),
        escape(rec.registeredAt),
        escape(rec.status),
      ].join(',');
    });

    const csvContent = [csvHeader, ...csvRows].join('\n');
    const csvPath = path.join(exportsDir, `${baseName}.csv`);
    fs.writeFileSync(csvPath, csvContent, 'utf-8');
    exportedFiles.push(csvPath);
    console.log(`CSV Export saved: ${csvPath}`);
  }

  if (format === 'json' || format === 'all') {
    const jsonPayload = {
      contest: {
        id: contest.id,
        title: contest.title,
        startTime: contest.startTime,
        venue: contest.venue,
        maxParticipants: contest.maxParticipants,
        registeredCount: contest.registrations.length,
        registrationDeadline: contest.registrationDeadline,
        hostedInternal: contest.hostedInternal,
        url: contest.url,
      },
      exportedAt: new Date().toISOString(),
      totalParticipants: records.length,
      participants: records,
    };

    const jsonPath = path.join(exportsDir, `${baseName}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(jsonPayload, null, 2), 'utf-8');
    exportedFiles.push(jsonPath);
    console.log(`JSON Export saved: ${jsonPath}`);
  }

  return exportedFiles;
}

async function runInteractiveMenu() {
  const rl = readline.createInterface({ input, output });

  try {
    let running = true;
    while (running) {
      console.log('\n========================================================');
      console.log('       CYBERNIX NEXUS - EVENT ADMIN PANEL (CLI)        ');
      console.log('========================================================');
      console.log('1. List all contests & deadline status');
      console.log('2. View contest details & participants');
      console.log('3. Quick Seed default contest ("Dimaag-e-Maqsad")');
      console.log('4. Create a new contest');
      console.log('5. Reopen / Modify registration deadline');
      console.log('6. Export contest registrations (CSV & JSON)');
      console.log('7. Delete a contest');
      console.log('8. Exit');
      console.log('--------------------------------------------------------');

      const choice = (await rl.question('Select an option (1-8): ')).trim();

      switch (choice) {
        case '1': {
          await listContests();
          break;
        }
        case '2': {
          const contests = await listContests();
          if (contests.length > 0) {
            const id = (await rl.question('\nEnter Contest ID to view: ')).trim();
            if (id) await viewContest(id);
          }
          break;
        }
        case '3': {
          await seedDimaagEMaqsad();
          break;
        }
        case '4': {
          console.log('\n--- Create Contest ---');
          const title = (await rl.question('Contest Title [Dimaag-e-Maqsad]: ')).trim() || 'Dimaag-e-Maqsad';
          const venue = (await rl.question('Venue [APC Hall]: ')).trim() || 'APC Hall';
          const maxInput = (await rl.question('Max Participants [50]: ')).trim() || '50';
          const prize = (await rl.question('Prize [TBD]: ')).trim() || 'TBD';
          const dateInput = (await rl.question('Tentative Date (YYYY-MM-DD) [2026-11-27]: ')).trim() || '2026-11-27';
          const duration = (await rl.question('Duration [3 hours]: ')).trim() || '3 hours';
          const hostedInternalInput = (await rl.question('Hosted internally on Nexus IDE? (y/N) [N]: ')).trim().toLowerCase();
          const hostedInternal = hostedInternalInput === 'y' || hostedInternalInput === 'yes';
          const url = (await rl.question('Contest Arena URL [https://www.hackerrank.com/demo-contest-1793994250]: ')).trim() || 'https://www.hackerrank.com/demo-contest-1793994250';
          const showUsersInput = (await rl.question('Display registered users publicly? (Y/n) [Y]: ')).trim().toLowerCase();
          const displayRegisteredUsers = showUsersInput !== 'n' && showUsersInput !== 'no';
          const deadlineInput = (await rl.question('Registration Deadline (YYYY-MM-DD or leave blank for 24h before event): ')).trim();

          const startTime = new Date(`${dateInput}T10:00:00.000Z`);
          const registrationDeadline = deadlineInput
            ? new Date(`${deadlineInput}T18:29:00.000Z`)
            : new Date(startTime.getTime() - 24 * 60 * 60 * 1000);

          await createContest({
            title,
            venue,
            maxParticipants: parseInt(maxInput, 10) || 50,
            prize,
            startTime,
            duration,
            hostedInternal,
            url,
            displayRegisteredUsers,
            registrationDeadline,
          });
          break;
        }
        case '5': {
          const contests = await listContests();
          if (contests.length > 0) {
            const id = (await rl.question('\nEnter Contest ID to modify registration deadline: ')).trim();
            if (id) {
              console.log('\n--- Reopen / Extend Registration Deadline ---');
              console.log('1. Reopen for +2 hours from now');
              console.log('2. Reopen for +24 hours from now (1 day)');
              console.log('3. Reopen for +48 hours from now (2 days)');
              console.log('4. Set custom date/time (e.g. 2026-11-26T23:59:59Z or 2026-11-26)');
              console.log('5. Close registrations immediately (stop now)');
              console.log('6. Remove deadline completely (keep open indefinitely)');

              const subChoice = (await rl.question('Select an option (1-6): ')).trim();
              const now = new Date();

              switch (subChoice) {
                case '1': {
                  const newDeadline = new Date(now.getTime() + 2 * 60 * 60 * 1000);
                  await updateRegistrationDeadline(id, newDeadline);
                  break;
                }
                case '2': {
                  const newDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                  await updateRegistrationDeadline(id, newDeadline);
                  break;
                }
                case '3': {
                  const newDeadline = new Date(now.getTime() + 48 * 60 * 60 * 1000);
                  await updateRegistrationDeadline(id, newDeadline);
                  break;
                }
                case '4': {
                  const customInput = (await rl.question('Enter deadline timestamp: ')).trim();
                  if (customInput) {
                    const parsed = new Date(customInput.includes('T') ? customInput : `${customInput}T23:59:59.000Z`);
                    if (isNaN(parsed.getTime())) {
                      console.error('Invalid date format.');
                    } else {
                      await updateRegistrationDeadline(id, parsed);
                    }
                  }
                  break;
                }
                case '5': {
                  // Close now
                  const past = new Date(now.getTime() - 1000);
                  await updateRegistrationDeadline(id, past);
                  break;
                }
                case '6': {
                  await updateRegistrationDeadline(id, null);
                  break;
                }
                default:
                  console.log('Invalid option.');
              }
            }
          }
          break;
        }
        case '6': {
          const contests = await listContests();
          if (contests.length > 0) {
            const id = (await rl.question('\nEnter Contest ID to export: ')).trim();
            if (id) {
              const formatInput = (await rl.question('Export format (csv / json / all) [all]: ')).trim().toLowerCase() || 'all';
              const format = formatInput === 'csv' || formatInput === 'json' ? formatInput : 'all';
              await exportRegistrations(id, format);
            }
          }
          break;
        }
        case '7': {
          const contests = await listContests();
          if (contests.length > 0) {
            const id = (await rl.question('\nEnter Contest ID to DELETE: ')).trim();
            if (id) {
              const confirm = (await rl.question(`Are you sure you want to permanently delete contest ${id}? (yes/no): `)).trim();
              if (confirm === 'yes') {
                await deleteContest(id);
              } else {
                console.log('Deletion cancelled.');
              }
            }
          }
          break;
        }
        case '8': {
          console.log('Exiting Event Admin CLI. Goodbye!');
          running = false;
          break;
        }
        default: {
          console.log('Invalid option. Please enter a number between 1 and 8.');
        }
      }
    }
  } finally {
    rl.close();
  }
}

// Subcommand parser for non-interactive / CI / script usage
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    await runInteractiveMenu();
    return;
  }

  const command = args[0].toLowerCase();

  switch (command) {
    case 'list': {
      await listContests();
      break;
    }
    case 'view': {
      const id = args[1];
      if (!id) {
        console.error('Usage: npm run event:admin -- view <contestId>');
        process.exit(1);
      }
      await viewContest(id);
      break;
    }
    case 'seed':
    case 'seed-default': {
      await seedDimaagEMaqsad();
      break;
    }
    case 'reopen':
    case 'extend': {
      const id = args[1];
      if (!id) {
        console.error('Usage: npm run event:admin -- reopen <contestId> [--hours=X | --days=X | --deadline=...]');
        process.exit(1);
      }
      const hoursFlag = args.find((a) => a.startsWith('--hours='));
      const daysFlag = args.find((a) => a.startsWith('--days='));
      const deadlineFlag = args.find((a) => a.startsWith('--deadline='));

      const now = new Date();
      let newDeadline: Date | null = null;

      if (hoursFlag) {
        const h = parseFloat(hoursFlag.split('=')[1]);
        newDeadline = new Date(now.getTime() + h * 60 * 60 * 1000);
      } else if (daysFlag) {
        const d = parseFloat(daysFlag.split('=')[1]);
        newDeadline = new Date(now.getTime() + d * 24 * 60 * 60 * 1000);
      } else if (deadlineFlag) {
        const raw = deadlineFlag.split('=')[1];
        newDeadline = new Date(raw.includes('T') ? raw : `${raw}T23:59:59.000Z`);
      } else {
        // Default reopen: 24 hours
        newDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      }

      await updateRegistrationDeadline(id, newDeadline);
      break;
    }
    case 'close': {
      const id = args[1];
      if (!id) {
        console.error('Usage: npm run event:admin -- close <contestId>');
        process.exit(1);
      }
      // Set deadline to 1 second ago
      const past = new Date(Date.now() - 1000);
      await updateRegistrationDeadline(id, past);
      break;
    }
    case 'delete': {
      const id = args[1];
      if (!id) {
        console.error('Usage: npm run event:admin -- delete <contestId>');
        process.exit(1);
      }
      await deleteContest(id);
      break;
    }
    case 'export': {
      const id = args[1];
      if (!id) {
        console.error('Usage: npm run event:admin -- export <contestId> [--format=csv|json|all]');
        process.exit(1);
      }
      const formatFlag = args.find((a) => a.startsWith('--format='));
      const formatVal = formatFlag ? formatFlag.split('=')[1] : 'all';
      const format = formatVal === 'csv' || formatVal === 'json' ? formatVal : 'all';
      await exportRegistrations(id, format);
      break;
    }
    case 'create': {
      const getArg = (name: string, fallback: string) => {
        const found = args.find((a) => a.startsWith(`--${name}=`));
        return found ? found.split('=')[1] : fallback;
      };

      const title = getArg('title', 'Dimaag-e-Maqsad');
      const venue = getArg('venue', 'APC Hall');
      const maxParticipants = parseInt(getArg('max', '50'), 10);
      const prize = getArg('prize', 'TBD');
      const dateStr = getArg('date', '2026-11-27T10:00:00.000Z');
      const duration = getArg('duration', '3 hours');
      const url = getArg('url', 'https://www.hackerrank.com/demo-contest-1793994250');
      const deadlineStr = getArg('deadline', '');
      const hostedInternal = args.includes('--hosted-internal');
      const displayUsers = !args.includes('--hide-users');

      const startTime = new Date(dateStr);
      const registrationDeadline = deadlineStr
        ? new Date(deadlineStr)
        : new Date(startTime.getTime() - 24 * 60 * 60 * 1000);

      await createContest({
        title,
        venue,
        maxParticipants,
        prize,
        startTime,
        duration,
        url,
        hostedInternal,
        displayRegisteredUsers: displayUsers,
        registrationDeadline,
      });
      break;
    }
    default: {
      console.log(`Unknown command: ${command}`);
      console.log('Available commands:');
      console.log('  npm run event:admin -- list');
      console.log('  npm run event:admin -- view <contestId>');
      console.log('  npm run event:admin -- seed');
      console.log('  npm run event:admin -- reopen <contestId> [--hours=X | --days=X | --deadline=...]');
      console.log('  npm run event:admin -- close <contestId>');
      console.log('  npm run event:admin -- export <contestId> [--format=csv|json|all]');
      console.log('  npm run event:admin -- delete <contestId>');
      console.log('  npm run event:admin -- create [--title=...] [--venue=...] [--max=50] [--prize=...] [--date=...] [--deadline=...]');
      process.exit(1);
    }
  }
}

main()
  .catch((err) => {
    console.error('Event Admin error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
