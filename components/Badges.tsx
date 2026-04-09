"use client";

export function Badges({ badges }: { badges: string[] }) {
  if (!badges.length) return null;
  return (
    <div className="flex gap-2 flex-wrap mt-2">
      {badges.map((badge, idx) => (
        <span key={idx} className="px-3 py-1 bg-yellow-200 text-yellow-900 rounded-full text-xs font-bold shadow">
          🏅 {badge}
        </span>
      ))}
    </div>
  );
}
