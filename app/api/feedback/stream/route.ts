import { NextResponse } from "next/server";
import { getPronunciationFeedbackAI } from "@/lib/openai";

// Streams the OpenAI chat completion (stream: true) to the client as NDJSON.
export async function POST(request: Request) {
  try {
    const { expectedSentence, userSpeech } = await request.json();

    if (!expectedSentence || !userSpeech) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      // If no key provided, fall back to synchronous AI helper
      try {
        const aiRaw = await getPronunciationFeedbackAI(expectedSentence, userSpeech);
        return NextResponse.json(aiRaw);
      } catch (e) {
        console.error("No OPENAI_API_KEY and AI fallback failed:", e);
        return NextResponse.json({ error: "OpenAI not configured" }, { status: 500 });
      }
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(encoder.encode(JSON.stringify({ type: "status", message: "Starting AI analysis (streaming)" }) + "\n"));

        try {
          const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: "gpt-4-turbo",
              messages: [
                {
                  role: "system",
                  content:
                    "You are an English pronunciation coach. As you analyze the user's spoken text, stream short, actionable coaching hints (one or two sentences) to the client. At the end of your analysis, output a single valid JSON object (no surrounding text) that contains: {phonemeErrors, aiSuggestions, aiAnalysis, feedback, score}. Do not output other unrelated text. Send partial hints as you compute them.",
                },
                {
                  role: "user",
                  content: `Expected: ${expectedSentence}\nUser: ${userSpeech}`,
                },
              ],
              temperature: 0.2,
              max_tokens: 512,
              stream: true,
            }),
          });

          if (!openaiRes.ok || !openaiRes.body) {
            throw new Error(`OpenAI stream error: ${openaiRes.status}`);
          }

          const reader = openaiRes.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          let contentBuffer = "";
          const emitted = new Set<string>();
          let hintCount = 0;

          function detectCategory(text: string) {
            const t = text.toLowerCase();
            if (/\b(th|thh|theta|th )\b/.test(t) || t.includes("th ")) return "articulation";
            if (/(r vs l| r vs l|r vs l| r and l|l vs r)/.test(t)) return "articulation";
            if (t.includes("pause") || t.includes("breathe") || t.includes("breath")) return "fluency";
            if (t.includes("filler") || t.includes("um") || t.includes("uh") || t.includes("like")) return "fluency";
            if (t.includes("stress") || t.includes("intonation") || t.includes("pitch")) return "prosody";
            if (t.includes("speed") || t.includes("slow") || t.includes("fast")) return "prosody";
            return "general";
          }

          function deriveSeverity(text: string) {
            const t = text.toLowerCase();
            if (t.includes("must") || t.includes("avoid") || t.includes("important")) return "high";
            if (t.includes("try") || t.includes("consider") || t.includes("should")) return "medium";
            return "low";
          }

          // Read streaming SSE-like events from OpenAI and forward partial content.
          // We also attempt to split completed sentences into structured 'hint' messages.
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            // Split on lines, looking for 'data: ' prefixed SSE lines
            const parts = buffer.split(/\r?\n/);
            buffer = parts.pop() || "";

            for (const line of parts) {
              if (!line.startsWith("data: ")) continue;
              const payload = line.replace(/^data: /, "").trim();
              if (payload === "[DONE]") {
                continue;
              }
              try {
                const parsed = JSON.parse(payload);
                const delta = parsed?.choices?.[0]?.delta;
                const text = delta?.content;
                if (text) {
                  // Forward raw partial text too (for backward compatibility)
                  controller.enqueue(encoder.encode(JSON.stringify({ type: "partial", text }) + "\n"));

                  // Accumulate content and try to detect sentence boundaries
                  contentBuffer += text;

                  // Split completed sentences by punctuation
                  const sentenceMatch = contentBuffer.match(/([\s\S]*?[\.\!\?])(?:\s|$)/);
                  while (sentenceMatch && hintCount < 8) {
                    const sentence = sentenceMatch[1].trim();
                    // remove the sentence from buffer
                    contentBuffer = contentBuffer.slice(sentenceMatch[1].length).trimLeft();

                    if (sentence.length > 5 && !emitted.has(sentence)) {
                      emitted.add(sentence);
                      hintCount += 1;
                      const category = detectCategory(sentence);
                      const severity = deriveSeverity(sentence);
                      const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
                      const hint = { id, text: sentence, category, severity };
                      controller.enqueue(encoder.encode(JSON.stringify({ type: "hint", hint }) + "\n"));
                    }

                    // look for another completed sentence
                    const nextMatch = contentBuffer.match(/([\s\S]*?[\.\!\?])(?:\s|$)/);
                    if (nextMatch) {
                      sentenceMatch[1] = nextMatch[1];
                    } else {
                      break;
                    }
                  }
                }
              } catch (e) {
                // ignore parse errors for now
              }
            }
          }

          // After streaming partial hints, call non-streaming AI helper to get structured JSON
          try {
            const aiRaw = await getPronunciationFeedbackAI(expectedSentence, userSpeech);
            const normalized = {
              mistakes: aiRaw.phonemeErrors || [],
              corrections: aiRaw.aiSuggestions || [],
              explanation: aiRaw.aiAnalysis || aiRaw.feedback || "",
              score: typeof aiRaw.score === "number" ? aiRaw.score : 0,
              suggestions: aiRaw.aiSuggestions || [],
              phonemeErrors: aiRaw.phonemeErrors || [],
              aiSuggestions: aiRaw.aiSuggestions || [],
              aiAnalysis: aiRaw.aiAnalysis || "",
              feedback: aiRaw.feedback || "",
            };
            controller.enqueue(encoder.encode(JSON.stringify({ type: "result", data: normalized }) + "\n"));
          } catch (e) {
            console.error("Final AI parse failed:", e);
            controller.enqueue(encoder.encode(JSON.stringify({ type: "result", data: { mistakes: [], corrections: [], explanation: "AI unavailable.", score: 0, suggestions: [] } }) + "\n"));
          }
        } catch (err) {
          console.error("Stream error:", err);
          controller.enqueue(encoder.encode(JSON.stringify({ type: "error", message: String(err) }) + "\n"));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Feedback stream error:", error);
    return NextResponse.json({ error: "Failed to generate streamed feedback" }, { status: 500 });
  }
}
