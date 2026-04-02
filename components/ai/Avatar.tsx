"use client";

export type AvatarState = "idle" | "thinking" | "speaking" | "listening";

export function Avatar({ state }: { state: AvatarState }) {
  const label =
    state === "thinking"
      ? "Thinking"
      : state === "speaking"
        ? "Speaking"
        : state === "listening"
          ? "Listening"
          : "Ready";

  const mouth =
    state === "speaking"
      ? "h-3 w-8 rounded-full bg-slate-800"
      : state === "thinking"
        ? "h-1 w-8 rounded-full bg-slate-800"
        : state === "listening"
          ? "h-2 w-10 rounded-full bg-slate-800"
          : "h-2 w-8 rounded-full bg-slate-800";

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 shadow-md">
        <div className="absolute left-4 top-5 h-2 w-2 rounded-full bg-white/95" />
        <div className="absolute right-4 top-5 h-2 w-2 rounded-full bg-white/95" />
        <div className={`absolute left-1/2 top-9 -translate-x-1/2 ${mouth}`} />
        {state === "listening" && (
          <div className="absolute -right-2 -top-2 h-4 w-4 animate-pulse rounded-full bg-emerald-400 shadow" />
        )}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">AI Coach</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}

