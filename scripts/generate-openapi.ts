import fs from 'fs';
import path from 'path';

interface RouteDoc {
  summary: string;
  description: string;
  tags: string[];
  parameters?: any[];
  requestBody?: any;
  responses: Record<string, any>;
  security?: any[];
}

interface PathItem {
  [method: string]: any;
}

const API_ROOT = path.join(process.cwd(), 'src/app/api');

// Scan all route.ts files in src/app/api
function findRouteFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      findRouteFiles(fullPath, fileList);
    } else if (item.isFile() && (item.name === 'route.ts' || item.name === 'route.js')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

// Convert filesystem path to OpenAPI route path
function filePathToOpenApiPath(filePath: string): string {
  const relative = path.relative(API_ROOT, filePath);
  const dir = path.dirname(relative);
  if (dir === '.') return '/api';
  
  // Replace [param] with {param} and [...param] with {param}
  const openApiPath = dir
    .split(path.sep)
    .map((segment) => {
      if (segment.startsWith('[...') && segment.endsWith(']')) {
        return `{${segment.slice(4, -1)}}`;
      }
      if (segment.startsWith('[') && segment.endsWith(']')) {
        return `{${segment.slice(1, -1)}}`;
      }
      return segment;
    })
    .join('/');

  return `/api/${openApiPath}`;
}

// Extract exported HTTP methods from route file content
function extractMethods(content: string): string[] {
  const methods = new Set<string>();

  // 1. export async function GET / export function POST
  const funcRegex = /export\s+(?:async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD)\b/g;
  let match;
  while ((match = funcRegex.exec(content)) !== null) {
    methods.add(match[1].toLowerCase());
  }

  // 2. export const GET = ...
  const constRegex = /export\s+const\s+(GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD)\b/g;
  while ((match = constRegex.exec(content)) !== null) {
    methods.add(match[1].toLowerCase());
  }

  // 3. export { handler as GET, handler as POST }
  const exportAsRegex = /\bas\s+(GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD)\b/g;
  while ((match = exportAsRegex.exec(content)) !== null) {
    methods.add(match[1].toLowerCase());
  }

  return Array.from(methods);
}

// Generate OpenAPI Specs programmatically
function generateOpenApiSpec() {
  console.log('🔍 Scanning API route handlers in src/app/api...');
  const routeFiles = findRouteFiles(API_ROOT);
  console.log(`📁 Discovered ${routeFiles.length} API route files.`);

  const paths: Record<string, PathItem> = {};

  const routeMetadata: Record<string, Record<string, RouteDoc>> = {
    '/api/auth/signup': {
      post: {
        summary: 'Register New Student Account',
        description: 'Creates a new user and student profile with academic info and coding platform handles, validating roll number uniqueness and triggering background platform stats sync.',
        tags: ['Authentication & Onboarding'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SignupRequest',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Account created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Account created successfully' },
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                      },
                    },
                    hasStudentProfile: { type: 'boolean', example: true },
                  },
                },
              },
            },
          },
          '400': { description: 'Missing required credentials or invalid data' },
          '409': { description: 'Email or Roll Number already registered in college directory' },
          '500': { description: 'Internal server error' },
        },
      },
    },
    '/api/auth/{nextauth}': {
      get: {
        summary: 'NextAuth Session & OAuth Handler',
        description: 'NextAuth.js authentication router handling Google OAuth, JWT verification, and active session validation.',
        tags: ['Authentication & Onboarding'],
        parameters: [
          {
            name: 'nextauth',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'NextAuth route action (e.g. session, callback, signin, csrf)',
          },
        ],
        responses: {
          '200': { description: 'Session payload or OAuth redirection' },
        },
      },
      post: {
        summary: 'NextAuth Credentials Authentication',
        description: 'Authenticates student email and password or processes OAuth tokens, generating persistent 30-day JWT sessions.',
        tags: ['Authentication & Onboarding'],
        parameters: [
          {
            name: 'nextauth',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'NextAuth action (e.g. callback/credentials, signout)',
          },
        ],
        responses: {
          '200': { description: 'Credentials verified and session token created' },
          '401': { description: 'Invalid email or password' },
        },
      },
    },
    '/api/dashboard': {
      get: {
        summary: 'Fetch Global Leaderboard & Dashboard Overview',
        description: 'Retrieves top ranked students ordered by total score, current authenticated user profile, tier distributions, and department statistics.',
        tags: ['Dashboard & Rankings'],
        parameters: [
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer', default: 30 },
            description: 'Maximum number of students to return in the leaderboard query',
          },
        ],
        responses: {
          '200': {
            description: 'Leaderboard standings and department metrics',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/DashboardResponse',
                },
              },
            },
          },
        },
      },
    },
    '/api/dashboard/velocity': {
      get: {
        summary: 'Fetch Weekly Problem Solve Velocity',
        description: 'Calculates historical problem solve velocity across thisWeek, lastWeek, and twoWeeksAgo from DailySnapshot aggregates.',
        tags: ['Dashboard & Rankings'],
        responses: {
          '200': {
            description: 'Weekly solve velocity metrics',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    velocity: {
                      type: 'object',
                      properties: {
                        thisWeek: { $ref: '#/components/schemas/VelocityTimeframe' },
                        lastWeek: { $ref: '#/components/schemas/VelocityTimeframe' },
                        twoWeeksAgo: { $ref: '#/components/schemas/VelocityTimeframe' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/student': {
      get: {
        summary: 'Get Current Student Profile',
        description: 'Returns the full student profile, linked platform handles, solve stats, college rank, and sync job status.',
        tags: ['Student Management'],
        responses: {
          '200': {
            description: 'Student profile details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    student: { $ref: '#/components/schemas/StudentDetail' },
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                        image: { type: 'string', nullable: true },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': { description: 'Unauthorized' },
        },
      },
      post: {
        summary: 'Create / Update Student Profile',
        description: 'Updates student department, graduation year, and platform handles for authenticated user.',
        tags: ['Student Management'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateStudentRequest',
              },
            },
          },
        },
        responses: {
          '200': { description: 'Student profile updated successfully' },
        },
      },
    },
    '/api/student/activity': {
      get: {
        summary: 'Compute Student 52-Week Solve Heatmap & Streak',
        description: 'Aggregates historical solve activity from DailySnapshot records to render 52-week activity matrices and compute active consecutive day streaks.',
        tags: ['Student Management'],
        parameters: [
          {
            name: 'studentId',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'Target student ID (defaults to active authenticated student)',
          },
        ],
        responses: {
          '200': {
            description: 'Activity heatmap matrix and streak metrics',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    currentStreak: { type: 'integer', example: 14 },
                    maxStreak: { type: 'integer', example: 30 },
                    totalAnnualSolves: { type: 'integer', example: 420 },
                    gridData: {
                      type: 'array',
                      items: {
                        type: 'array',
                        items: { type: 'integer', minimum: 0, maximum: 4 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/student/sync': {
      post: {
        summary: 'Trigger Student Platform Scraping & Stats Sync',
        description: 'Triggers live non-blocking scraping of LeetCode, Codeforces, GFG, and CodeChef stats for the authenticated student.',
        tags: ['Student Management'],
        responses: {
          '200': {
            description: 'Platform synchronization completed or queued',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Student stats synced successfully' },
                    stats: { $ref: '#/components/schemas/StudentStats' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/student/handles': {
      post: {
        summary: 'Update Platform Coding Handles',
        description: 'Saves updated handles for LeetCode, Codeforces, CodeChef, and GeeksforGeeks and enqueues immediate sync.',
        tags: ['Student Management'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  leetcode: { type: 'string' },
                  codeforces: { type: 'string' },
                  gfg: { type: 'string' },
                  codechef: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Coding handles saved' },
        },
      },
    },
    '/api/editorials': {
      get: {
        summary: 'List Peer Problem Tutorials & Solutions',
        description: 'Fetches community tutorials filtered by platform, difficulty, tags, or search query with author profiles and upvote counts.',
        tags: ['Peer Editorials'],
        parameters: [
          { name: 'platform', in: 'query', schema: { type: 'string' }, description: 'Filter by platform (Codeforces, LeetCode, etc.)' },
          { name: 'difficulty', in: 'query', schema: { type: 'string' }, description: 'Filter by difficulty (Easy, Medium, Hard)' },
          { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Search term for title or tags' },
        ],
        responses: {
          '200': {
            description: 'List of peer tutorials',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    editorials: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Editorial' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Publish Peer Problem Solution',
        description: 'Creates a new peer problem tutorial with code snippets, markdown explanations, tags, and problem source URLs.',
        tags: ['Peer Editorials'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateEditorialRequest',
              },
            },
          },
        },
        responses: {
          '201': { description: 'Tutorial published successfully' },
          '401': { description: 'Authentication required to publish tutorials' },
        },
      },
    },
    '/api/editorials/{id}/like': {
      post: {
        summary: 'Toggle Editorial Upvote',
        description: 'Likes or un-likes an editorial by the authenticated student and returns the updated upvote tally.',
        tags: ['Peer Editorials'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Editorial ID' },
        ],
        responses: {
          '200': {
            description: 'Like status toggled',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    liked: { type: 'boolean', example: true },
                    likesCount: { type: 'integer', example: 42 },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/editorials/{id}/comment': {
      post: {
        summary: 'Add Comment to Editorial',
        description: 'Appends a peer discussion comment to the target tutorial.',
        tags: ['Peer Editorials'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Editorial ID' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['content'],
                properties: {
                  content: { type: 'string', minLength: 1 },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Comment posted successfully' },
        },
      },
    },
    '/api/contests': {
      get: {
        summary: 'Get Hybrid Contest Calendar Schedule',
        description: 'Returns scheduled NSEC internal coding battles merged with upcoming live rounds from Codeforces and external platforms.',
        tags: ['Contests & Tournaments'],
        responses: {
          '200': {
            description: 'List of active and upcoming contests',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    contests: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Contest' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Register for NSEC Internal Contest',
        description: 'Enrolls the authenticated student into an internal college algorithm championship.',
        tags: ['Contests & Tournaments'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['contestId'],
                properties: {
                  contestId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Registration confirmed' },
        },
      },
    },
    '/api/achievements/monthly': {
      get: {
        summary: 'Get Monthly Hall of Fame Winners',
        description: 'Retrieves categorized winners for Beginner of the Month, Problem Solver of the Month, and Department of the Month.',
        tags: ['Gamification & Badges'],
        parameters: [
          { name: 'year', in: 'query', schema: { type: 'integer' } },
          { name: 'month', in: 'query', schema: { type: 'integer' } },
        ],
        responses: {
          '200': { description: 'Monthly Hall of Fame winners list' },
        },
      },
      post: {
        summary: 'Compute & Store Monthly Achievements',
        description: 'Evaluates snapshot score growth and stores winners in PostgreSQL database.',
        tags: ['Gamification & Badges'],
        responses: {
          '200': { description: 'Monthly achievements generated' },
        },
      },
    },
    '/api/cron/sync': {
      get: {
        summary: 'Execute Scheduled Platform Scraping Cron',
        description: 'Secured cron worker for syncing all eligible student coding metrics and recording daily snapshots.',
        tags: ['Cron & Background Tasks'],
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'Sync execution summary',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    syncedCount: { type: 'integer' },
                    eligibleCount: { type: 'integer' },
                    skippedCount: { type: 'integer' },
                    totalCount: { type: 'integer' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
          '401': { description: 'Unauthorized — Missing or invalid CRON_SECRET bearer token' },
        },
      },
    },
  };

  // Populate discovered routes
  for (const filePath of routeFiles) {
    const openApiPath = filePathToOpenApiPath(filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    const methods = extractMethods(content);

    if (!paths[openApiPath]) {
      paths[openApiPath] = {};
    }

    for (const method of methods) {
      const explicitDoc = routeMetadata[openApiPath]?.[method];
      if (explicitDoc) {
        paths[openApiPath][method] = explicitDoc;
      } else {
        paths[openApiPath][method] = {
          summary: `${method.toUpperCase()} ${openApiPath}`,
          description: `Auto-generated endpoint definition for ${openApiPath}`,
          tags: ['General Endpoints'],
          responses: {
            '200': { description: 'Successful response' },
          },
        };
      }
    }
  }

  const spec = {
    openapi: '3.1.0',
    info: {
      title: 'Cybernix Nexus API Specification',
      version: '2.0.0',
      description:
        'Official OpenAPI 3.1 specification for Cybernix Nexus — NSEC Multi-Platform Competitive Programming Hub. Provides endpoints for student rating synchronization, real-time leaderboards, peer problem editorials, contest scheduling, and background cron scraping.',
      contact: {
        name: 'Phoenix Tech Club (NSEC)',
        url: 'https://github.com/cybernixNexus',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local Development Server',
      },
      {
        url: 'https://cybernixnexus.nsec.ac.in',
        description: 'Production Server',
      },
    ],
    paths,
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Bearer token for background cron operations (CRON_SECRET).',
        },
        SessionAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'next-auth.session-token',
          description: 'NextAuth persistent session cookie.',
        },
      },
      schemas: {
        SignupRequest: {
          type: 'object',
          required: ['name', 'email', 'password', 'rollNumber', 'department', 'graduationYear'],
          properties: {
            name: { type: 'string', example: 'Satyaki Das' },
            email: { type: 'string', format: 'email', example: 'satyaki@nsec.ac.in' },
            password: { type: 'string', minLength: 6, example: 'secretpassword123' },
            image: { type: 'string', format: 'uri', nullable: true, example: 'https://example.com/avatar.jpg' },
            rollNumber: { type: 'string', example: '10800121001' },
            department: { type: 'string', enum: ['CSE', 'IT', 'ECE', 'AI&DS', 'EE', 'ME'], example: 'CSE' },
            graduationYear: { type: 'integer', example: 2026 },
            github: { type: 'string', nullable: true, example: 'octocat' },
            linkedin: { type: 'string', nullable: true, example: 'satyaki-das' },
            leetcode: { type: 'string', nullable: true, example: 'neal_wu' },
            codeforces: { type: 'string', nullable: true, example: 'tourist' },
            gfg: { type: 'string', nullable: true, example: 'gfg_student' },
            codechef: { type: 'string', nullable: true, example: 'chef_student' },
          },
        },
        UpdateStudentRequest: {
          type: 'object',
          properties: {
            department: { type: 'string', example: 'CSE' },
            graduationYear: { type: 'integer', example: 2026 },
            rollNumber: { type: 'string' },
            github: { type: 'string' },
            linkedin: { type: 'string' },
            leetcode: { type: 'string' },
            codeforces: { type: 'string' },
            gfg: { type: 'string' },
            codechef: { type: 'string' },
          },
        },
        StudentStats: {
          type: 'object',
          properties: {
            leetcodeSolved: { type: 'integer', example: 450 },
            leetcodeRating: { type: 'integer', example: 1980 },
            codeforcesRating: { type: 'integer', example: 1740 },
            codeforcesMaxRating: { type: 'integer', example: 1820 },
            codeforcesRank: { type: 'string', example: 'expert' },
            codeforcesSolved: { type: 'integer', example: 280 },
            gfgScore: { type: 'integer', example: 380 },
            codechefRating: { type: 'integer', example: 1790 },
            totalScore: { type: 'integer', example: 32400 },
            ranking: { type: 'integer', example: 3 },
            departmentRanking: { type: 'integer', example: 1 },
          },
        },
        StudentDetail: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            rollNumber: { type: 'string' },
            department: { type: 'string' },
            graduationYear: { type: 'integer' },
            github: { type: 'string', nullable: true },
            linkedin: { type: 'string', nullable: true },
            leetcode: { type: 'string', nullable: true },
            codeforces: { type: 'string', nullable: true },
            gfg: { type: 'string', nullable: true },
            codechef: { type: 'string', nullable: true },
            stats: { $ref: '#/components/schemas/StudentStats' },
          },
        },
        DashboardResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            currentUser: { $ref: '#/components/schemas/StudentDetail', nullable: true },
            students: {
              type: 'array',
              items: { $ref: '#/components/schemas/StudentDetail' },
            },
            summary: {
              type: 'object',
              properties: {
                totalStudents: { type: 'integer', example: 120 },
                totalProblemsSolved: { type: 'integer', example: 8400 },
                averageTotalScore: { type: 'integer', example: 14500 },
                topDepartment: {
                  type: 'object',
                  properties: {
                    department: { type: 'string', example: 'CSE' },
                    averageScore: { type: 'integer', example: 18400 },
                    seasonalMultiplier: { type: 'number', example: 2.0 },
                  },
                },
                tierDistribution: {
                  type: 'object',
                  properties: {
                    Phoenix: { type: 'integer', example: 5 },
                    Flame: { type: 'integer', example: 18 },
                    Ember: { type: 'integer', example: 34 },
                    Spark: { type: 'integer', example: 63 },
                  },
                },
              },
            },
          },
        },
        VelocityTimeframe: {
          type: 'object',
          properties: {
            label: { type: 'string', example: 'This Week' },
            change: { type: 'string', example: '+24%' },
            leetcode: { type: 'array', items: { type: 'integer' } },
            codeforces: { type: 'array', items: { type: 'integer' } },
            maxVal: { type: 'integer', example: 45 },
          },
        },
        Editorial: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            problemUrl: { type: 'string', format: 'uri' },
            platform: { type: 'string' },
            difficulty: { type: 'string', enum: ['Easy', 'Medium', 'Hard'] },
            authorName: { type: 'string' },
            authorDept: { type: 'string' },
            authorLevel: { type: 'integer' },
            authorTier: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            summary: { type: 'string' },
            content: { type: 'string' },
            codeSnippet: { type: 'string', nullable: true },
            codeLanguage: { type: 'string', nullable: true },
            likesCount: { type: 'integer' },
            commentsCount: { type: 'integer' },
            isLikedByMe: { type: 'boolean' },
            publishedAt: { type: 'string' },
          },
        },
        CreateEditorialRequest: {
          type: 'object',
          required: ['title', 'problemUrl', 'platform', 'difficulty', 'tags', 'summary', 'content'],
          properties: {
            title: { type: 'string' },
            problemUrl: { type: 'string', format: 'uri' },
            platform: { type: 'string' },
            difficulty: { type: 'string', enum: ['Easy', 'Medium', 'Hard'] },
            tags: { type: 'array', items: { type: 'string' } },
            summary: { type: 'string' },
            content: { type: 'string' },
            codeSnippet: { type: 'string' },
            codeLanguage: { type: 'string', default: 'cpp' },
          },
        },
        Contest: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            platform: { type: 'string' },
            startTime: { type: 'string', format: 'date-time' },
            duration: { type: 'string' },
            registeredCount: { type: 'integer' },
            isInternal: { type: 'boolean' },
            isRegisteredByMe: { type: 'boolean' },
            url: { type: 'string' },
            badge: { type: 'string', nullable: true },
            description: { type: 'string', nullable: true },
          },
        },
      },
    },
  };

  const outputPath = path.join(process.cwd(), 'openapi.json');
  const publicOutputPath = path.join(process.cwd(), 'public/openapi.json');

  fs.writeFileSync(outputPath, JSON.stringify(spec, null, 2), 'utf8');
  console.log(`✅ OpenAPI specification generated at: ${outputPath}`);

  if (!fs.existsSync(path.dirname(publicOutputPath))) {
    fs.mkdirSync(path.dirname(publicOutputPath), { recursive: true });
  }
  fs.writeFileSync(publicOutputPath, JSON.stringify(spec, null, 2), 'utf8');
  console.log(`✅ Public OpenAPI specification generated at: ${publicOutputPath}`);
}

generateOpenApiSpec();
