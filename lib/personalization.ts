// Personalization utilities for VoiceGym

import { FeedbackResponse } from "./feedback";

// Analyze feedback and extract weak sounds
export function extractWeakSounds(feedback: FeedbackResponse): string[] {
  const weakSounds: string[] = [];
  if (feedback.phonemeErrors && Array.isArray(feedback.phonemeErrors)) {
    for (const err of feedback.phonemeErrors) {
      if (typeof err === "string") {
        // Example: "R sound pronounced as L"
        if (/r/i.test(err)) weakSounds.push("R");
        if (/l/i.test(err)) weakSounds.push("L");
        if (/th/i.test(err)) weakSounds.push("TH");
        if (/sh/i.test(err)) weakSounds.push("SH");
        if (/s[^h]/i.test(err)) weakSounds.push("S");
        if (/v/i.test(err)) weakSounds.push("V");
        if (/f/i.test(err)) weakSounds.push("F");
      }
    }
  }
  return Array.from(new Set(weakSounds));
}

// Suggest a daily mission based on weak sounds
export function getDailyMission(weakSounds: string[]): string {
  if (!weakSounds.length) return "Practice any lesson or sentence of your choice!";
  if (weakSounds.includes("R") && weakSounds.includes("L")) return "Focus on R vs L lesson today!";
  if (weakSounds.includes("TH")) return "Practice the TH sound lesson today!";
  if (weakSounds.includes("SH") || weakSounds.includes("S")) return "Try the S vs SH lesson today!";
  if (weakSounds.includes("V") || weakSounds.includes("F")) return "Practice V and F sounds for clarity!";
  return `Practice the ${weakSounds[0]} sound lesson today!`;
}
