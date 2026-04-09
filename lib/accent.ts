// Accent detection placeholder

import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function detectAccent(audioBlob: Blob): Promise<string> {
  // Convert Blob to ArrayBuffer
  const buffer = await audioBlob.arrayBuffer();
  const file = new File([buffer], "audio.wav", { type: "audio/wav" });

  // Use OpenAI Whisper API for accent detection
  const transcription = await openai.audio.transcriptions.create({
    file,
    model: "whisper-1",
    response_format: "verbose_json"
  });

  // Analyze language/accents from transcription metadata
  // (For demo, just return detected language)
  return transcription.language || "Unknown";
}
