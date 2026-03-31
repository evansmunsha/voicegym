"use client";

interface NavbarProps {
  title?: string;
}

export function Navbar({ title = "VoiceGym" }: NavbarProps) {
  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎤</span>
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        <div className="text-sm opacity-90">
          AI English Pronunciation Trainer
        </div>
      </div>
    </nav>
  );
}
