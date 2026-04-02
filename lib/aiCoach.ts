//aiCoach.ts

export type AICoachContext = {
  lastTopic?: "r" | "l" | "th" | "v" | "sh" | "general";
};

function normalize(input: string) {
  return input.toLowerCase().trim();
}

export async function getAICoachResponse(
  input: string,
  context?: AICoachContext
): Promise<{ reply: string; nextContext: AICoachContext }> {
  const text = normalize(input);

  // Keep this intentionally simple for now: no network calls, no secrets.
  if (/\bth\b/.test(text) || text.includes("th sound")) {
    return {
      reply:
        "TH tip: place your tongue lightly between your teeth and blow air gently. Start slow: 'thhh' then add the vowel.",
      nextContext: { lastTopic: "th" },
    };
  }

  if (text.includes("r sound") || /\br\b/.test(text) || context?.lastTopic === "r") {
    return {
      reply:
        "R tip: pull your tongue back slightly (do not touch the roof of your mouth), round your lips, and keep the sound smooth. Try: 'rrrr' then 'right'.",
      nextContext: { lastTopic: "r" },
    };
  }

  if (text.includes("l sound") || /\bl\b/.test(text) || context?.lastTopic === "l") {
    return {
      reply:
        "L tip: touch the ridge just behind your upper teeth with the tip of your tongue. Let air flow around the sides. Try: 'llll' then 'light'.",
      nextContext: { lastTopic: "l" },
    };
  }

  if (text.includes("v") || text.includes("f")) {
    return {
      reply:
        "V/F tip: for V, your bottom lip touches your top teeth and you should feel vibration. For F, there is no vibration. Alternate: 'ffff' then 'vvvv'.",
      nextContext: { lastTopic: "v" },
    };
  }

  if (text.includes("sh") || text.includes("s")) {
    return {
      reply:
        "S/SH tip: for SH, round your lips a bit and push air through a narrow channel. For S, lips are flatter and the airflow is more focused. Try: 'sss' then 'shhh'.",
      nextContext: { lastTopic: "sh" },
    };
  }

  return {
    reply:
      "Nice work. Say it slowly first, then speed up only after it sounds clean. If you tell me the word you are practicing, I can coach that specific sound.",
    nextContext: { lastTopic: "general" },
  };
}

