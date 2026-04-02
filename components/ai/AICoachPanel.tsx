"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Avatar, type AvatarState } from "./Avatar";
import { getAICoachResponse, type AICoachContext } from "@/lib/aiCoach";
import { SpeechRecognizer, speakText, stopSpeaking } from "@/lib/speech";

type ChatMessage = {
  role: "user" | "coach";
  text: string;
};

const SUGGESTED_PROMPTS = [
  "Help me improve my R sound",
  "How do I pronounce the L sound?",
  "Give me a TH tip",
  "How can I sound more natural?",
];

export function AICoachPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "coach",
      text: "Tell me what you are practicing (a word or sentence) and I will coach you.",
    },
  ]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<AvatarState>("idle");
  const [context, setContext] = useState<AICoachContext>({});

  const recognizerRef = useRef<SpeechRecognizer | null>(null);

  const isBusy =
    state === "thinking" || state === "speaking" || state === "listening";

  const canSpeak = useMemo(
    () => typeof window !== "undefined" && !!window.speechSynthesis,
    []
  );

  const ensureRecognizer = useCallback(() => {
    if (recognizerRef.current) return recognizerRef.current;
    recognizerRef.current = new SpeechRecognizer();
    return recognizerRef.current;
  }, []);

  const appendMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const askCoach = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      setError(null);
      stopSpeaking();
      setState("thinking");
      appendMessage({ role: "user", text: trimmed });

      try {
        const { reply, nextContext } = await getAICoachResponse(trimmed, context);
        setContext(nextContext);
        appendMessage({ role: "coach", text: reply });

        if (canSpeak) {
          setState("speaking");
          await speakText(reply, 0.92);
        }

        setState("idle");
      } catch (e) {
        setState("idle");
        setError(e instanceof Error ? e.message : "Coach failed to respond");
      }
    },
    [appendMessage, canSpeak, context]
  );

  const onSend = useCallback(async () => {
    const text = input;
    setInput("");
    await askCoach(text);
  }, [askCoach, input]);

  const onListen = useCallback(async () => {
    setError(null);

    if (state === "listening") {
      recognizerRef.current?.stop();
      setState("idle");
      return;
    }

    try {
      const recognizer = ensureRecognizer();
      setState("listening");
      const transcript = await recognizer.start();
      setState("idle");
      await askCoach(transcript);
    } catch (e) {
      setState("idle");
      setError(
        e instanceof Error
          ? e.message
          : "Speech recognition is not supported in this browser"
      );
    }
  }, [askCoach, ensureRecognizer, state]);

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl p-5 shadow-lg border border-slate-200">
      <div className="flex items-start justify-between gap-4">
        <Avatar state={state} />

        <button
          type="button"
          onClick={() => {
            stopSpeaking();
            setState((s) => (s === "speaking" ? "idle" : s));
          }}
          disabled={state !== "speaking"}
          className="px-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Stop voice
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="mt-4 h-72 overflow-y-auto rounded-xl bg-slate-50 p-4 text-sm">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`mb-3 flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 leading-relaxed ${
                m.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-slate-200 text-slate-900"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {SUGGESTED_PROMPTS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => askCoach(p)}
            disabled={isBusy}
            className="px-3 py-2 text-xs rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {p}
          </button>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void onSend();
            }
          }}
          placeholder="Type a question or paste what you said..."
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          disabled={isBusy}
        />

        <button
          type="button"
          onClick={onListen}
          disabled={state === "thinking" || state === "speaking"}
          className="px-4 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {state === "listening" ? "Stop" : "Talk"}
        </button>

        <button
          type="button"
          onClick={onSend}
          disabled={!input.trim() || isBusy}
          className="px-4 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  );
}

