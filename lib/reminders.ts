// Simple daily reminder utility

export function shouldShowReminder(lastPracticeDate: string | null): boolean {
  if (!lastPracticeDate) return true;
  const last = new Date(lastPracticeDate);
  const now = new Date();
  return now.getDate() !== last.getDate() || now.getMonth() !== last.getMonth() || now.getFullYear() !== last.getFullYear();
}
