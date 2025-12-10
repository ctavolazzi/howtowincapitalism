/**
 * Activity Tracker
 *
 * Tracks user activity (page views, login/logout) in localStorage.
 * This is ethical, transparent tracking - all stored client-side.
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
