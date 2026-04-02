//utils.ts

/**
 * Utility Functions
 */

/**
 * Format time in seconds to MM:SS
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Calculate streak days from last practice date
 */
export function calculateStreak(lastPracticeDate: Date | null): number {
  if (!lastPracticeDate) return 0;

  const today = new Date();
  const last = new Date(lastPracticeDate);

  const diffTime = Math.abs(today.getTime() - last.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays === 1 ? diffDays : 0;
}

/**
 * Get greeting based on time of day
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning! ☀️";
  if (hour < 18) return "Good afternoon! 🌤️";
  return "Good evening! 🌙";
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Generate or get user ID from localStorage
 */
export function getUserId(): string {
  if (typeof window === "undefined") return "";

  let userId = localStorage.getItem("userId");
  if (!userId) {
    userId = `user_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("userId", userId);
  }
  return userId;
}
