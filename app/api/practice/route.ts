//api/practice/route.ts

import { NextResponse } from "next/server";
import getPrismaClient from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { userId, sentence, userText, feedback, score } = body;

    // Validate required fields
    if (!userId || !sentence || !userText) {
      return NextResponse.json(
        { error: "Missing required fields: userId, sentence, userText" },
        { status: 400 }
      );
    }

    // Save practice session to database
    const prisma = getPrismaClient();
    const session = await prisma.practiceSession.create({
      data: {
        userId,
        sentence,
        userText,
        feedback: feedback || "",
        score: score || 0,
      },
    });

    // Update user progress
    const existingProgress = await prisma.progress.findUnique({
      where: { userId },
    });

    if (existingProgress) {
      // Update existing progress
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Safely handle null lastPracticeDate
      let lastPractice: Date | null = null;
      if (existingProgress.lastPracticeDate) {
        lastPractice = new Date(existingProgress.lastPracticeDate);
        lastPractice.setHours(0, 0, 0, 0);
      }

      let newStreak = 1;

      if (lastPractice) {
        const isSameDay = today.getTime() === lastPractice.getTime();
        const isConsecutiveDay =
          (today.getTime() - lastPractice.getTime()) / (1000 * 60 * 60 * 24) === 1;

        newStreak = isSameDay
          ? existingProgress.streak
          : isConsecutiveDay
            ? existingProgress.streak + 1
            : 1;
      }

      await prisma.progress.update({
        where: { userId },
        data: {
          lastPracticeDate: new Date(),
          totalSessions: existingProgress.totalSessions + 1,
          streak: newStreak,
        },
      });
    } else {
      // Create new progress record
      await prisma.progress.create({
        data: {
          userId,
          streak: 1,
          lastPracticeDate: new Date(),
          totalSessions: 1,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        session,
        message: "Practice session saved successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Practice API error:", error);
    return NextResponse.json(
      { error: "Failed to save practice session" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/practice?userId=...
 * Retrieve user's practice sessions with progress, improvement, and level
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "10");
    const prisma = getPrismaClient();

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    const sessions = await prisma.practiceSession.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const progress = await prisma.progress.findUnique({
      where: { userId },
    });

    // Calculate improvement (last score vs previous score)
    let improvement: number | null = null;
    const lastScore = sessions[0]?.score ?? null;
    const previousScore = sessions[1]?.score ?? null;

    if (sessions.length >= 2 && lastScore !== null && previousScore !== null) {
      improvement = lastScore - previousScore;
    } else if (sessions.length === 1 && lastScore !== null) {
      improvement = lastScore; // No previous score, show current as baseline
    }

    // Calculate user level based on total sessions
    // Level 1: 1-9 sessions (Beginner)
    // Level 2: 10-24 sessions (Improving)
    // Level 3: 25-49 sessions (Confident)
    // Level 4: 50+ sessions (Expert)
    const level = progress
      ? Math.min(
          4,
          Math.floor(progress.totalSessions / 10) + 1
        )
      : 1;

    const levelLabels: { [key: number]: string } = {
      1: "Beginner",
      2: "Improving",
      3: "Confident",
      4: "Expert",
    };

    return NextResponse.json(
      {
        sessions,
        progress: progress
          ? {
              ...progress,
              level,
              levelLabel: levelLabels[level],
            }
          : null,
        improvement: improvement !== null ? improvement : 0,
        stats: {
          totalSessions: progress?.totalSessions || 0,
          currentStreak: progress?.streak || 0,
          averageScore:
            sessions.length > 0
              ? Math.round(
                  sessions.reduce((sum, s) => sum + (s.score ?? 0), 0) /
                    sessions.length
                )
              : 0,
          bestScore: sessions.length > 0
            ? Math.max(...sessions.map((s) => s.score ?? 0))
            : 0,
          lastScore: sessions.length > 0 ? (sessions[0].score ?? 0) : 0,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Practice GET error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve practice sessions" },
      { status: 500 }
    );
  }
}
