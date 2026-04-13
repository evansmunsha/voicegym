"use client";

import React from "react";

export function ProgressOverlay({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-30" />
      <div className="relative bg-white rounded-xl p-6 shadow-lg flex items-center gap-4 w-11/12 max-w-md">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-indigo-600" />
        <div>
          <p className="text-gray-900 font-semibold">{message}</p>
          <p className="text-sm text-gray-600">This may take a few seconds.</p>
        </div>
      </div>
    </div>
  );
}

export default ProgressOverlay;
