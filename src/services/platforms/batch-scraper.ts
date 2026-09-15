import pLimit, { Limit } from 'p-limit';
import { fetchCodechefStats } from './codechef';
import { fetchLeetCodeStats } from './leetcode';
import { fetchCodeforcesStats } from './codeforces';
import {
  CodechefFetchResult,
  LeetCodeFetchResult,
  CodeforcesFetchResult,
} from './types';

/**
 * Platform types for batching
 */
export type Platform = 'codechef' | 'leetcode' | 'codeforces';

/**
 * Individual scrape result with metadata
 */
export interface ScrapResult<T> {
  username: string;
  platform: Platform;
  success: boolean;
  data?: T;
  error?: string;
  duration: number;
  timestamp: Date;
  retryCount: number;
}

/**
 * Batch scrape result with statistics
 */
export interface BatchScrapeResult {
  platform: Platform;
  totalRequested: number;
  successCount: number;
  failureCount: number;
  averageDuration: number;
  totalDuration: number;
  results: ScrapResult<any>[];
  failedUsernames: string[];
  rateLimit?: {
    remaining: number;
    resetAt?: Date;
  };
}

/**
 * Options for batch scraping
 */
export interface BatchScrapingOptions {
  concurrency?: number; // Max parallel requests (default: 3)
  delayMs?: number; // Delay between requests in ms (default: 600)
  chunkSize?: number; // Number of users per chunk (default: 20)
  timeout?: number; // Individual fetch timeout in ms (default: 8000)
  verbose?: boolean; // Log detailed progress (default: false)
}

/**
 * Queue item for async processing
 */
interface QueueItem {
  username: string;
  platform: Platform;
  retries: number;
}

/**
 * Batch scraper utility for managing concurrent platform scrapes
 */
export class BatchScraper {
  private limit: Limit;
  private concurrency: number;
  private delayMs: number;
  private timeout: number;
  private verbose: boolean;
  private queue: QueueItem[] = [];
  private processing = false;

  constructor(options: BatchScrapingOptions = {}) {
    this.concurrency = options.concurrency ?? 3;
    this.delayMs = options.delayMs ?? 600;
    this.timeout = options.timeout ?? 8000;
    this.verbose = options.verbose ?? false;
    this.limit = pLimit(this.concurrency);
  }

  /**
   * Log with verbose flag check
   */
  private log(message: string, data?: any) {
    if (this.verbose) {
      console.log(`[BatchScraper] ${message}`, data ?? '');
    }
  }

  /**
   * Scrape a single user with delay between requests
   */
  private async scrapeWithDelay<T>(
    username: string,
    platform: Platform,
    delayIndex: number
  ): Promise<ScrapResult<T>> {
    const startTime = Date.now();

    try {
      // Add stagger delay to prevent thundering herd
      await new Promise(resolve =>
        setTimeout(resolve, delayIndex * this.delayMs)
      );

      this.log(`Fetching ${platform}:${username}`);

      let data: any;
      switch (platform) {
        case 'codechef':
          data = await fetchCodechefStats(username);
          break;
        case 'leetcode':
          data = await fetchLeetCodeStats(username);
          break;
        case 'codeforces':
          data = await fetchCodeforcesStats(username);
          break;
        default:
          throw new Error(`Unknown platform: ${platform}`);
      }

      const duration = Date.now() - startTime;

      return {
        username,
        platform,
        success: true,
        data,
        duration,
        timestamp: new Date(),
        retryCount: 0,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      const errorMsg =
        error instanceof Error ? error.message : String(error);

      this.log(`Failed to fetch ${platform}:${username}`, errorMsg);

      return {
        username,
        platform,
        success: false,
        error: errorMsg,
        duration,
        timestamp: new Date(),
        retryCount: 0,
      };
    }
  }

  /**
   * Batch scrape multiple users for a single platform
   * with concurrency control and proper staggering
   */
  async scrapeBatch(
    usernames: string[],
    platform: Platform
  ): Promise<BatchScrapeResult> {
    if (usernames.length === 0) {
      return {
        platform,
        totalRequested: 0,
        successCount: 0,
        failureCount: 0,
        averageDuration: 0,
        totalDuration: 0,
        results: [],
        failedUsernames: [],
      };
    }

    const startTime = Date.now();
    this.log(`Starting batch scrape for ${platform}`, {
      count: usernames.length,
      concurrency: this.concurrency,
    });

    // Create tasks with concurrency limiting
    const tasks = usernames.map((username, index) =>
      this.limit(() => this.scrapeWithDelay(username, platform, index))
    );

    // Execute all tasks
    const settled = await Promise.allSettled(tasks);

    // Process results
    const results: ScrapResult<any>[] = [];
    for (let i = 0; i < settled.length; i++) {
      const settlement = settled[i];
      if (settlement.status === 'fulfilled') {
        results.push(settlement.value);
      } else {
        results.push({
          username: usernames[i],
          platform,
          success: false,
          error: settlement.reason?.message || 'Promise rejected',
          duration: 0,
          timestamp: new Date(),
          retryCount: 0,
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    const totalDuration = Date.now() - startTime;
    const averageDuration =
      results.length > 0
        ? results.reduce((sum, r) => sum + r.duration, 0) / results.length
        : 0;

    const failedUsernames = results
      .filter(r => !r.success)
      .map(r => r.username);

    this.log(`Batch scrape complete for ${platform}`, {
      success: successCount,
      failed: failureCount,
      totalTime: `${totalDuration}ms`,
      avgTime: `${averageDuration.toFixed(0)}ms`,
    });

    return {
      platform,
      totalRequested: usernames.length,
      successCount,
      failureCount,
      averageDuration,
      totalDuration,
      results,
      failedUsernames,
    };
  }

  /**
   * Scrape multiple users across multiple platforms
   */
  async scrapeMultiPlatform(
    usernames: string[],
    platforms: Platform[]
  ): Promise<Map<Platform, BatchScrapeResult>> {
    const results = new Map<Platform, BatchScrapeResult>();

    for (const platform of platforms) {
      const result = await this.scrapeBatch(usernames, platform);
      results.set(platform, result);
    }

    return results;
  }

  /**
   * Chunk users for processing across multiple cron jobs
   * Returns: { chunk, users, totalChunks }
   */
  static chunkUsers(
    allUsernames: string[],
    chunkSize: number = 20,
    chunkIndex: number = 0
  ): {
    users: string[];
    chunk: number;
    totalChunks: number;
    isLastChunk: boolean;
  } {
    const totalChunks = Math.ceil(allUsernames.length / chunkSize);

    if (chunkIndex >= totalChunks) {
      return {
        users: [],
        chunk: chunkIndex,
        totalChunks,
        isLastChunk: true,
      };
    }

    const start = chunkIndex * chunkSize;
    const end = Math.min(start + chunkSize, allUsernames.length);
    const users = allUsernames.slice(start, end);

    return {
      users,
      chunk: chunkIndex,
      totalChunks,
      isLastChunk: chunkIndex === totalChunks - 1,
    };
  }

  /**
   * Queue a user for async processing
   */
  queueUser(username: string, platform: Platform, retries: number = 0) {
    this.queue.push({ username, platform, retries });
    this.processQueue();
  }

  /**
   * Process queued users (useful for event-driven sync)
   */
  private async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    try {
      while (this.queue.length > 0) {
        const item = this.queue.shift();
        if (!item) break;

        await this.scrapeWithDelay(item.username, item.platform, 0);
      }
    } finally {
      this.processing = false;
    }
  }

  /**
   * Get queue status
   */
  getQueueStatus() {
    return {
      queuedCount: this.queue.length,
      isProcessing: this.processing,
      queue: [...this.queue],
    };
  }

  /**
   * Clear the queue
   */
  clearQueue() {
    this.queue = [];
  }
}

/**
 * Helper function to create a batch scraper with default options
 */
export function createBatchScraper(
  options?: BatchScrapingOptions
): BatchScraper {
  return new BatchScraper(options);
}

/**
 * Helper function to chunk and process users
 * Returns iterator for cron jobs to call sequentially
 */
export function* createChunkedBatchIterator(
  usernames: string[],
  chunkSize: number = 20
) {
  let chunkIndex = 0;

  while (true) {
    const chunk = BatchScraper.chunkUsers(usernames, chunkSize, chunkIndex);

    if (chunk.users.length === 0) {
      break;
    }

    yield {
      chunk: chunk.chunk,
      users: chunk.users,
      totalChunks: chunk.totalChunks,
      isLastChunk: chunk.isLastChunk,
    };

    chunkIndex++;
  }
}
