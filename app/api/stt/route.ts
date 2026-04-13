import { NextResponse } from "next/server";
import { getPronunciationFeedbackAI } from "@/lib/openai";
import { analyzeCommunication } from "@/lib/communication";
import { verifySessionToken } from "@/lib/session-server";

export async function POST(request: Request) {
  try {
    // Authentication: require a valid `vg_session` cookie unless explicitly skipped
    try {
      const cookieHeader = request.headers.get("cookie") || "";
      const skipAuth = process.env.SKIP_AUTH === "true";
      if (!skipAuth) {
        const vg = cookieHeader.split(";").map((s) => s.trim()).find((c) => c.startsWith("vg_session="));
        if (!vg) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const token = vg.split("=")[1];
        const userId = verifySessionToken(token);
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } catch (e) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") || "";
    let audioBuffer: Buffer | null = null;
    let expectedSentence: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file") as File | null;
      expectedSentence = (form.get("expectedSentence") as string) || undefined;
      if (!file) {
        return NextResponse.json({ error: "Missing file" }, { status: 400 });
      }
      const ab = await file.arrayBuffer();
      audioBuffer = Buffer.from(ab);
    } else {
      const body = await request.json();
      expectedSentence = body.expectedSentence || undefined;
      if (!body.data) {
        return NextResponse.json({ error: "Missing data" }, { status: 400 });
      }
      audioBuffer = Buffer.from(body.data, "base64");
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI not configured. Enable OPENAI_API_KEY to use server STT." },
        { status: 501 }
      );
    }

    // Build multipart/form-data to call OpenAI's transcription endpoint
    const form = new FormData();
    // Node Buffer -> Uint8Array for Blob
    const u8 = new Uint8Array(audioBuffer as Buffer);
    const blob = new Blob([u8], { type: "audio/wav" });
    form.append("file", blob, "upload.wav");
    form.append("model", "whisper-1");

    const openaiRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: form as any,
    });

    if (!openaiRes.ok) {
      const text = await openaiRes.text();
      console.error("OpenAI transcription error:", text);
      return NextResponse.json({ error: "Transcription failed" }, { status: 502 });
    }

    const transJson = await openaiRes.json();
    const transcript: string = transJson.text || "";

    let aiResult = null;
    if (expectedSentence) {
      try {
        aiResult = await getPronunciationFeedbackAI(expectedSentence, transcript);
      } catch (aiErr) {
        console.error("AI feedback error after transcription:", aiErr);
      }
    }

    const comm = analyzeCommunication(transcript);

    return NextResponse.json({ transcript, feedback: aiResult, communication: comm });
  } catch (err) {
    console.error("STT API error:", err);
    return NextResponse.json({ error: "Server error during STT" }, { status: 500 });
  }
}
