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
      const lastPractice = new Date(existingProgress.lastPracticeDate || 0);
      lastPractice.setHours(0, 0, 0, 0);

      const isSameDay = today.getTime() === lastPractice.getTime();
      const isConsecutiveDay =
        (today.getTime() - lastPractice.getTime()) / (1000 * 60 * 60 * 24) === 1;

      const newStreak = isSameDay
        ? existingProgress.streak
        : isConsecutiveDay
          ? existingProgress.streak + 1
          : 1;

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
 * Retrieve user's practice sessions
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

    return NextResponse.json(
      {
        sessions,
        progress: progress || null,
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
