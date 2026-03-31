"use client";

interface LessonCardProps {
  title: string;
  description: string;
  icon: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  onClick?: () => void;
  isCompleted?: boolean;
}

export function LessonCard({
  title,
  description,
  icon,
  difficulty,
  onClick,
  isCompleted = false,
}: LessonCardProps) {
  const difficultyColor =
    difficulty === "Beginner"
      ? "bg-green-100 text-green-800"
      : difficulty === "Intermediate"
        ? "bg-yellow-100 text-yellow-800"
        : "bg-red-100 text-red-800";

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-6 cursor-pointer transition-all duration-200 ${
        isCompleted
          ? "bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300"
          : "bg-white border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="text-5xl">{icon}</div>
        {isCompleted && (
          <span className="text-2xl">✅</span>
        )}
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4">{description}</p>

      <div className="flex items-center justify-between">
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${difficultyColor}`}
        >
          {difficulty}
        </span>
        {!isCompleted && (
          <span className="text-blue-600 font-semibold text-sm flex items-center gap-1">
            Start → <span className="text-lg">→</span>
          </span>
        )}
      </div>
    </div>
  );
}
