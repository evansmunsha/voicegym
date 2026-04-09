import { cookies } from "next/headers";
import SeedUserId from "./components/SeedUserId";
import { getGreeting } from "@/lib/utils";
import { extractWeakSounds, getDailyMission } from "@/lib/personalization";
import { getBadges } from "@/lib/analytics";
import { shouldShowReminder } from "@/lib/reminders";
import { t } from "@/lib/i18n";

const DAILY_GOAL = 5;

interface UserStats {
  totalSessions: number;
  // support both names returned by different endpoints
  currentStreak?: number;
  streak?: number;
  averageScore: number;
  lastPracticeDate?: string;
}

const HOW_IT_WORKS = [
  {
    num: "1",
    title: "Speak a phrase",
    desc: "Pick a lesson, tap the mic, say the target sentence aloud",
    color: "bg-violet-500/20 text-violet-300",
  },
  {
    num: "2",
    title: "Get AI feedback",
    desc: "Instant score + breakdown of which sounds need work",
    color: "bg-emerald-500/20 text-emerald-300",
  },
  {
    num: "3",
    title: "Track your growth",
    desc: "Scores improve over time as you repeat daily sessions",
    color: "bg-amber-500/20 text-amber-300",
  },
];

export default async function Home() {
  const greeting = getGreeting();

  // read userId from cookie (seeded by client)
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value ?? null;

  // server-side fetch of stats when userId exists
  let data: any = null;
  if (userId) {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/practice?userId=${encodeURIComponent(
        userId
      )}&limit=100`;
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) data = await res.json();
      else {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch stats server-side:", await res.text());
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Server fetch error:", err);
    }
  }

  // Normalize stats
  const incoming = (data && data.stats) || {};
  const stats = {
    totalSessions: incoming.totalSessions ?? 0,
    currentStreak: incoming.currentStreak ?? incoming.streak ?? 0,
    streak: incoming.streak ?? incoming.currentStreak ?? 0,
    averageScore: incoming.averageScore ?? 0,
    lastPracticeDate: incoming.lastPracticeDate ?? null,
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaysSessions = (data?.sessions || []).filter((session: any) => {
    const d = new Date(session.createdAt);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });

  const sessionsToday = todaysSessions.length;
  const recentScores = (data?.sessions || []).slice(0, 10).map((s: any) => s.score ?? 0).reverse();

  let weakSounds: string[] = [];
  for (const session of todaysSessions) if (session.phonemeErrors) weakSounds = weakSounds.concat(extractWeakSounds(session));
  const dailyMission = getDailyMission(Array.from(new Set(weakSounds)));

  const streak = stats.currentStreak ?? stats.streak ?? 0;
  const totalSessions = stats.totalSessions ?? 0;
  const averageScore = stats.averageScore ?? 0;
  const remainingToday = Math.max(0, DAILY_GOAL - sessionsToday);
  const progressPercent = Math.min(100, (sessionsToday / DAILY_GOAL) * 100);
  const badges = getBadges({ totalSessions, streak, averageScore });
  const showReminder = shouldShowReminder(stats.lastPracticeDate ?? null);
  const maxScore = recentScores.length ? Math.max(...recentScores) : 1;

  const reminderText = await t("Don't forget to practice today!");

  return (
    <div className="min-h-screen" style={{ background: "#0f0e17", color: "#f0eeff", fontFamily: "'DM Sans', sans-serif" }}>
      <SeedUserId />

      {/* Top bar */}
      <header style={{ background: "#1a1828", borderBottom: "1px solid rgba(124,110,245,0.15)" }}
        className="sticky top-0 z-20 flex items-center justify-between px-5 py-4">
        <span style={{ fontSize: 18, fontWeight: 600, color: "#e0dcff", letterSpacing: "0.3px" }}>
          VoiceGym
        </span>
        <div className="flex items-center gap-3">
          {streak > 0 && (
            <span style={{
              background: "rgba(245,166,35,0.15)", border: "1px solid rgba(245,166,35,0.3)",
              borderRadius: 99, padding: "5px 12px", fontSize: 12, fontWeight: 600, color: "#f5a623"
            }}>
              🔥 {streak}-day streak
            </span>
          )}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-5 pb-24">

        {/* Reminder */}
        {showReminder && (
          <div style={{
            background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.3)",
            borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#f5d08a"
          }}>
            {reminderText}
          </div>
        )}

        {/* Greeting */}
        <div className="pt-1">
          <p style={{ fontSize: 12, color: "#5e587a", letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: 4 }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#f0eeff", lineHeight: 1.2 }}>{greeting}</h1>
          <p style={{ fontSize: 14, color: "#9b94c4", marginTop: 4 }}>Ready to practice your English pronunciation?</p>
        </div>

        {/* Hero — mic + value prop */}
        <div style={{
          background: "#1e1c2e", borderRadius: 20, border: "1px solid rgba(124,110,245,0.2)", padding: "24px 20px",
          position: "relative", overflow: "hidden"
        }}>
          <div style={{
            position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,110,245,0.12), transparent 70%)", pointerEvents: "none"
          }} />
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: "#5e587a", marginBottom: 14 }}>
            Core action
          </p>
          <div className="flex items-center gap-4 mb-5">
            <a href="/practice" style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "linear-gradient(135deg, #7c6ef5, #5b4de8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 26, flexShrink: 0, textDecoration: "none",
              boxShadow: "0 0 24px rgba(124,110,245,0.35)"
            }}>
              🎙️
            </a>
            <div>
              <p style={{ fontSize: 17, fontWeight: 600, color: "#f0eeff", marginBottom: 4 }}>Speak a sentence</p>
              <p style={{ fontSize: 13, color: "#9b94c4", lineHeight: 1.5 }}>
                Tap the mic, say the phrase, get instant AI feedback on your pronunciation.
              </p>
            </div>
          </div>

          {/* Fake score preview */}
          <div style={{ background: "#13121f", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="flex items-center gap-3">
              <div style={{
                width: 42, height: 42, borderRadius: "50%",
                background: "rgba(62,207,142,0.12)", border: "2px solid #3ecf8e",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 700, color: "#3ecf8e"
              }}>
                {averageScore > 0 ? averageScore : "—"}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#f0eeff", marginBottom: 2 }}>
                  {averageScore > 0 ? "Your average score" : "No sessions yet"}
                </p>
                <p style={{ fontSize: 11, color: "#5e587a" }}>
                  {averageScore > 0 ? "Keep going to improve it" : "Start your first session below"}
                </p>
              </div>
            </div>
            {averageScore > 0 && (
              <span style={{ fontSize: 11, fontWeight: 600, background: "rgba(62,207,142,0.12)", color: "#3ecf8e", padding: "3px 10px", borderRadius: 99 }}>
                {averageScore >= 80 ? "Great" : averageScore >= 60 ? "Good" : "Keep going"}
              </span>
            )}
          </div>
        </div>

        {/* How it works */}
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", color: "#5e587a", marginBottom: 10 }}>
            How it works
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i}>
                <div style={{ background: "#1e1c2e", borderRadius: 12, border: "1px solid rgba(124,110,245,0.12)", padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}
                    className={step.color}>
                    {step.num}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#f0eeff", marginBottom: 2 }}>{step.title}</p>
                    <p style={{ fontSize: 12, color: "#9b94c4" }}>{step.desc}</p>
                  </div>
                </div>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div style={{ width: 1, height: 8, background: "#1e1c2e", marginLeft: 31 }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Today's goal */}
        <div style={{ background: "#1e1c2e", borderRadius: 16, border: "1px solid rgba(124,110,245,0.2)", padding: "18px 20px" }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", color: "#5e587a", marginBottom: 6 }}>Today's goal</p>
              <p style={{ fontSize: 32, fontWeight: 700, color: "#f0eeff", lineHeight: 1 }}>
                {sessionsToday}
                <span style={{ fontSize: 16, fontWeight: 400, color: "#5e587a" }}> / {DAILY_GOAL}</span>
              </p>
              <p style={{ fontSize: 13, color: "#9b94c4", marginTop: 4 }}>
                {sessionsToday >= DAILY_GOAL ? "Goal complete! Amazing work." : `${remainingToday} session${remainingToday !== 1 ? "s" : ""} to go`}
              </p>
            </div>
            <svg width="54" height="54" viewBox="0 0 54 54">
              <circle cx="27" cy="27" r="21" fill="none" stroke="rgba(124,110,245,0.15)" strokeWidth="5" />
              <circle cx="27" cy="27" r="21" fill="none" stroke="#7c6ef5" strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray="132"
                strokeDashoffset={132 - (132 * progressPercent) / 100}
                transform="rotate(-90 27 27)" />
              <text x="27" y="32" textAnchor="middle" fontSize="12" fontWeight="700" fill="#a599f7">
                {Math.round(progressPercent)}%
              </text>
            </svg>
          </div>

          {/* Progress bar */}
          <div style={{ height: 6, background: "#13121f", borderRadius: 99, overflow: "hidden", marginBottom: 14 }}>
            <div style={{ height: "100%", width: `${progressPercent}%`, borderRadius: 99, background: "linear-gradient(90deg, #7c6ef5, #a599f7)", transition: "width 0.5s ease" }} />
          </div>

          {/* Session dots */}
          <div className="flex gap-2">
            {Array.from({ length: DAILY_GOAL }).map((_, i) => (
              <div key={i} style={{
                width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 600,
                background: i < sessionsToday ? "rgba(124,110,245,0.25)" : "#13121f",
                color: i < sessionsToday ? "#a599f7" : "#5e587a",
                border: i < sessionsToday ? "none" : "1px solid #1e1c2e"
              }}>
                {i < sessionsToday ? "✓" : i + 1}
              </div>
            ))}
          </div>

          {dailyMission && (
            <div style={{ background: "rgba(124,110,245,0.1)", borderRadius: 10, padding: "10px 12px", marginTop: 14, fontSize: 13, color: "#c4bcf7", lineHeight: 1.5 }}>
              <span style={{ fontWeight: 600 }}>Focus: </span>{dailyMission}
            </div>
          )}
        </div>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div style={{ background: "#1e1c2e", borderRadius: 14, padding: "14px 16px", border: "1px solid rgba(124,110,245,0.12)" }}>
            <p style={{ fontSize: 11, color: "#5e587a", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 6 }}>Sessions</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: "#a599f7" }}>{totalSessions}</p>
          </div>
          <div style={{ background: "rgba(245,166,35,0.08)", borderRadius: 14, padding: "14px 16px", border: "1px solid rgba(245,166,35,0.15)" }}>
            <p style={{ fontSize: 11, color: "#5e587a", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 6 }}>Streak</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: "#f5a623" }}>{streak} <span style={{ fontSize: 14, fontWeight: 400, color: "#9b7a30" }}>days</span></p>
          </div>
          <div style={{ gridColumn: "1 / -1", background: "#1e1c2e", borderRadius: 14, padding: "14px 16px", border: "1px solid rgba(62,207,142,0.15)" }}>
            <p style={{ fontSize: 11, color: "#5e587a", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 6 }}>Average score</p>
            <div className="flex items-end justify-between">
              <p style={{ fontSize: 28, fontWeight: 700, color: "#3ecf8e" }}>{averageScore}<span style={{ fontSize: 14, fontWeight: 400, color: "#2a8a5e" }}>%</span></p>
              {/* Mini sparkline */}
              {recentScores.length > 1 && (
                <div className="flex items-end gap-1" style={{ height: 40 }}>
                  {recentScores.slice(-8).map((s, i) => (
                    <div key={i} style={{
                      width: 8, borderRadius: "3px 3px 0 0",
                      height: `${Math.round((s / maxScore) * 38)}px`,
                      background: s >= 75 ? "#3ecf8e" : "#7c6ef5",
                      opacity: 0.7
                    }} />
                  ))}
                </div>
              )}
            </div>
            <div style={{ height: 5, background: "#13121f", borderRadius: 99, marginTop: 10, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${averageScore}%`, background: "#3ecf8e", borderRadius: 99 }} />
            </div>
          </div>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", color: "#5e587a", marginBottom: 10 }}>Badges earned</p>
            <div className="flex flex-wrap gap-2">
              {badges.map((badge: any, i: number) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, background: "#1e1c2e", border: "1px solid rgba(124,110,245,0.2)", borderRadius: 99, padding: "6px 12px", fontSize: 12, color: "#c4bcf7" }}>
                  {badge.icon && <span style={{ fontSize: 13 }}>{badge.icon}</span>}
                  {badge.label || badge.name || badge}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lessons */}
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", color: "#5e587a", marginBottom: 10 }}>Lessons</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <a href="/lessons/r-vs-l" style={{ background: "#1e1c2e", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, border: "1px solid rgba(124,110,245,0.2)", textDecoration: "none", cursor: "pointer" }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(124,110,245,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#a599f7", flexShrink: 0 }}>R/L</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#f0eeff", marginBottom: 2 }}>R vs L sounds</p>
                <p style={{ fontSize: 12, color: "#9b94c4" }}>The most common challenge for learners</p>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, background: "rgba(62,207,142,0.12)", color: "#3ecf8e", padding: "3px 10px", borderRadius: 99 }}>Beginner</span>
            </a>
            <div style={{ background: "#1a1828", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, border: "1px solid rgba(255,255,255,0.04)", opacity: 0.5 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "#13121f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🔒</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#9b94c4", marginBottom: 2 }}>TH sound</p>
                <p style={{ fontSize: 12, color: "#5e587a" }}>Complete R vs L to unlock</p>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, background: "#13121f", color: "#5e587a", padding: "3px 10px", borderRadius: 99 }}>Locked</span>
            </div>
          </div>
        </div>

        {/* Navigation tiles */}
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", color: "#5e587a", marginBottom: 10 }}>Explore</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[
              { href: "/progress", icon: "📈", label: "Progress", desc: "Your history" },
              { href: "/lessons", icon: "📚", label: "Lessons", desc: "All sounds" },
              { href: "/coach", icon: "🤖", label: "Coach", desc: "Get tips" },
            ].map((item) => (
              <a key={item.href} href={item.href} style={{ background: "#1e1c2e", borderRadius: 14, padding: "14px 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, border: "1px solid rgba(124,110,245,0.1)", textDecoration: "none", textAlign: "center" }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#f0eeff" }}>{item.label}</span>
                <span style={{ fontSize: 11, color: "#5e587a", lineHeight: 1.3 }}>{item.desc}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Motivational CTA */}
        <div style={{ background: "rgba(124,110,245,0.08)", border: "1px solid rgba(124,110,245,0.2)", borderRadius: 16, padding: "18px 20px" }}>
          <p style={{ fontSize: 14, color: "#9b94c4", lineHeight: 1.65, marginBottom: 14 }}>
            <span style={{ color: "#f0eeff", fontWeight: 600 }}>You're {Math.round(progressPercent)}% through today.</span>{" "}
            Each session takes about 3 minutes. Consistent daily practice is the fastest path to fluent pronunciation.
          </p>
          <a href="/practice" style={{
            display: "block", width: "100%", background: "#7c6ef5", border: "none",
            borderRadius: 10, padding: "13px", fontSize: 14, fontWeight: 600, color: "white",
            textAlign: "center", textDecoration: "none", cursor: "pointer"
          }}>
            {sessionsToday >= DAILY_GOAL ? "Practice more →" : "Start next session →"}
          </a>
        </div>

      </main>

      <footer style={{ background: "#13121f", borderTop: "1px solid rgba(124,110,245,0.1)", textAlign: "center", padding: "16px", fontSize: 11, color: "#5e587a" }}>
        VoiceGym © 2026 — AI English Pronunciation Trainer
      </footer>
    </div>
  );
}
