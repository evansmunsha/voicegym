"use client";

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export function ProgressBar({
  current,
  total,
  label = "Progress",
}: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-semibold text-gray-900">
          {current} / {total}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-green-400 to-blue-500 h-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-gray-600 mt-1">{percentage}% complete</p>
    </div>
  );
}
