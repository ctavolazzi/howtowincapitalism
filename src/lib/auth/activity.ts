/**
 * @fileoverview Client-Side Activity Tracker
 *
 * Tracks user activity (page views, login/logout events) in localStorage.
 * This is ethical, transparent tracking with all data stored client-side
 * only - no server-side analytics or third-party tracking.
 *
 * @module lib/auth/activity
 * @see {@link module:lib/auth/store} - Calls trackActivity on login/logout
 * @see {@link module:components/organisms/profile/ActivityFeed} - Displays activity
 *
 * ## Privacy Design
 *
 * - All data stored locally in browser's localStorage
 * - No data sent to servers or third parties
 * - User can clear all activity data at any time
 * - Maximum 100 events stored (auto-trimmed)
 *
 * ## Event Types
 *
 * | Type     | Triggered By           | Contains          |
 * |----------|------------------------|-------------------|
 * | pageview | Page load              | Path              |
 * | login    | Successful login       | Login page path   |
 * | logout   | User logout            | Current page path |
 *
 * ## localStorage Key
 *
 * All activity stored under `user_activity` as JSON array.
 *
 * @author How To Win Capitalism Team
 * @since 1.0.0
 */

export interface ActivityEvent {
  type: 'pageview' | 'login' | 'logout';
  path: string;
  timestamp: string;
}

const STORAGE_KEY = 'user_activity';
const MAX_EVENTS = 100; // Keep last 100 events

/**
 * Get all stored activity events
 */
export function getActivity(): ActivityEvent[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Track an activity event
 */
export function trackActivity(type: ActivityEvent['type'], path: string): void {
  if (typeof window === 'undefined') return;

  const events = getActivity();

  events.push({
    type,
    path,
    timestamp: new Date().toISOString(),
  });

  // Keep only the last MAX_EVENTS
  const trimmed = events.slice(-MAX_EVENTS);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Storage full or disabled - silently fail
  }
}

/**
 * Track a page view (call this on each page load)
 */
export function trackPageView(path: string): void {
  trackActivity('pageview', path);
}

/**
 * Clear all activity data
 */
export function clearActivity(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get activity summary for profile display
 */
export function getActivitySummary(): {
  totalPageViews: number;
  lastActive: string | null;
  recentPages: string[];
} {
  const events = getActivity();
  const pageViews = events.filter(e => e.type === 'pageview');

  return {
    totalPageViews: pageViews.length,
    lastActive: events.length > 0 ? events[events.length - 1].timestamp : null,
    recentPages: [...new Set(pageViews.slice(-10).map(e => e.path))],
  };
}
