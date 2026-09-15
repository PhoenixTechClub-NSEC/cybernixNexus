import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  BatchScraper,
  BatchScrapeResult,
  createBatchScraper,
} from '@/services/platforms';

const CHUNK_SIZE = 20; // Process 20 users per cron invocation
const MAX_CODECHEF_FAILURES = 3; // Skip users with 3+ consecutive failures

/**
 * GET /api/cron/sync-codechef
 * 
 * Chunked batch processing endpoint for CodeChef stats synchronization
 * 
 * Query Parameters:
 * - chunk: (optional) Which chunk to process (0-based index). If omitted, processes chunk 0.
 * - concurrency: (optional) Max parallel requests. Defaults to 3.
 * - delayMs: (optional) Delay between requests in ms. Defaults to 600.
 * 
 * Authorization:
 * - Requires CRON_SECRET bearer token in Authorization header
 * 
 * Example Usage:
 * curl -X GET "http://localhost:3000/api/cron/sync-codechef?chunk=0" \
 *   -H "Authorization: Bearer YOUR_CRON_SECRET"
 */
export async function GET(req: Request) {
  const startTime = Date.now();

  try {
    // Verify authorization
    const authHeader = req.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET;

    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized cron request' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const chunkIndex = Math.max(0, parseInt(searchParams.get('chunk') ?? '0', 10));
    const concurrency = Math.max(1, parseInt(searchParams.get('concurrency') ?? '3', 10));
    const delayMs = Math.max(100, parseInt(searchParams.get('delayMs') ?? '600', 10));

    console.log(`[CodeChef Cron] Starting chunk ${chunkIndex} with concurrency=${concurrency}, delayMs=${delayMs}`);

    // Fetch all students with CodeChef handles, excluding those with too many failures
    const allStudentsWithCodeChef = await prisma.student.findMany({
      where: {
        codechef: { not: null },
        stats: {
          codechefFailCount: { lt: MAX_CODECHEF_FAILURES },
        },
      },
      select: {
        id: true,
        codechef: true,
        name: true,
        stats: {
          select: {
            codechefFailCount: true,
            codechefRating: true,
            codechefSolved: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    // Calculate chunk boundaries
    const totalStudents = allStudentsWithCodeChef.length;
    const totalChunks = Math.ceil(totalStudents / CHUNK_SIZE);
    const chunkStart = chunkIndex * CHUNK_SIZE;
    const chunkEnd = Math.min(chunkStart + CHUNK_SIZE, totalStudents);

    // Check if chunk is out of range
    if (chunkStart >= totalStudents) {
      return NextResponse.json({
        success: true,
        message: 'No more chunks to process',
        chunk: chunkIndex,
        totalChunks,
        chunkSize: 0,
        processed: 0,
        succeeded: 0,
        failed: 0,
        skipped: 0,
        totalDuration: Date.now() - startTime,
      });
    }

    // Get the chunk of students for this invocation
    const chunkStudents = allStudentsWithCodeChef.slice(chunkStart, chunkEnd);
    const usernames = chunkStudents.map(s => s.codechef!);

    console.log(
      `[CodeChef Cron] Processing chunk ${chunkIndex}/${totalChunks - 1}: ${usernames.length} students`
    );

    // Create batch scraper
    const scraper = createBatchScraper({
      concurrency,
      delayMs,
      chunkSize: CHUNK_SIZE,
      verbose: true,
    });

    // Scrape CodeChef stats for the chunk
    const batchResult = await scraper.scrapeBatch(usernames, 'codechef');

    // Process results and update database
    const results = [];
    let succeeded = 0;
    let failed = 0;

    for (let i = 0; i < batchResult.results.length; i++) {
      const result = batchResult.results[i];
      const student = chunkStudents[i];

      if (result.success && result.data) {
        try {
          // Successful scrape - update stats and reset failure count
          await prisma.studentStats.update({
            where: { studentId: student.id },
            data: {
              codechefRating: result.data.rating,
              codechefSolved: result.data.solved,
              codechefStars: result.data.stars,
              codechefGlobalRank: result.data.globalRank,
              codechefFailCount: 0, // Reset failure counter on success
              codechefLastError: null,
              lastSyncError: null,
              consecutiveFailures: 0,
              updatedAt: new Date(),
            },
          });

          results.push({
            studentId: student.id,
            username: result.username,
            status: 'success',
            rating: result.data.rating,
            solved: result.data.solved,
            duration: result.duration,
          });

          succeeded++;
        } catch (dbErr: any) {
          console.error(`[CodeChef Cron] DB error for ${result.username}:`, dbErr.message);

          results.push({
            studentId: student.id,
            username: result.username,
            status: 'db_error',
            error: dbErr.message,
            duration: result.duration,
          });

          failed++;
        }
      } else {
        // Scrape failed - increment failure count
        try {
          const currentFailCount = student.stats?.codechefFailCount ?? 0;
          const newFailCount = Math.min(currentFailCount + 1, MAX_CODECHEF_FAILURES);

          await prisma.studentStats.update({
            where: { studentId: student.id },
            data: {
              codechefFailCount: newFailCount,
              codechefLastError: result.error || 'Unknown error',
              lastSyncError: result.error || 'Unknown error',
              consecutiveFailures: newFailCount,
              updatedAt: new Date(),
            },
          });

          results.push({
            studentId: student.id,
            username: result.username,
            status: 'scrape_failed',
            error: result.error,
            failCount: newFailCount,
            skipNextSync: newFailCount >= MAX_CODECHEF_FAILURES,
            duration: result.duration,
          });

          failed++;
        } catch (dbErr: any) {
          console.error(`[CodeChef Cron] Failed to update failure count for ${result.username}:`, dbErr.message);
          results.push({
            studentId: student.id,
            username: result.username,
            status: 'db_error',
            error: dbErr.message,
            duration: result.duration,
          });

          failed++;
        }
      }
    }

    // Calculate statistics
    const duration = Date.now() - startTime;
    const isLastChunk = chunkIndex === totalChunks - 1;

    console.log(
      `[CodeChef Cron] Chunk ${chunkIndex} complete: ${succeeded} succeeded, ${failed} failed in ${duration}ms`
    );

    return NextResponse.json({
      success: true,
      chunk: chunkIndex,
      totalChunks,
      chunkSize: chunkStudents.length,
      processed: batchResult.totalRequested,
      succeeded,
      failed,
      batchMetrics: {
        averageDuration: batchResult.averageDuration,
        totalDuration: batchResult.totalDuration,
      },
      isLastChunk,
      nextChunk: isLastChunk ? null : chunkIndex + 1,
      totalDuration: duration,
      timestamp: new Date().toISOString(),
      results: results.slice(0, 10), // Return first 10 for logging
      failedUsers: batchResult.failedUsernames.slice(0, 5), // Show first 5 failures
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    const duration = Date.now() - startTime;

    console.error('[CodeChef Cron Error]:', error);

    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
        totalDuration: duration,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
