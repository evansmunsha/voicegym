export interface CommunicationAnalysis {
  totalWords: number;
  fillerCount: number;
  fillerWords: { [word: string]: number };
  fluencyScore: number; // 0-100
  suggestions: string[];
}

const FILLER_WORDS = [
  "um",
  "uh",
  "like",
  "you know",
  "so",
  "actually",
  "basically",
  "right",
  "i mean",
  "well",
  "sort of",
  "kind of",
];

export function analyzeCommunication(text: string): CommunicationAnalysis {
  const normalized = text.toLowerCase();
  const words = normalized.split(/\s+/).filter(Boolean);
  const totalWords = words.length;

  const fillerWordsCount: { [k: string]: number } = {};
  let fillerCount = 0;

  for (const filler of FILLER_WORDS) {
    const re = new RegExp(`\\b${filler}\\b`, "gi");
    const matches = (normalized.match(re) || []).length;
    if (matches > 0) {
      fillerWordsCount[filler] = matches;
      fillerCount += matches;
    }
  }

  // Simple fluency score: penalize high filler rate
  const fillerRate = totalWords > 0 ? fillerCount / totalWords : 0;
  // Map fillerRate 0..0.2 to score 100..40
  let fluencyScore = Math.round(Math.max(40, 100 - fillerRate * 300));
  if (fluencyScore > 100) fluencyScore = 100;
  if (fluencyScore < 0) fluencyScore = 0;

  const suggestions: string[] = [];
  if (fillerCount > 0) {
    suggestions.push("Try to reduce filler words (um, uh, like). Pause instead of filling.");
  }
  if (totalWords > 0 && totalWords < 5) {
    suggestions.push("Try to speak slightly longer phrases to give the listener more context.");
  }

  return {
    totalWords,
    fillerCount,
    fillerWords: fillerWordsCount,
    fluencyScore,
    suggestions,
  };
}
