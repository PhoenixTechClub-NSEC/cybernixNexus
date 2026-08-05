import {
  UserProfile,
  Editorial,
  Contest,
  DepartmentStat,
  MonthlyAchievement,
} from '@/types';
import {
  LEADERBOARD_USERS,
  FAKE_EDITORIALS,
  FAKE_CONTESTS,
  DEPARTMENT_STATS,
  MONTHLY_ACHIEVEMENTS,
  CURRENT_USER,
} from './constants';

/**
 * ==========================================
 * TODO: BACKEND INTEGRATION
 * ==========================================
 * Replace these mock functions with actual 
 * fetch() calls to your backend API endpoints.
 * Example:
 * export async function getLeaderboard() {
 *   const res = await fetch('/api/v1/leaderboard');
 *   return res.json();
 * }
 */

const MOCK_DELAY = 600; // Simulate network latency

export async function getCurrentUser(): Promise<UserProfile> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(CURRENT_USER), MOCK_DELAY);
  });
}

export async function getLeaderboard(): Promise<UserProfile[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...LEADERBOARD_USERS]), MOCK_DELAY);
  });
}

export async function getEditorials(): Promise<Editorial[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...FAKE_EDITORIALS]), MOCK_DELAY);
  });
}

export async function getContests(): Promise<Contest[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...FAKE_CONTESTS]), MOCK_DELAY);
  });
}

export async function getDepartmentStats(): Promise<DepartmentStat[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...DEPARTMENT_STATS]), MOCK_DELAY);
  });
}

export async function getMonthlyAchievements(): Promise<MonthlyAchievement[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...MONTHLY_ACHIEVEMENTS]), MOCK_DELAY);
  });
}
