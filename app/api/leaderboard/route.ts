import { NextResponse } from "next/server";
import getPrismaClient from "@/lib/prisma";

export async function GET() {
  try {
    const prisma = getPrismaClient();
    // Get top 10 users by streak, then by totalSessions
    const users = await prisma.user.findMany({
      include: { progress: true },
    });
    const leaderboard = users
      .map((u) => ({
        user: u.id,
        streak: u.progress?.streak || 0,
        totalSessions: u.progress?.totalSessions || 0,
      }))
      .sort((a, b) => b.streak - a.streak || b.totalSessions - a.totalSessions)
      .slice(0, 10);
    return NextResponse.json({ leaderboard });
  } catch (error) {
    return NextResponse.json({ leaderboard: [] }, { status: 200 });
  }
}
