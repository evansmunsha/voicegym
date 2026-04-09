// Progress analytics utilities

export function getBadges(stats: { totalSessions: number; streak: number; averageScore: number }): string[] {
  const badges: string[] = [];
  if (stats.streak >= 7) badges.push("7-Day Streak");
  if (stats.streak >= 30) badges.push("30-Day Streak");
  if (stats.totalSessions >= 50) badges.push("50 Sessions");
  if (stats.averageScore >= 90) badges.push("Pronunciation Pro");
  return badges;
}
